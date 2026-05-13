import { Badge } from "@/components/ui/Badge"
import type { PointsEligibilityStatus } from "@/types/database"

const TONE = {
  pending_minimum_teams: "outline",
  points_eligible: "accent",
  tracked_only: "warn",
  canceled: "warn",
} as const

export function PointsEligibilityBadge({
  status,
  teamCount,
  minTeams,
  className,
}: {
  status: PointsEligibilityStatus
  teamCount?: number
  minTeams?: number
  className?: string
}) {
  const label = (() => {
    switch (status) {
      case "points_eligible":
        return "Points eligible"
      case "tracked_only":
        return "Tracked only"
      case "canceled":
        return "Canceled"
      case "pending_minimum_teams":
        return teamCount != null && minTeams != null
          ? `Pending: ${teamCount}/${minTeams} teams`
          : "Pending minimum teams"
    }
  })()
  return (
    <Badge tone={TONE[status]} className={className}>
      {label}
    </Badge>
  )
}
