/**
 * Points-eligibility logic.
 *
 * Mirrors what the Postgres `recalc_division_eligibility()` function does
 * server-side — kept in TS so the UI can show the right messaging without a
 * round-trip on edits (e.g. while the organizer is filling out a division
 * form). The DB remains the source of truth.
 */

import type { PointsEligibilityStatus, TournamentStatus } from "@/types/database"

export type EligibilityInput = {
  registeredTeamCount: number
  minTeamsForPoints: number
  tournamentStatus: TournamentStatus
  divisionStatus?: PointsEligibilityStatus
}

export type EligibilityResult = {
  pointsEligible: boolean
  pointsEligibilityStatus: PointsEligibilityStatus
  teamsNeededForEligibility: number
  playerFacingMessage: string
}

export function calculatePointsEligibility(
  input: EligibilityInput,
): EligibilityResult {
  const {
    registeredTeamCount,
    minTeamsForPoints,
    tournamentStatus,
    divisionStatus,
  } = input

  const teamsNeededForEligibility = Math.max(
    0,
    minTeamsForPoints - registeredTeamCount,
  )

  if (divisionStatus === "canceled" || tournamentStatus === "canceled") {
    return {
      pointsEligible: false,
      pointsEligibilityStatus: "canceled",
      teamsNeededForEligibility,
      playerFacingMessage: "This division is canceled.",
    }
  }

  if (registeredTeamCount >= minTeamsForPoints) {
    return {
      pointsEligible: true,
      pointsEligibilityStatus: "points_eligible",
      teamsNeededForEligibility: 0,
      playerFacingMessage:
        "This division is points eligible. Match wins and placement can earn ranking and reward points.",
    }
  }

  if (tournamentStatus === "draft" || tournamentStatus === "published") {
    return {
      pointsEligible: false,
      pointsEligibilityStatus: "pending_minimum_teams",
      teamsNeededForEligibility,
      playerFacingMessage:
        teamsNeededForEligibility === 1
          ? "This division needs 1 more team to become points eligible."
          : `This division needs ${teamsNeededForEligibility} more teams to become points eligible.`,
    }
  }

  return {
    pointsEligible: false,
    pointsEligibilityStatus: "tracked_only",
    teamsNeededForEligibility,
    playerFacingMessage:
      "This division is tracked for results and standings, but no points will be awarded because it has fewer than the minimum number of teams.",
  }
}

export const ELIGIBILITY_LABELS: Record<PointsEligibilityStatus, string> = {
  pending_minimum_teams: "Pending minimum teams",
  points_eligible: "Points eligible",
  tracked_only: "Tracked only",
  canceled: "Canceled",
}
