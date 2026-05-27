import { LayoutGrid, LogOut, Moon, Sun } from "lucide-react"

import { useTheme } from "@/components/theme-provider"
import { UBButton } from "./UBButton"

type UBHeaderProps = {
  userName: string
  userEmail: string
  isLoggingOut?: boolean
  onLogout: () => void
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

export function UBHeader({
  userName,
  userEmail,
  isLoggingOut = false,
  onLogout,
}: UBHeaderProps) {
  const { theme, setTheme } = useTheme()
  const isDarkMode = theme === "dark"

  return (
    <header className="border-b bg-background/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-4 lg:px-8">
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

        <div className="flex items-center gap-3">
          <div className="hidden items-center gap-3 rounded-2xl border bg-card px-4 py-2 text-right sm:flex">
            <div>
              <p className="text-sm font-medium">{userName}</p>
              <p className="text-xs text-muted-foreground">{userEmail}</p>
            </div>
            <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
              {getUserInitials(userName)}
            </div>
          </div>

          <UBButton
            variant="outline"
            size="sm"
            onClick={() => setTheme(isDarkMode ? "light" : "dark")}
          >
            {isDarkMode ? <Sun className="size-4" /> : <Moon className="size-4" />}
            {isDarkMode ? "Light mode" : "Dark mode"}
          </UBButton>

          <UBButton
            variant="outline"
            size="sm"
            onClick={onLogout}
            disabled={isLoggingOut}
          >
            <LogOut className="size-4" />
            {isLoggingOut ? "Signing out..." : "Sign out"}
          </UBButton>
        </div>
      </div>
    </header>
  )
}
