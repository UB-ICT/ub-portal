import React from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export type UBButtonProps = React.ComponentProps<typeof Button>

export type UBIconTileButtonProps = React.ComponentProps<"button"> & {
  label: string
  icon: React.ReactNode
}

export function UBButton(props: UBButtonProps) {
  return <Button {...props} />
}

export function UBIconTileButton({
  label,
  icon,
  className,
  type = "button",
  ...props
}: UBIconTileButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex flex-col items-center gap-2 rounded-xl border border-transparent bg-transparent px-4 py-3 text-foreground transition-colors hover:border-border hover:bg-muted/40 focus-visible:border-ring focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50",
        className
      )}
      {...props}
    >
      <span className="inline-flex size-10 items-center justify-center rounded-lg border bg-background text-primary [&_svg]:size-5">
        {icon}
      </span>
      <span className="text-sm font-medium">{label}</span>
    </button>
  )
}
