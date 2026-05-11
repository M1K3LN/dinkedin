import type { HTMLAttributes } from "react"
import { cn } from "@/lib/utils"

type Tone = "neutral" | "accent" | "primary" | "warn" | "gold" | "outline"

const tones: Record<Tone, string> = {
  neutral: "bg-surface-2 text-ink-2 border border-hairline",
  accent: "bg-accent text-accent-ink",
  primary: "bg-primary text-primary-ink",
  warn: "bg-warn/15 text-warn",
  gold: "bg-gold/20 text-[#7A5B00]",
  outline: "bg-transparent text-ink-2 border border-hairline",
}

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: Tone
}

export function Badge({ className, tone = "neutral", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold uppercase tracking-[0.08em]",
        tones[tone],
        className,
      )}
      {...props}
    />
  )
}
