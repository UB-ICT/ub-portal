import { useState } from "react"

import { UBInput, UBNativeSelect } from "@/components/shared/UBInput"
import { cn } from "@/lib/utils"

import {
  DEFAULT_ACCOUNT_SEARCH,
  type AccountSearchCriteria,
  type AccountSortField,
} from "../lib/account-admin-utils"

const SORT_OPTIONS: { value: AccountSortField; label: string }[] = [
  { value: "account_no", label: "Account number" },
  { value: "description", label: "Description" },
]

type SearchAccountsProps = {
  onSearch?: (criteria: AccountSearchCriteria) => void
  className?: string
}

export function SearchAccounts({ onSearch, className }: SearchAccountsProps) {
  const [values, setValues] =
    useState<AccountSearchCriteria>(DEFAULT_ACCOUNT_SEARCH)

  const applySearch = (nextValues: AccountSearchCriteria) => {
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
          placeholder="Account number or description..."
          value={values.query}
          onChange={(event) =>
            applySearch({ ...values, query: event.target.value })
          }
        />
        <UBNativeSelect
          label="Sort by"
          options={SORT_OPTIONS}
          value={values.sortBy}
          onChange={(event) =>
            applySearch({
              ...values,
              sortBy: event.target.value as AccountSortField,
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
