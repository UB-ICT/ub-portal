import { useEffect, useState } from "react"
import { Outlet, useNavigate } from "react-router-dom"

import { AppLayout } from "@/components/layout/AppLayout"
import { StatusScreen } from "@/components/layout/StatusScreen"
import { useProtectedPortalSession } from "@/hooks/useProtectedPortalSession"
import { useIdleTimeout } from "@/hooks/useIdleTimeout"
import { useProfileMenuStore } from "@/store/profile-menu-store"
import { mapMenuItemsToDrawerItems } from "@/store/application-menu-store"
import { fetchActiveApplicationMenu } from "@/lib/api/menu"
import { readStoredAccessToken } from "@/lib/auth/storage"
import type { UBDrawerItem } from "@/components/shared"

const ADMIN_CONSOLE_PATH = "/admin"
const ADMIN_CONSOLE_FALLBACK_LABEL = "Identity Cloud"
const ADMIN_IDLE_TIMEOUT_MS = 20 * 60 * 1000

export const AdminLayout = () => {
  const navigate = useNavigate()
  const { user, handleLogout, isReady } = useProtectedPortalSession()

  // Idle inside the admin area only ends the admin session — the user's
  // main portal token/session stays valid, they're just sent back to "/".
  // Re-entering Admin Console always forces a fresh login regardless.
  useIdleTimeout(ADMIN_IDLE_TIMEOUT_MS, () => {
    navigate("/", { replace: true })
  })
  const navigation = useProfileMenuStore((state) => state.navigation)
  const fetchProfileMenu = useProfileMenuStore(
    (state) => state.fetchProfileMenu
  )

  const [appLabel, setAppLabel] = useState(ADMIN_CONSOLE_FALLBACK_LABEL)
  const [menuItems, setMenuItems] = useState<UBDrawerItem[]>([])

  useEffect(() => {
    document.title = "Admin Console | UB Portal Admin"
    return () => {
      document.title = "UB Portal"
    }
  }, [])

  useEffect(() => {
    if (isReady) {
      void fetchProfileMenu()
    }
  }, [fetchProfileMenu, isReady])

  useEffect(() => {
    const adminConsoleItem = navigation.find(
      (item) => item.path === ADMIN_CONSOLE_PATH
    )
    const token = readStoredAccessToken()

    if (!adminConsoleItem || !token) {
      return
    }

    let cancelled = false

    void fetchActiveApplicationMenu(adminConsoleItem.id, token)
      .then((menu) => {
        if (cancelled) {
          return
        }

        setAppLabel(menu.label)
        setMenuItems(mapMenuItemsToDrawerItems(menu.children, menu.path))
      })
      .catch(() => {
        // Keep the fallback label/menu if the admin submenu can't be loaded.
      })

    return () => {
      cancelled = true
    }
  }, [navigation])

  if (!isReady || !user) {
    return (
      <StatusScreen
        title="Preparing your workspace"
        description="Loading your profile, menus, and permissions from UB Portal."
      />
    )
  }

  const showAdminActions = navigation.some(
    (item) => item.path === ADMIN_CONSOLE_PATH
  )

  return (
    <AppLayout
      userName={user.name}
      userEmail={user.email}
      userImageSrc={user.profile_picture}
      showSearch={false}
      showAdminActions={showAdminActions}
      onLogout={handleLogout}
      appLabel={appLabel}
      menuItems={menuItems}
    >
      <Outlet />
    </AppLayout>
  )
}
