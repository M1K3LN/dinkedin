import { createClient } from "@/lib/supabase/server"
import { Card, CardEyebrow, CardTitle } from "@/components/ui/Card"
import { EmptyState } from "@/components/ui/EmptyState"
import { Badge } from "@/components/ui/Badge"
import { PLAY_TYPE_LABELS } from "@/lib/validation"
import { MatchesPanel } from "./MatchesPanel"

export async function MatchesSection({
  tournamentId,
  locked,
}: {
  tournamentId: string
  locked: boolean
}) {
  const supabase = await createClient()

  const { data: divisions } = await supabase
    .from("tournament_divisions")
    .select("id, name, play_type")
    .eq("tournament_id", tournamentId)
    .order("created_at", { ascending: true })

  if (!divisions || divisions.length === 0) return null

  const divisionIds = divisions.map((d) => d.id)

  const [{ data: registrations }, { data: matches }] = await Promise.all([
    supabase
      .from("tournament_registrations")
      .select("id, division_id, player_id, partner_player_id, status")
      .in("division_id", divisionIds)
      .neq("status", "canceled"),
    supabase
      .from("matches")
      .select(
        "id, division_id, round_name, player_1_id, player_2_id, team_1_partner_id, team_2_partner_id, winner_team, winner_player_id, team_1_score, team_2_score, status, played_at",
      )
      .in("division_id", divisionIds)
      .order("created_at", { ascending: true }),
  ])

  const playerIds = Array.from(
    new Set(
      [
        ...(registrations ?? []).flatMap((r) =>
          [r.player_id, r.partner_player_id].filter(
            (id): id is string => id != null,
          ),
        ),
        ...(matches ?? []).flatMap((m) =>
          [
            m.player_1_id,
            m.player_2_id,
            m.team_1_partner_id,
            m.team_2_partner_id,
          ].filter((id): id is string => id != null),
        ),
      ],
    ),
  )

  const { data: players } = playerIds.length
    ? await supabase
        .from("player_profiles")
        .select("user_id, display_name")
        .in("user_id", playerIds)
    : { data: [] }

  const playerNameMap = new Map(
    (players ?? []).map((p) => [
      p.user_id,
      p.display_name ?? "Unknown player",
    ]),
  )

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <div>
          <CardEyebrow>Matches</CardEyebrow>
          <CardTitle className="mt-1">Bracket &amp; results</CardTitle>
        </div>
        {locked && <Badge tone="outline">Tournament finalized</Badge>}
      </div>

      {(registrations?.length ?? 0) === 0 ? (
        <EmptyState
          title="No registrations yet"
          description="Add at least one registration to a division before creating matches."
        />
      ) : (
        <div className="space-y-6">
          {divisions.map((d) => {
            const regsHere = (registrations ?? []).filter(
              (r) => r.division_id === d.id,
            )
            const matchesHere = (matches ?? []).filter(
              (m) => m.division_id === d.id,
            )
            return (
              <MatchesPanel
                key={d.id}
                tournamentId={tournamentId}
                division={{
                  id: d.id,
                  name: d.name,
                  play_type: d.play_type,
                  play_type_label: PLAY_TYPE_LABELS[d.play_type],
                }}
                locked={locked}
                registrations={regsHere.map((r) => ({
                  id: r.id,
                  label: teamLabel(
                    playerNameMap.get(r.player_id) ?? "Unknown",
                    r.partner_player_id
                      ? playerNameMap.get(r.partner_player_id) ?? "Unknown"
                      : null,
                  ),
                }))}
                matches={matchesHere.map((m) => ({
                  id: m.id,
                  round_name: m.round_name,
                  status: m.status,
                  team_1_score: m.team_1_score,
                  team_2_score: m.team_2_score,
                  winner_team: m.winner_team,
                  team_1_label: teamLabel(
                    playerNameMap.get(m.player_1_id ?? "") ?? "Unknown",
                    m.team_1_partner_id
                      ? playerNameMap.get(m.team_1_partner_id) ?? "Unknown"
                      : null,
                  ),
                  team_2_label: teamLabel(
                    playerNameMap.get(m.player_2_id ?? "") ?? "Unknown",
                    m.team_2_partner_id
                      ? playerNameMap.get(m.team_2_partner_id) ?? "Unknown"
                      : null,
                  ),
                }))}
              />
            )
          })}
        </div>
      )}
    </Card>
  )
}

function teamLabel(player: string, partner: string | null) {
  if (!partner) return player
  return `${player} + ${partner}`
}
