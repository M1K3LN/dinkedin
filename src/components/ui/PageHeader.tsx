import type { ReactNode } from "react"

interface PageHeaderProps {
  eyebrow?: string
  title: string
  description?: string
  action?: ReactNode
}

export function PageHeader({ eyebrow, title, description, action }: PageHeaderProps) {
  return (
    <div className="flex items-start justify-between gap-4 mb-6">
      <div>
        {eyebrow && (
          <p className="text-[11px] uppercase tracking-[0.14em] font-semibold text-muted mb-1.5">
            {eyebrow}
          </p>
        )}
        <h1 className="font-display text-3xl md:text-4xl font-bold tracking-tight">
          {title}
        </h1>
        {description && (
          <p className="mt-2 text-[15px] text-ink-2 max-w-prose">{description}</p>
        )}
      </div>
      {action}
    </div>
  )
}
