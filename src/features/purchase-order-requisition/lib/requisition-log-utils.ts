import type { RequisitionLogAction } from "@/lib/api/requisition-logs"

export const REQUISITION_LOG_ACTION_LABELS: Record<RequisitionLogAction, string> =
  {
    created: "Created",
    updated: "Updated",
    submitted: "Submitted",
    approved: "Approved",
    rejected: "Rejected",
    comment: "Comment",
    cost_center_review: "Cost Center Review",
    forwarded_for_review: "Forwarded for Review",
    delegated_review_submitted: "Delegated Review Submitted",
    cancelled: "Cancelled",
    closed: "Closed",
  }

export function getRequisitionLogActionLabel(action: RequisitionLogAction) {
  return REQUISITION_LOG_ACTION_LABELS[action] ?? action
}

export function getRequisitionLogActionStyles(action: RequisitionLogAction) {
  switch (action) {
    case "approved":
      return "border-green-200 bg-green-50 text-green-800 dark:border-green-900 dark:bg-green-950 dark:text-green-200"
    case "rejected":
      return "border-red-200 bg-red-50 text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200"
    case "submitted":
      return "border-blue-200 bg-blue-50 text-blue-800 dark:border-blue-900 dark:bg-blue-950 dark:text-blue-200"
    case "comment":
      return "border-violet-200 bg-violet-50 text-violet-800 dark:border-violet-900 dark:bg-violet-950 dark:text-violet-200"
    case "cost_center_review":
      return "border-orange-200 bg-orange-50 text-orange-800 dark:border-orange-900 dark:bg-orange-950 dark:text-orange-200"
    case "forwarded_for_review":
      return "border-indigo-200 bg-indigo-50 text-indigo-800 dark:border-indigo-900 dark:bg-indigo-950 dark:text-indigo-200"
    case "delegated_review_submitted":
      return "border-cyan-200 bg-cyan-50 text-cyan-800 dark:border-cyan-900 dark:bg-cyan-950 dark:text-cyan-200"
    case "cancelled":
      return "border-slate-300 bg-slate-100 text-slate-800 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
    case "closed":
      return "border-zinc-300 bg-zinc-100 text-zinc-800 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200"
    case "created":
      return "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-200"
    case "updated":
    default:
      return "border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-100"
  }
}

export function formatRequisitionLogTimestamp(value: string) {
  const parsed = new Date(value)

  if (Number.isNaN(parsed.getTime())) {
    return value
  }

  return parsed.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  })
}

export function canCostCenterEditRequisition(
  statusName?: string | null,
  isEditable?: boolean
) {
  if (typeof isEditable === "boolean") {
    return isEditable
  }

  const normalized = statusName?.toLowerCase() ?? ""

  return normalized === "draft" || normalized === "cost center review"
}

/** Operations pipeline sequence for Director / Head of Department approval. */
export const DIRECTOR_APPROVAL_STAGE_SEQUENCE = 2

export function canAddLineItemsToRequisition(
  statusName?: string | null,
  mode: "create" | "edit" = "edit"
) {
  if (mode === "create") {
    return true
  }

  const normalized = statusName?.toLowerCase() ?? ""

  return normalized === "draft" || normalized === "cost center review"
}

export function canRemoveLineItemsFromRequisition(
  statusName?: string | null,
  mode: "create" | "edit" = "edit",
  currentStageSequence?: number | null
) {
  if (mode === "create") {
    return true
  }

  const normalized = statusName?.toLowerCase() ?? ""

  if (normalized === "draft") {
    return true
  }

  // Cost center may remove lines only while the requisition has not moved past
  // the head-of-department (Director) stage — e.g. sent back before HOD approval.
  if (normalized === "cost center review") {
    const sequence =
      currentStageSequence ?? DIRECTOR_APPROVAL_STAGE_SEQUENCE

    return sequence <= DIRECTOR_APPROVAL_STAGE_SEQUENCE
  }

  return false
}

export function canSubmitRequisition(
  statusName?: string | null,
  mode: "create" | "edit" = "edit"
) {
  if (mode === "create") {
    return true
  }

  const normalized = statusName?.toLowerCase() ?? ""

  return normalized === "draft" || normalized === "cost center review"
}
