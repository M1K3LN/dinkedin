import { createClient } from "@/lib/supabase/server"
import { Card, CardEyebrow, CardTitle } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import { PLAY_TYPE_LABELS } from "@/lib/validation"
import { FinalizePanel } from "./FinalizePanel"

export async function FinalizeSection({
  tournamentId,
  tournamentStatus,
}: {
  tournamentId: string
  tournamentStatus: string
}) {
  const supabase = await createClient()

  const { data: divisions } = await supabase
    .from("tournament_divisions")
    .select("id, name, play_type")
    .eq("tournament_id", tournamentId)
    .order("created_at", { ascending: true })

  if (!divisions || divisions.length === 0) return null

  const divisionIds = divisions.map((d) => d.id)
  const { data: registrations } = await supabase
    .from("tournament_registrations")
    .select("id, division_id, player_id, partner_player_id, status")
    .in("division_id", divisionIds)
    .neq("status", "canceled")

  const playerIds = Array.from(
    new Set(
      (registrations ?? []).flatMap((r) =>
        [r.player_id, r.partner_player_id].filter(
          (id): id is string => id != null,
        ),
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
    (players ?? []).map((p) => [p.user_id, p.display_name ?? "Unknown player"]),
  )

  const divisionData = divisions.map((d) => {
    const regs = (registrations ?? []).filter((r) => r.division_id === d.id)
    return {
      id: d.id,
      name: d.name,
      play_type: d.play_type,
      play_type_label: PLAY_TYPE_LABELS[d.play_type],
      teams: regs.map((r) => ({
        registrationId: r.id,
        player_ids: [
          r.player_id,
          ...(r.partner_player_id ? [r.partner_player_id] : []),
        ],
        label: r.partner_player_id
          ? `${nameMap.get(r.player_id) ?? "Unknown"} + ${nameMap.get(r.partner_player_id) ?? "Unknown"}`
          : nameMap.get(r.player_id) ?? "Unknown",
      })),
    }
  })

  return (
    <Card>
      <div className="flex items-center justify-between mb-2">
        <div>
          <CardEyebrow>Finalize</CardEyebrow>
          <CardTitle className="mt-1">Award placements</CardTitle>
        </div>
        <Badge tone={tournamentStatus === "completed" ? "gold" : "outline"}>
          {tournamentStatus === "completed" ? "Completed" : "Open"}
        </Badge>
      </div>
      <p className="text-sm text-muted mb-4">
        Pick the top three teams per division. Awards{" "}
        <span className="font-semibold text-ink">+50/+30/+20 ranking</span> and{" "}
        <span className="font-semibold text-ink">+500/+300/+200 reward</span>{" "}
        points to each player.
      </p>

      <FinalizePanel
        tournamentId={tournamentId}
        divisions={divisionData}
        locked={tournamentStatus === "completed" || tournamentStatus === "canceled"}
      />
    </Card>
  )
}
