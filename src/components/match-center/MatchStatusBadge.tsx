import { Badge } from "@/components/ui/Badge"
import type { MatchStatus } from "@/types/database"

const LABELS: Record<MatchStatus | "live", string> = {
  scheduled: "Scheduled",
  completed: "Final",
  disputed: "Disputed",
  canceled: "Canceled",
  live: "Live",
}

const TONE: Record<
  MatchStatus | "live",
  "neutral" | "accent" | "primary" | "warn" | "gold" | "outline"
> = {
  scheduled: "outline",
  completed: "primary",
  disputed: "warn",
  canceled: "warn",
  live: "accent",
}

export function MatchStatusBadge({
  status,
  className,
}: {
  status: MatchStatus | "live"
  className?: string
}) {
  return (
    <Badge tone={TONE[status]} className={className}>
      {status === "live" && (
        <span className="mr-1 inline-block size-1.5 rounded-full bg-current animate-pulse" />
      )}
      {LABELS[status]}
    </Badge>
  )
}
