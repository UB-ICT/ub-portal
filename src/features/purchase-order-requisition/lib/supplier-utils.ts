import type { Supplier } from "@/lib/api/suppliers"

export const APPROVED_SUPPLIER_STATUS_ID = 3

export function isSupplierApproved(
  supplier: Pick<Supplier, "status_id"> & {
    status?: { name?: string | null } | null
  }
) {
  if (supplier.status?.name?.toLowerCase() === "approved") {
    return true
  }

  return supplier.status_id === APPROVED_SUPPLIER_STATUS_ID
}
