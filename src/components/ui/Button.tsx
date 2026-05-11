import { forwardRef, type ButtonHTMLAttributes } from "react"
import { cn } from "@/lib/utils"

type Variant = "primary" | "secondary" | "outline" | "ghost" | "danger"
type Size = "sm" | "md" | "lg"

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  fullWidth?: boolean
}

const variants: Record<Variant, string> = {
  primary:
    "bg-accent text-accent-ink hover:brightness-95 active:brightness-90 shadow-[0_1px_0_rgba(11,11,11,0.06),0_8px_24px_-12px_rgba(15,61,46,0.45)]",
  secondary:
    "bg-primary text-primary-ink hover:brightness-110 active:brightness-95",
  outline:
    "border border-ink/15 bg-surface text-ink hover:bg-surface-2",
  ghost: "text-ink hover:bg-surface-2",
  danger: "bg-warn text-white hover:brightness-95",
}

const sizes: Record<Size, string> = {
  sm: "h-9 px-3.5 text-sm rounded-full",
  md: "h-11 px-5 text-sm rounded-full",
  lg: "h-13 px-6 text-base rounded-full",
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", fullWidth, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center gap-2 font-semibold tracking-tight transition disabled:opacity-50 disabled:cursor-not-allowed",
        variants[variant],
        sizes[size],
        fullWidth && "w-full",
        className,
      )}
      {...props}
    />
  ),
)
Button.displayName = "Button"
