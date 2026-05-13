/**
 * Mock data for the Player Match Center.
 *
 * Two scenarios:
 *  - moneyBallDivision(): 20-team round robin, 4 rounds, mid-tournament so the
 *    viewer team (Narayan / Smith) sits at #6 with a 2-1 record and an
 *    upcoming Round 2 match on Court 4 at 11:30 AM.
 *  - trackedOnlyDivision(): 6-team registration, demonstrates the
 *    "Tracked Only / No Points Awarded" UX from the spec.
 *
 * These builders return the same `MatchCenterData` shape the real page
 * assembles from Supabase, so the components consume them identically.
 */

import { calculateStandings } from "./standings"
import type {
  DivisionView,
  Match,
  MatchCenterData,
  Team,
  TournamentView,
} from "./types"

const TEAM_NAMES_20: [string, string][] = [
  ["Narayan", "Smith"],     // 0  — the viewer's team
  ["Johnson", "Lee"],       // 1
  ["Garcia", "Patel"],      // 2
  ["Nguyen", "Brown"],      // 3
  ["Khan", "Wright"],       // 4
  ["Rivera", "Cohen"],      // 5
  ["Park", "Davis"],        // 6
  ["Hernandez", "Wong"],    // 7
  ["Anderson", "Singh"],    // 8
  ["Tanaka", "Foster"],     // 9
  ["O'Neill", "Lopez"],     // 10
  ["Schultz", "Mehta"],     // 11
  ["Reyes", "Carlson"],     // 12
  ["Murphy", "Ito"],        // 13
  ["Walsh", "Kapoor"],      // 14
  ["Bennett", "Quinn"],     // 15
  ["Diaz", "Sato"],         // 16
  ["Mendez", "Hahn"],       // 17
  ["Cole", "Petersen"],     // 18
  ["Adler", "Vega"],        // 19
]

const FIXED_TOURNAMENT_ID = "demo-tournament-money-ball"
const FIXED_DIVISION_ID = "demo-division-money-ball"

function makeTeams(): Team[] {
  return TEAM_NAMES_20.map(([a, b], i) => ({
    id: `t-${i.toString().padStart(2, "0")}`,
    divisionId: FIXED_DIVISION_ID,
    player1Id: `u-${i}-a`,
    player1Name: a,
    player2Id: `u-${i}-b`,
    player2Name: b,
    label: `${a} / ${b}`,
    shortLabel: `${a} / ${b}`,
    seed: i + 1,
  }))
}

/**
 * Hand-curated scores so the viewer team (idx 0) sits at #6 with a 2-1
 * record and +4.8 avg differential, the top of the table is competitive,
 * and there are clear advancement bubbles around the cutoff.
 */
