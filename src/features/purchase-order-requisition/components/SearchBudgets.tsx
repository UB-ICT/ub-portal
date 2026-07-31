import { useState } from "react"

import { UBInput, UBNativeSelect } from "@/components/shared/UBInput"
import { cn } from "@/lib/utils"
import type { BudgetYear } from "@/lib/api/budgets"

import {
  DEFAULT_BUDGET_SEARCH,
  type BudgetSearchCriteria,
} from "../lib/budget-utils"

const STATUS_OPTIONS = [
  { value: "", label: "All statuses" },
  { value: "Draft", label: "Draft" },
  { value: "Pending", label: "Pending" },
  { value: "Approved", label: "Approved" },
  { value: "Active", label: "Active" },
  { value: "Inactive", label: "Inactive" },
]

type SearchBudgetsProps = {
  years: BudgetYear[]
  onSearch?: (criteria: BudgetSearchCriteria) => void
  className?: string
}

export function SearchBudgets({
  years,
  onSearch,
  className,
}: SearchBudgetsProps) {
  const [values, setValues] =
    useState<BudgetSearchCriteria>(DEFAULT_BUDGET_SEARCH)

  const applySearch = (nextValues: BudgetSearchCriteria) => {
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
          placeholder="Cost center, year, status..."
          value={values.query}
          onChange={(event) =>
            applySearch({ ...values, query: event.target.value })
          }
        />
        <UBNativeSelect
          label="Budget year"
          options={[
            { value: "", label: "All years" },
            ...years.map((year) => ({
              value: String(year.id),
              label: year.submissions_open
                ? `${year.label} (open)`
                : year.label,
            })),
          ]}
          value={values.budgetYearId === "" ? "" : String(values.budgetYearId)}
          onChange={(event) =>
            applySearch({
              ...values,
              budgetYearId: event.target.value
                ? Number(event.target.value)
                : "",
            })
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
      </div>
    </div>
  )
}
