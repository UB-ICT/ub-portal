import { BookOpen, ClipboardList, Grid3X3, LayoutGrid, Moon, Search, Sun } from "lucide-react"
import { useState } from "react"

import { useTheme } from "@/components/theme-provider"
import { cn } from "@/lib/utils"
import { UBIconTileButton } from "./UBButton"
import { UBNotificationBell } from "./UBNotificationBell"

type UBHeaderPortalProps = {
  userName: string
  userImageSrc?: string
  notificationCount?: number
  onThemeToggle?: () => void
  onNotificationsClick?: () => void
  onAppsClick?: () => void
  onProfileClick?: () => void
}

function getUserInitials(name: string) {
  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("")

  return initials || "UB"
}

export function UBHeaderPortal({
  userName,
  userImageSrc,
  notificationCount = 0,
  onThemeToggle,
  onNotificationsClick,
  onAppsClick,
  onProfileClick,
}: UBHeaderPortalProps) {
  const { theme, setTheme } = useTheme()
  const isDarkMode = theme === "dark"
  const [isAppsOpen, setIsAppsOpen] = useState(false)

  const handleThemeToggle = () => {
    onThemeToggle?.()
    setTheme(isDarkMode ? "light" : "dark")
  }

  const handleAppsClick = () => {
    onAppsClick?.()
    setIsAppsOpen((current) => !current)
  }

  return (
    <header className="border-b bg-background/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-4 lg:px-8">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
            <LayoutGrid className="size-5" />
          </div>

          <div className="shrink-0">
            <p className="text-sm font-medium text-muted-foreground">University of Belize</p>
            <h1 className="text-lg font-semibold tracking-tight">UB Portal</h1>
          </div>

          <div className="ml-2 hidden max-w-xl flex-1 sm:block">
            <label className="relative block">
              <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="search"
                placeholder="Search news, apps, topics..."
                className="h-10 w-full rounded-full border border-input bg-background pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/20"
              />
            </label>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleThemeToggle}
            className="inline-flex size-9 items-center justify-center rounded-full border border-border bg-background text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
          >
            {isDarkMode ? <Sun className="size-4" /> : <Moon className="size-4" />}
          </button>

          <UBNotificationBell
            notificationCount={notificationCount}
            onClick={onNotificationsClick}
          />

          <div className="relative">
            <button
              type="button"
              onClick={handleAppsClick}
              className="inline-flex size-9 items-center justify-center rounded-full border border-border bg-background text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label="Open apps"
              aria-expanded={isAppsOpen}
            >
              <Grid3X3 className="size-4" />
            </button>

            {isAppsOpen ? (
              <div className="absolute top-11 right-0 z-20 w-64 rounded-xl border bg-popover p-3 shadow-sm">
                <div className="grid grid-cols-2 gap-2">
                  <UBIconTileButton
                    label="Education"
                    icon={<BookOpen />}
                    className="w-full"
                    onClick={() => setIsAppsOpen(false)}
                  />
                  <UBIconTileButton
                    label="Requisitions"
                    icon={<ClipboardList />}
                    className="w-full"
                    onClick={() => setIsAppsOpen(false)}
                  />
                  <UBIconTileButton
                    label="Registration"
                    icon={<LayoutGrid />}
                    className="w-full"
                    onClick={() => setIsAppsOpen(false)}
                  />
                  <UBIconTileButton
                    label="Reports"
                    icon={<Grid3X3 />}
                    className="w-full"
                    onClick={() => setIsAppsOpen(false)}
                  />
                </div>
              </div>
            ) : null}
          </div>

          <button
            type="button"
            onClick={onProfileClick}
            className="inline-flex size-10 items-center justify-center overflow-hidden rounded-full border border-border bg-background text-sm font-semibold text-primary transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="Open profile"
          >
            {userImageSrc ? (
              <img
                src={userImageSrc}
                alt={`${userName} profile`}
                className="size-full object-cover"
              />
            ) : (
              <span className={cn("inline-flex size-full items-center justify-center bg-primary/10")}>{getUserInitials(userName)}</span>
            )}
          </button>
        </div>
      </div>
    </header>
  )
}
