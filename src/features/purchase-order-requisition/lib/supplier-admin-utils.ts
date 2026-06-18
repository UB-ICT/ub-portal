import type { Supplier } from "@/lib/api/suppliers"

export type SupplierSortField =
  | "name"
  | "email"
  | "contact_person"
  | "status"
  | "phone_number"

export type SupplierSearchCriteria = {
  query: string
  status: string
  sortBy: SupplierSortField
  sortDirection: "asc" | "desc"
}

export const DEFAULT_SUPPLIER_SEARCH: SupplierSearchCriteria = {
  query: "",
  status: "",
  sortBy: "name",
  sortDirection: "asc",
}

export function getSupplierSearchText(supplier: Supplier) {
  return [
    supplier.name,
    supplier.email,
    supplier.contact_person,
    supplier.phone_number,
    supplier.TIN,
    supplier.notes,
    supplier.status?.name,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase()
}

export function filterAndSortSuppliers(
  suppliers: Supplier[],
  criteria: SupplierSearchCriteria
) {
  const normalizedQuery = criteria.query.trim().toLowerCase()

  const filtered = suppliers.filter((supplier) => {
    if (
      normalizedQuery &&
      !getSupplierSearchText(supplier).includes(normalizedQuery)
    ) {
      return false
    }

    if (
      criteria.status &&
      (supplier.status?.name ?? "").toLowerCase() !==
        criteria.status.toLowerCase()
    ) {
      return false
    }

    return true
  })

  return [...filtered].sort((left, right) => {
    const direction = criteria.sortDirection === "asc" ? 1 : -1

    switch (criteria.sortBy) {
      case "email":
        return (
          (left.email ?? "").localeCompare(right.email ?? "") * direction
        )
      case "contact_person":
        return (
          (left.contact_person ?? "").localeCompare(
            right.contact_person ?? ""
          ) * direction
        )
      case "phone_number":
        return (
          (left.phone_number ?? "").localeCompare(right.phone_number ?? "") *
          direction
        )
      case "status":
        return (
          (left.status?.name ?? "").localeCompare(right.status?.name ?? "") *
          direction
        )
      case "name":
      default:
        return left.name.localeCompare(right.name) * direction
    }
  })
}

export function getSupplierStatusStyles(statusName?: string | null) {
  const normalized = (statusName ?? "").toLowerCase()

  if (normalized.includes("approve")) {
    return "border-green-200 bg-green-50 text-green-800 dark:border-green-900 dark:bg-green-950 dark:text-green-200"
  }

  if (normalized.includes("reject")) {
    return "border-red-200 bg-red-50 text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200"
  }

  if (normalized.includes("pending") || normalized.includes("review")) {
    return "border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-100"
  }

  return "border-border bg-muted/40 text-muted-foreground"
}

export function supplierIsReviewable(supplier: Supplier) {
  const status = (supplier.status?.name ?? "").toLowerCase()
  return status.includes("pending") || status.includes("review")
}
