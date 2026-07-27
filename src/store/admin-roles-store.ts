import { create } from "zustand"

import { fetchRoles, type AdminRoleRecord } from "@/lib/api/admin-roles"
import { readStoredAccessToken } from "@/lib/auth/storage"

type AdminRolesState = {
  roles: AdminRoleRecord[]
  total: number
  isLoading: boolean
  error: string | null
  fetchRoles: (force?: boolean) => Promise<AdminRoleRecord[]>
  reset: () => void
}

const initialState = {
  roles: [] as AdminRoleRecord[],
  total: 0,
  isLoading: false,
  error: null as string | null,
}

let rolesFetchPromise: Promise<AdminRoleRecord[]> | null = null

export const useAdminRolesStore = create<AdminRolesState>((set, get) => ({
  ...initialState,
  fetchRoles: async (force = false) => {
    if (!force && get().roles.length > 0 && !get().isLoading) {
      return get().roles
    }

    if (rolesFetchPromise) {
      return rolesFetchPromise
    }

    const token = readStoredAccessToken()

    if (!token) {
      set({ roles: [], total: 0, isLoading: false, error: null })
      return []
    }

    rolesFetchPromise = (async () => {
      set({ isLoading: true, error: null })

      try {
        const roles = await fetchRoles(token)
        set({ roles, total: roles.length, isLoading: false, error: null })
        return roles
      } catch (error) {
        set({
          roles: [],
          total: 0,
          isLoading: false,
          error: error instanceof Error ? error.message : "Failed to load roles.",
        })
        return []
      } finally {
        rolesFetchPromise = null
      }
    })()

    return rolesFetchPromise
  },
  reset: () => {
    rolesFetchPromise = null
    set(initialState)
  },
}))
