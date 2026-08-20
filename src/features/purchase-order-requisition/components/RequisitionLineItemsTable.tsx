import { Plus, Trash2 } from "lucide-react"
import { useMemo, type ReactNode } from "react"

import { UBButton } from "@/components/shared/UBButton"
import type { ChartOfAccount } from "@/lib/api/chart-of-accounts"
import { cn } from "@/lib/utils"

import {
  calculateLinePricing,
  DEFAULT_GST_RATE_PERCENT,
  roundMoney,
} from "../lib/line-pricing"
import { ChartOfAccountCombobox } from "./ChartOfAccountCombobox"

export type RequisitionLineItemDraft = {
  id: string
  chart_of_account_id: number | null
  account_no: string
  description: string
  quantity: number
  unit_cost: number
  total: number
  gst_applicable: boolean
  comments: string
}

export function createEmptyLineItem(): RequisitionLineItemDraft {
  return {
    id: crypto.randomUUID(),
    chart_of_account_id: null,
    account_no: "",
    description: "",
    quantity: 1,
    unit_cost: 0,
    total: 0,
    gst_applicable: false,
    comments: "",
  }
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(amount)
}

export function calculateRequisitionTotalFromLineItems(
  items: RequisitionLineItemDraft[],
  gstRatePercent = DEFAULT_GST_RATE_PERCENT
) {
  return calculateLinePricing(items, gstRatePercent).total
}

type RequisitionLineItemsTableProps = {
  items: RequisitionLineItemDraft[]
  onChange: (items: RequisitionLineItemDraft[]) => void
  gstRatePercent?: number
  budgetAccounts?: ChartOfAccount[]
  isLoadingBudgetAccounts?: boolean
  budgetAccountsError?: string | null
  footerActions?: ReactNode
  className?: string
  disabled?: boolean
  allowAddItems?: boolean
  stripedRows?: boolean
}

const baseInputClassName =
  "w-full rounded-lg border border-input px-2 py-1.5 text-sm transition-colors placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-50"

function getInputClassName(stripedRows: boolean) {
  return cn(baseInputClassName, stripedRows ? "bg-transparent" : "bg-background")
}

function getStripedCellClassName(index: number, stripedRows: boolean) {
  return cn(
    "px-2 py-2 align-top",
    stripedRows && (index % 2 === 1 ? "bg-muted/50" : "bg-transparent")
  )
}

