import type { RequisitionUserStageAction } from "@/lib/api/requisitions"

export const REQUISITION_USER_STAGE_ACTION_LABELS: Record<
  RequisitionUserStageAction,
  string
> = {
  approved: "Approved",
  rejected: "Rejected",
  cost_center_review: "More information requested",
}

export function getRequisitionUserStageActionLabel(
  action: RequisitionUserStageAction
) {
  return REQUISITION_USER_STAGE_ACTION_LABELS[action] ?? action
}

export function getRequisitionUserStageActionDescription(
  action: RequisitionUserStageAction,
  stageName?: string | null
) {
  const stageSuffix = stageName ? ` at the ${stageName} stage` : " at this stage"

  switch (action) {
    case "approved":
      return `You approved this requisition${stageSuffix}.`
    case "rejected":
      return `You rejected this requisition${stageSuffix}.`
    case "cost_center_review":
      return `You requested more information from the cost center${stageSuffix}.`
    default:
      return `You recorded a decision${stageSuffix}.`
  }
}

export function getRequisitionUserStageActionHighlightClass(
  action: RequisitionUserStageAction
) {
  switch (action) {
    case "approved":
      return "border-green-200 bg-green-50 text-green-900 dark:border-green-900 dark:bg-green-950 dark:text-green-100"
    case "rejected":
      return "border-red-200 bg-red-50 text-red-900 dark:border-red-900 dark:bg-red-950 dark:text-red-100"
    case "cost_center_review":
      return "border-orange-200 bg-orange-50 text-orange-900 dark:border-orange-900 dark:bg-orange-950 dark:text-orange-100"
    default:
      return "border-border bg-muted/40 text-foreground"
  }
}

export function getRequisitionUserStageActionButtonClass(
  action: RequisitionUserStageAction,
  isTaken: boolean
) {
  if (!isTaken) {
    return ""
  }

  switch (action) {
    case "approved":
      return "border-green-600 bg-green-600 text-white hover:bg-green-600 hover:text-white"
    case "rejected":
      return "border-destructive bg-destructive text-white hover:bg-destructive hover:text-white"
    case "cost_center_review":
      return "border-orange-500 bg-orange-500 text-white hover:bg-orange-500 hover:text-white"
    default:
      return ""
  }
}
