/**
 * Round-robin standings calculator.
 *
 * Pure function: takes the teams and matches that exist for a division and
 * returns ranked standings with W/L, PF, PA, +/-, avg differential, and
 * advancement status. Doesn't read from the DB — pages pass in arrays.
 *
 * Tiebreaker order (modular by design — to change, swap `tiebreakers`):
 *   1. wins (desc)
 *   2. avg point differential (desc)
 *   3. total point differential (desc)
 *   4. points scored (desc)
 *   5. head-to-head (desc; only used between two tied teams)
 *   6. stable order by team id (fallback)
 */

import type {
  AdvancementStatus,
  Match,
  Standing,
  Team,
} from "./types"

type Accumulator = {
  teamId: string
  wins: number
  losses: number
  matchesPlayed: number
  pointsFor: number
  pointsAgainst: number
  /** matches already accounted for, indexed by opponent team id → wins vs them */
  h2hWinsByOpponent: Record<string, number>
}

function buildAccumulator(teamId: string): Accumulator {
  return {
    teamId,
    wins: 0,
    losses: 0,
    matchesPlayed: 0,
    pointsFor: 0,
    pointsAgainst: 0,
    h2hWinsByOpponent: {},
  }
}

/**
 * Determine each team's record from completed matches with numeric scores.
 * Matches without numeric scores or a winner are skipped so partially-entered
 * tournaments still render sensible standings.
 */
function tally(teams: Team[], matches: Match[]): Map<string, Accumulator> {
  const acc = new Map<string, Accumulator>(
    teams.map((t) => [t.id, buildAccumulator(t.id)]),
  )

  for (const m of matches) {
    if (m.status !== "completed") continue
    if (!m.team1Id || !m.team2Id) continue
    if (m.team1Score == null || m.team2Score == null) continue
    const t1 = acc.get(m.team1Id)
    const t2 = acc.get(m.team2Id)
    if (!t1 || !t2) continue

    t1.matchesPlayed += 1
    t2.matchesPlayed += 1
    t1.pointsFor += m.team1Score
    t1.pointsAgainst += m.team2Score
    t2.pointsFor += m.team2Score
    t2.pointsAgainst += m.team1Score

    const team1Won =
      m.winnerTeam === "team_1" ||
      (m.winnerTeam == null && m.team1Score > m.team2Score)
    if (team1Won) {
      t1.wins += 1
      t2.losses += 1
      t1.h2hWinsByOpponent[m.team2Id] = (t1.h2hWinsByOpponent[m.team2Id] ?? 0) + 1
    } else {
      t2.wins += 1
      t1.losses += 1
      t2.h2hWinsByOpponent[m.team1Id] = (t2.h2hWinsByOpponent[m.team1Id] ?? 0) + 1
    }
  }

  return acc
}

type Sortable = {
  acc: Accumulator
  pointDifferential: number
  avgPointDifferential: number
}

function toSortable(acc: Accumulator): Sortable {
  const pointDifferential = acc.pointsFor - acc.pointsAgainst
  const avgPointDifferential =
    acc.matchesPlayed > 0 ? pointDifferential / acc.matchesPlayed : 0
  return { acc, pointDifferential, avgPointDifferential }
}

function compareTiebreakers(a: Sortable, b: Sortable): number {
  // 1. wins
  if (a.acc.wins !== b.acc.wins) return b.acc.wins - a.acc.wins
  // 2. avg point differential
  if (a.avgPointDifferential !== b.avgPointDifferential) {
    return b.avgPointDifferential - a.avgPointDifferential
  }
  // 3. total point differential
  if (a.pointDifferential !== b.pointDifferential) {
    return b.pointDifferential - a.pointDifferential
  }
  // 4. points scored
  if (a.acc.pointsFor !== b.acc.pointsFor) {
    return b.acc.pointsFor - a.acc.pointsFor
  }
  // 5. head-to-head between the two tied teams
  const aH2H = a.acc.h2hWinsByOpponent[b.acc.teamId] ?? 0
  const bH2H = b.acc.h2hWinsByOpponent[a.acc.teamId] ?? 0
  if (aH2H !== bH2H) return bH2H - aH2H
  // 6. stable fallback
  return a.acc.teamId.localeCompare(b.acc.teamId)
}

