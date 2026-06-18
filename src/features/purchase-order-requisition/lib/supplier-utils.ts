import type { Supplier } from "@/lib/api/suppliers"

export const APPROVED_SUPPLIER_STATUS_ID = 3
export const DELETED_SUPPLIER_STATUS_ID = 7

export function isSupplierDeleted(
  supplier: Pick<Supplier, "status_id"> & {
    status?: { name?: string | null } | null
  }
) {
  if (supplier.status?.name?.toLowerCase() === "deleted") {
    return true
  }

  return supplier.status_id === DELETED_SUPPLIER_STATUS_ID
}

export function isSupplierApproved(
  supplier: Pick<Supplier, "status_id"> & {
    status?: { name?: string | null } | null
  }
) {
  if (isSupplierDeleted(supplier)) {
    return false
  }

  if (supplier.status?.name?.toLowerCase() === "approved") {
    return true
  }

  return supplier.status_id === APPROVED_SUPPLIER_STATUS_ID
}
