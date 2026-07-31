import type * as React from "react"

import { cn } from "@/lib/utils"

export type UBArrowStageProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  label: string
  sequence?: number
  selected?: boolean
  userCount?: number
  isFirst?: boolean
  isLast?: boolean
}

/**
 * Chevron / arrow-shaped stage node for pipeline editors.
 * Uses clip-path so stages nest visually as a left-to-right flow.
 */
export function UBArrowStage({
  label,
  sequence,
  selected = false,
  userCount,
  isFirst = false,
  isLast = false,
  className,
  type = "button",
  ...props
}: UBArrowStageProps) {
  return (
    <button
      type={type}
      className={cn(
        "relative z-0 inline-flex min-h-16 min-w-[9.5rem] cursor-pointer flex-col items-start justify-center gap-0.5 px-6 py-3 text-left transition-colors focus-visible:z-20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        isFirst ? "pl-5" : "pl-7",
        isLast ? "pr-6" : "pr-8",
        selected
          ? "z-10 bg-primary text-primary-foreground"
          : "bg-muted text-foreground hover:bg-muted/80",
        className
      )}
      style={{
        clipPath: isFirst
          ? "polygon(0 0, calc(100% - 18px) 0, 100% 50%, calc(100% - 18px) 100%, 0 100%)"
          : "polygon(0 0, calc(100% - 18px) 0, 100% 50%, calc(100% - 18px) 100%, 0 100%, 18px 50%)",
      }}
      {...props}
    >
      {sequence != null ? (
        <span
          className={cn(
            "text-[10px] font-semibold tracking-wider uppercase",
            selected ? "text-primary-foreground/80" : "text-muted-foreground"
          )}
        >
          Stage {sequence}
        </span>
      ) : null}
      <span className="truncate text-sm font-semibold">{label}</span>
      {userCount != null ? (
        <span
          className={cn(
            "text-xs",
            selected ? "text-primary-foreground/80" : "text-muted-foreground"
          )}
        >
          {userCount} {userCount === 1 ? "user" : "users"}
        </span>
      ) : null}
    </button>
  )
}
