import type * as React from "react"

import { cn } from "@/lib/utils"
import { UBButton } from "./UBButton"

export type UBCardProps = React.HTMLAttributes<HTMLDivElement> & {
  subtitle?: string
  title: string
  description: string
  imageSrc?: string
  imageAlt?: string
  icon?: React.ReactNode
  actionLabel?: string
  onAction?: () => void
}

export function UBCard({
  subtitle,
  title,
  description,
  imageSrc,
  imageAlt,
  icon,
  actionLabel,
  onAction,
  className,
  ...props
}: UBCardProps) {
  return (
    <div
      className={cn("rounded-2xl border bg-card p-6 shadow-sm", className)}
      {...props}
    >
      {imageSrc ? (
        <img
          src={imageSrc}
          alt={imageAlt ?? title}
          className="mb-4 h-40 w-full rounded-xl object-cover"
        />
      ) : null}

      {!imageSrc && icon ? (
        <div className="mb-4 inline-flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
          {icon}
        </div>
      ) : null}

      {!imageSrc && !icon && subtitle ? (
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
          {subtitle}
        </p>
      ) : null}

      <h3 className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
        {title}
      </h3>
      <p className="mt-3 text-sm leading-6 text-muted-foreground">
        {description}
      </p>

      {actionLabel ? (
        <UBButton
          className="mt-5"
          variant="outline"
          onClick={onAction}
        >
          {actionLabel}
        </UBButton>
      ) : null}
    </div>
  )
}