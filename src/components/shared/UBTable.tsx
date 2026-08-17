import type * as React from "react"

import { cn } from "@/lib/utils"

export type ColumnDef<T> = {
  header: React.ReactNode
  accessor: keyof T
  render?: (value: T[keyof T], row: T) => React.ReactNode
  className?: string
  mobile?: boolean
}

export type UBTableProps<T> = {
  columns: ColumnDef<T>[]
  data: T[]
  rowKey?: keyof T
  onRowClick?: (row: T) => void
  className?: string
  striped?: boolean
  responsive?: boolean
}

export function UBTable<T extends Record<string, any>>({
  columns,
  data,
  rowKey,
  onRowClick,
  className,
  striped = true,
  responsive = true,
}: UBTableProps<T>) {
  // Columns visible on mobile (mobile: true or defaults to first 2-3 important columns)
  const mobileColumns = columns.filter((col) => col.mobile !== false)

  return (
    <>
      {/* Mobile Card View (visible on sm and below) */}
      {responsive && (
        <div className={cn("md:hidden space-y-4", className)}>
          {data.length === 0 ? (
            <div className="rounded-lg border bg-card p-6 text-center text-muted-foreground">
              No data available
            </div>
          ) : (
            data.map((row, rowIndex) => (
              <div
                key={
                  rowKey && row[rowKey]
                    ? String(row[rowKey])
                    : `mobile-row-${rowIndex}`
                }
                onClick={() => onRowClick?.(row)}
                className={cn(
                  "rounded-lg border bg-card p-4 space-y-3 transition-colors",
                  onRowClick && "cursor-pointer hover:bg-muted/40"
                )}
              >
                {mobileColumns.map((column, colIndex) => (
                  <div key={colIndex} className="space-y-1">
                    <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
                      {column.header}
                    </p>
                    <p
                      className={cn(
                        "text-sm font-medium text-foreground",
                        column.className
                      )}
                    >
                      {column.render
                        ? column.render(row[column.accessor], row)
                        : String(row[column.accessor] ?? "")}
                    </p>
                  </div>
                ))}
              </div>
            ))
          )}
        </div>
      )}

      {/* Desktop Table View (visible on md and above) */}
      <div
        className={cn(
          "hidden md:block overflow-x-auto rounded-lg border bg-card",
          className,
          responsive && "md:block"
        )}
      >
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              {columns.map((column, index) => (
                <th
                  key={index}
                  className="px-6 py-3 text-left font-medium text-foreground"
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-6 py-8 text-center text-muted-foreground"
                >
                  No data available
                </td>
              </tr>
            ) : (
              data.map((row, rowIndex) => (
                <tr
                  key={
                    rowKey && row[rowKey]
                      ? String(row[rowKey])
                      : `row-${rowIndex}`
                  }
                  onClick={() => onRowClick?.(row)}
                  className={cn(
                    "border-b transition-colors",
                    striped && rowIndex % 2 === 0 && "bg-muted/20",
                    onRowClick && "cursor-pointer hover:bg-muted/40"
                  )}
                >
                  {columns.map((column, colIndex) => (
                    <td
                      key={colIndex}
                      className={cn(
                        "px-6 py-3 text-foreground",
                        column.className
                      )}
                    >
                      {column.render
                        ? column.render(row[column.accessor], row)
                        : String(row[column.accessor] ?? "")}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  )
}