function advancementStatus(
  rank: number,
  matchesPlayed: number,
  matchesRemainingMax: number,
  wins: number,
  teamsAdvancing: number,
  totalTeams: number,
  bestPossibleRank: number,
  worstPossibleRank: number,
): AdvancementStatus {
  if (matchesPlayed === 0) return "pending"

  // Once a team can't be caught by enough rivals to push them below cutoff
  // even if they lose every remaining match, they've clinched.
  if (worstPossibleRank <= teamsAdvancing) return "clinched"

  // Conversely, if their best possible rank can't reach the cutoff, they're out.
  if (bestPossibleRank > teamsAdvancing) return "eliminated"

  if (rank <= teamsAdvancing) {
    // In the cutoff but vulnerable: if losing all remaining could drop them
    // out, they're on the bubble.
    if (worstPossibleRank > teamsAdvancing) return "on_bubble"
    return "in_position"
  }
  // Outside the cutoff but still alive: they need a win to climb.
  if (matchesRemainingMax > 0) return "needs_win"
  return "eliminated"
}

export function calculateStandings(input: {
  teams: Team[]
  matches: Match[]
  teamsAdvancing: number | null
  totalRounds?: number
}): Standing[] {
  const { teams, matches, teamsAdvancing } = input

  const accMap = tally(teams, matches)
  const sortables: Sortable[] = []
  for (const team of teams) {
    const acc = accMap.get(team.id) ?? buildAccumulator(team.id)
    sortables.push(toSortable(acc))
  }
  sortables.sort(compareTiebreakers)

  // Compute matches remaining per team — bounded by how many opponents are
  // left for them in the schedule, so advancement math doesn't over-estimate.
  const remainingByTeam = new Map<string, number>(
    teams.map((t) => [t.id, 0]),
  )
  for (const m of matches) {
    if (m.status === "completed" || m.status === "canceled") continue
    if (!m.team1Id || !m.team2Id) continue
    remainingByTeam.set(m.team1Id, (remainingByTeam.get(m.team1Id) ?? 0) + 1)
    remainingByTeam.set(m.team2Id, (remainingByTeam.get(m.team2Id) ?? 0) + 1)
  }

  // First pass: assign rank by sort order.
  const rankByTeam = new Map<string, number>()
  sortables.forEach((s, i) => rankByTeam.set(s.acc.teamId, i + 1))

  const advancingCut = teamsAdvancing ?? Math.ceil(teams.length / 2)

  const standings: Standing[] = sortables.map((s) => {
    const rank = rankByTeam.get(s.acc.teamId)!
    const remaining = remainingByTeam.get(s.acc.teamId) ?? 0

    // Best possible: assume they win every remaining match. They could leap
    // ahead of any team with fewer (current wins + that team's remaining).
    const projectedWins = s.acc.wins + remaining
    let teamsThatCouldFinishAheadIfWeWin = 0
    let teamsThatCouldFinishBehindIfWeLose = 0
    for (const other of sortables) {
      if (other.acc.teamId === s.acc.teamId) continue
      const otherRemaining = remainingByTeam.get(other.acc.teamId) ?? 0
      const otherProjectedWins = other.acc.wins + otherRemaining
      // Best possible: their floor (current wins) vs our projected wins
      if (other.acc.wins > projectedWins) {
        teamsThatCouldFinishAheadIfWeWin++
      }
      // Worst possible: their ceiling (projected wins) vs our floor (current)
      if (otherProjectedWins > s.acc.wins) {
        teamsThatCouldFinishBehindIfWeLose++
      }
    }
    const bestPossibleRank = teamsThatCouldFinishAheadIfWeWin + 1
    const worstPossibleRank = teamsThatCouldFinishBehindIfWeLose + 1

    return {
      teamId: s.acc.teamId,
      rank,
      wins: s.acc.wins,
      losses: s.acc.losses,
      matchesPlayed: s.acc.matchesPlayed,
      pointsFor: s.acc.pointsFor,
      pointsAgainst: s.acc.pointsAgainst,
      pointDifferential: s.pointDifferential,
      avgPointDifferential:
        Math.round(s.avgPointDifferential * 10) / 10,
      advancementStatus: advancementStatus(
        rank,
        s.acc.matchesPlayed,
        remaining,
        s.acc.wins,
        advancingCut,
        teams.length,
        bestPossibleRank,
        worstPossibleRank,
      ),
    }
  })

  return standings
}

export const ADVANCEMENT_LABELS: Record<AdvancementStatus, string> = {
  clinched: "Clinched",
  in_position: "In Position",
  on_bubble: "On Bubble",
  needs_win: "Needs Win",
  eliminated: "Eliminated",
  pending: "Pending",
}
