import { Bell, LayoutGrid, LogOut, Moon, Plus, Search, Sun } from "lucide-react"

import { useTheme } from "@/components/theme-provider"
import { UBButton } from "./UBButton"

type UBHeaderProps = {
  userName: string
  userEmail: string
  layout?: "default" | "daily"
  isLoggingOut?: boolean
  submitLabel?: string
  searchPlaceholder?: string
  onSubmit?: () => void
  onNotificationsClick?: () => void
  onAppsClick?: () => void
  onSearchChange?: (value: string) => void
  onLogout: () => void
}

/**
 * Parses user display names to retrieve up to two capitalized leading initials.
 */
function getUserInitials(name: string) {
  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("")

  return initials || "UB"
}

export function UBHeader({
  userName,
  userEmail,
  layout = "default",
  isLoggingOut = false,
  submitLabel = "Submit",
  searchPlaceholder = "Search articles, tags, sources...",
  onSubmit,
  onNotificationsClick,
  onAppsClick,
  onSearchChange,
  onLogout,
}: UBHeaderProps) {
  const { theme, setTheme } = useTheme()
  const isDarkMode = theme === "dark"

  // ---------------------------------------------------------------------------
  // LAYOUT VARIANT: DAILY PORTAL
  // ---------------------------------------------------------------------------
  if (layout === "daily") {
    return (
      <header className="border-b bg-card/90 backdrop-blur">
        <div className="mx-auto flex w-full max-w-[120rem] items-center gap-4 px-4 py-3 lg:px-6">
          
          {/* Brand/Identity Segment */}
          <div className="flex min-w-fit items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
              <LayoutGrid className="size-4" />
            </div>
            <div className="leading-tight">
              <p className="text-sm font-semibold tracking-tight">UB Daily</p>
              <p className="text-[10px] font-semibold tracking-[0.06em] text-secondary">
                UNIVERSITY OF BELIZE
              </p>
            </div>
          </div>

          {/* Search Box Form Element */}
          <label className="relative flex flex-1 items-center">
            {/* FIX: Visually hidden descriptive text mapping back to the label container.
              Ensures screen readers announce the input purpose despite missing visible text strings.
            */}
            <span className="sr-only">{searchPlaceholder}</span>
            
            <Search className="pointer-events-none absolute left-3 size-4 text-muted-foreground" />
            <input
              type="search"
              aria-label={searchPlaceholder}
              placeholder={searchPlaceholder}
              className="h-10 w-full rounded-xl border border-border bg-muted/70 px-10 text-sm text-foreground placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:outline-none"
              onChange={(event) => onSearchChange?.(event.target.value)}
            />
          </label>
          </label>

          {/* Action Systems & User Meta Controllers */}
          <div className="flex min-w-fit items-center gap-2">
            <UBButton
              aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
              variant="ghost"
              size="icon"
              onClick={() => setTheme(isDarkMode ? "light" : "dark")}
            >
              {isDarkMode ? <Sun className="size-4" /> : <Moon className="size-4" />}
            </UBButton>

            <UBButton
              aria-label="Open notifications panel"
              variant="ghost"
              size="icon"
              onClick={onNotificationsClick}
            >
              <Bell className="size-4" />
            </UBButton>

            <UBButton size="default" onClick={onSubmit}>
              <Plus className="size-4" />
              {submitLabel}
            </UBButton>

            <UBButton
              aria-label="Open integrated apps"
              variant="ghost"
              size="icon"
              onClick={onAppsClick}
            >
              <LayoutGrid className="size-4" />
            </UBButton>

            <div 
              aria-hidden="true"
              className="flex size-10 items-center justify-center rounded-full bg-gradient-to-br from-primary/85 to-secondary/90 text-sm font-semibold text-primary-foreground"
            >
              {getUserInitials(userName)}
            </div>
          </div>
        </div>
      </header>
    )
  }

  // ---------------------------------------------------------------------------
  // LAYOUT VARIANT: DEFAULT PORTAL
  // ---------------------------------------------------------------------------
  return (
    <header className="border-b bg-background/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-4 lg:px-8">
        
        {/* Brand/Identity Segment */}
        <div className="flex items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm">
            <LayoutGrid className="size-5" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              University of Belize
            </p>
            <h1 className="text-lg font-semibold tracking-tight">UB Portal</h1>
          </div>
        </div>

        {/* User Account Controls */}
        <div className="flex items-center gap-3">
          <div className="hidden items-center gap-3 rounded-2xl border bg-card px-4 py-2 text-right sm:flex">
            <div>
              <p className="text-sm font-medium">{userName}</p>
              <p className="text-xs text-muted-foreground">{userEmail}</p>
            </div>
            <div 
              aria-hidden="true"
              className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary"
            >
              {getUserInitials(userName)}
            </div>
          </div>

          <UBButton
            variant="outline"
            size="sm"
            onClick={() => setTheme(isDarkMode ? "light" : "dark")}
          >
            {isDarkMode ? <Sun className="size-4" /> : <Moon className="size-4" />}
            <span className="ml-2">{isDarkMode ? "Light mode" : "Dark mode"}</span>
          </UBButton>

          <UBButton
            variant="outline"
            size="sm"
            onClick={onLogout}
            disabled={isLoggingOut}
          >
            <LogOut className="size-4" />
            <span className="ml-2">{isLoggingOut ? "Signing out..." : "Sign out"}</span>
          </UBButton>
        </div>
      </div>
    </header>
  )
}