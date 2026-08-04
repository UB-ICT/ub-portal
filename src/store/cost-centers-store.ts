import { create } from "zustand"

import {
  createCostCenter,
  deleteCostCenter,
  fetchCostCenters,
  syncCostCenterUsers,
  updateCostCenter,
  type CreateCostCenterPayload,
  type UpdateCostCenterPayload,
} from "@/lib/api/cost-centers"
import type { CostCenter } from "@/lib/api/requisitions"
import { readStoredAccessToken } from "@/lib/auth/storage"

type CostCentersState = {
  costCenters: CostCenter[]
  isLoading: boolean
  isSaving: boolean
  error: string | null
  fetchCostCenters: (force?: boolean) => Promise<CostCenter[]>
  createCostCenter: (
    payload: CreateCostCenterPayload
  ) => Promise<CostCenter | null>
  updateCostCenter: (
    id: number,
    payload: UpdateCostCenterPayload
  ) => Promise<CostCenter | null>
  syncCostCenterUsers: (
    id: number,
    userIds: string[]
  ) => Promise<CostCenter | null>
  deleteCostCenter: (id: number) => Promise<boolean>
  reset: () => void
}

const initialState = {
  costCenters: [] as CostCenter[],
  isLoading: false,
  isSaving: false,
  error: null as string | null,
}

let costCentersFetchPromise: Promise<CostCenter[]> | null = null

function sortCostCenters(costCenters: CostCenter[]) {
  return [...costCenters].sort((left, right) =>
    left.name.localeCompare(right.name)
  )
}

function upsertCostCenter(costCenters: CostCenter[], costCenter: CostCenter) {
  const exists = costCenters.some((item) => item.id === costCenter.id)

  if (!exists) {
    return sortCostCenters([...costCenters, costCenter])
  }

  return sortCostCenters(
    costCenters.map((item) => (item.id === costCenter.id ? costCenter : item))
  )
}

export const useCostCentersStore = create<CostCentersState>((set, get) => ({
  ...initialState,
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
        set({
          costCenters: sortCostCenters(costCenters),
          isLoading: false,
          error: null,
        })
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
  createCostCenter: async (payload) => {
    set({ isSaving: true, error: null })

    try {
      const costCenter = await createCostCenter(payload)
      set((state) => ({
        costCenters: upsertCostCenter(state.costCenters, costCenter),
        isSaving: false,
        error: null,
      }))
      return costCenter
    } catch (error) {
      set({
        isSaving: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to create cost center.",
      })
      return null
    }
  },
  updateCostCenter: async (id, payload) => {
    set({ isSaving: true, error: null })

    try {
      const costCenter = await updateCostCenter(id, payload)
      set((state) => ({
        costCenters: upsertCostCenter(state.costCenters, costCenter),
        isSaving: false,
        error: null,
      }))
      return costCenter
    } catch (error) {
      set({
        isSaving: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to update cost center.",
      })
      return null
    }
  },
  syncCostCenterUsers: async (id, userIds) => {
    set({ isSaving: true, error: null })

    try {
      const costCenter = await syncCostCenterUsers(id, userIds)
      set((state) => ({
        costCenters: upsertCostCenter(state.costCenters, costCenter),
        isSaving: false,
        error: null,
      }))
      return costCenter
    } catch (error) {
      set({
        isSaving: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to update cost center users.",
      })
      return null
    }
  },
  deleteCostCenter: async (id) => {
    set({ isSaving: true, error: null })

    try {
      await deleteCostCenter(id)
      set((state) => ({
        costCenters: state.costCenters.filter((item) => item.id !== id),
        isSaving: false,
        error: null,
      }))
      return true
    } catch (error) {
      set({
        isSaving: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to delete cost center.",
      })
      return false
    }
  },
  reset: () => {
    costCentersFetchPromise = null
    set(initialState)
  },
}))