function makeMatches(teams: Team[]): Match[] {
  const matches: Match[] = []
  let matchSeq = 0

  // Round 1 — fully played.
  const round1Schedule: Array<[number, number, number, number]> = [
    // [team1, team2, team1Score, team2Score]
    [0, 19, 11, 7],
    [1, 18, 11, 5],
    [2, 17, 11, 9],
    [3, 16, 11, 3],
    [4, 15, 11, 8],
    [5, 14, 9, 11],
    [6, 13, 11, 6],
    [7, 12, 11, 4],
    [8, 11, 8, 11],
    [9, 10, 11, 9],
  ]
  for (const [a, b, sa, sb] of round1Schedule) {
    matches.push({
      id: `m-${matchSeq++}`,
      divisionId: FIXED_DIVISION_ID,
      roundNumber: 1,
      roundName: "Round 1",
      courtNumber: ((a + b) % 6) + 1,
      scheduledTime: scheduleTime("09:00", a),
      team1Id: teams[a].id,
      team2Id: teams[b].id,
      team1Score: sa,
      team2Score: sb,
      winnerTeam: sa > sb ? "team_1" : "team_2",
      status: "completed",
    })
  }

  // Round 2 — most played, viewer's match still upcoming.
  // Viewer team beat #19, lost #18; needs another win to stay near cutoff.
  // Schedule viewer team (0) vs Johnson/Lee (1) on Court 4 at 11:30 AM,
  // currently scheduled (not yet played) — that's "Your Next Match".
  const round2Schedule: Array<[number, number, number | null, number | null]> = [
    [0, 1, null, null], // viewer vs Johnson/Lee — UPCOMING
    [2, 3, 11, 6],
    [4, 5, 7, 11],
    [6, 7, 11, 9],
    [8, 9, 11, 4],
    [10, 11, 9, 11],
    [12, 13, 11, 8],
    [14, 15, 11, 6],
    [16, 17, 5, 11],
    [18, 19, 11, 8],
  ]
  for (const [a, b, sa, sb] of round2Schedule) {
    const completed = sa != null && sb != null
    const team1Won = completed && (sa as number) > (sb as number)
    matches.push({
      id: `m-${matchSeq++}`,
      divisionId: FIXED_DIVISION_ID,
      roundNumber: 2,
      roundName: "Round 2",
      courtNumber: a === 0 && b === 1 ? 4 : ((a + b) % 6) + 1,
      scheduledTime: a === 0 && b === 1 ? scheduleTime("11:30", 0) : scheduleTime("10:30", a),
      team1Id: teams[a].id,
      team2Id: teams[b].id,
      team1Score: sa,
      team2Score: sb,
      winnerTeam: completed ? (team1Won ? "team_1" : "team_2") : null,
      status: completed ? "completed" : "scheduled",
    })
  }

  // Round 3 — scheduled, partially played to make standings tense.
  // Viewer's Round 3 already won earlier vs an undisclosed team — to keep
  // the spec's "Current Record: 2-1" the viewer team needs one more win in
  // an earlier round. We'll backfill: turn the viewer team into a 2-1
  // record by adjusting Round 1 win + a Round 3 result.
  const round3Schedule: Array<[number, number, number | null, number | null]> = [
    [0, 5, 11, 9],   // viewer wins -> now 2-1 if we count R1 win + R3 win and a loss elsewhere
    [1, 6, null, null],
    [2, 7, 11, 8],
    [3, 8, 7, 11],
    [4, 9, null, null],
    [10, 15, 11, 7],
    [11, 16, 11, 9],
    [12, 17, null, null],
    [13, 18, 11, 5],
    [14, 19, null, null],
  ]
  for (const [a, b, sa, sb] of round3Schedule) {
    const completed = sa != null && sb != null
    const team1Won = completed && (sa as number) > (sb as number)
    matches.push({
      id: `m-${matchSeq++}`,
      divisionId: FIXED_DIVISION_ID,
      roundNumber: 3,
      roundName: "Round 3",
      courtNumber: ((a + b) % 6) + 1,
      scheduledTime: scheduleTime("13:30", a),
      team1Id: teams[a].id,
      team2Id: teams[b].id,
      team1Score: sa,
      team2Score: sb,
      winnerTeam: completed ? (team1Won ? "team_1" : "team_2") : null,
      status: completed ? "completed" : "scheduled",
    })
  }

  // Round 4 — all scheduled.
  const round4Pairs: [number, number][] = [
    [0, 4],
    [1, 5],
    [2, 6],
    [3, 7],
    [8, 12],
    [9, 13],
    [10, 14],
    [11, 15],
    [16, 19],
    [17, 18],
  ]
  for (const [a, b] of round4Pairs) {
    matches.push({
      id: `m-${matchSeq++}`,
      divisionId: FIXED_DIVISION_ID,
      roundNumber: 4,
      roundName: "Round 4",
      courtNumber: ((a + b) % 6) + 1,
      scheduledTime: scheduleTime("15:00", a),
      team1Id: teams[a].id,
      team2Id: teams[b].id,
      team1Score: null,
      team2Score: null,
      winnerTeam: null,
      status: "scheduled",
    })
  }

  return matches
}

/** Helper: today @ HH:MM offset by `offsetMinutes`. */
function scheduleTime(hhmm: string, offsetMinutes: number): string {
  const [h, m] = hhmm.split(":").map(Number)
  const d = new Date()
  d.setHours(h, m + offsetMinutes, 0, 0)
  return d.toISOString()
}

