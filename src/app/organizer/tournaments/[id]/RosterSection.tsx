import { createClient } from "@/lib/supabase/server"
import { Card, CardEyebrow, CardTitle } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import { EmptyState } from "@/components/ui/EmptyState"
import { GENDER_TYPE_LABELS, PLAY_TYPE_LABELS } from "@/lib/validation"

type Registration = {
  id: string
  division_id: string
  player_id: string
  partner_player_id: string | null
  status: string
  registered_at: string
}

export async function RosterSection({ tournamentId }: { tournamentId: string }) {
  const supabase = await createClient()

  const { data: divisions } = await supabase
    .from("tournament_divisions")
    .select("id, name, play_type, gender_type, max_players, skill_level")
    .eq("tournament_id", tournamentId)
    .order("created_at", { ascending: true })

  if (!divisions || divisions.length === 0) {
    return null
  }

  const { data: regs } = await supabase
    .from("tournament_registrations")
    .select("id, division_id, player_id, partner_player_id, status, registered_at")
    .eq("tournament_id", tournamentId)
    .neq("status", "canceled")
    .order("registered_at", { ascending: true })

  const playerIds = Array.from(
    new Set(
      (regs ?? []).flatMap((r) =>
        [r.player_id, r.partner_player_id].filter(
          (id): id is string => id != null,
        ),
      ),
    ),
  )

  const { data: players } = playerIds.length
    ? await supabase
        .from("player_profiles")
        .select("user_id, display_name, skill_level")
        .in("user_id", playerIds)
    : { data: [] }

  const playerMap = new Map(
    (players ?? []).map((p) => [
      p.user_id,
      {
        display_name: p.display_name ?? "Unknown player",
        skill_level: p.skill_level,
      },
    ]),
  )

  const totalRegs = regs?.length ?? 0
  const byDivision: Record<string, Registration[]> = {}
  for (const r of regs ?? []) {
    ;(byDivision[r.division_id] ??= []).push(r)
  }

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <div>
          <CardEyebrow>Roster</CardEyebrow>
          <CardTitle className="mt-1">Who&apos;s registered</CardTitle>
        </div>
        <Badge tone="outline">{totalRegs} total</Badge>
      </div>

      {totalRegs === 0 ? (
        <EmptyState
          title="No registrations yet"
          description="Once you publish the tournament, sign-ups will appear here grouped by division."
        />
      ) : (
        <div className="space-y-5">
          {divisions.map((d) => {
            const regsForDiv = byDivision[d.id] ?? []
            const cap = d.max_players
            const seatsTaken = regsForDiv.reduce(
              (sum, r) => sum + (r.partner_player_id ? 2 : 1),
              0,
            )

            return (
              <div key={d.id} className="space-y-2">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold">{d.name}</p>
                    <Badge tone="outline">{PLAY_TYPE_LABELS[d.play_type]}</Badge>
                    <Badge tone="outline">
                      {GENDER_TYPE_LABELS[d.gender_type]}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted tabular">
                    {seatsTaken}
                    {cap ? `/${cap}` : ""} seats
                  </p>
                </div>

                {regsForDiv.length === 0 ? (
                  <p className="text-sm text-muted pl-1">No sign-ups yet.</p>
                ) : (
                  <ol className="rounded-2xl border border-hairline overflow-hidden">
                    {regsForDiv.map((r, i) => {
                      const p = playerMap.get(r.player_id)
                      const partner = r.partner_player_id
                        ? playerMap.get(r.partner_player_id)
                        : null
                      return (
                        <li
                          key={r.id}
                          className={`flex items-center justify-between gap-3 px-4 py-2.5 ${
                            i < regsForDiv.length - 1
                              ? "border-b border-hairline"
                              : ""
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <span className="size-7 rounded-full bg-surface-2 grid place-items-center text-xs font-bold tabular text-ink-2 shrink-0">
                              {i + 1}
                            </span>
                            <div className="min-w-0">
                              <p className="text-sm font-semibold capitalize truncate">
                                {p?.display_name ?? "Unknown player"}
                                {partner && (
                                  <span className="text-muted font-normal">
                                    {" + "}
                                    {partner.display_name ?? "Unknown"}
                                  </span>
                                )}
                              </p>
                              <p className="text-[11px] text-muted">
                                Registered{" "}
                                {new Date(r.registered_at).toLocaleDateString(
                                  undefined,
                                  { month: "short", day: "numeric" },
                                )}
                              </p>
                            </div>
                          </div>
                          <Badge tone={r.status === "waitlisted" ? "warn" : "neutral"}>
                            {r.status}
                          </Badge>
                        </li>
                      )
                    })}
                  </ol>
                )}
              </div>
            )
          })}
        </div>
      )}
    </Card>
  )
}
