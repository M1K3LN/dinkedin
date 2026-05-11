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
        <label htmlFor={inputId} className="text-sm font-medium">
          {label}
        </label>
        <input
          ref={ref}
          id={inputId}
          className={cn(
            "w-full h-11 rounded-xl border border-border bg-surface px-3 text-sm",
            "focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent",
            error && "border-red-500 focus:ring-red-500",
            className,
          )}
          aria-invalid={error ? "true" : "false"}
          {...props}
        />
        {hint && !error && <p className="text-xs text-muted">{hint}</p>}
        {error && <p className="text-xs text-red-600">{error}</p>}
      </div>
    )
  },
)
Field.displayName = "Field"
