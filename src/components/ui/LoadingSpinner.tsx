import { cn } from "@/lib/utils"

export function LoadingSpinner({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "inline-block size-5 animate-spin rounded-full border-2 border-current border-r-transparent align-[-0.125em]",
        className,
      )}
      role="status"
      aria-label="Loading"
    />
  )
}
