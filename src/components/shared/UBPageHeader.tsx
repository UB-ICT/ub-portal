import type * as React from "react"

export type UBPageHeaderProps = {
  title: string
  description?: React.ReactNode
  actions?: React.ReactNode
  variant?: "dashboard" | "section"
}

export function UBPageHeader({
  title,
  description,
  actions,
  variant = "section",
}: UBPageHeaderProps) {
  if (variant === "dashboard") {
    return (
      <div className="border-b border-border pb-5">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          {title}
        </h1>
        {description ? (
          <div className="mt-1 text-sm text-muted-foreground">{description}</div>
        ) : null}
      </div>
    )
  }

  return (
    <header className="flex shrink-0 flex-wrap items-center justify-between gap-3">
      <div>
        <h1 className="text-lg font-semibold tracking-tight">{title}</h1>
        {description ? (
          <div className="text-sm text-muted-foreground">{description}</div>
        ) : null}
      </div>
      {actions}
    </header>
  )
}
