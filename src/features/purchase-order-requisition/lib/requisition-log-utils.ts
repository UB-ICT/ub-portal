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
    cancelled: "Cancelled",
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
    case "cancelled":
      return "border-slate-300 bg-slate-100 text-slate-800 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
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

export function canAddLineItemsToRequisition(
  statusName?: string | null,
  mode: "create" | "edit" = "edit"
) {
  if (mode === "create") {
    return true
  }

  return (statusName?.toLowerCase() ?? "") === "draft"
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
