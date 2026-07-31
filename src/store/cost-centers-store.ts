import { create } from "zustand"

import { fetchCostCenters, type CostCenter } from "@/lib/api/requisitions"
import { readStoredAccessToken } from "@/lib/auth/storage"

type CostCentersState = {
  costCenters: CostCenter[]
  isLoading: boolean
  error: string | null
  fetchCostCenters: (force?: boolean) => Promise<CostCenter[]>
}

let costCentersFetchPromise: Promise<CostCenter[]> | null = null

export const useCostCentersStore = create<CostCentersState>((set, get) => ({
  costCenters: [],
  isLoading: false,
  error: null,
  fetchCostCenters: async (force = false) => {
    if (!force && get().costCenters.length > 0 && !get().isLoading) {
      return get().costCenters
    }

    if (costCentersFetchPromise) {
      return costCentersFetchPromise
    }

    const token = readStoredAccessToken()

    if (!token) {
      set({ costCenters: [], isLoading: false, error: null })
      return []
    }

    costCentersFetchPromise = (async () => {
      set({ isLoading: true, error: null })

      try {
        const costCenters = await fetchCostCenters()
        set({ costCenters, isLoading: false, error: null })
        return costCenters
      } catch (error) {
        set({
          costCenters: [],
          isLoading: false,
          error:
            error instanceof Error
              ? error.message
              : "Failed to load cost centers.",
        })
        return []
      } finally {
        costCentersFetchPromise = null
      }
    })()

    return costCentersFetchPromise
  },
}))
