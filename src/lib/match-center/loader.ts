/**
 * Real-data loader for the Match Center.
 *
 * Loads a single division view (the division the viewer is registered in,
 * or the first division on the tournament if not registered) and assembles
 * the `MatchCenterData` shape the components expect. Standings are derived
 * in-memory on every load — cheap for the team sizes we support and avoids
 * a separate standings table.
 */

import "server-only"
import { createClient } from "@/lib/supabase/server"
import type {
  DivisionView,
  Match,
  MatchCenterData,
  Team,
  TournamentView,
} from "./types"
import { calculateStandings } from "./standings"

/**
 * Load the Match Center for a tournament + the viewer. If `divisionId` is
 * passed, prefer that division; otherwise pick the one the viewer is in,
 * else the first division on the tournament. Returns null when the
 * tournament doesn't exist or has no divisions.
 */
export async function loadMatchCenter(
  tournamentId: string,
  viewerUserId: string,
  preferredDivisionId?: string,
): Promise<MatchCenterData | null> {
  const supabase = await createClient()

  const { data: tournamentRow } = await supabase
    .from("tournaments")
    .select(
      "id, name, status, city, state, location_name, start_date, end_date",
    )
    .eq("id", tournamentId)
    .maybeSingle()
  if (!tournamentRow) return null

  const { data: divisions } = await supabase
    .from("tournament_divisions")
    .select(
      "id, tournament_id, name, play_type, min_teams_for_points, teams_advancing, points_eligibility_status, points_eligible",
    )
    .eq("tournament_id", tournamentId)
    .order("created_at", { ascending: true })

  if (!divisions || divisions.length === 0) return null

  // Pick the active division.
  let divisionRow = preferredDivisionId
    ? divisions.find((d) => d.id === preferredDivisionId) ?? null
    : null
  if (!divisionRow) {
    // Find the viewer's division if they're registered.
    const { data: myReg } = await supabase
      .from("tournament_registrations")
      .select("division_id")
      .eq("tournament_id", tournamentId)
      .or(`player_id.eq.${viewerUserId},partner_player_id.eq.${viewerUserId}`)
      .neq("status", "canceled")
      .limit(1)
      .maybeSingle()
    divisionRow =
      (myReg && divisions.find((d) => d.id === myReg.division_id)) ??
      divisions[0]
  }

  const division = divisionRow

  // All teams in this division.
  const { data: registrations } = await supabase
    .from("tournament_registrations")
    .select("id, player_id, partner_player_id, status")
    .eq("division_id", division.id)
    .neq("status", "canceled")
    .order("registered_at", { ascending: true })

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
    (players ?? []).map((p) => [
      p.user_id,
      p.display_name ?? "Unknown player",
    ]),
  )

  const teams: Team[] = (registrations ?? []).map((r, i) => {
    const p1 = nameMap.get(r.player_id) ?? "Unknown"
    const p2 = r.partner_player_id
      ? nameMap.get(r.partner_player_id) ?? "Unknown"
      : null
    return {
      id: r.id,
      divisionId: division.id,
      player1Id: r.player_id,
      player1Name: p1,
      player2Id: r.partner_player_id,
      player2Name: p2,
      label: p2 ? `${p1} / ${p2}` : p1,
      shortLabel: p2 ? `${p1} / ${p2}` : p1,
      seed: i + 1,
    }
  })

  // Match the registration row (a "team") to the viewer if they're player or partner.
  const myTeam =
    teams.find(
      (t) => t.player1Id === viewerUserId || t.player2Id === viewerUserId,
    ) ?? null

  // All matches in this division.
  const { data: matchRows } = await supabase
    .from("matches")
    .select(
      "id, division_id, round_number, round_name, court_number, scheduled_time, player_1_id, player_2_id, team_1_partner_id, team_2_partner_id, team_1_score, team_2_score, winner_team, status",
    )
    .eq("division_id", division.id)
    .order("round_number", { ascending: true, nullsFirst: true })
    .order("scheduled_time", { ascending: true, nullsFirst: true })

  // Match's player_1_id + team_1_partner_id maps back to a registration (team).
  // Find the registration whose player_id/partner_player_id matches.
  function findTeamId(
    primary: string | null,
    partner: string | null,
  ): string | null {
    if (!primary) return null
    const team = teams.find(
      (t) =>
        (t.player1Id === primary && t.player2Id === partner) ||
        (t.player2Id === primary && t.player1Id === partner) ||
        (partner == null && t.player1Id === primary && t.player2Id == null),
    )
    return team?.id ?? null
  }

  const matches: Match[] = (matchRows ?? []).map((m) => ({
    id: m.id,
    divisionId: m.division_id,
    roundNumber: m.round_number ?? 1,
    roundName: m.round_name,
    courtNumber: m.court_number,
    scheduledTime: m.scheduled_time,
    team1Id: findTeamId(m.player_1_id, m.team_1_partner_id),
    team2Id: findTeamId(m.player_2_id, m.team_2_partner_id),
    team1Score: m.team_1_score,
    team2Score: m.team_2_score,
    winnerTeam: m.winner_team,
    status: m.status,
  }))

  const standings = calculateStandings({
    teams,
    matches,
    teamsAdvancing: division.teams_advancing ?? null,
  })

  const myNextMatch = myTeam
    ? matches.find(
        (m) =>
          m.status !== "completed" &&
          (m.team1Id === myTeam.id || m.team2Id === myTeam.id),
      ) ?? null
    : null

  const rounds = Array.from(new Set(matches.map((m) => m.roundNumber))).sort(
    (a, b) => a - b,
  )

  const tournament: TournamentView = {
    id: tournamentRow.id,
    name: tournamentRow.name,
    status: tournamentRow.status,
    city: tournamentRow.city,
    state: tournamentRow.state,
    locationName: tournamentRow.location_name,
    startDate: tournamentRow.start_date,
    endDate: tournamentRow.end_date,
  }

  const divisionView: DivisionView = {
    id: division.id,
    tournamentId: division.tournament_id,
    name: division.name,
    playType: division.play_type,
    format: "round_robin",
    minTeamsForPoints: division.min_teams_for_points,
    teamsAdvancing: division.teams_advancing,
    pointsEligibilityStatus: division.points_eligibility_status,
    pointsEligible: division.points_eligible,
    teamCount: teams.length,
  }

  return {
    tournament,
    division: divisionView,
    teams,
    matches,
    standings,
    myTeam,
    myNextMatch,
    rounds: rounds.length > 0 ? rounds : [1],
  }
}
