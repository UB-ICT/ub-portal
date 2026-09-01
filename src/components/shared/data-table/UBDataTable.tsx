import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react"

import { cn } from "@/lib/utils"

import { resolveColumnId, useColumnLayout } from "./useColumnLayout"
import type { DataTableColumnDef, UBDataTableProps } from "./types"

function getCellValue<T extends Record<string, unknown>>(
  column: DataTableColumnDef<T>,
  row: T
) {
  if (column.accessorFn) {
    return column.accessorFn(row)
  }

  if (column.accessor) {
    return row[column.accessor]
  }

  return null
}

function SortIndicator({
  active,
  direction,
}: {
  active: boolean
  direction: "asc" | "desc" | null
}) {
  if (!active || !direction) {
    return <ArrowUpDown className="size-3.5 opacity-40" aria-hidden />
  }

  if (direction === "asc") {
    return <ArrowUp className="size-3.5" aria-hidden />
  }

  return <ArrowDown className="size-3.5" aria-hidden />
}

export function UBDataTable<T extends Record<string, unknown>>({
  columns,
  data,
  rowKey,
  onRowClick,
  onSortedDataChange,
  className,
  tableClassName,
  striped = true,
  responsive = true,
  sortable = true,
  resizable = true,
  emptyMessage = "No data available",
  footer,
  getRowClassName,
  ariaLabel,
  density = "comfortable",
}: UBDataTableProps<T>) {
  const {
    columnMeta,
    columnWidths,
    sortState,
    sortedData,
    toggleSort,
    startResize,
  } = useColumnLayout({
    columns,
    data,
    sortable,
    resizable,
    onSortedDataChange,
  })

  const isCompact = density === "compact"
  const headerCellClassName = isCompact
    ? "relative px-2 py-2 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground"
    : "relative px-4 py-3 text-left font-medium text-foreground"
  const bodyCellClassName = isCompact
    ? "overflow-hidden px-2 py-2 align-top text-foreground"
    : "overflow-hidden px-4 py-3 text-foreground"

  const mobileColumns = columns.filter((column, index) => {
    if (column.mobile === false) {
      return false
    }

    if (column.mobile === true) {
      return true
    }

    return index < 3
  })

  const renderDesktopTable = () => (
    <div
      className={cn(
        "overflow-x-auto rounded-lg border bg-card",
        responsive ? "hidden md:block" : "block",
        tableClassName
      )}
    >
      <table
        className="w-full table-fixed text-sm"
        aria-label={ariaLabel}
        style={{ minWidth: "100%" }}
      >
        <colgroup>
          {columns.map((column, index) => {
            const id = resolveColumnId(column, index)
            const meta = columnMeta.find((entry) => entry.id === id)

            return (
              <col
                key={id}
                style={{
                  width: columnWidths[id] ?? meta?.initialWidth ?? 160,
                }}
              />
            )
          })}
        </colgroup>
        <thead>
          <tr className={cn("border-b", isCompact ? "bg-muted/40" : "bg-muted/50")}>
            {columns.map((column, index) => {
              const id = resolveColumnId(column, index)
              const meta = columnMeta.find((entry) => entry.id === id)
              const isSorted = sortState?.columnId === id
              const canSort = Boolean(meta?.sortable)
              const canResize = Boolean(meta?.resizable)

              return (
                <th
                  key={id}
                  scope="col"
                  className={cn(headerCellClassName, column.headerClassName)}
                >
                  {canSort ? (
                    <button
                      type="button"
                      className="flex w-full items-center gap-1.5 text-left hover:text-primary"
                      onClick={() => toggleSort(id)}
                      aria-label={`Sort by ${typeof column.header === "string" ? column.header : id}`}
                    >
                      <span className="truncate">{column.header}</span>
                      <SortIndicator
                        active={isSorted}
                        direction={
                          isSorted ? (sortState?.direction ?? null) : null
                        }
                      />
                    </button>
                  ) : (
                    <span className="block truncate">{column.header}</span>
                  )}
                  {canResize ? (
                    <button
                      type="button"
                      aria-label={`Resize ${typeof column.header === "string" ? column.header : id} column`}
                      className="absolute inset-y-0 right-0 z-10 w-2 translate-x-1/2 cursor-col-resize touch-none border-0 bg-transparent p-0 after:absolute after:inset-y-0 after:left-1/2 after:w-px after:-translate-x-1/2 after:bg-border hover:after:bg-primary/60"
                      onMouseDown={(event) => {
                        event.preventDefault()
                        event.stopPropagation()
                        startResize(id, event.clientX)
                      }}
                    />
                  ) : null}
                </th>
              )
            })}
          </tr>
        </thead>
        <tbody>
          {sortedData.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="px-4 py-8 text-center text-muted-foreground"
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            sortedData.map((row, rowIndex) => (
              <tr
                key={
                  rowKey && row[rowKey] != null
                    ? String(row[rowKey])
                    : `row-${rowIndex}`
                }
                onClick={() => onRowClick?.(row)}
                className={cn(
                  "border-b transition-colors",
                  striped && rowIndex % 2 === 0 && "bg-muted/20",
                  onRowClick && "cursor-pointer hover:bg-muted/40",
                  getRowClassName?.(row, rowIndex)
                )}
              >
                {columns.map((column, colIndex) => {
                  const id = resolveColumnId(column, colIndex)
                  const value = getCellValue(column, row)

                  return (
                    <td
                      key={id}
                      className={cn(bodyCellClassName, column.className)}
                    >
                      {column.disableTruncate ? (
                        column.render
                          ? column.render(value, row, rowIndex)
                          : String(value ?? "")
                      ) : (
                        <div className="truncate">
                          {column.render
                            ? column.render(value, row, rowIndex)
                            : String(value ?? "")}
                        </div>
                      )}
                    </td>
                  )
                })}
              </tr>
            ))
          )}
        </tbody>
      </table>
      {footer}
    </div>
  )

  const renderMobileCards = () => {
    if (!responsive) {
      return null
    }

    return (
      <div className={cn("space-y-4 md:hidden", className)}>
        {sortedData.length === 0 ? (
          <div className="rounded-lg border bg-card p-6 text-center text-muted-foreground">
            {emptyMessage}
          </div>
        ) : (
          sortedData.map((row, rowIndex) => (
            <div
              key={
                rowKey && row[rowKey] != null
                  ? String(row[rowKey])
                  : `mobile-row-${rowIndex}`
              }
              onClick={() => onRowClick?.(row)}
              className={cn(
                "space-y-3 rounded-lg border bg-card p-4 transition-colors",
                onRowClick && "cursor-pointer hover:bg-muted/40",
                getRowClassName?.(row, rowIndex)
              )}
            >
              {mobileColumns.map((column, colIndex) => {
                const id = resolveColumnId(column, colIndex)
                const value = getCellValue(column, row)

                return (
                  <div key={id} className="space-y-1">
                    <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
                      {column.header}
                    </p>
                    <div
                      className={cn(
                        "text-sm font-medium text-foreground",
                        column.className
                      )}
                    >
                      {column.render
                        ? column.render(value, row, rowIndex)
                        : String(value ?? "")}
                    </div>
                  </div>
                )
              })}
            </div>
          ))
        )}
        {footer}
      </div>
    )
  }

  return (
    <div className={className}>
      {renderMobileCards()}
      {renderDesktopTable()}
    </div>
  )
}

export type { DataTableColumnDef, UBDataTableProps }
