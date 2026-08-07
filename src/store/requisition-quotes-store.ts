import { create } from "zustand"

import {
  deleteRequisitionAttachment,
  fetchRequisitionAttachments,
  uploadRequisitionQuote,
  type RequisitionAttachment,
  type RequisitionQuoteUploadMeta,
} from "@/lib/api/attachments"
import { readStoredAccessToken } from "@/lib/auth/storage"

type PendingQuoteUpload = {
  clientId: string
  requisitionId: number
  supplierId: number
  file: File
  meta?: RequisitionQuoteUploadMeta
}

type RequisitionQuotesState = {
  attachments: RequisitionAttachment[]
  isLoading: boolean
  isUploading: boolean
  isDeleting: boolean
  error: string | null
  /** Latest known requisition id for in-progress draft uploads */
  activeRequisitionId: number | null
  /** clientId → in-flight/pending local PDF waiting for POST */
  pendingByClientId: Record<string, PendingQuoteUpload>
  lastUploadedByClientId: Record<
    string,
    { attachmentId: number; fileName: string }
  >
  setActiveRequisitionId: (requisitionId: number | null) => void
  fetchAttachments: (
    requisitionId: number,
    force?: boolean
  ) => Promise<RequisitionAttachment[] | null>
  /**
   * Queue + immediately POST a quote PDF. Safe to call repeatedly; duplicate
   * in-flight uploads for the same clientId are ignored.
   */
  enqueueAndUploadQuote: (
    pending: PendingQuoteUpload
  ) => Promise<RequisitionAttachment | null>
  uploadQuote: (
    requisitionId: number,
    supplierId: number,
    file: File,
    meta?: RequisitionQuoteUploadMeta
  ) => Promise<RequisitionAttachment | null>
  deleteQuote: (attachmentId: number) => Promise<boolean>
  clearPending: (clientId: string) => void
  reset: () => void
}

const initialState = {
  attachments: [] as RequisitionAttachment[],
  isLoading: false,
  isUploading: false,
  isDeleting: false,
  error: null as string | null,
  activeRequisitionId: null as number | null,
  pendingByClientId: {} as Record<string, PendingQuoteUpload>,
  lastUploadedByClientId: {} as Record<
    string,
    { attachmentId: number; fileName: string }
  >,
}

let attachmentsFetchPromise: Promise<RequisitionAttachment[] | null> | null =
  null
let attachmentsFetchRequisitionId: number | null = null
let lastFetchedRequisitionId: number | null = null
const inFlightClientIds = new Set<string>()

export const useRequisitionQuotesStore = create<RequisitionQuotesState>(
  (set, get) => ({
    ...initialState,
    setActiveRequisitionId: (requisitionId) => {
      set({ activeRequisitionId: requisitionId })
    },
    fetchAttachments: async (requisitionId, force = false) => {
      if (
        !force &&
        lastFetchedRequisitionId === requisitionId &&
        get().attachments.length > 0 &&
        !get().isLoading
      ) {
        return get().attachments
      }

      if (
        attachmentsFetchPromise &&
        attachmentsFetchRequisitionId === requisitionId &&
        !force
      ) {
        return attachmentsFetchPromise
      }

      const token = readStoredAccessToken()

      if (!token) {
        set({ attachments: [], isLoading: false, error: null })
        return []
      }

      attachmentsFetchRequisitionId = requisitionId
      attachmentsFetchPromise = (async () => {
        const isFirstLoad =
          lastFetchedRequisitionId !== requisitionId &&
          get().attachments.length === 0
        if (isFirstLoad) {
          set({ isLoading: true, error: null })
        } else {
          set({ error: null })
        }

        try {
          const attachments = await fetchRequisitionAttachments(requisitionId)
          lastFetchedRequisitionId = requisitionId
          set({ attachments, isLoading: false, error: null })
          return attachments
        } catch (error) {
          set({
            isLoading: false,
            error:
              error instanceof Error
                ? error.message
                : "Failed to load supplier quotes.",
          })
          return null
        } finally {
          attachmentsFetchPromise = null
          attachmentsFetchRequisitionId = null
        }
      })()

      return attachmentsFetchPromise
    },
    enqueueAndUploadQuote: async (pending) => {
      set((state) => ({
        pendingByClientId: {
          ...state.pendingByClientId,
          [pending.clientId]: pending,
        },
        error: null,
      }))

      if (inFlightClientIds.has(pending.clientId)) {
        return null
      }

      inFlightClientIds.add(pending.clientId)
      set({ isUploading: true, error: null })

      try {
        const attachment = await uploadRequisitionQuote(
          pending.requisitionId,
          pending.supplierId,
          pending.file,
          pending.meta
        )

        set((state) => {
          const { [pending.clientId]: _removed, ...restPending } =
            state.pendingByClientId
          return {
            attachments: [
              attachment,
              ...state.attachments.filter(
                (existing) =>
                  existing.supplier_id !== attachment.supplier_id &&
                  existing.id !== attachment.id
              ),
            ],
            pendingByClientId: restPending,
            lastUploadedByClientId: {
              ...state.lastUploadedByClientId,
              [pending.clientId]: {
                attachmentId: attachment.id,
                fileName: attachment.file_name || pending.file.name,
              },
            },
            isUploading: false,
            error: null,
          }
        })
        lastFetchedRequisitionId = pending.requisitionId
        return attachment
      } catch (error) {
        set({
          isUploading: false,
          error:
            error instanceof Error
              ? error.message
              : "Failed to upload supplier quote.",
        })
        return null
      } finally {
        inFlightClientIds.delete(pending.clientId)
      }
    },
    uploadQuote: async (requisitionId, supplierId, file, meta) => {
      return get().enqueueAndUploadQuote({
        clientId: `legacy-${supplierId}-${file.name}`,
        requisitionId,
        supplierId,
        file,
        meta,
      })
    },
    deleteQuote: async (attachmentId) => {
      set({ isDeleting: true, error: null })

      try {
        await deleteRequisitionAttachment(attachmentId)
        set((state) => ({
          attachments: state.attachments.filter(
            (attachment) => attachment.id !== attachmentId
          ),
          isDeleting: false,
          error: null,
        }))
        return true
      } catch (error) {
        set({
          isDeleting: false,
          error:
            error instanceof Error
              ? error.message
              : "Failed to remove supplier quote.",
        })
        return false
      }
    },
    clearPending: (clientId) => {
      set((state) => {
        const { [clientId]: _removed, ...rest } = state.pendingByClientId
        return { pendingByClientId: rest }
      })
    },
    reset: () => {
      attachmentsFetchPromise = null
      attachmentsFetchRequisitionId = null
      lastFetchedRequisitionId = null
      inFlightClientIds.clear()
      set(initialState)
    },
  })
)