export function RequisitionLineItemsTable({
  items,
  onChange,
  gstRatePercent = DEFAULT_GST_RATE_PERCENT,
  budgetAccounts = [],
  isLoadingBudgetAccounts = false,
  budgetAccountsError = null,
  footerActions,
  className,
  disabled = false,
  allowAddItems = true,
  stripedRows = true,
}: RequisitionLineItemsTableProps) {
  const pricing = useMemo(
    () => calculateLinePricing(items, gstRatePercent),
    [items, gstRatePercent]
  )

  const updateItem = (
    id: string,
    patch: Partial<RequisitionLineItemDraft>
  ) => {
    onChange(
      items.map((item) => (item.id === id ? { ...item, ...patch } : item))
    )
  }

  const updateQuantity = (item: RequisitionLineItemDraft, quantity: number) => {
    const safeQuantity = Number.isFinite(quantity) ? Math.max(0, quantity) : 0
    updateItem(item.id, {
      quantity: safeQuantity,
      total: roundMoney(safeQuantity * item.unit_cost),
    })
  }

  const updateUnitCost = (item: RequisitionLineItemDraft, unitCost: number) => {
    updateItem(item.id, {
      unit_cost: unitCost,
      total: roundMoney(item.quantity * unitCost),
    })
  }

  const updateTotal = (item: RequisitionLineItemDraft, total: number) => {
    updateItem(item.id, {
      total,
      unit_cost: item.quantity !== 0 ? total / item.quantity : 0,
    })
  }

  const removeItem = (id: string) => {
    onChange(items.filter((item) => item.id !== id))
  }

  const addItem = () => {
    if (!allowAddItems || disabled) {
      return
    }

    const previous = items[items.length - 1]
    const next = createEmptyLineItem()

    if (previous?.chart_of_account_id) {
      next.chart_of_account_id = previous.chart_of_account_id
      next.account_no = previous.account_no
      next.description = previous.description
    }

    onChange([...items, next])
  }

  const inputClassName = getInputClassName(stripedRows)
  const canSelectBudgetLine =
    !isLoadingBudgetAccounts &&
    !budgetAccountsError &&
    budgetAccounts.length > 0

  return (
    <div className={cn("space-y-2", className)}>
      <h3 className="text-sm font-semibold text-foreground">Line items</h3>
      {!allowAddItems ? (
        <p className="text-xs text-muted-foreground">
          New line items cannot be added after this requisition has been
          submitted. You may still edit existing items while in Cost Center
          Review.
        </p>
      ) : null}
      {budgetAccountsError ? (
        <p className="text-xs text-destructive">{budgetAccountsError}</p>
      ) : null}
      {!budgetAccountsError &&
      !isLoadingBudgetAccounts &&
      budgetAccounts.length === 0 ? (
        <p className="text-xs text-muted-foreground">
          No active budget line items are available for this cost center.
          Activate a budget before adding requisition line items.
        </p>
      ) : null}
      <p className="text-xs text-muted-foreground">
        GST rate: {gstRatePercent}% (applied to the line total on checked lines)
      </p>

      <div className="overflow-hidden rounded-xl border border-border">
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse text-sm">
            <thead className="bg-muted/40">
              <tr className="text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                <th className="min-w-72 px-2 py-2 font-medium">Budget line item</th>
                <th className="min-w-32 px-2 py-2 font-medium">Notes</th>
                <th className="w-20 px-2 py-2 font-medium">Qty</th>
                <th className="w-28 px-2 py-2 font-medium">Unit cost</th>
                <th className="w-28 px-2 py-2 font-medium">Total</th>
                <th className="w-16 px-2 py-2 font-medium">GST</th>
                <th className="w-28 px-2 py-2 font-medium">GST amt</th>
                <th className="w-28 px-2 py-2 font-medium">Line total</th>
                <th className="w-10 px-2 py-2" aria-label="Actions" />
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td
                    colSpan={9}
                    className="px-2 py-6 text-center text-sm text-muted-foreground"
                  >
                    No line items yet. Add at least one item to continue.
                  </td>
                </tr>
              ) : (
                items.map((item, index) => {
                  const priced = pricing.items[index]

                  return (
                    <tr key={item.id} className="border-t border-border/70">
                      <td className={getStripedCellClassName(index, stripedRows)}>
                        <ChartOfAccountCombobox
                          label="Budget line item"
                          hideLabel
                          value={
                            item.chart_of_account_id
                              ? String(item.chart_of_account_id)
                              : ""
                          }
                          primaryField="account_no"
                          accounts={budgetAccounts}
                          loading={isLoadingBudgetAccounts}
                          emptyMessage="No active budget accounts match."
                          placeholder="Select budget line item..."
                          inputClassName={inputClassName}
                          disabled={disabled || !canSelectBudgetLine}
                          onSelect={(account) =>
                            updateItem(item.id, {
                              chart_of_account_id: account.id,
                              account_no: account.account_no,
                              description: account.description,
                            })
                          }
                        />
                      </td>
                      <td className={getStripedCellClassName(index, stripedRows)}>
                        <input
                          type="text"
                          aria-label="Notes"
                          className={inputClassName}
                          value={item.comments}
                          onChange={(event) =>
                            updateItem(item.id, {
                              comments: event.target.value,
                            })
                          }
                          disabled={disabled}
                          placeholder="Optional"
                        />
                      </td>
                      <td className={getStripedCellClassName(index, stripedRows)}>
                        <input
                          type="number"
                          step="any"
                          aria-label="Quantity"
                          className={inputClassName}
                          value={Number.isNaN(item.quantity) ? "-" : item.quantity}
                          onChange={(event) => {
                            const raw = event.target.value
                            updateQuantity(item, raw === "" ? 0 : Number(raw))
                          }}
                          disabled={disabled}
                        />
                      </td>
                      <td className={getStripedCellClassName(index, stripedRows)}>
                        <input
                          type="number"
                          min={0}
                          step="0.01"
                          aria-label="Unit cost"
                          className={inputClassName}
                          value={item.unit_cost}
                          onChange={(event) =>
                            updateUnitCost(
                              item,
                              Math.max(0, Number(event.target.value) || 0)
                            )
                          }
                          disabled={disabled}
                        />
                      </td>
                      <td className={getStripedCellClassName(index, stripedRows)}>
                        <input
                          type="number"
                          min={0}
                          step="0.01"
                          aria-label="Total"
                          className={inputClassName}
                          value={item.total}
                          onChange={(event) =>
                            updateTotal(
                              item,
                              Math.max(0, Number(event.target.value) || 0)
                            )
                          }
                          disabled={disabled}
                        />
                      </td>
                      <td className={getStripedCellClassName(index, stripedRows)}>
                        <label className="flex items-center justify-center gap-2 py-1.5">
                          <input
                            type="checkbox"
                            className="size-4 rounded border-border"
                            checked={item.gst_applicable}
                            onChange={(event) =>
                              updateItem(item.id, {
                                gst_applicable: event.target.checked,
                              })
                            }
                            disabled={disabled}
                            aria-label="Apply GST"
                          />
                        </label>
                      </td>
                      <td className={getStripedCellClassName(index, stripedRows)}>
                        <span className="block px-1 py-1.5 tabular-nums">
                          {formatCurrency(priced?.gst_amount ?? 0)}
                        </span>
                      </td>
                      <td className={getStripedCellClassName(index, stripedRows)}>
                        <span className="block px-1 py-1.5 font-medium tabular-nums">
                          {formatCurrency(priced?.total ?? 0)}
                        </span>
                      </td>
                      <td className={getStripedCellClassName(index, stripedRows)}>
                        <UBButton
                          type="button"
                          size="icon"
                          variant="ghost"
                          aria-label="Remove line item"
                          disabled={disabled || items.length === 1}
                          onClick={() => removeItem(item.id)}
                        >
                          <Trash2 className="size-4 text-destructive" />
                        </UBButton>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {items.length > 0 ? (
          <div className="space-y-3 border-t border-border bg-muted/20 px-3 py-3">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div
                className="min-w-56 space-y-1 rounded-lg border border-border/70 bg-background px-3 py-2 text-sm shadow-sm"
                aria-label="Requisition totals"
              >
                <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
                  Totals
                </p>
                <p className="text-muted-foreground">
                  Subtotal:{" "}
                  <span className="font-medium text-foreground tabular-nums">
                    {formatCurrency(pricing.lines_subtotal)}
                  </span>
                </p>
                <p className="text-muted-foreground">
                  GST ({gstRatePercent}%):{" "}
                  <span className="font-medium text-foreground tabular-nums">
                    {formatCurrency(pricing.gst_total)}
                  </span>
                </p>
                <p className="text-base font-semibold text-foreground">
                  Grand total:{" "}
                  <span className="tabular-nums">
                    {formatCurrency(pricing.total)}
                  </span>
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {allowAddItems ? (
                  <UBButton
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addItem}
                    disabled={disabled || !canSelectBudgetLine}
                  >
                    <Plus className="size-4" data-icon="inline-start" />
                    Add line
                  </UBButton>
                ) : null}
                {!disabled ? footerActions : null}
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
}

export function mapLineItemsForApi(items: RequisitionLineItemDraft[]) {
  return items.map((item) => ({
    chart_of_account_id: item.chart_of_account_id as number,
    quantity: item.quantity,
    unit_cost: item.unit_cost,
    gst_applicable: item.gst_applicable,
    comments: item.comments.trim() || undefined,
  }))
}

/** Only rows that the API can persist (budget line selected). */
export function mapCompleteLineItemsForApi(items: RequisitionLineItemDraft[]) {
  return mapLineItemsForApi(
    items.filter(
      (item) =>
        item.chart_of_account_id !== null &&
        Number.isFinite(item.quantity) &&
        item.total >= 0
    )
  )
}

/** Persist in-progress draft rows, including incomplete budget lines. */
export function mapDraftLineItemsForApi(items: RequisitionLineItemDraft[]) {
  return items
    .filter(
      (item) =>
        item.chart_of_account_id !== null ||
        item.comments.trim() !== "" ||
        (Number.isFinite(item.quantity) && item.quantity !== 0) ||
        item.total > 0 ||
        item.gst_applicable
    )
    .map((item) => ({
      chart_of_account_id: item.chart_of_account_id,
      quantity: Number.isFinite(item.quantity) ? item.quantity : 0,
      unit_cost: item.unit_cost >= 0 ? item.unit_cost : 0,
      gst_applicable: item.gst_applicable,
      comments: item.comments.trim() || undefined,
    }))
}

export function isLineItemsValid(items: RequisitionLineItemDraft[]) {
  return (
    items.length > 0 &&
    items.every(
      (item) =>
        item.chart_of_account_id !== null &&
        Number.isFinite(item.quantity) &&
        item.quantity !== 0 &&
        item.total >= 0
    )
  )
}
