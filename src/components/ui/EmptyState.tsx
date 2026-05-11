import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

interface EmptyStateProps {
  title: string
  description?: string
  action?: ReactNode
  icon?: ReactNode
  className?: string
}

export function EmptyState({ title, description, action, icon, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "rounded-[var(--radius-lg)] border border-dashed border-hairline bg-surface px-6 py-10 text-center",
        className,
      )}
    >
      <div className="mx-auto mb-4 grid size-12 place-items-center rounded-full bg-surface-2 text-primary">
        {icon ?? <PaddleIcon className="size-6" />}
      </div>
      <h3 className="font-display text-lg font-semibold tracking-tight">{title}</h3>
      {description && (
        <p className="mt-1 text-sm text-muted max-w-sm mx-auto">{description}</p>
      )}
      {action && <div className="mt-5 flex justify-center">{action}</div>}
    </div>
  )
}

function PaddleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <ellipse cx="10" cy="9" rx="6" ry="7" />
      <path d="M14 14l5 6" />
      <circle cx="10" cy="9" r="1.5" fill="currentColor" />
    </svg>
  )
}
