import { createClient } from "@/lib/supabase/server"
import { Card, CardEyebrow } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import { PLAY_TYPE_LABELS } from "@/lib/validation"
import { cn } from "@/lib/utils"

export async function MatchesList({
  tournamentId,
  currentUserId,
}: {
  tournamentId: string
  currentUserId: string
}) {
  const supabase = await createClient()

  const [{ data: divisions }, { data: matches }] = await Promise.all([
    supabase
      .from("tournament_divisions")
      .select("id, name, play_type")
      .eq("tournament_id", tournamentId)
      .order("created_at", { ascending: true }),
    supabase
      .from("matches")
      .select(
        "id, division_id, round_name, player_1_id, player_2_id, team_1_partner_id, team_2_partner_id, winner_team, score, status, played_at",
      )
      .eq("tournament_id", tournamentId)
      .order("played_at", { ascending: false, nullsFirst: false })
      .order("created_at", { ascending: true }),
  ])

  if (!matches || matches.length === 0) return null

  const playerIds = Array.from(
    new Set(
      matches.flatMap((m) =>
        [
          m.player_1_id,
          m.player_2_id,
          m.team_1_partner_id,
          m.team_2_partner_id,
        ].filter((id): id is string => id != null),
      ),
    ),
  )

  const { data: players } = playerIds.length
    ? await supabase
        .from("player_profiles")
        .select("user_id, display_name")
        .in("user_id", playerIds)
    : { data: [] }

  const nameMap = new Map(
    (players ?? []).map((p) => [
      p.user_id,
      p.display_name ?? "Unknown player",
    ]),
  )
  const divisionMap = new Map((divisions ?? []).map((d) => [d.id, d]))

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <CardEyebrow>Matches</CardEyebrow>
        <span className="text-xs text-muted">{matches.length} total</span>
      </div>

      <Card className="p-0 overflow-hidden">
        <ul>
          {matches.map((m, i) => {
            const division = divisionMap.get(m.division_id)
            const team1 = teamLabel(
              nameMap.get(m.player_1_id ?? "") ?? "Unknown",
              m.team_1_partner_id ? nameMap.get(m.team_1_partner_id) ?? "Unknown" : null,
            )
            const team2 = teamLabel(
              nameMap.get(m.player_2_id ?? "") ?? "Unknown",
              m.team_2_partner_id ? nameMap.get(m.team_2_partner_id) ?? "Unknown" : null,
            )
            const youInMatch =
              m.player_1_id === currentUserId ||
              m.player_2_id === currentUserId ||
              m.team_1_partner_id === currentUserId ||
              m.team_2_partner_id === currentUserId

            return (
              <li
                key={m.id}
                className={cn(
                  "px-5 py-4",
                  i < matches.length - 1 && "border-b border-hairline",
                  youInMatch && "bg-accent/10",
                )}
              >
                <div className="flex items-center justify-between gap-3 flex-wrap mb-1.5">
                  <div className="flex items-center gap-1.5 flex-wrap min-w-0">
                    {division && (
                      <Badge tone="outline">{division.name}</Badge>
                    )}
                    {m.round_name && (
                      <span className="text-[11px] uppercase tracking-[0.14em] font-semibold text-muted">
                        {m.round_name}
                      </span>
                    )}
                  </div>
                  {m.status === "completed" ? (
                    <Badge tone="primary">Final</Badge>
                  ) : (
                    <Badge tone="outline">Scheduled</Badge>
                  )}
                </div>

                <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
                  <p
                    className={cn(
                      "truncate text-sm",
                      m.winner_team === "team_1" && "font-bold text-primary",
                    )}
                  >
                    {team1}
                  </p>
                  <span className="font-display text-sm font-bold tabular text-muted whitespace-nowrap">
                    {m.status === "completed" && m.score ? m.score : "vs"}
                  </span>
                  <p
                    className={cn(
                      "truncate text-sm text-right",
                      m.winner_team === "team_2" && "font-bold text-primary",
                    )}
                  >
                    {team2}
                  </p>
                </div>
              </li>
            )
          })}
        </ul>
      </Card>
    </section>
  )
}

function teamLabel(player: string, partner: string | null) {
  if (!partner) return player
  return `${player} + ${partner}`
}
