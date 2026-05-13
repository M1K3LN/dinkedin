import { Badge } from "@/components/ui/Badge"
import { ADVANCEMENT_LABELS } from "@/lib/match-center/standings"
import type { AdvancementStatus } from "@/lib/match-center/types"

const TONE: Record<
  AdvancementStatus,
  "neutral" | "accent" | "primary" | "warn" | "gold" | "outline"
> = {
  clinched: "gold",
  in_position: "accent",
  on_bubble: "warn",
  needs_win: "outline",
  eliminated: "warn",
  pending: "neutral",
}

export function AdvancementBadge({
  status,
  className,
}: {
  status: AdvancementStatus
  className?: string
}) {
  return (
    <Badge tone={TONE[status]} className={className}>
      {ADVANCEMENT_LABELS[status]}
    </Badge>
  )
}
