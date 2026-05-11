import type { HTMLAttributes } from "react"
import { cn } from "@/lib/utils"

type CardProps = HTMLAttributes<HTMLDivElement> & {
  tone?: "default" | "dark" | "accent"
}

export function Card({ className, tone = "default", ...props }: CardProps) {
  const tones = {
    default: "bg-surface border border-hairline",
    dark: "bg-surface-dark text-primary-ink border border-black/30",
    accent: "bg-accent text-accent-ink border border-accent",
  }
  return (
    <div
      className={cn(
        "rounded-[var(--radius-card)] p-5 shadow-[var(--shadow-soft)]",
        tones[tone],
        className,
      )}
      {...props}
    />
  )
}

export function CardHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("mb-4 flex items-center justify-between gap-3", className)}
      {...props}
    />
  )
}

export function CardTitle({ className, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn("font-display text-lg font-semibold tracking-tight", className)}
      {...props}
    />
  )
}

export function CardEyebrow({ className, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "text-[11px] uppercase tracking-[0.14em] font-semibold text-muted",
        className,
      )}
      {...props}
    />
  )
}
