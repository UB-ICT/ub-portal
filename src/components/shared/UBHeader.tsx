import {
  BookOpen,
  Globe,
  Grid3X3,
  LayoutGrid,
  LogOut,
  Moon,
  Search,
  Settings,
  Sun,
  User,
  Users,
  Wrench,
} from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"

import { useTheme } from "@/components/theme-provider"
import type { PortalApplication } from "@/lib/api/menu"
import { resolveMenuIcon } from "@/lib/menu-icons"
import { cn } from "@/lib/utils"
import { useApplicationMenuStore } from "@/store/application-menu-store"
import { useApplicationsStore } from "@/store/applications-store"
import { UBIconTileButton } from "./UBButton"
import { UBNotificationBell } from "./UBNotificationBell"

type UBHeaderProps = {
  userName: string
  userEmail?: string
  userImageSrc?: string
  notificationCount?: number
  showAdminActions?: boolean
  applications?: PortalApplication[]
  onThemeToggle?: () => void
  onNotificationsClick?: () => void
  onAppsClick?: () => void
  onProfileClick?: () => void
  onViewProfile?: () => void
  onSettingsClick?: () => void
  onConnectUsersClick?: () => void
  onAdminToolsClick?: () => void
  onGoogleSettingsClick?: () => void
  onSignOutClick?: () => void
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

function isExternalPath(path: string) {
  return /^https?:\/\//i.test(path)
}

export function UBHeader({
  userName,
  userEmail,
  userImageSrc,
  notificationCount = 0,
  showAdminActions = false,
  applications: applicationsOverride,
  onThemeToggle,
  onNotificationsClick,
  onAppsClick,
  onProfileClick,
  onViewProfile,
  onSettingsClick,
  onConnectUsersClick,
  onAdminToolsClick,
  onGoogleSettingsClick,
  onSignOutClick,
}: UBHeaderProps) {
  const navigate = useNavigate()
  const { theme, setTheme } = useTheme()
  const isDarkMode = theme === "dark"
  const [isAppsOpen, setIsAppsOpen] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const appsMenuRef = useRef<HTMLDivElement>(null)
  const profileMenuRef = useRef<HTMLDivElement>(null)
  const storeApplications = useApplicationsStore((state) => state.applications)
  const isLoadingApplications = useApplicationsStore((state) => state.isLoading)
  const fetchMyApplications = useApplicationsStore(
    (state) => state.fetchMyApplications
  )
  const loadApplication = useApplicationMenuStore(
    (state) => state.loadApplication
  )
  const applications = applicationsOverride ?? storeApplications

  useEffect(() => {
    if (!applicationsOverride) {
      void fetchMyApplications()
    }
  }, [applicationsOverride, fetchMyApplications])

  useEffect(() => {
    if (!isAppsOpen && !isProfileOpen) {
      return
    }

    const closeMenus = () => {
      setIsAppsOpen(false)
      setIsProfileOpen(false)
    }

    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Node

      if (
        appsMenuRef.current?.contains(target) ||
        profileMenuRef.current?.contains(target)
      ) {
        return
      }

      closeMenus()
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeMenus()
      }
    }

    document.addEventListener("mousedown", handlePointerDown)
    document.addEventListener("keydown", handleKeyDown)

    return () => {
      document.removeEventListener("mousedown", handlePointerDown)
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [isAppsOpen, isProfileOpen])

  const handleApplicationClick = async (application: PortalApplication) => {
    setIsAppsOpen(false)
    await loadApplication(application)

    if (isExternalPath(application.path)) {
      window.location.assign(application.path)
      return
    }

    navigate(application.path)
  }

  const handleThemeToggle = () => {
    onThemeToggle?.()
    setTheme(isDarkMode ? "light" : "dark")
  }

  const handleAppsClick = () => {
    onAppsClick?.()
    setIsAppsOpen((current) => !current)
    setIsProfileOpen(false)
  }

  const handleProfileClick = () => {
    onProfileClick?.()
    setIsProfileOpen((current) => !current)
    setIsAppsOpen(false)
  }

  const profileActionButtonClassName =
    "inline-flex w-full items-center gap-2 rounded-lg border border-transparent px-3 py-2 text-left text-sm text-foreground transition-colors hover:border-border hover:bg-muted"

  return (
    <header className="relative z-50 border-b bg-background/90 pb-2 backdrop-blur">
      <div className="flex items-center justify-between gap-4 px-6 py-4 lg:px-8">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <div className="hidden max-w-xl flex-1 sm:block">
            <label className="relative block">
              <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="search"
                aria-label="Search"
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

          <div className="relative" ref={appsMenuRef}>
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
              <div className="absolute top-11 right-0 z-50 w-64 rounded-xl border bg-popover p-3 shadow-lg">
                {isLoadingApplications && applications.length === 0 ? (
                  <p className="px-2 py-3 text-sm text-muted-foreground">
                    Loading applications...
                  </p>
                ) : applications.length === 0 ? (
                  <p className="px-2 py-3 text-sm text-muted-foreground">
                    No applications available.
                  </p>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    {applications.map((application) => {
                      const Icon = resolveMenuIcon(application.icon)

                      return (
                        <UBIconTileButton
                          key={application.id}
                          label={application.label}
                          icon={<Icon />}
                          className="w-full"
                          onClick={() => handleApplicationClick(application)}
                        />
                      )
                    })}
                  </div>
                )}
              </div>
            ) : null}
          </div>

          <div className="relative" ref={profileMenuRef}>
            <button
              type="button"
              onClick={handleProfileClick}
              className="inline-flex size-10 items-center justify-center overflow-hidden rounded-full border border-border bg-background text-sm font-semibold text-primary transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label="Open profile"
              aria-expanded={isProfileOpen}
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

            {isProfileOpen ? (
              <div className="absolute top-11 right-0 z-50 w-72 rounded-xl border bg-popover p-3 shadow-lg">
                <div className="flex items-center gap-3 rounded-lg border bg-background px-3 py-2.5">
                  <div className="inline-flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-full border border-border bg-muted text-sm font-semibold text-primary">
                    {userImageSrc ? (
                      <img
                        src={userImageSrc}
                        alt={`${userName} profile`}
                        className="size-full object-cover"
                      />
                    ) : (
                      <span>{getUserInitials(userName)}</span>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">{userName}</p>
                    <p className="truncate text-xs text-muted-foreground">{userEmail ?? "user@ub.edu.bz"}</p>
                  </div>
                </div>

                <div className="mt-3 space-y-1">
                  <button
                    type="button"
                    className={profileActionButtonClassName}
                    onClick={onViewProfile}
                  >
                    <User className="size-4" />
                    View profile
                  </button>
                  <button
                    type="button"
                    className={profileActionButtonClassName}
                    onClick={onSettingsClick}
                  >
                    <Settings className="size-4" />
                    Settings
                  </button>
                  <button
                    type="button"
                    className={profileActionButtonClassName}
                    onClick={onConnectUsersClick}
                  >
                    <Users className="size-4" />
                    Connect with users
                  </button>

                  {showAdminActions ? (
                    <button
                      type="button"
                      className={profileActionButtonClassName}
                      onClick={onAdminToolsClick}
                    >
                      <LayoutGrid className="size-4" />
                      Admin tools
                    </button>
                  ) : null}

                  <div className="my-1 border-t" />

                  <button
                    type="button"
                    className={profileActionButtonClassName}
                    onClick={onSignOutClick}
                  >
                    <LogOut className="size-4" />
                    Sign out
                  </button>

                  <div className="pt-1">
                    <p className="mb-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                      External links
                    </p>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={onGoogleSettingsClick}
                        className="inline-flex size-8 items-center justify-center rounded-full border border-border bg-background text-foreground transition-colors hover:bg-muted"
                        aria-label="Google settings"
                        title="Google settings"
                      >
                        <Wrench className="size-4" />
                      </button>
                      <button
                        type="button"
                        className="inline-flex size-8 items-center justify-center rounded-full border border-border bg-background text-foreground transition-colors hover:bg-muted"
                        aria-label="Campus platform"
                        title="Campus platform"
                      >
                        <BookOpen className="size-4" />
                      </button>
                      <button
                        type="button"
                        className="inline-flex size-8 items-center justify-center rounded-full border border-border bg-background text-foreground transition-colors hover:bg-muted"
                        aria-label="University website"
                        title="University website"
                      >
                        <Globe className="size-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </header>
  )
}
