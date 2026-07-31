import { cn } from "@/lib/utils"
import type { BudgetComparison } from "@/lib/api/budgets"

import { formatBudgetAmount } from "../lib/budget-utils"

export type BudgetComparisonDraftRow = {
  chart_of_account_id: number
  account_no: string
  description: string
  previousAmount: number | null
  previousNotes: string | null
  amount: string
  notes: string
}

type BudgetComparisonTableProps = {
  comparison: BudgetComparison | null
  rows: BudgetComparisonDraftRow[]
  editable?: boolean
  onChange?: (rows: BudgetComparisonDraftRow[]) => void
  className?: string
}

export function mapComparisonToDraftRows(
  comparison: BudgetComparison | null
): BudgetComparisonDraftRow[] {
  if (!comparison) {
    return []
  }

  return comparison.rows.map((row) => ({
    chart_of_account_id: row.chart_of_account_id,
    account_no: row.account_no ?? "",
    description: row.description ?? "",
    previousAmount: row.previous.amount,
    previousNotes: row.previous.notes,
    amount:
      row.current.amount === null || row.current.amount === undefined
        ? row.previous.amount !== null && row.previous.amount !== undefined
          ? String(row.previous.amount)
          : ""
        : String(row.current.amount),
    notes: row.current.notes ?? "",
  }))
}

export function BudgetComparisonTable({
  comparison,
  rows,
  editable = false,
  onChange,
  className,
}: BudgetComparisonTableProps) {
  const previousLabel = comparison?.years.previous ?? "Previous year"
  const currentLabel = comparison?.years.current ?? "Current year"

  const updateRow = (
    index: number,
    patch: Partial<BudgetComparisonDraftRow>
  ) => {
    if (!onChange) {
      return
    }

    onChange(
      rows.map((row, rowIndex) =>
        rowIndex === index ? { ...row, ...patch } : row
      )
    )
  }

  if (rows.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No line items available for comparison yet. Add accounts to build this
        budget.
      </p>
    )
  }

  return (
    <div
      className={cn(
        "overflow-x-auto rounded-xl border border-border bg-card",
        className
      )}
    >
      <table className="w-full min-w-[720px] text-sm">
        <thead>
          <tr className="border-b bg-muted/50">
            <th className="px-4 py-3 text-left font-medium">Account</th>
            <th className="px-4 py-3 text-left font-medium">Description</th>
            <th className="px-4 py-3 text-right font-medium">{previousLabel}</th>
            <th className="px-4 py-3 text-right font-medium">{currentLabel}</th>
            <th className="px-4 py-3 text-left font-medium">
              Notes ({currentLabel})
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={row.chart_of_account_id} className="border-b align-top">
              <td className="px-4 py-3 font-medium tabular-nums">
                {row.account_no || "—"}
              </td>
              <td className="px-4 py-3">{row.description || "—"}</td>
              <td className="px-4 py-3 text-right tabular-nums text-muted-foreground">
                <div>{formatBudgetAmount(row.previousAmount)}</div>
                {row.previousNotes ? (
                  <p className="mt-1 text-left text-xs text-muted-foreground">
                    {row.previousNotes}
                  </p>
                ) : null}
              </td>
              <td className="px-4 py-3 text-right">
                {editable ? (
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={row.amount}
                    onChange={(event) =>
                      updateRow(index, { amount: event.target.value })
                    }
                    aria-label={`Amount for ${row.account_no}`}
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-right text-sm tabular-nums focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/20"
                  />
                ) : (
                  <span className="tabular-nums">
                    {formatBudgetAmount(row.amount)}
                  </span>
                )}
              </td>
              <td className="px-4 py-3">
                {editable ? (
                  <textarea
                    value={row.notes}
                    onChange={(event) =>
                      updateRow(index, { notes: event.target.value })
                    }
                    rows={2}
                    aria-label={`Notes for ${row.account_no}`}
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/20"
                  />
                ) : (
                  <span className="text-muted-foreground">
                    {row.notes || "—"}
                  </span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
