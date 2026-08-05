import type { RequisitionRecord } from "@/lib/api/requisitions"

const STORAGE_KEY = "ub-por-selected-requisition:v1"

export type StoredRequisitionSelection =
  | { mode: "edit"; requisitionId: number }
  | { mode: "create" }

export function readStoredRequisitionSelection(): StoredRequisitionSelection | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      return null
    }

    const parsed = JSON.parse(raw) as StoredRequisitionSelection

    if (parsed?.mode === "create") {
      return { mode: "create" }
    }

    if (
      parsed?.mode === "edit" &&
      typeof parsed.requisitionId === "number" &&
      Number.isFinite(parsed.requisitionId)
    ) {
      return {
        mode: "edit",
        requisitionId: parsed.requisitionId,
      }
    }

    return null
  } catch {
    return null
  }
}

export function writeStoredRequisitionSelection(
  selection: StoredRequisitionSelection
) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(selection))
  } catch {
    // Quota / private mode — ignore.
  }
}

/**
 * Restore the last selection when possible; otherwise pick the first list
 * item, or fall back to the create form when the list is empty.
 */
export function resolveInitialRequisitionSelection(
  requisitions: RequisitionRecord[],
  stored: StoredRequisitionSelection | null
): StoredRequisitionSelection {
  if (stored?.mode === "create") {
    return { mode: "create" }
  }

  if (stored?.mode === "edit") {
    const stillVisible = requisitions.some(
      (requisition) => requisition.id === stored.requisitionId
    )

    if (stillVisible) {
      return stored
    }
  }

  if (requisitions.length > 0) {
    return {
      mode: "edit",
      requisitionId: requisitions[0].id,
    }
  }

  return { mode: "create" }
}
