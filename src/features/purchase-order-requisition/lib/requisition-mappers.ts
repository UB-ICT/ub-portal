import type { RequisitionRecord } from "@/lib/api/requisitions"
import { normalizeRequisitionPriority } from "@/features/purchase-order-requisition/lib/requisition-priorities"

import type { RequisitionStatus } from "../components/RequisitionCard"
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
    referenceNumber: requisition.number,
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
