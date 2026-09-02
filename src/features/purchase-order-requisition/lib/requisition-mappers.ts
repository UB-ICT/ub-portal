import type { RequisitionRecord } from "@/lib/api/requisitions"
import { normalizeRequisitionPriority } from "@/features/purchase-order-requisition/lib/requisition-priorities"
import type { RequisitionStatus } from "@/features/purchase-order-requisition/lib/requisition-status"

import type { RequisitionListItem } from "../components/ListRequisitions"

export function mapApiStatusToCardStatus(
  statusName?: string | null
): RequisitionStatus {
  const normalized = (statusName ?? "").toLowerCase()

  if (normalized.includes("review") || normalized.includes("cost center")) {
    return "in-review"
  }

  if (normalized.includes("approve")) {
    return "approved"
  }

  if (normalized.includes("reject")) {
    return "rejected"
  }

  if (normalized.includes("cancel")) {
    return "cancelled"
  }

  if (normalized.includes("closed") || normalized === "close") {
    return "closed"
  }

  // Draft and Pending share the amber "pending" treatment for the number badge.
  return "pending"
}

export function mapRequisitionRecordToListItem(
  requisition: RequisitionRecord
): RequisitionListItem {
  const primarySupplier =
    requisition.suppliers?.find((supplier) => supplier.pivot?.is_recommended) ??
    requisition.suppliers?.[0] ??
    requisition.attachments?.[0]?.supplier

  return {
    id: requisition.id,
    referenceNumber: requisition.requisition_number ?? requisition.number,
    supplier: primarySupplier?.name ?? "",
    department: requisition.cost_center?.name ?? "",
    date: toDateInputValue(requisition.date_prepared),
    status: mapApiStatusToCardStatus(requisition.status?.name),
    priority: normalizeRequisitionPriority(requisition.priority),
    costCenter: requisition.cost_center?.name ?? "",
    amount: Number(requisition.total),
  }
}

export function toDateInputValue(value: string) {
  const parsed = new Date(value)

  if (Number.isNaN(parsed.getTime())) {
    return value.slice(0, 10)
  }

  return parsed.toISOString().slice(0, 10)
}

/** Keep nested detail when a slim list/mutation payload omits relations. */
export function mergeRequisitionRecord(
  previous: RequisitionRecord | null | undefined,
  incoming: RequisitionRecord
): RequisitionRecord {
  if (!previous || previous.id !== incoming.id) {
    return incoming
  }

  return {
    ...previous,
    ...incoming,
    items: incoming.items !== undefined ? incoming.items : previous.items,
    attachments:
      incoming.attachments !== undefined
        ? incoming.attachments
        : previous.attachments,
    suppliers:
      incoming.suppliers !== undefined ? incoming.suppliers : previous.suppliers,
    tags: incoming.tags !== undefined ? incoming.tags : previous.tags,
    cost_center: incoming.cost_center ?? previous.cost_center,
    status: incoming.status ?? previous.status,
    stage: incoming.stage ?? previous.stage,
    pipeline: incoming.pipeline ?? previous.pipeline,
  }
}
