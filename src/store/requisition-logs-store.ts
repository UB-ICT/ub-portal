import { create } from "zustand"

import {
  createRequisitionLogComment,
  fetchRequisitionLogs,
  type CreateRequisitionLogPayload,
  type RequisitionLogEntry,
} from "@/lib/api/requisition-logs"
import { readStoredAccessToken } from "@/lib/auth/storage"

type RequisitionLogsState = {
  logs: RequisitionLogEntry[]
  isLoading: boolean
  isSubmittingComment: boolean
  error: string | null
  fetchLogs: (requisitionId: number, force?: boolean) => Promise<RequisitionLogEntry[]>
  addComment: (
    requisitionId: number,
    payload: CreateRequisitionLogPayload
  ) => Promise<RequisitionLogEntry | null>
  reset: () => void
}

const initialState = {
  logs: [] as RequisitionLogEntry[],
  isLoading: false,
  isSubmittingComment: false,
  error: null as string | null,
}

let logsFetchPromise: Promise<RequisitionLogEntry[]> | null = null
let logsFetchRequisitionId: number | null = null
let lastFetchedRequisitionId: number | null = null

export const useRequisitionLogsStore = create<RequisitionLogsState>((set, get) => ({
  ...initialState,
  fetchLogs: async (requisitionId, force = false) => {
    if (
      !force &&
      lastFetchedRequisitionId === requisitionId &&
      get().logs.length > 0 &&
      !get().isLoading
    ) {
      return get().logs
    }

    if (
      logsFetchPromise &&
      logsFetchRequisitionId === requisitionId &&
      !force
    ) {
      return logsFetchPromise
    }

    const token = readStoredAccessToken()

    if (!token) {
      set({ logs: [], isLoading: false, error: null })
      return []
    }

    logsFetchRequisitionId = requisitionId
    logsFetchPromise = (async () => {
      set({ isLoading: true, error: null })

      try {
        const logs = await fetchRequisitionLogs(requisitionId)
        lastFetchedRequisitionId = requisitionId
        set({ logs, isLoading: false, error: null })
        return logs
      } catch (error) {
        set({
          logs: [],
          isLoading: false,
          error:
            error instanceof Error
              ? error.message
              : "Failed to load requisition activity.",
        })
        return []
      } finally {
        logsFetchPromise = null
        logsFetchRequisitionId = null
      }
    })()

    return logsFetchPromise
  },
  addComment: async (requisitionId, payload) => {
    set({ isSubmittingComment: true, error: null })

    try {
      const log = await createRequisitionLogComment(requisitionId, payload)
      set((state) => ({
        logs: [log, ...state.logs],
        isSubmittingComment: false,
        error: null,
      }))
      return log
    } catch (error) {
      set({
        isSubmittingComment: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to add comment.",
      })
      return null
    }
  },
  reset: () => {
    logsFetchPromise = null
    logsFetchRequisitionId = null
    lastFetchedRequisitionId = null
    set(initialState)
  },
}))
