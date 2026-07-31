import { useEffect } from "react"
import { Outlet } from "react-router-dom"

import { PortalShellLayout } from "@/components/layout/PortalShellLayout"
import { StatusScreen } from "@/components/layout/StatusScreen"
import { useProtectedPortalSession } from "@/hooks/useProtectedPortalSession"
import { useApplicationMenuStore } from "@/store/application-menu-store"

export function PortalLayout() {
  const { user, handleLogout, isReady } = useProtectedPortalSession()
  const resetApplicationMenu = useApplicationMenuStore((state) => state.reset)

  useEffect(() => {
    if (!isReady) {
      return
    }

    resetApplicationMenu()
  }, [isReady, resetApplicationMenu])

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
      onLogout={handleLogout}
    >
      <Outlet />
    </PortalShellLayout>
  )
}
