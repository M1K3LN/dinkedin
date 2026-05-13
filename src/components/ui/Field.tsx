import {
  forwardRef,
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from "react"
import { cn } from "@/lib/utils"

const inputClasses = (error?: string) =>
  cn(
    "w-full h-12 rounded-2xl bg-surface border border-hairline px-4 text-[15px] placeholder:text-muted",
    "transition-colors hover:border-ink/20",
    error && "border-warn focus-visible:shadow-[0_0_0_3px_rgba(226,109,92,0.35)]",
  )

function FieldWrap({
  label,
  htmlFor,
  hint,
  error,
  children,
}: {
  label: string
  htmlFor?: string
  hint?: ReactNode
  error?: string
  children: ReactNode
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={htmlFor} className="text-sm font-medium text-ink-2">
        {label}
      </label>
      {children}
      {hint && !error && <p className="text-xs text-muted">{hint}</p>}
      {error && <p className="text-xs text-warn font-medium">{error}</p>}
    </div>
  )
}

// -----------------------------------------------------------------------------
// Text input

interface FieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  hint?: ReactNode
  error?: string
}

export const Field = forwardRef<HTMLInputElement, FieldProps>(
  ({ className, label, hint, error, id, ...props }, ref) => {
    const inputId = id ?? props.name
    return (
      <FieldWrap label={label} htmlFor={inputId} hint={hint} error={error}>
        <input
          ref={ref}
          id={inputId}
          className={cn(inputClasses(error), className)}
          aria-invalid={error ? "true" : "false"}
          {...props}
        />
      </FieldWrap>
    )
  },
)
Field.displayName = "Field"

// -----------------------------------------------------------------------------
// Select

interface SelectFieldProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string
  hint?: ReactNode
  error?: string
  options: { value: string; label: string }[]
  placeholder?: string
}

export const SelectField = forwardRef<HTMLSelectElement, SelectFieldProps>(
  (
    { className, label, hint, error, id, options, placeholder, ...props },
    ref,
  ) => {
    const inputId = id ?? props.name
    return (
      <FieldWrap label={label} htmlFor={inputId} hint={hint} error={error}>
        <div className="relative">
          <select
            ref={ref}
            id={inputId}
            className={cn(
              inputClasses(error),
              "appearance-none pr-10",
              !props.value && !props.defaultValue && "text-muted",
              className,
            )}
            aria-invalid={error ? "true" : "false"}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((o) => (
              <option key={o.value} value={o.value} className="text-ink">
                {o.label}
              </option>
            ))}
          </select>
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
            className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 size-4 text-muted"
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>
      </FieldWrap>
    )
  },
)
SelectField.displayName = "SelectField"

// -----------------------------------------------------------------------------
// Textarea

interface TextareaFieldProps
  extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string
  hint?: ReactNode
  error?: string
}

export const TextareaField = forwardRef<
  HTMLTextAreaElement,
  TextareaFieldProps
>(({ className, label, hint, error, id, rows = 4, ...props }, ref) => {
  const inputId = id ?? props.name
  return (
    <FieldWrap label={label} htmlFor={inputId} hint={hint} error={error}>
      <textarea
        ref={ref}
        id={inputId}
        rows={rows}
        className={cn(
          inputClasses(error),
          "h-auto py-3 leading-relaxed resize-y",
          className,
        )}
        aria-invalid={error ? "true" : "false"}
        {...props}
      />
    </FieldWrap>
  )
})
TextareaField.displayName = "TextareaField"
