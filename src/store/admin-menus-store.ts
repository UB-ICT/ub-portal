import { create } from "zustand"

import {
  createMenu,
  deleteMenu,
  fetchMenus,
  syncMenuRoles,
  updateMenu,
  type AdminMenuPayload,
  type AdminMenuRecord,
} from "@/lib/api/admin-menus"
import { readStoredAccessToken } from "@/lib/auth/storage"

type AdminMenusState = {
  roots: AdminMenuRecord[]
  menus: AdminMenuRecord[]
  selectedRootId: string | null
  isLoading: boolean
  isSaving: boolean
  error: string | null
  fetchRoots: (force?: boolean) => Promise<AdminMenuRecord[]>
  selectRoot: (rootId: string | null) => Promise<AdminMenuRecord[]>
  createMenu: (payload: AdminMenuPayload) => Promise<AdminMenuRecord | null>
  updateMenu: (
    id: string,
    payload: Partial<AdminMenuPayload>
  ) => Promise<AdminMenuRecord | null>
  syncMenuRoles: (id: string, roleIds: string[]) => Promise<AdminMenuRecord | null>
  deleteMenu: (id: string) => Promise<boolean>
  reset: () => void
}

const initialState = {
  roots: [] as AdminMenuRecord[],
  menus: [] as AdminMenuRecord[],
  selectedRootId: null as string | null,
  isLoading: false,
  isSaving: false,
  error: null as string | null,
}

function sortMenus(menus: AdminMenuRecord[]) {
  return [...menus].sort(
    (left, right) =>
      left.sort_order - right.sort_order || left.label.localeCompare(right.label)
  )
}

async function refreshSelected(
  get: () => AdminMenusState,
  set: (partial: Partial<AdminMenusState>) => void
) {
  const selectedRootId = get().selectedRootId

  if (selectedRootId) {
    await get().selectRoot(selectedRootId)
  }

  await get().fetchRoots(true)
  set({ isSaving: false, error: null })
}

export const useAdminMenusStore = create<AdminMenusState>((set, get) => ({
  ...initialState,
  fetchRoots: async (force = false) => {
    if (!force && get().roots.length > 0 && !get().isLoading) {
      return get().roots
    }

    const token = readStoredAccessToken()

    if (!token) {
      set({ roots: [], isLoading: false, error: null })
      return []
    }

    set({ isLoading: true, error: null })

    try {
      const roots = await fetchMenus({ rootsOnly: true }, token)
      set({ roots: sortMenus(roots), isLoading: false, error: null })
      return roots
    } catch (error) {
      set({
        roots: [],
        isLoading: false,
        error:
          error instanceof Error ? error.message : "Failed to load applications.",
      })
      return []
    }
  },
  selectRoot: async (rootId) => {
    const token = readStoredAccessToken()

    if (!token) {
      set({ menus: [], selectedRootId: rootId, isLoading: false, error: null })
      return []
    }

    set({ isLoading: true, error: null, selectedRootId: rootId })

    try {
      const menus = await fetchMenus(
        rootId ? { parentId: rootId } : { parentId: null },
        token
      )
      set({ menus: sortMenus(menus), isLoading: false, error: null })
      return menus
    } catch (error) {
      set({
        menus: [],
        isLoading: false,
        error: error instanceof Error ? error.message : "Failed to load menus.",
      })
      return []
    }
  },
  createMenu: async (payload) => {
    set({ isSaving: true, error: null })

    try {
      const menu = await createMenu(payload)
      await refreshSelected(get, set)
      return menu
    } catch (error) {
      set({
        isSaving: false,
        error:
          error instanceof Error ? error.message : "Failed to create menu item.",
      })
      return null
    }
  },
  updateMenu: async (id, payload) => {
    set({ isSaving: true, error: null })

    try {
      const menu = await updateMenu(id, payload)
      await refreshSelected(get, set)
      return menu
    } catch (error) {
      set({
        isSaving: false,
        error:
          error instanceof Error ? error.message : "Failed to update menu item.",
      })
      return null
    }
  },
  syncMenuRoles: async (id, roleIds) => {
    set({ isSaving: true, error: null })

    try {
      const menu = await syncMenuRoles(id, roleIds)

      set((state) => ({
        roots: state.roots.map((item) => (item.id === id ? menu : item)),
        menus: state.menus.map((item) => (item.id === id ? menu : item)),
        isSaving: false,
        error: null,
      }))

      return menu
    } catch (error) {
      set({
        isSaving: false,
        error:
          error instanceof Error ? error.message : "Failed to update menu roles.",
      })
      return null
    }
  },
  deleteMenu: async (id) => {
    set({ isSaving: true, error: null })

    try {
      await deleteMenu(id)
      set((state) => ({
        roots: state.roots.filter((item) => item.id !== id),
        menus: state.menus.filter((item) => item.id !== id),
        selectedRootId:
          state.selectedRootId === id ? null : state.selectedRootId,
        isSaving: false,
        error: null,
      }))
      return true
    } catch (error) {
      set({
        isSaving: false,
        error:
          error instanceof Error ? error.message : "Failed to delete menu item.",
      })
      return false
    }
  },
  reset: () => set(initialState),
}))
