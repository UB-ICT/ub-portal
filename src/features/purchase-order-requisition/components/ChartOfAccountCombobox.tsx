import { useEffect, useId, useMemo, useState } from "react"

import { Popover, PopoverAnchor, PopoverContent } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { useChartOfAccountsStore } from "@/store/chart-of-accounts-store"
import type { ChartOfAccount } from "@/lib/api/chart-of-accounts"

function matchesQuery(account: ChartOfAccount, query: string) {
  const needle = query.trim().toLowerCase()

  if (!needle) {
    return true
  }

  return (
    account.account_no.toLowerCase().includes(needle) ||
    account.description.toLowerCase().includes(needle)
  )
}

type ChartOfAccountComboboxProps = {
  label: string
  value: string
  onSelect: (account: ChartOfAccount) => void
  primaryField: "account_no" | "description"
  disabled?: boolean
  error?: string
  placeholder?: string
  hideLabel?: boolean
  inputClassName?: string
}

export function ChartOfAccountCombobox({
  label,
  value,
  onSelect,
  primaryField,
  disabled = false,
  error,
  inputClassName,
  placeholder,
  hideLabel = false,
}: ChartOfAccountComboboxProps) {
  const chartOfAccounts = useChartOfAccountsStore(
    (state) => state.chartOfAccounts
  )
  const isLoading = useChartOfAccountsStore((state) => state.isLoading)
  const fetchChartOfAccounts = useChartOfAccountsStore(
    (state) => state.fetchChartOfAccounts
  )

  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")

  useEffect(() => {
    void fetchChartOfAccounts()
  }, [fetchChartOfAccounts])

  const selectedAccount = chartOfAccounts.find(
    (account) => String(account.id) === value
  )
  const displayText = selectedAccount ? selectedAccount[primaryField] : ""
  // While closed, always show the selected account's text rather than
  // whatever was last typed -- avoids syncing `query` via an effect.
  const inputValue = open ? query : displayText

  const visibleAccounts = useMemo(
    () => chartOfAccounts.filter((account) => matchesQuery(account, query)),
    [chartOfAccounts, query]
  )

  const inputId = useId()
  const errorId = `${inputId}-error`

  const handleSelect = (account: ChartOfAccount) => {
    onSelect(account)
    setOpen(false)
  }

  return (
    <div className="w-full">
      {hideLabel ? null : (
        <label
          htmlFor={inputId}
          className="mb-2 block text-xs font-medium uppercase tracking-widest text-muted-foreground"
        >
          {label}
        </label>
      )}

      <Popover open={open && !disabled} onOpenChange={setOpen}>
        <PopoverAnchor asChild>
          <input
            id={inputId}
            type="text"
            role="combobox"
            aria-expanded={open}
            aria-label={hideLabel ? label : undefined}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? errorId : undefined}
            autoComplete="off"
            className={cn(
              "w-full rounded-lg border border-input bg-background px-2 py-1.5 text-sm transition-colors placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-50",
              error && "border-destructive focus:border-destructive focus:ring-destructive/20",
              inputClassName
            )}
            placeholder={
              isLoading ? "Loading chart of accounts..." : placeholder
            }
            value={inputValue}
            disabled={disabled}
            onFocus={() => {
              setQuery(displayText)
              setOpen(true)
            }}
            onChange={(event) => {
              setQuery(event.target.value)
              setOpen(true)
            }}
            onKeyDown={(event) => {
              if (event.key === "Escape") {
                setOpen(false)
              }
            }}
          />
        </PopoverAnchor>

        <PopoverContent
          className="max-h-64 w-[--radix-popover-trigger-width] overflow-y-auto p-1"
          onOpenAutoFocus={(event) => event.preventDefault()}
        >
          {visibleAccounts.length === 0 ? (
            <p className="px-2 py-3 text-center text-xs text-muted-foreground">
              {isLoading ? "Loading..." : "No matching accounts."}
            </p>
          ) : (
            <ul role="listbox">
              {visibleAccounts.map((account) => (
                <li key={account.id}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={String(account.id) === value}
                    className={cn(
                      "flex w-full flex-col items-start gap-0.5 rounded-lg px-2 py-1.5 text-left text-sm outline-none hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
                      String(account.id) === value && "bg-accent/60"
                    )}
                    onClick={() => handleSelect(account)}
                  >
                    <span className="font-medium">{account.account_no}</span>
                    <span className="text-xs text-muted-foreground">
                      {account.description}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </PopoverContent>
      </Popover>

      {error ? (
        <p id={errorId} className="mt-1 text-xs text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  )
}
