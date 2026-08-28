import { useEffect } from "react"
import { Outlet, useLocation } from "react-router-dom"

import { AppLayout } from "@/components/layout/AppLayout"
import { StatusScreen } from "@/components/layout/StatusScreen"
import { useProtectedPortalSession } from "@/hooks/useProtectedPortalSession"
import { useApplicationMenuStore } from "@/store/application-menu-store"
import { useProfileMenuStore } from "@/store/profile-menu-store"

const ADMIN_CONSOLE_PATH = "/admin"

export function ApplicationLayout() {
  const location = useLocation()
  const { user, handleLogout, isReady } = useProtectedPortalSession()
  const ensureMenuForPath = useApplicationMenuStore(
    (state) => state.ensureMenuForPath
  )
  const navigation = useProfileMenuStore((state) => state.navigation)
  const fetchProfileMenu = useProfileMenuStore(
    (state) => state.fetchProfileMenu
  )

  useEffect(() => {
    if (!isReady) {
      return
    }

    void ensureMenuForPath(location.pathname)
    void fetchProfileMenu()
  }, [ensureMenuForPath, isReady, location.pathname, fetchProfileMenu])

  const showAdminActions = navigation.some(
    (item) => item.path === ADMIN_CONSOLE_PATH
  )

  if (!isReady || !user) {
    return (
      <StatusScreen
        title="Preparing your workspace"
        description="Loading your profile, menus, and permissions from UB Portal."
      />
    )
  }

  return (
    <AppLayout
      userName={user.name}
      userEmail={user.email}
      userImageSrc={user.profile_picture}
      showAdminActions={showAdminActions}
      onLogout={handleLogout}
    >
      <Outlet />
    </AppLayout>
  )
}
