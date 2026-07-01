import { createElement } from "react"
import { create } from "zustand"

import type {
  ActiveApplicationMenu,
  PortalApplication,
  PortalMenuItem,
} from "@/lib/api/menu"
import {
  fetchActiveApplicationMenu,
} from "@/lib/api/menu"
import {
  matchesMenuItemPath,
  normalizeRoutePath,
  resolveApplicationForMenuPath,
  resolveApplicationForPath,
  resolveMenuItemRoute,
} from "@/lib/application-path"
import { resolveMenuIcon } from "@/lib/menu-icons"
import { readStoredAccessToken } from "@/lib/auth/storage"
import type { UBDrawerItem } from "@/components/shared/UBDrawer"
import { useApplicationsStore } from "@/store/applications-store"

export function mapMenuItemsToDrawerItems(
  menuItems: PortalMenuItem[],
  applicationPath?: string
): UBDrawerItem[] {
  return menuItems.map((item) => {
    const normalizedPath = resolveMenuItemRoute(item.path, applicationPath)
    const Icon = resolveMenuIcon(item.icon, item.label)
    const isExternal = /^https?:\/\//i.test(normalizedPath)

    return {
      id: item.id,
      label: item.label,
      icon: createElement(Icon, { className: "size-4" }),
      ...(isExternal ? { href: normalizedPath } : { to: normalizedPath }),
    }
  })
}

type ApplicationMenuState = {
  activeApplicationId: string | null
  applicationMenu: ActiveApplicationMenu | null
  drawerItems: UBDrawerItem[]
  isLoading: boolean
  error: string | null
  loadApplication: (application: PortalApplication) => Promise<void>
  syncApplicationForPath: (
    pathname: string,
    applications: PortalApplication[]
  ) => Promise<void>
  ensureMenuForPath: (pathname: string) => Promise<void>
  reset: () => void
}

const initialState = {
  activeApplicationId: null as string | null,
  applicationMenu: null as ActiveApplicationMenu | null,
  drawerItems: [] as UBDrawerItem[],
  isLoading: false,
  error: null as string | null,
}

export const useApplicationMenuStore = create<ApplicationMenuState>((set, get) => ({
  ...initialState,
  loadApplication: async (application) => {
    const token = readStoredAccessToken()

    if (!token) {
      set({ ...initialState })
      return
    }

    set({
      activeApplicationId: application.id,
      isLoading: true,
      error: null,
    })

    try {
      const applicationMenu = await fetchActiveApplicationMenu(
        application.id,
        token
      )

      set({
        applicationMenu,
        drawerItems: mapMenuItemsToDrawerItems(
          applicationMenu.children,
          applicationMenu.path
        ),
        isLoading: false,
        error: null,
        activeApplicationId: application.id,
      })
    } catch (error) {
      set({
        applicationMenu: null,
        drawerItems: [],
        isLoading: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to load application menu.",
        activeApplicationId: application.id,
      })
    }
  },
  syncApplicationForPath: async (pathname, applications) => {
    let matchedApplication = resolveApplicationForPath(pathname, applications)

    if (!matchedApplication) {
      const menusByApplicationId: Record<string, PortalMenuItem[]> = {}
      const { applicationMenu, activeApplicationId } = get()

      if (applicationMenu && activeApplicationId) {
        menusByApplicationId[activeApplicationId] = applicationMenu.children
      }

      matchedApplication = resolveApplicationForMenuPath(
        pathname,
        applications,
        menusByApplicationId
      )
    }

    if (!matchedApplication) {
      const token = readStoredAccessToken()

      if (!token) {
        return
      }

      for (const application of [...applications].sort(
        (left, right) => left.sort_order - right.sort_order
      )) {
        try {
          const applicationMenu = await fetchActiveApplicationMenu(
            application.id,
            token
          )
          const hasMatchingMenuItem = applicationMenu.children.some((menuItem) =>
            matchesMenuItemPath(
              pathname,
              resolveMenuItemRoute(menuItem.path, applicationMenu.path)
            )
          )

          if (hasMatchingMenuItem) {
            set({
              applicationMenu,
              drawerItems: mapMenuItemsToDrawerItems(
                applicationMenu.children,
                applicationMenu.path
              ),
              isLoading: false,
              error: null,
              activeApplicationId: application.id,
            })
            return
          }
        } catch {
          continue
        }
      }

      get().reset()
      return
    }

    const { activeApplicationId, applicationMenu } = get()

    if (
      matchedApplication.id === activeApplicationId &&
      applicationMenu &&
      !get().isLoading
    ) {
      return
    }

    await get().loadApplication(matchedApplication)
  },
  ensureMenuForPath: async (pathname) => {
    const normalizedPath = normalizeRoutePath(pathname)

    if (normalizedPath === "/") {
      get().reset()
      return
    }

    const applications =
      await useApplicationsStore.getState().fetchMyApplications()

    await get().syncApplicationForPath(pathname, applications)
  },
  reset: () => {
    set(initialState)
  },
}))
