import { cn } from "@/lib/utils"

type LoadingSpinnerProps = {
  className?: string
  label?: string
}

export function LoadingSpinner({
  className,
  label = "Loading",
}: LoadingSpinnerProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 py-8 text-center",
        className
      )}
      role="status"
      aria-live="polite"
      aria-label={label}
    >
      <div className="size-8 animate-spin rounded-full border-2 border-primary/20 border-t-primary" />
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  )
}
