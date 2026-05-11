import { cn } from "@/lib/utils"

interface RankBadgeProps {
  /** Player rating, e.g. 4.235 */
  rating: number | null
  /** 0–100. Drives the reliability ring fill. */
  reliability?: number
  /** Shows a small tick in the top-right notch */
  verified?: boolean
  /** Visual size of the hex */
  size?: "sm" | "md" | "lg"
  className?: string
}

const sizeMap = {
  sm: { wrap: "size-20", text: "text-xl", label: "text-[9px]" },
  md: { wrap: "size-28", text: "text-3xl", label: "text-[10px]" },
  lg: { wrap: "size-40", text: "text-5xl", label: "text-[11px]" },
}

/**
 * Hex-stamped player rating — the app's signature element.
 * Lime hex chip, deep-green ring that fills based on match count,
 * small verified tick in the top-right notch.
 */
export function RankBadge({
  rating,
  reliability = 0,
  verified = false,
  size = "md",
  className,
}: RankBadgeProps) {
  const s = sizeMap[size]
  const display = rating == null ? "—" : rating.toFixed(3)
  const clamped = Math.max(0, Math.min(100, reliability))

  return (
    <div className={cn("relative inline-block", s.wrap, className)} aria-label="Player rating">
      {/* Reliability ring (deep green arc on chalk) */}
      <svg
        viewBox="0 0 100 100"
        className="absolute inset-0 -rotate-90"
        aria-hidden
      >
        <circle
          cx="50" cy="50" r="46"
          fill="none"
          stroke="rgba(15,61,46,0.10)"
          strokeWidth="3"
        />
        <circle
          cx="50" cy="50" r="46"
          fill="none"
          stroke="var(--primary)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={`${(clamped / 100) * 289.03} 289.03`}
        />
      </svg>

      {/* Lime hex chip */}
      <div className="absolute inset-2 clip-hex bg-accent text-accent-ink flex flex-col items-center justify-center select-none">
        <span className={cn("font-display font-bold tabular leading-none", s.text)}>
          {display}
        </span>
        <span className={cn("uppercase font-semibold tracking-[0.16em] mt-1 opacity-80", s.label)}>
          Rating
        </span>
      </div>

      {/* Verified tick */}
      {verified && (
        <span
          className="absolute top-0 right-0 grid place-items-center size-6 rounded-full bg-primary text-primary-ink ring-2 ring-[var(--bg)]"
          aria-label="Verified rating"
          title="Verified rating"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="size-3.5">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </span>
      )}
    </div>
  )
}