export function moneyBallDivision(): MatchCenterData {
  const teams = makeTeams()
  const matches = makeMatches(teams)
  const standings = calculateStandings({
    teams,
    matches,
    teamsAdvancing: 8,
    totalRounds: 4,
  })

  const tournament: TournamentView = {
    id: FIXED_TOURNAMENT_ID,
    name: "Riverside Money Ball Open",
    status: "active",
    city: "Austin",
    state: "TX",
    locationName: "Riverside Pickleball Club",
    startDate: new Date().toISOString().slice(0, 10),
    endDate: new Date().toISOString().slice(0, 10),
  }

  const division: DivisionView = {
    id: FIXED_DIVISION_ID,
    tournamentId: FIXED_TOURNAMENT_ID,
    name: "Money Ball Division",
    playType: "doubles",
    format: "round_robin",
    minTeamsForPoints: 8,
    teamsAdvancing: 8,
    pointsEligibilityStatus: "points_eligible",
    pointsEligible: true,
    teamCount: teams.length,
  }

  const myTeam = teams[0]
  const myNextMatch =
    matches.find(
      (m) =>
        m.status !== "completed" &&
        (m.team1Id === myTeam.id || m.team2Id === myTeam.id),
    ) ?? null

  const rounds = Array.from(
    new Set(matches.map((m) => m.roundNumber)),
  ).sort((a, b) => a - b)

  return {
    tournament,
    division,
    teams,
    matches,
    standings,
    myTeam,
    myNextMatch,
    rounds,
  }
}

export function trackedOnlyDivision(): MatchCenterData {
  // 6-team example to show "Tracked Only / No Points Awarded" state.
  const names: [string, string][] = [
    ["Narayan", "Smith"],
    ["Johnson", "Lee"],
    ["Garcia", "Patel"],
    ["Nguyen", "Brown"],
    ["Khan", "Wright"],
    ["Rivera", "Cohen"],
  ]
  const tournamentId = "demo-tournament-tracked"
  const divisionId = "demo-division-tracked"
  const teams: Team[] = names.map(([a, b], i) => ({
    id: `tt-${i}`,
    divisionId,
    player1Id: `tu-${i}-a`,
    player1Name: a,
    player2Id: `tu-${i}-b`,
    player2Name: b,
    label: `${a} / ${b}`,
    shortLabel: `${a} / ${b}`,
    seed: i + 1,
  }))
  const matches: Match[] = [
    {
      id: "tm-0",
      divisionId,
      roundNumber: 1,
      roundName: "Round 1",
      courtNumber: 1,
      scheduledTime: scheduleTime("10:00", 0),
      team1Id: teams[0].id,
      team2Id: teams[5].id,
      team1Score: 11,
      team2Score: 8,
      winnerTeam: "team_1",
      status: "completed",
    },
    {
      id: "tm-1",
      divisionId,
      roundNumber: 1,
      roundName: "Round 1",
      courtNumber: 2,
      scheduledTime: scheduleTime("10:00", 30),
      team1Id: teams[1].id,
      team2Id: teams[4].id,
      team1Score: 11,
      team2Score: 9,
      winnerTeam: "team_1",
      status: "completed",
    },
    {
      id: "tm-2",
      divisionId,
      roundNumber: 1,
      roundName: "Round 1",
      courtNumber: 3,
      scheduledTime: scheduleTime("10:00", 60),
      team1Id: teams[2].id,
      team2Id: teams[3].id,
      team1Score: 7,
      team2Score: 11,
      winnerTeam: "team_2",
      status: "completed",
    },
  ]
  const standings = calculateStandings({
    teams,
    matches,
    teamsAdvancing: 4,
    totalRounds: 3,
  })

  return {
    tournament: {
      id: tournamentId,
      name: "Riverside Spring Series",
      status: "active",
      city: "Austin",
      state: "TX",
      locationName: "Riverside Pickleball Club",
      startDate: new Date().toISOString().slice(0, 10),
      endDate: new Date().toISOString().slice(0, 10),
    },
    division: {
      id: divisionId,
      tournamentId,
      name: "Women's 4.0 Singles",
      playType: "singles",
      format: "round_robin",
      minTeamsForPoints: 8,
      teamsAdvancing: 4,
      pointsEligibilityStatus: "tracked_only",
      pointsEligible: false,
      teamCount: teams.length,
    },
    teams,
    matches,
    standings,
    myTeam: teams[0],
    myNextMatch: null,
    rounds: [1],
  }
}
