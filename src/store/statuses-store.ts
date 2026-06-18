import { create } from "zustand"

import { fetchStatuses, type RequisitionStatus } from "@/lib/api/statuses"
import { readStoredAccessToken } from "@/lib/auth/storage"

type StatusesState = {
  statuses: RequisitionStatus[]
  isLoading: boolean
  error: string | null
  fetchStatuses: (force?: boolean) => Promise<RequisitionStatus[]>
  reset: () => void
}

const initialState = {
  statuses: [] as RequisitionStatus[],
  isLoading: false,
  error: null as string | null,
}

let statusesFetchPromise: Promise<RequisitionStatus[]> | null = null

export const useStatusesStore = create<StatusesState>((set, get) => ({
  ...initialState,
  fetchStatuses: async (force = false) => {
    if (!force && get().statuses.length > 0 && !get().isLoading) {
      return get().statuses
    }

    if (statusesFetchPromise) {
      return statusesFetchPromise
    }

    const token = readStoredAccessToken()

    if (!token) {
      set({ statuses: [], isLoading: false, error: null })
      return []
    }

    statusesFetchPromise = (async () => {
      set({ isLoading: true, error: null })

      try {
        const statuses = await fetchStatuses()
        set({
          statuses: [...statuses].sort((left, right) =>
            left.name.localeCompare(right.name)
          ),
          isLoading: false,
          error: null,
        })
        return statuses
      } catch (error) {
        set({
          statuses: [],
          isLoading: false,
          error:
            error instanceof Error
              ? error.message
              : "Failed to load statuses.",
        })
        return []
      } finally {
        statusesFetchPromise = null
      }
    })()

    return statusesFetchPromise
  },
  reset: () => {
    statusesFetchPromise = null
    set(initialState)
  },
}))
