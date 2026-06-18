import { Plus, Trash2 } from "lucide-react"
import type { ReactNode } from "react"

import { UBButton } from "@/components/shared/UBButton"
import { cn } from "@/lib/utils"

export type RequisitionLineItemDraft = {
  id: string
  description: string
  quantity: number
  unit_cost: number
  comments: string
}

export function createEmptyLineItem(): RequisitionLineItemDraft {
  return {
    id: crypto.randomUUID(),
    description: "",
    quantity: 1,
    unit_cost: 0,
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

function calculateLineTotal(item: RequisitionLineItemDraft) {
  return item.quantity * item.unit_cost
}

type RequisitionLineItemsTableProps = {
  items: RequisitionLineItemDraft[]
  onChange: (items: RequisitionLineItemDraft[]) => void
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
  footerActions,
  className,
  disabled = false,
  allowAddItems = true,
  stripedRows = true,
}: RequisitionLineItemsTableProps) {
  const updateItem = (
    id: string,
    patch: Partial<RequisitionLineItemDraft>
  ) => {
    onChange(
      items.map((item) => (item.id === id ? { ...item, ...patch } : item))
    )
  }

  const removeItem = (id: string) => {
    onChange(items.filter((item) => item.id !== id))
  }

  const addItem = () => {
    if (!allowAddItems || disabled) {
      return
    }

    onChange([...items, createEmptyLineItem()])
  }

  const grandTotal = items.reduce(
    (sum, item) => sum + calculateLineTotal(item),
    0
  )
  const inputClassName = getInputClassName(stripedRows)

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

      <div className="overflow-hidden rounded-xl border border-border">
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse text-sm">
          <thead className="bg-muted/40">
            <tr className="text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
              <th className="px-2 py-2 font-medium">Description</th>
              <th className="w-20 px-2 py-2 font-medium">Qty</th>
              <th className="w-28 px-2 py-2 font-medium">Unit cost</th>
              <th className="w-28 px-2 py-2 font-medium">Total</th>
              <th className="min-w-32 px-2 py-2 font-medium">Notes</th>
              <th className="w-10 px-2 py-2" aria-label="Actions" />
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-2 py-6 text-center text-sm text-muted-foreground"
                >
                  No line items yet. Add at least one item to continue.
                </td>
              </tr>
            ) : (
              items.map((item, index) => (
                <tr key={item.id} className="border-t border-border/70">
                  <td className={getStripedCellClassName(index, stripedRows)}>
                    <input
                      type="text"
                      aria-label="Item description"
                      placeholder="Item description"
                      className={inputClassName}
                      value={item.description}
                      onChange={(event) =>
                        updateItem(item.id, { description: event.target.value })
                      }
                      disabled={disabled}
                    />
                  </td>
                  <td className={getStripedCellClassName(index, stripedRows)}>
                    <input
                      type="number"
                      min={1}
                      step={1}
                      aria-label="Quantity"
                      className={inputClassName}
                      value={item.quantity}
                      onChange={(event) =>
                        updateItem(item.id, {
                          quantity: Math.max(1, Number(event.target.value) || 1),
                        })
                      }
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
                        updateItem(item.id, {
                          unit_cost: Math.max(0, Number(event.target.value) || 0),
                        })
                      }
                      disabled={disabled}
                    />
                  </td>
                  <td className={getStripedCellClassName(index, stripedRows)}>
                    <div className="flex h-[34px] items-center px-1 text-sm font-medium tabular-nums text-foreground">
                      {formatCurrency(calculateLineTotal(item))}
                    </div>
                  </td>
                  <td className={getStripedCellClassName(index, stripedRows)}>
                    <input
                      type="text"
                      aria-label="Notes"
                      placeholder="Notes"
                      className={inputClassName}
                      value={item.comments}
                      onChange={(event) =>
                        updateItem(item.id, { comments: event.target.value })
                      }
                      disabled={disabled}
                    />
                  </td>
                  <td className={getStripedCellClassName(index, stripedRows)}>
                    <button
                      type="button"
                      aria-label="Remove line item"
                      className="inline-flex size-8 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-destructive"
                      onClick={() => removeItem(item.id)}
                      disabled={disabled || items.length === 1}
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
          {items.length > 0 ? (
            <tfoot>
              <tr className="border-t border-border bg-muted/20">
                <td
                  colSpan={3}
                  className="px-2 py-2 text-right text-xs font-medium uppercase tracking-wide text-muted-foreground"
                >
                  Grand total
                </td>
                <td
                  colSpan={3}
                  className="px-2 py-2 text-sm font-semibold tabular-nums text-foreground"
                >
                  {formatCurrency(grandTotal)}
                </td>
              </tr>
            </tfoot>
          ) : null}
          </table>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
        {allowAddItems ? (
          <UBButton
            type="button"
            variant="outline"
            size="sm"
            onClick={addItem}
            disabled={disabled}
          >
            <Plus className="size-4" data-icon="inline-start" />
            Add item
          </UBButton>
        ) : (
          <span />
        )}

        {footerActions ? (
          <div className="flex flex-wrap items-center justify-end gap-2">
            {footerActions}
          </div>
        ) : null}
      </div>
    </div>
  )
}

export function mapLineItemsForApi(items: RequisitionLineItemDraft[]) {
  return items.map((item) => ({
    description: item.description.trim(),
    quantity: item.quantity,
    unit_cost: item.unit_cost,
    comments: item.comments.trim() || undefined,
  }))
}

export function isLineItemsValid(items: RequisitionLineItemDraft[]) {
  return (
    items.length > 0 &&
    items.every(
      (item) =>
        item.description.trim().length > 0 &&
        item.quantity > 0 &&
        item.unit_cost >= 0
    )
  )
}
