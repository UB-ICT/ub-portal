import { create } from "zustand"

import {
  createRequisition,
  deleteRequisition,
  fetchAssignedCostCenter,
  fetchRequisition,
  fetchRequisitions,
  updateRequisition,
  type CostCenter,
  type CreateRequisitionPayload,
  type RequisitionRecord,
  type UpdateRequisitionPayload,
} from "@/lib/api/requisitions"
import { readStoredAccessToken } from "@/lib/auth/storage"

type RequisitionsState = {
  requisitions: RequisitionRecord[]
  assignedCostCenter: CostCenter | null
  selectedRequisition: RequisitionRecord | null
  isLoadingList: boolean
  isLoadingFormData: boolean
  isLoadingSelected: boolean
  isSaving: boolean
  error: string | null
  fetchRequisitions: (force?: boolean) => Promise<RequisitionRecord[]>
  fetchRequisitionById: (id: number) => Promise<RequisitionRecord | null>
  createRequisition: (
    payload: CreateRequisitionPayload
  ) => Promise<RequisitionRecord | null>
  updateRequisition: (
    id: number,
    payload: UpdateRequisitionPayload
  ) => Promise<RequisitionRecord | null>
  deleteRequisition: (id: number) => Promise<boolean>
  fetchFormData: (force?: boolean) => Promise<void>
  reset: () => void
}

const initialState = {
  requisitions: [] as RequisitionRecord[],
  assignedCostCenter: null as CostCenter | null,
  selectedRequisition: null as RequisitionRecord | null,
  isLoadingList: false,
  isLoadingFormData: false,
  isLoadingSelected: false,
  isSaving: false,
  error: null as string | null,
}

let listFetchPromise: Promise<RequisitionRecord[]> | null = null
let formDataFetchPromise: Promise<void> | null = null

export const useRequisitionsStore = create<RequisitionsState>((set, get) => ({
  ...initialState,
  fetchRequisitions: async (force = false) => {
    if (!force && get().requisitions.length > 0 && !get().isLoadingList) {
      return get().requisitions
    }

    if (listFetchPromise) {
      return listFetchPromise
    }

    const token = readStoredAccessToken()

    if (!token) {
      set({ requisitions: [], isLoadingList: false, error: null })
      return []
    }

    listFetchPromise = (async () => {
      set({ isLoadingList: true, error: null })

      try {
        const requisitions = await fetchRequisitions()
        set({ requisitions, isLoadingList: false, error: null })
        return requisitions
      } catch (error) {
        set({
          requisitions: [],
          isLoadingList: false,
          error:
            error instanceof Error
              ? error.message
              : "Failed to load requisitions.",
        })
        return []
      } finally {
        listFetchPromise = null
      }
    })()

    return listFetchPromise
  },
  fetchRequisitionById: async (id) => {
    const token = readStoredAccessToken()

    if (!token) {
      return null
    }

    set({ isLoadingSelected: true, error: null })

    try {
      const requisition = await fetchRequisition(id)
      set({
        selectedRequisition: requisition,
        isLoadingSelected: false,
        error: null,
      })
      return requisition
    } catch (error) {
      set({
        selectedRequisition: null,
        isLoadingSelected: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to load requisition.",
      })
      return null
    }
  },
  createRequisition: async (payload) => {
    set({ isSaving: true, error: null })

    try {
      const requisition = await createRequisition(payload)
      set((state) => ({
        requisitions: [requisition, ...state.requisitions],
        isSaving: false,
        error: null,
      }))
      return requisition
    } catch (error) {
      set({
        isSaving: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to create requisition.",
      })
      return null
    }
  },
  updateRequisition: async (id, payload) => {
    set({ isSaving: true, error: null })

    try {
      const requisition = await updateRequisition(id, payload)
      set((state) => ({
        requisitions: state.requisitions.map((item) =>
          item.id === id ? requisition : item
        ),
        selectedRequisition: requisition,
        isSaving: false,
        error: null,
      }))
      return requisition
    } catch (error) {
      set({
        isSaving: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to update requisition.",
      })
      return null
    }
  },
  deleteRequisition: async (id) => {
    set({ isSaving: true, error: null })

    try {
      await deleteRequisition(id)
      set((state) => ({
        requisitions: state.requisitions.filter((item) => item.id !== id),
        selectedRequisition:
          state.selectedRequisition?.id === id ? null : state.selectedRequisition,
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
            : "Failed to delete requisition.",
      })
      return false
    }
  },
  fetchFormData: async (force = false) => {
    if (
      !force &&
      get().assignedCostCenter &&
      !get().isLoadingFormData
    ) {
      return
    }

    if (formDataFetchPromise) {
      return formDataFetchPromise
    }

    const token = readStoredAccessToken()

    if (!token) {
      set({
        assignedCostCenter: null,
        isLoadingFormData: false,
      })
      return
    }

    formDataFetchPromise = (async () => {
      set({ isLoadingFormData: true, error: null })

      try {
        const assignedCostCenter = await fetchAssignedCostCenter()

        set({
          assignedCostCenter,
          isLoadingFormData: false,
          error: null,
        })
      } catch (error) {
        set({
          isLoadingFormData: false,
          error:
            error instanceof Error
              ? error.message
              : "Failed to load requisition form data.",
        })
      } finally {
        formDataFetchPromise = null
      }
    })()

    return formDataFetchPromise
  },
  reset: () => {
    listFetchPromise = null
    formDataFetchPromise = null
    set(initialState)
  },
}))
