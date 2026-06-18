import { useState } from "react"

import { UBInput, UBNativeSelect } from "@/components/shared/UBInput"
import { cn } from "@/lib/utils"

export type RequisitionSearchStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "in-review"

export type RequisitionSearchCriteria = {
  query: string
  status: RequisitionSearchStatus | ""
}

const STATUS_OPTIONS: { value: RequisitionSearchStatus | ""; label: string }[] =
  [
    { value: "", label: "All statuses" },
    { value: "pending", label: "Pending" },
    { value: "in-review", label: "In review" },
    { value: "approved", label: "Approved" },
    { value: "rejected", label: "Rejected" },
  ]

const INITIAL_CRITERIA: RequisitionSearchCriteria = {
  query: "",
  status: "",
}

type SearchRequisitionsProps = {
  onSearch?: (criteria: RequisitionSearchCriteria) => void
  className?: string
}

export function SearchRequisitions({
  onSearch,
  className,
}: SearchRequisitionsProps) {
  const [values, setValues] = useState<RequisitionSearchCriteria>(INITIAL_CRITERIA)

  const applySearch = (nextValues: RequisitionSearchCriteria) => {
    setValues(nextValues)
    onSearch?.({
      query: nextValues.query.trim(),
      status: nextValues.status,
    })
  }

  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-card p-2 shadow-sm",
        className
      )}
    >
      <div className="flex flex-col gap-2">
        <UBInput
          label="Search"
          placeholder="Reference, department, supplier, amount..."
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
            applySearch({
              ...values,
              status: event.target.value as RequisitionSearchStatus | "",
            })
          }
        />
      </div>
    </div>
  )
}
