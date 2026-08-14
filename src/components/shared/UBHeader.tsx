import { Grid3X3, LogOut, Moon, Search, Sun } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"

import { useTheme } from "@/components/theme-provider"
import type { PortalApplication } from "@/lib/api/menu"
import type { PortalNotification } from "@/lib/api/notifications"
import { writeStoredRequisitionSelection } from "@/features/purchase-order-requisition/lib/requisition-selection-storage"
import { resolveMenuIcon } from "@/lib/menu-icons"
import { cn } from "@/lib/utils"
import { useApplicationMenuStore } from "@/store/application-menu-store"
import { useApplicationsStore } from "@/store/applications-store"
import { useNotificationsStore } from "@/store/notifications-store"
import { UBButton, UBIconTileButton } from "./UBButton"
import { UBNotificationBell } from "./UBNotificationBell"

type UBHeaderProps = {
  userName: string
  userEmail?: string
  userImageSrc?: string
  notificationCount?: number
  showAdminActions?: boolean
  showSearch?: boolean
  applications?: PortalApplication[]
  onThemeToggle?: () => void
  onNotificationsClick?: () => void
  onAppsClick?: () => void
  onProfileClick?: () => void
  onAdminToolsClick?: () => void
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
  showSearch = true,
  applications: applicationsOverride,
  onThemeToggle,
  onNotificationsClick,
  onAppsClick,
  onProfileClick,
  onAdminToolsClick,
  onSignOutClick,
}: UBHeaderProps) {
  const navigate = useNavigate()
  const { theme, setTheme } = useTheme()
  const isDarkMode = theme === "dark"
  const [isAppsOpen, setIsAppsOpen] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)
  const appsMenuRef = useRef<HTMLDivElement>(null)
  const profileMenuRef = useRef<HTMLDivElement>(null)
  const notificationsMenuRef = useRef<HTMLDivElement>(null)
  const storeApplications = useApplicationsStore((state) => state.applications)
  const isLoadingApplications = useApplicationsStore((state) => state.isLoading)
  const fetchMyApplications = useApplicationsStore(
    (state) => state.fetchMyApplications
  )
  const loadApplication = useApplicationMenuStore(
    (state) => state.loadApplication
  )
  const applications = applicationsOverride ?? storeApplications
  const unreadCount = useNotificationsStore((state) => state.unreadCount)
  const notifications = useNotificationsStore((state) => state.notifications)
  const isLoadingNotifications = useNotificationsStore((state) => state.isLoading)
  const fetchNotificationsList = useNotificationsStore(
    (state) => state.fetchNotifications
  )
  const refreshUnreadCount = useNotificationsStore(
    (state) => state.refreshUnreadCount
  )
  const markAsRead = useNotificationsStore((state) => state.markAsRead)
  const resolvedNotificationCount = notificationCount || unreadCount

  useEffect(() => {
    if (!applicationsOverride) {
      void fetchMyApplications()
    }
  }, [applicationsOverride, fetchMyApplications])

  useEffect(() => {
    void refreshUnreadCount()
  }, [refreshUnreadCount])

  useEffect(() => {
    if (!isAppsOpen && !isProfileOpen && !isNotificationsOpen) {
      return
    }

    const closeMenus = () => {
      setIsAppsOpen(false)
      setIsProfileOpen(false)
      setIsNotificationsOpen(false)
    }

    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Node

      if (
        appsMenuRef.current?.contains(target) ||
        profileMenuRef.current?.contains(target) ||
        notificationsMenuRef.current?.contains(target)
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
  }, [isAppsOpen, isProfileOpen, isNotificationsOpen])

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
    setIsNotificationsOpen(false)
  }

  const handleProfileClick = () => {
    onProfileClick?.()
    setIsProfileOpen((current) => !current)
    setIsAppsOpen(false)
    setIsNotificationsOpen(false)
  }

  const handleNotificationsClick = () => {
    onNotificationsClick?.()
    setIsNotificationsOpen((current) => {
      const next = !current
      if (next) {
        void fetchNotificationsList(true)
      }
      return next
    })
    setIsAppsOpen(false)
    setIsProfileOpen(false)
  }

  const handleNotificationSelect = async (notification: PortalNotification) => {
    await markAsRead(notification.id)
    setIsNotificationsOpen(false)

    const requisitionId = Number(notification.data.requisition_id)
    if (!Number.isFinite(requisitionId) || requisitionId <= 0) {
      return
    }

    writeStoredRequisitionSelection({
      mode: "edit",
      requisitionId,
    })
    navigate(`/requisitions/forms?requisition=${requisitionId}`)
  }

  const handleAdminConsoleClick = () => {
    if (onAdminToolsClick) {
      onAdminToolsClick()
      return
    }

    setIsProfileOpen(false)
    navigate("/admin")
  }

  return (
    <header className="relative z-50 border-b bg-background/90 pb-2 backdrop-blur">
      <div className="flex items-center justify-between gap-4 px-6 py-4 lg:px-8">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          {showSearch ? (
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
          ) : null}
        </div>

        <div className="flex items-center gap-2">
          <UBButton
            type="button"
            variant="outline"
            size="icon"
            onClick={handleThemeToggle}
            aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
            className="size-9 rounded-full"
          >
            {isDarkMode ? <Sun className="size-4" /> : <Moon className="size-4" />}
          </UBButton>

          <div className="relative" ref={notificationsMenuRef}>
            <UBNotificationBell
              notificationCount={resolvedNotificationCount}
              onClick={handleNotificationsClick}
              aria-expanded={isNotificationsOpen}
            />

            {isNotificationsOpen ? (
              <div className="absolute top-11 right-0 z-50 w-80 rounded-xl border bg-popover p-2 shadow-lg">
                <div className="border-b px-2 py-2">
                  <p className="text-sm font-semibold">Notifications</p>
                </div>
                {isLoadingNotifications && notifications.length === 0 ? (
                  <p className="px-2 py-4 text-sm text-muted-foreground">
                    Loading notifications...
                  </p>
                ) : notifications.length === 0 ? (
                  <p className="px-2 py-4 text-sm text-muted-foreground">
                    No notifications yet.
                  </p>
                ) : (
                  <ul className="max-h-80 overflow-y-auto">
                    {notifications.map((notification) => (
                      <li key={notification.id}>
                        <button
                          type="button"
                          onClick={() => void handleNotificationSelect(notification)}
                          className={cn(
                            "w-full rounded-lg px-2 py-2.5 text-left transition-colors hover:bg-muted/60",
                            !notification.read_at && "bg-primary/5"
                          )}
                        >
                          <p className="text-sm text-foreground">
                            {notification.data.message}
                          </p>
                          {notification.data.requisition_number ? (
                            <p className="mt-0.5 text-xs text-muted-foreground">
                              #{notification.data.requisition_number}
                            </p>
                          ) : null}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ) : null}
          </div>

          <div className="relative" ref={appsMenuRef}>
            <UBButton
              type="button"
              variant="outline"
              size="icon"
              onClick={handleAppsClick}
              aria-label="Open apps"
              aria-expanded={isAppsOpen}
              className="size-9 rounded-full"
            >
              <Grid3X3 className="size-4" />
            </UBButton>

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
                      const Icon = resolveMenuIcon(
                        application.icon,
                        application.label
                      )

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
            <UBButton
              type="button"
              variant="outline"
              size="icon"
              onClick={handleProfileClick}
              aria-label="Open profile"
              aria-expanded={isProfileOpen}
              className="size-10 overflow-hidden rounded-full text-sm font-semibold text-primary"
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
            </UBButton>

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

                {showAdminActions ? (
                  <div className="mt-2 flex flex-col items-center gap-0.5 pb-1 text-center">
                    <UBButton
                      type="button"
                      variant="link"
                      onClick={handleAdminConsoleClick}
                      className="h-auto w-auto p-0 text-sm font-medium"
                    >
                      Admin console
                    </UBButton>
                  </div>
                ) : null}

                <div className="mt-3 space-y-1">
                  <div className="my-1 border-t" />

                  <UBButton
                    type="button"
                    variant="ghost"
                    onClick={onSignOutClick}
                    className="h-auto w-full justify-start gap-2 rounded-lg border border-transparent px-3 py-2 text-sm font-normal text-foreground hover:border-border"
                  >
                    <LogOut className="size-4" />
                    Sign out
                  </UBButton>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </header>
  )
}
