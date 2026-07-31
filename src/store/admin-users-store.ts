import { create } from "zustand"

import {
  attachUserRole,
  detachUserRole,
} from "@/lib/api/admin-user-roles"
import {
  createUser,
  deleteUser,
  fetchUsers,
  updateUser,
  type AdminUserPayload,
  type AdminUserRecord,
} from "@/lib/api/admin-users"
import { readStoredAccessToken } from "@/lib/auth/storage"

type AdminUsersState = {
  users: AdminUserRecord[]
  total: number
  isLoading: boolean
  isSaving: boolean
  error: string | null
  fetchUsers: (force?: boolean) => Promise<AdminUserRecord[]>
  createUser: (payload: AdminUserPayload) => Promise<AdminUserRecord | null>
  updateUser: (
    id: string,
    payload: Partial<AdminUserPayload>
  ) => Promise<AdminUserRecord | null>
  deleteUser: (id: string) => Promise<boolean>
  assignRole: (userId: string, roleId: string) => Promise<boolean>
  removeRole: (userId: string, roleId: string) => Promise<boolean>
  reset: () => void
}

const initialState = {
  users: [] as AdminUserRecord[],
  total: 0,
  isLoading: false,
  isSaving: false,
  error: null as string | null,
}

let usersFetchPromise: Promise<AdminUserRecord[]> | null = null

export const useAdminUsersStore = create<AdminUsersState>((set, get) => ({
  ...initialState,
  fetchUsers: async (force = false) => {
    if (!force && get().users.length > 0 && !get().isLoading) {
      return get().users
    }

    if (usersFetchPromise) {
      return usersFetchPromise
    }

    const token = readStoredAccessToken()

    if (!token) {
      set({ users: [], total: 0, isLoading: false, error: null })
      return []
    }

    usersFetchPromise = (async () => {
      set({ isLoading: true, error: null })

      try {
        const { data, count } = await fetchUsers(token)
        set({ users: data, total: count, isLoading: false, error: null })
        return data
      } catch (error) {
        set({
          users: [],
          total: 0,
          isLoading: false,
          error: error instanceof Error ? error.message : "Failed to load users.",
        })
        return []
      } finally {
        usersFetchPromise = null
      }
    })()

    return usersFetchPromise
  },
  createUser: async (payload) => {
    set({ isSaving: true, error: null })

    try {
      const user = await createUser(payload)
      set((state) => ({
        users: [...state.users, user],
        total: state.total + 1,
        isSaving: false,
        error: null,
      }))
      return user
    } catch (error) {
      set({
        isSaving: false,
        error: error instanceof Error ? error.message : "Failed to create user.",
      })
      return null
    }
  },
  updateUser: async (id, payload) => {
    set({ isSaving: true, error: null })

    try {
      const updated = await updateUser(id, payload)
      set((state) => ({
        users: state.users.map((user) => (user.id === id ? updated : user)),
        isSaving: false,
        error: null,
      }))
      return updated
    } catch (error) {
      set({
        isSaving: false,
        error: error instanceof Error ? error.message : "Failed to update user.",
      })
      return null
    }
  },
  deleteUser: async (id) => {
    set({ isSaving: true, error: null })

    try {
      await deleteUser(id)
      set((state) => ({
        users: state.users.filter((user) => user.id !== id),
        total: Math.max(0, state.total - 1),
        isSaving: false,
        error: null,
      }))
      return true
    } catch (error) {
      set({
        isSaving: false,
        error: error instanceof Error ? error.message : "Failed to delete user.",
      })
      return false
    }
  },
  assignRole: async (userId, roleId) => {
    set({ isSaving: true, error: null })

    try {
      const assignment = await attachUserRole(userId, roleId)
      set((state) => ({
        users: state.users.map((user) =>
          user.id === userId
            ? {
                ...user,
                roles: [
                  ...user.roles,
                  { id: assignment.role_id, role_name: assignment.role_name },
                ],
              }
            : user
        ),
        isSaving: false,
        error: null,
      }))
      return true
    } catch (error) {
      set({
        isSaving: false,
        error: error instanceof Error ? error.message : "Failed to assign role.",
      })
      return false
    }
  },
  removeRole: async (userId, roleId) => {
    set({ isSaving: true, error: null })

    try {
      await detachUserRole(userId, roleId)
      set((state) => ({
        users: state.users.map((user) =>
          user.id === userId
            ? { ...user, roles: user.roles.filter((role) => role.id !== roleId) }
            : user
        ),
        isSaving: false,
        error: null,
      }))
      return true
    } catch (error) {
      set({
        isSaving: false,
        error: error instanceof Error ? error.message : "Failed to remove role.",
      })
      return false
    }
  },
  reset: () => {
    usersFetchPromise = null
    set(initialState)
  },
}))
