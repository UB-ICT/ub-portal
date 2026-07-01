import { useEffect } from "react"
import { Outlet, useLocation } from "react-router-dom"

import { AppLayout } from "@/components/layout/AppLayout"
import { StatusScreen } from "@/components/layout/StatusScreen"
import { useProtectedPortalSession } from "@/hooks/useProtectedPortalSession"
import { useApplicationMenuStore } from "@/store/application-menu-store"

export function ApplicationLayout() {
  const location = useLocation()
  const { user, handleLogout, isReady } = useProtectedPortalSession()
  const ensureMenuForPath = useApplicationMenuStore(
    (state) => state.ensureMenuForPath
  )

  useEffect(() => {
    document.title = "Purchase Order Requisitions | UB Portal"
    return () => {
      document.title = "UB Portal"
    }
  }, [])

  useEffect(() => {
    if (!isReady) {
      return
    }

    void ensureMenuForPath(location.pathname)
  }, [ensureMenuForPath, isReady, location.pathname])

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
      showSearch={false}
      onLogout={handleLogout}
    >
      <Outlet />
    </AppLayout>
  )
}
