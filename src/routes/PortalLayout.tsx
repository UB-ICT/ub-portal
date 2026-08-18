import { useEffect } from "react"
import { Outlet } from "react-router-dom"

import { PortalShellLayout } from "@/components/layout/PortalShellLayout"
import { StatusScreen } from "@/components/layout/StatusScreen"
import { useProtectedPortalSession } from "@/hooks/useProtectedPortalSession"
import { useApplicationMenuStore } from "@/store/application-menu-store"
import { useProfileMenuStore } from "@/store/profile-menu-store"

const ADMIN_CONSOLE_PATH = "/admin"

export function PortalLayout() {
  const { user, handleLogout, isReady } = useProtectedPortalSession()
  const resetApplicationMenu = useApplicationMenuStore((state) => state.reset)
  const navigation = useProfileMenuStore((state) => state.navigation)
  const fetchProfileMenu = useProfileMenuStore(
    (state) => state.fetchProfileMenu
  )

  useEffect(() => {
    if (!isReady) {
      return
    }

    resetApplicationMenu()
    void fetchProfileMenu()
  }, [isReady, resetApplicationMenu, fetchProfileMenu])

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
    <PortalShellLayout
      userName={user.name}
      userEmail={user.email}
      userImageSrc={user.profile_picture}
      showAdminActions={showAdminActions}
      onLogout={handleLogout}
    >
      <Outlet />
    </PortalShellLayout>
  )
}
