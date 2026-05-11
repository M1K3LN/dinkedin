import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

interface StatProps {
  label: string
  value: ReactNode
  hint?: string
  tone?: "ink" | "accent" | "primary"
  className?: string
}

export function Stat({ label, value, hint, tone = "ink", className }: StatProps) {
  const valueTone = {
    ink: "text-ink",
    accent: "text-accent-ink",
    primary: "text-primary",
  }[tone]

  return (
    <div className={cn("space-y-1", className)}>
      <p className="text-[11px] uppercase tracking-[0.14em] font-semibold text-muted">
        {label}
      </p>
      <p
        className={cn(
          "font-display font-bold tabular leading-none text-3xl md:text-4xl",
          valueTone,
        )}
      >
        {value}
      </p>
      {hint && <p className="text-xs text-muted">{hint}</p>}
    </div>
  )
}

interface StatRowProps {
  children: ReactNode
  className?: string
}

/** Strava-style stat trio. Three stats with vertical hairlines between. */
export function StatRow({ children, className }: StatRowProps) {
  return (
    <div
      className={cn(
        "grid grid-cols-3 divide-x divide-hairline",
        "*:px-3 first:*:pl-0 last:*:pr-0",
        className,
      )}
    >
      {children}
    </div>
  )
}
