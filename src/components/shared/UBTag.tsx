import type * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const tagVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium whitespace-nowrap transition-colors",
  {
    variants: {
      variant: {
        neutral: "border-border bg-muted text-muted-foreground",
        primary: "border-primary/25 bg-primary/10 text-primary",
        secondary: "border-secondary/35 bg-secondary/60 text-secondary-foreground",
        destructive: "border-destructive/25 bg-destructive/10 text-destructive",
        category: "border-transparent bg-[#2d1b4e] text-white dark:bg-[#1a0f2e] dark:text-white/90",
      },
      size: {
        sm: "h-6",
        md: "h-7",
      },
      interactive: {
        true: "cursor-pointer hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
        false: "cursor-default",
      },
      selected: {
        true: "ring-1 ring-primary/35",
        false: "",
      },
    },
    defaultVariants: {
      variant: "neutral",
      size: "sm",
      interactive: false,
      selected: false,
    },
  }
)

export type UBTagProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof tagVariants> & {
    text: string
    icon?: React.ReactNode
    count?: number
    interactive?: boolean
    selected?: boolean
  }

export function UBTag({
  text,
  icon,
  count,
  variant,
  size,
  interactive,
  selected,
  className,
  type = "button",
  ...props
}: UBTagProps) {
  return (
    <button
      type={type}
      className={cn(
        tagVariants({ variant, size, interactive, selected }),
        className
      )}
      {...props}
    >
      {icon ? (
        <span className="inline-flex items-center justify-center [&_svg]:size-3.5">
          {icon}
        </span>
      ) : null}
      <span>{text}</span>

      {typeof count === "number" ? (
        <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-background/80 px-1 text-[11px] font-semibold">
          {count}
        </span>
      ) : null}
    </button>
  )
}
