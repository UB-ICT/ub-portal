import { create } from "zustand"

import { fetchPermissions } from "@/lib/api/admin-permissions"
import type { AdminPermissionRecord } from "@/lib/api/admin-roles"
import { readStoredAccessToken } from "@/lib/auth/storage"

type AdminPermissionsState = {
  permissions: AdminPermissionRecord[]
  isLoading: boolean
  error: string | null
  fetchPermissions: (force?: boolean) => Promise<AdminPermissionRecord[]>
  reset: () => void
}

const initialState = {
  permissions: [] as AdminPermissionRecord[],
  isLoading: false,
  error: null as string | null,
}

let permissionsFetchPromise: Promise<AdminPermissionRecord[]> | null = null

export const useAdminPermissionsStore = create<AdminPermissionsState>(
  (set, get) => ({
    ...initialState,
    fetchPermissions: async (force = false) => {
      if (!force && get().permissions.length > 0 && !get().isLoading) {
        return get().permissions
      }

      if (permissionsFetchPromise) {
        return permissionsFetchPromise
      }

      const token = readStoredAccessToken()

      if (!token) {
        set({ permissions: [], isLoading: false, error: null })
        return []
      }

      permissionsFetchPromise = (async () => {
        set({ isLoading: true, error: null })

        try {
          const permissions = await fetchPermissions(token)
          set({ permissions, isLoading: false, error: null })
          return permissions
        } catch (error) {
          set({
            permissions: [],
            isLoading: false,
            error:
              error instanceof Error
                ? error.message
                : "Failed to load permissions.",
          })
          return []
        } finally {
          permissionsFetchPromise = null
        }
      })()

      return permissionsFetchPromise
    },
    reset: () => {
      permissionsFetchPromise = null
      set(initialState)
    },
  })
)
