import { useState } from "react"

import { UBInput, UBNativeSelect } from "@/components/shared/UBInput"
import { cn } from "@/lib/utils"

import {
  DEFAULT_SUPPLIER_SEARCH,
  type SupplierSearchCriteria,
  type SupplierSortField,
} from "../lib/supplier-admin-utils"

const STATUS_OPTIONS = [
  { value: "", label: "All statuses" },
  { value: "Draft", label: "Draft" },
  { value: "Pending", label: "Pending" },
  { value: "Approved", label: "Approved" },
  { value: "Rejected", label: "Rejected" },
  { value: "Under Review", label: "Under Review" },
]

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
          placeholder="Name, email, contact, TIN..."
          value={values.query}
          onChange={(event) =>
            applySearch({ ...values, query: event.target.value })
          }
        />
        <UBNativeSelect
          label="Status"
          options={STATUS_OPTIONS}
          value={values.status}
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
