import { useState } from "react"

import { UBInput, UBNativeSelect } from "@/components/shared/UBInput"
import { cn } from "@/lib/utils"

import {
  DEFAULT_COST_CENTER_SEARCH,
  type CostCenterSearchCriteria,
} from "../lib/cost-center-admin-utils"

type SearchCostCentersProps = {
  onSearch?: (criteria: CostCenterSearchCriteria) => void
  className?: string
}

export function SearchCostCenters({
  onSearch,
  className,
}: SearchCostCentersProps) {
  const [values, setValues] = useState<CostCenterSearchCriteria>(
    DEFAULT_COST_CENTER_SEARCH
  )

  const applySearch = (nextValues: CostCenterSearchCriteria) => {
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
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        <UBInput
          label="Search"
          placeholder="Name, number, or user..."
          value={values.query}
          onChange={(event) =>
            applySearch({ ...values, query: event.target.value })
          }
        />
        <UBNativeSelect
          label="Sort by"
          options={[
            { value: "name", label: "Name" },
            { value: "number", label: "Number" },
          ]}
          value={values.sortBy}
          onChange={(event) =>
            applySearch({
              ...values,
              sortBy: event.target.value as CostCenterSearchCriteria["sortBy"],
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
