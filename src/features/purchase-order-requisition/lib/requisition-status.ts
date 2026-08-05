export type RequisitionStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "in-review"
  | "cancelled"
  | "closed"

export const REQUISITION_STATUS_LABELS: Record<RequisitionStatus, string> = {
  pending: "Pending",
  approved: "Approved",
  rejected: "Rejected",
  "in-review": "In review",
  cancelled: "Cancelled",
  closed: "Closed",
}

export function getRequisitionStatusStyles(status: RequisitionStatus) {
  switch (status) {
    case "approved":
      return {
        accent: "border-l-green-500",
        badge:
          "border-green-200 bg-green-50 text-green-800 dark:border-green-900 dark:bg-green-950 dark:text-green-200",
      }
    case "pending":
      return {
        accent: "border-l-amber-500",
        badge:
          "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-200",
      }
    case "in-review":
      return {
        accent: "border-l-blue-500",
        badge:
          "border-blue-200 bg-blue-50 text-blue-800 dark:border-blue-900 dark:bg-blue-950 dark:text-blue-200",
      }
    case "rejected":
      return {
        accent: "border-l-red-500",
        badge:
          "border-red-200 bg-red-50 text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200",
      }
    case "cancelled":
      return {
        accent: "border-l-slate-400",
        badge:
          "border-slate-300 bg-slate-100 text-slate-800 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200",
      }
    case "closed":
      return {
        accent: "border-l-zinc-500",
        badge:
          "border-zinc-300 bg-zinc-100 text-zinc-800 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200",
      }
    default:
      return {
        accent: "border-l-border",
        badge: "",
      }
  }
}
