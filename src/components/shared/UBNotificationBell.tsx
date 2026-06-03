import { Bell } from "lucide-react"
import type * as React from "react"

import { cn } from "@/lib/utils"

export type UBNotificationBellProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  notificationCount?: number
}

export function UBNotificationBell({
  notificationCount = 0,
  className,
  type = "button",
  ...props
}: UBNotificationBellProps) {
  const hasNotifications = notificationCount > 0

  return (
    <button
      type={type}
      className={cn(
        "relative inline-flex size-9 items-center justify-center rounded-full border border-border bg-background text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        className
      )}
      aria-label={`Notifications${hasNotifications ? ` (${notificationCount} new)` : ""}`}
      {...props}
    >
      <Bell className="size-4" />

      {hasNotifications ? (
        <span className="absolute -top-1 -right-1 inline-flex min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold text-primary-foreground">
          {notificationCount > 99 ? "99+" : notificationCount}
        </span>
      ) : null}
    </button>
  )
}
