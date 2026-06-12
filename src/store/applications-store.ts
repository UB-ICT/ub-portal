import { create } from "zustand"

import { fetchMyApplications } from "@/lib/api/menu"
import type { PortalApplication } from "@/lib/api/menu"
import { readStoredAccessToken } from "@/lib/auth/storage"

type ApplicationsState = {
  applications: PortalApplication[]
  isLoading: boolean
  error: string | null
  hasFetched: boolean
  fetchMyApplications: (force?: boolean) => Promise<PortalApplication[]>
  reset: () => void
}

const initialState = {
  applications: [] as PortalApplication[],
  isLoading: false,
  error: null as string | null,
  hasFetched: false,
}

let applicationsFetchPromise: Promise<PortalApplication[]> | null = null

export const useApplicationsStore = create<ApplicationsState>((set, get) => ({
  ...initialState,
  fetchMyApplications: async (force = false) => {
    if (!force && get().hasFetched && !get().isLoading) {
      return get().applications
    }

    if (applicationsFetchPromise) {
      return applicationsFetchPromise
    }

    const token = readStoredAccessToken()

    if (!token) {
      set({ ...initialState, hasFetched: true })
      return []
    }

    applicationsFetchPromise = (async () => {
      set({ isLoading: true, error: null })

      try {
        const applications = await fetchMyApplications(token)
        set({
          applications,
          isLoading: false,
          error: null,
          hasFetched: true,
        })
        return applications
      } catch (error) {
        set({
          applications: [],
          isLoading: false,
          error:
            error instanceof Error
              ? error.message
              : "Failed to load applications.",
          hasFetched: true,
        })
        return []
      } finally {
        applicationsFetchPromise = null
      }
    })()

    return applicationsFetchPromise
  },
  reset: () => {
    applicationsFetchPromise = null
    set(initialState)
  },
}))
