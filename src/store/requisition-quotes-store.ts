import { create } from "zustand"

import {
  deleteRequisitionAttachment,
  fetchRequisitionAttachments,
  uploadRequisitionQuote,
  type RequisitionAttachment,
  type RequisitionQuoteUploadMeta,
} from "@/lib/api/attachments"
import { readStoredAccessToken } from "@/lib/auth/storage"

type RequisitionQuotesState = {
  attachments: RequisitionAttachment[]
  isLoading: boolean
  isUploading: boolean
  isDeleting: boolean
  error: string | null
  fetchAttachments: (
    requisitionId: number,
    force?: boolean
  ) => Promise<RequisitionAttachment[] | null>
  uploadQuote: (
    requisitionId: number,
    supplierId: number,
    file: File,
    meta?: RequisitionQuoteUploadMeta
  ) => Promise<RequisitionAttachment | null>
  deleteQuote: (attachmentId: number) => Promise<boolean>
  reset: () => void
}

const initialState = {
  attachments: [] as RequisitionAttachment[],
  isLoading: false,
  isUploading: false,
  isDeleting: false,
  error: null as string | null,
}

let attachmentsFetchPromise: Promise<RequisitionAttachment[] | null> | null =
  null
let attachmentsFetchRequisitionId: number | null = null
let lastFetchedRequisitionId: number | null = null

export const useRequisitionQuotesStore = create<RequisitionQuotesState>(
  (set, get) => ({
    ...initialState,
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
        set({ isLoading: true, error: null })

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
          // null = failed fetch; callers must not treat this as "no quotes".
          return null
        } finally {
          attachmentsFetchPromise = null
          attachmentsFetchRequisitionId = null
        }
      })()

      return attachmentsFetchPromise
    },
    uploadQuote: async (requisitionId, supplierId, file, meta) => {
      set({ isUploading: true, error: null })

      try {
        const attachment = await uploadRequisitionQuote(
          requisitionId,
          supplierId,
          file,
          meta
        )

        set((state) => ({
          attachments: [
            attachment,
            ...state.attachments.filter(
              (existing) =>
                existing.supplier_id !== attachment.supplier_id &&
                existing.id !== attachment.id
            ),
          ],
          isUploading: false,
          error: null,
        }))
        lastFetchedRequisitionId = requisitionId

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
      }
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
    reset: () => {
      attachmentsFetchPromise = null
      attachmentsFetchRequisitionId = null
      lastFetchedRequisitionId = null
      set(initialState)
    },
  })
)
