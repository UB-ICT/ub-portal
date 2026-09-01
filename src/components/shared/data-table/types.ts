import type * as React from "react"

export type SortDirection = "asc" | "desc"

export type DataTableSortState = {
  columnId: string
  direction: SortDirection
} | null

export type DataTableColumnDef<T> = {
  /** Stable id used for sorting and resizing. Falls back to String(accessor). */
  id?: string
  header: React.ReactNode
  accessor?: keyof T
  accessorFn?: (row: T) => unknown
  render?: (value: unknown, row: T, rowIndex: number) => React.ReactNode
  className?: string
  headerClassName?: string
  /** Included in the mobile card layout. Defaults to true for the first columns. */
  mobile?: boolean
  sortable?: boolean
  resizable?: boolean
  minWidth?: number
  initialWidth?: number
  sortValue?: (row: T) => string | number | boolean | null | undefined
  /** Keep cell content untruncated (for inputs, comboboxes, etc.). */
  disableTruncate?: boolean
}

export type UBDataTableProps<T extends Record<string, unknown>> = {
  columns: DataTableColumnDef<T>[]
  data: T[]
  rowKey?: keyof T
  onRowClick?: (row: T) => void
  /** Called when client-side sorting reorders rows (e.g. editable grids). */
  onSortedDataChange?: (rows: T[]) => void
  className?: string
  tableClassName?: string
  striped?: boolean
  responsive?: boolean
  sortable?: boolean
  resizable?: boolean
  emptyMessage?: string
  footer?: React.ReactNode
  getRowClassName?: (row: T, rowIndex: number) => string
  ariaLabel?: string
  density?: "comfortable" | "compact"
}
