/**
 * Match Center view-model types.
 *
 * These types describe the *shape the UI expects* — they are not 1:1 with the
 * database rows. Pages assemble them either from Supabase queries (real data)
 * or from mock builders (demo data); the components don't care which.
 *
 * Where each field maps to today (see `src/app/(player)/tournaments/[id]/match-center/page.tsx`):
 *  - Team           = a `tournament_registrations` row + the two players'
 *                     display names joined from `player_profiles`.
 *  - Match          = a `matches` row.
 *  - Standing       = derived in-memory from completed matches by
 *                     `src/lib/match-center/standings.ts`.
 *  - DivisionView   = `tournament_divisions` row + a few derived fields.
 *  - Tournament/Division-level eligibility = computed by
 *    `src/lib/match-center/eligibility.ts` from the same shape the DB stores.
 */

import type {
  MatchStatus,
  PointsEligibilityStatus,
  PlayType,
  TournamentStatus,
  WinnerTeam,
} from "@/types/database"

export type Team = {
  /** registration id — stable team identity */
  id: string
  divisionId: string
  player1Id: string
  player1Name: string
  player2Id: string | null
  player2Name: string | null
  /** "Narayan / Smith" or just "Narayan" for singles */
  label: string
  /** "Narayan / Smith" shortened with last names when available */
  shortLabel: string
  seed: number | null
}

/** UI-extended status: the DB only knows scheduled/completed/disputed/canceled
 *  but the Match Center can also render "live" for in-progress matches when
 *  the data source provides it (demo mock and, eventually, real live scoring). */
export type MatchUiStatus = MatchStatus | "live"

export type Match = {
  id: string
  divisionId: string
  roundNumber: number
  roundName: string | null
  courtNumber: number | null
  scheduledTime: string | null
  team1Id: string | null
  team2Id: string | null
  team1Score: number | null
  team2Score: number | null
  winnerTeam: WinnerTeam | null
  status: MatchUiStatus
}

export type AdvancementStatus =
  | "clinched"
  | "in_position"
  | "on_bubble"
  | "needs_win"
  | "eliminated"
  | "pending"

export type Standing = {
  teamId: string
  rank: number
  wins: number
  losses: number
  matchesPlayed: number
  pointsFor: number
  pointsAgainst: number
  pointDifferential: number
  avgPointDifferential: number
  advancementStatus: AdvancementStatus
}

export type DivisionView = {
  id: string
  tournamentId: string
  name: string
  playType: PlayType
  format: "round_robin"
  minTeamsForPoints: number
  teamsAdvancing: number | null
  pointsEligibilityStatus: PointsEligibilityStatus
  pointsEligible: boolean
  teamCount: number
}

export type TournamentView = {
  id: string
  name: string
  status: TournamentStatus
  city: string | null
  state: string | null
  locationName: string | null
  startDate: string | null
  endDate: string | null
}

export type MatchCenterData = {
  tournament: TournamentView
  division: DivisionView
  teams: Team[]
  matches: Match[]
  standings: Standing[]
  /** The current viewer's team if they're registered in this division. */
  myTeam: Team | null
  /** Their next non-completed match, if any. */
  myNextMatch: Match | null
  /** All distinct round numbers present, ascending. */
  rounds: number[]
}
