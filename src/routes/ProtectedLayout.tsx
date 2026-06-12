import { useEffect } from "react"
import { Outlet, useLocation, useNavigate } from "react-router-dom"

import { AppLayout } from "@/components/layout/AppLayout"
import { StatusScreen } from "@/components/layout/StatusScreen"
import { useLogoutMutation, usePortalSessionQuery } from "@/lib/api/auth"
import { useApplicationMenuStore } from "@/store/application-menu-store"

export function ProtectedLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const sessionQuery = usePortalSessionQuery()
  const logoutMutation = useLogoutMutation()
  const ensureMenuForPath = useApplicationMenuStore(
    (state) => state.ensureMenuForPath
  )
  const user = sessionQuery.data?.user

  useEffect(() => {
    if (!user) {
      return
    }

    void ensureMenuForPath(location.pathname)
  }, [ensureMenuForPath, location.pathname, user])

  if (!user) {
    return (
      <StatusScreen
        title="Preparing your workspace"
        description="Loading your profile, menus, and permissions from UB Portal."
      />
    )
  }

  const handleLogout = async () => {
    await logoutMutation.mutateAsync()
    navigate("/login", { replace: true })
  }

  return (
    <AppLayout
      userName={user.name}
      userEmail={user.email}
      isLoggingOut={logoutMutation.isPending}
      onLogout={handleLogout}
    >
      <Outlet />
    </AppLayout>
  )
}
