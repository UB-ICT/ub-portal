import { create } from "zustand"

import { fetchProfileMenu } from "@/lib/api/menu"
import type { PortalMenuItem } from "@/lib/api/menu"
import { readStoredAccessToken } from "@/lib/auth/storage"

type ProfileMenuState = {
  navigation: PortalMenuItem[]
  externalLinks: PortalMenuItem[]
  isLoading: boolean
  error: string | null
  hasFetched: boolean
  fetchProfileMenu: (force?: boolean) => Promise<PortalMenuItem[]>
  reset: () => void
}

const initialState = {
  navigation: [] as PortalMenuItem[],
  externalLinks: [] as PortalMenuItem[],
  isLoading: false,
  error: null as string | null,
  hasFetched: false,
}

let profileMenuFetchPromise: Promise<PortalMenuItem[]> | null = null

export const useProfileMenuStore = create<ProfileMenuState>((set, get) => ({
  ...initialState,
  fetchProfileMenu: async (force = false) => {
    if (!force && get().hasFetched && !get().isLoading) {
      return get().navigation
    }

    if (profileMenuFetchPromise) {
      return profileMenuFetchPromise
    }

    const token = readStoredAccessToken()

    if (!token) {
      set({ ...initialState, hasFetched: true })
      return []
    }

    profileMenuFetchPromise = (async () => {
      set({ isLoading: true, error: null })

      try {
        const response = await fetchProfileMenu(token)
        const navigation = response?.navigation ?? []
        set({
          navigation,
          externalLinks: response?.external_links ?? [],
          isLoading: false,
          error: null,
          hasFetched: true,
        })
        return navigation
      } catch (error) {
        set({
          navigation: [],
          externalLinks: [],
          isLoading: false,
          error:
            error instanceof Error
              ? error.message
              : "Failed to load profile menu.",
          hasFetched: true,
        })
        return []
      } finally {
        profileMenuFetchPromise = null
      }
    })()

    return profileMenuFetchPromise
  },
  reset: () => {
    profileMenuFetchPromise = null
    set(initialState)
  },
}))
