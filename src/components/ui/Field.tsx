import { forwardRef, type InputHTMLAttributes, type ReactNode } from "react"
import { cn } from "@/lib/utils"

interface FieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  hint?: ReactNode
  error?: string
}

export const Field = forwardRef<HTMLInputElement, FieldProps>(
  ({ className, label, hint, error, id, ...props }, ref) => {
    const inputId = id ?? props.name
    return (
      <div className="space-y-1.5">
        <label htmlFor={inputId} className="text-sm font-medium text-ink-2">
          {label}
        </label>
        <input
          ref={ref}
          id={inputId}
          className={cn(
            "w-full h-12 rounded-2xl bg-surface border border-hairline px-4 text-[15px] placeholder:text-muted",
            "transition-colors hover:border-ink/20",
            error && "border-warn focus-visible:shadow-[0_0_0_3px_rgba(226,109,92,0.35)]",
            className,
          )}
          aria-invalid={error ? "true" : "false"}
          {...props}
        />
        {hint && !error && <p className="text-xs text-muted">{hint}</p>}
        {error && <p className="text-xs text-warn font-medium">{error}</p>}
      </div>
    )
  },
)
Field.displayName = "Field"
