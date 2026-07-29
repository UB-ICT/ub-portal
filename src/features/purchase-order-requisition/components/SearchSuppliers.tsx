import { useEffect, useState } from "react"

import { UBInput, UBNativeSelect } from "@/components/shared/UBInput"
import { cn } from "@/lib/utils"
import { useStatusesStore } from "@/store/statuses-store"

import {
  DEFAULT_SUPPLIER_SEARCH,
  type SupplierSearchCriteria,
  type SupplierSortField,
} from "../lib/supplier-admin-utils"

const SUPPLIER_STATUS_NAMES = ["Pending", "Approved", "Rejected", "Deleted"]

const SORT_OPTIONS: { value: SupplierSortField; label: string }[] = [
  { value: "name", label: "Name" },
  { value: "email", label: "Email" },
  { value: "contact_person", label: "Contact person" },
  { value: "phone_number", label: "Phone" },
  { value: "status", label: "Status" },
]

type SearchSuppliersProps = {
  onSearch?: (criteria: SupplierSearchCriteria) => void
  className?: string
}

export function SearchSuppliers({ onSearch, className }: SearchSuppliersProps) {
  const [values, setValues] =
    useState<SupplierSearchCriteria>(DEFAULT_SUPPLIER_SEARCH)

  const statuses = useStatusesStore((state) => state.statuses)
  const isLoadingStatuses = useStatusesStore((state) => state.isLoading)
  const fetchStatuses = useStatusesStore((state) => state.fetchStatuses)

  useEffect(() => {
    void fetchStatuses()
  }, [fetchStatuses])

  const statusOptions = [
    { value: "", label: "All statuses" },
    ...statuses
      .filter((status) => SUPPLIER_STATUS_NAMES.includes(status.name))
      .map((status) => ({ value: status.name, label: status.name })),
  ]

  const applySearch = (nextValues: SupplierSearchCriteria) => {
    setValues(nextValues)
    onSearch?.(nextValues)
  }

  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-card p-3 shadow-sm",
        className
      )}
    >
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <UBInput
          label="Search"
          placeholder="Name, email, contact, TAX..."
          value={values.query}
          onChange={(event) =>
            applySearch({ ...values, query: event.target.value })
          }
        />
        <UBNativeSelect
          label="Status"
          options={statusOptions}
          value={values.status}
          disabled={isLoadingStatuses}
          onChange={(event) =>
            applySearch({ ...values, status: event.target.value })
          }
        />
        <UBNativeSelect
          label="Sort by"
          options={SORT_OPTIONS}
          value={values.sortBy}
          onChange={(event) =>
            applySearch({
              ...values,
              sortBy: event.target.value as SupplierSortField,
            })
          }
        />
        <UBNativeSelect
          label="Direction"
          options={[
            { value: "asc", label: "Ascending" },
            { value: "desc", label: "Descending" },
          ]}
          value={values.sortDirection}
          onChange={(event) =>
            applySearch({
              ...values,
              sortDirection: event.target.value as "asc" | "desc",
            })
          }
        />
      </div>
    </div>
  )
}
