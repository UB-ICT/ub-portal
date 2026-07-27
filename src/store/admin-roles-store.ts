import { create } from "zustand"

import {
  attachRolePermission,
  createRole,
  deleteRole,
  detachRolePermission,
  fetchRoles,
  updateRole,
  type AdminRolePayload,
  type AdminRoleRecord,
} from "@/lib/api/admin-roles"
import { readStoredAccessToken } from "@/lib/auth/storage"

type AdminRolesState = {
  roles: AdminRoleRecord[]
  total: number
  isLoading: boolean
  isSaving: boolean
  error: string | null
  fetchRoles: (force?: boolean) => Promise<AdminRoleRecord[]>
  createRole: (payload: AdminRolePayload) => Promise<AdminRoleRecord | null>
  updateRole: (
    id: string,
    payload: Partial<AdminRolePayload>
  ) => Promise<AdminRoleRecord | null>
  deleteRole: (id: string) => Promise<boolean>
  assignPermission: (roleId: string, permissionId: string) => Promise<boolean>
  removePermission: (roleId: string, permissionId: string) => Promise<boolean>
  reset: () => void
}

const initialState = {
  roles: [] as AdminRoleRecord[],
  total: 0,
  isLoading: false,
  isSaving: false,
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
  createRole: async (payload) => {
    set({ isSaving: true, error: null })

    try {
      const created = await createRole(payload)
      // store() doesn't load permissions/counts on the fresh model, but a
      // brand new role genuinely has none yet, so defaulting is accurate.
      const role: AdminRoleRecord = {
        ...created,
        permissions: created.permissions ?? [],
        permissions_count: created.permissions_count ?? 0,
        users_count: created.users_count ?? 0,
      }
      set((state) => ({
        roles: [...state.roles, role],
        total: state.total + 1,
        isSaving: false,
        error: null,
      }))
      return role
    } catch (error) {
      set({
        isSaving: false,
        error: error instanceof Error ? error.message : "Failed to create role.",
      })
      return null
    }
  },
  updateRole: async (id, payload) => {
    set({ isSaving: true, error: null })

    try {
      const updated = await updateRole(id, payload)
      let mergedRole: AdminRoleRecord | null = null

      set((state) => ({
        roles: state.roles.map((role) => {
          if (role.id !== id) {
            return role
          }

          // update() only returns role_name/description - preserve the
          // permissions/counts already known locally rather than the
          // update response's blank ones.
          mergedRole = {
            ...role,
            role_name: updated.role_name,
            description: updated.description,
          }
          return mergedRole
        }),
        isSaving: false,
        error: null,
      }))

      return mergedRole
    } catch (error) {
      set({
        isSaving: false,
        error: error instanceof Error ? error.message : "Failed to update role.",
      })
      return null
    }
  },
  deleteRole: async (id) => {
    set({ isSaving: true, error: null })

    try {
      await deleteRole(id)
      set((state) => ({
        roles: state.roles.filter((role) => role.id !== id),
        total: Math.max(0, state.total - 1),
        isSaving: false,
        error: null,
      }))
      return true
    } catch (error) {
      set({
        isSaving: false,
        error: error instanceof Error ? error.message : "Failed to delete role.",
      })
      return false
    }
  },
  assignPermission: async (roleId, permissionId) => {
    set({ isSaving: true, error: null })

    try {
      const updated = await attachRolePermission(roleId, permissionId)
      set((state) => ({
        roles: state.roles.map((role) =>
          role.id === roleId
            ? {
                ...role,
                permissions: updated.permissions,
                permissions_count: updated.permissions.length,
              }
            : role
        ),
        isSaving: false,
        error: null,
      }))
      return true
    } catch (error) {
      set({
        isSaving: false,
        error:
          error instanceof Error ? error.message : "Failed to assign permission.",
      })
      return false
    }
  },
  removePermission: async (roleId, permissionId) => {
    set({ isSaving: true, error: null })

    try {
      const updated = await detachRolePermission(roleId, permissionId)
      set((state) => ({
        roles: state.roles.map((role) =>
          role.id === roleId
            ? {
                ...role,
                permissions: updated.permissions,
                permissions_count: updated.permissions.length,
              }
            : role
        ),
        isSaving: false,
        error: null,
      }))
      return true
    } catch (error) {
      set({
        isSaving: false,
        error:
          error instanceof Error ? error.message : "Failed to remove permission.",
      })
      return false
    }
  },
  reset: () => {
    rolesFetchPromise = null
    set(initialState)
  },
}))
