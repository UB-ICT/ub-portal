import type { RequisitionPriority } from "@/lib/api/requisitions"
import type { RequisitionTag } from "@/lib/api/tags"

import type { RequisitionLineItemDraft } from "../components/RequisitionLineItemsTable"
import type { SupplierQuoteDraft } from "../lib/supplier-quotes"

export type RequisitionDraftSnapshot = {
  version: 3
  updatedAt: number
  requisitionId: number | null
  currencyId: string
  priority: RequisitionPriority
  description: string
  expectedDeliveryDate: string
  isRecurring: boolean
  requiresDownpayment: boolean
  reminderDate: string
  quoteWaiverReason: string
  activityComment: string
  selectedTagIds: number[]
  selectedTags: RequisitionTag[]
  lineItems: RequisitionLineItemDraft[]
  supplierQuotes: SupplierQuoteDraft[]
}

const STORAGE_PREFIX = "ub-por-requisition-draft:v1:"

export function draftStorageKey(requisitionId: number | null | undefined) {
  return `${STORAGE_PREFIX}${requisitionId ?? "new"}`
}

export function writeRequisitionDraftSnapshot(
  requisitionId: number | null | undefined,
  snapshot: Omit<
    RequisitionDraftSnapshot,
    "version" | "updatedAt" | "requisitionId"
  >
) {
  try {
    const payload: RequisitionDraftSnapshot = {
      version: 3,
      updatedAt: Date.now(),
      requisitionId: requisitionId ?? null,
      ...snapshot,
      // Attachment-backed quotes belong on the server. Persisting them in
      // localStorage caused deleted duplicates to reappear after refresh.
      supplierQuotes: snapshot.supplierQuotes
        .filter((quote) => quote.supplierId && !quote.attachmentId)
        .map((quote) => ({
          ...quote,
          file: null,
          previewUrl: null,
        })),
    }
    localStorage.setItem(draftStorageKey(requisitionId), JSON.stringify(payload))

    if (requisitionId) {
      localStorage.removeItem(draftStorageKey(null))
    }
  } catch {
    // Quota / private mode — ignore.
  }
}

export function readRequisitionDraftSnapshot(
  requisitionId: number | null | undefined
): RequisitionDraftSnapshot | null {
  try {
    const raw = localStorage.getItem(draftStorageKey(requisitionId))
    if (!raw) {
      return null
    }
    const parsed = JSON.parse(raw) as RequisitionDraftSnapshot
    if (parsed?.version !== 3) {
      return null
    }
    return parsed
  } catch {
    return null
  }
}

export function clearRequisitionDraftSnapshot(
  requisitionId: number | null | undefined
) {
  try {
    localStorage.removeItem(draftStorageKey(requisitionId))
    if (requisitionId) {
      localStorage.removeItem(draftStorageKey(null))
    }
  } catch {
    // ignore
  }
}
