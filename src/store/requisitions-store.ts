import { create } from "zustand"

import {
  approveRequisition,
  createRequisition,
  deleteRequisition,
  fetchAssignedCostCenter,
  fetchRequisition,
  fetchRequisitions,
  rejectRequisition,
  requestRequisitionReview,
  updateRequisition,
  type CostCenter,
  type CreateRequisitionPayload,
  type Pipeline,
  type RequisitionApprovalPayload,
  type RequisitionRecord,
  type UpdateRequisitionPayload,
} from "@/lib/api/requisitions"
import { fetchPipelines } from "@/lib/api/pipelines"
import { readStoredAccessToken } from "@/lib/auth/storage"

type RequisitionsState = {
  requisitions: RequisitionRecord[]
  assignedCostCenter: CostCenter | null
  approvalPipeline: Pipeline | null
  selectedRequisition: RequisitionRecord | null
  isLoadingList: boolean
  isLoadingFormData: boolean
  isLoadingPipeline: boolean
  isLoadingSelected: boolean
  isSaving: boolean
  isReviewing: boolean
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
  approveRequisition: (
    id: number,
    payload?: RequisitionApprovalPayload
  ) => Promise<RequisitionRecord | null>
  rejectRequisition: (
    id: number,
    payload?: RequisitionApprovalPayload
  ) => Promise<RequisitionRecord | null>
  requestRequisitionReview: (
    id: number,
    payload?: RequisitionApprovalPayload
  ) => Promise<RequisitionRecord | null>
  deleteRequisition: (id: number) => Promise<boolean>
  fetchFormData: (force?: boolean) => Promise<void>
  fetchApprovalPipeline: (force?: boolean) => Promise<Pipeline | null>
  reset: () => void
  
}

const initialState = {
  requisitions: [] as RequisitionRecord[],
  assignedCostCenter: null as CostCenter | null,
  approvalPipeline: null as Pipeline | null,
  selectedRequisition: null as RequisitionRecord | null,
  isLoadingList: false,
  isLoadingFormData: false,
  isLoadingPipeline: false,
  isLoadingSelected: false,
  isSaving: false,
  isReviewing: false,
  error: null as string | null,
}

let listFetchPromise: Promise<RequisitionRecord[]> | null = null
let formDataFetchPromise: Promise<void> | null = null
let pipelineFetchPromise: Promise<Pipeline | null> | null = null

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
  approveRequisition: async (id, payload) => {
    set({ isReviewing: true, error: null })

    try {
      const requisition = await approveRequisition(id, payload)
      set((state) => ({
        requisitions: state.requisitions.map((item) =>
          item.id === id ? requisition : item
        ),
        selectedRequisition: requisition,
        isReviewing: false,
        error: null,
      }))
      return requisition
    } catch (error) {
      set({
        isReviewing: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to approve requisition.",
      })
      return null
    }
  },
  rejectRequisition: async (id, payload) => {
    set({ isReviewing: true, error: null })

    try {
      const requisition = await rejectRequisition(id, payload)
      set((state) => ({
        requisitions: state.requisitions.map((item) =>
          item.id === id ? requisition : item
        ),
        selectedRequisition: requisition,
        isReviewing: false,
        error: null,
      }))
      return requisition
    } catch (error) {
      set({
        isReviewing: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to reject requisition.",
      })
      return null
    }
  },
  requestRequisitionReview: async (id, payload) => {
    set({ isReviewing: true, error: null })

    try {
      const requisition = await requestRequisitionReview(id, payload)
      set((state) => ({
        requisitions: state.requisitions.map((item) =>
          item.id === id ? requisition : item
        ),
        selectedRequisition: requisition,
        isReviewing: false,
        error: null,
      }))
      return requisition
    } catch (error) {
      set({
        isReviewing: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to send requisition back for review.",
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
  fetchApprovalPipeline: async (force = false) => {
    if (!force && get().approvalPipeline && !get().isLoadingPipeline) {
      return get().approvalPipeline
    }

    if (pipelineFetchPromise) {
      return pipelineFetchPromise
    }

    const token = readStoredAccessToken()

    if (!token) {
      set({ approvalPipeline: null, isLoadingPipeline: false })
      return null
    }

    pipelineFetchPromise = (async () => {
      set({ isLoadingPipeline: true, error: null })

      try {
        const pipelines = await fetchPipelines()
        const approvalPipeline = pipelines[0] ?? null

        set({
          approvalPipeline,
          isLoadingPipeline: false,
          error: null,
        })

        return approvalPipeline
      } catch (error) {
        set({
          approvalPipeline: null,
          isLoadingPipeline: false,
          error:
            error instanceof Error
              ? error.message
              : "Failed to load approval pipeline.",
        })
        return null
      } finally {
        pipelineFetchPromise = null
      }
    })()

    return pipelineFetchPromise
  },
  reset: () => {
    listFetchPromise = null
    formDataFetchPromise = null
    pipelineFetchPromise = null
    set(initialState)
  },
}))
