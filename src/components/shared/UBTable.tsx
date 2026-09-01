import type * as React from "react"

import {
  UBDataTable,
  type DataTableColumnDef,
} from "@/components/shared/data-table"

export type ColumnDef<T> = {
  header: string
  accessor: keyof T
  render?: (value: T[keyof T], row: T) => React.ReactNode
  className?: string
  mobile?: boolean
  sortable?: boolean
  resizable?: boolean
  minWidth?: number
  initialWidth?: number
  sortValue?: (row: T) => string | number | boolean | null | undefined
}

export type UBTableProps<T> = {
  columns: ColumnDef<T>[]
  data: T[]
  rowKey?: keyof T
  onRowClick?: (row: T) => void
  className?: string
  striped?: boolean
  responsive?: boolean
  sortable?: boolean
  resizable?: boolean
  emptyMessage?: string
}

function mapColumns<T extends Record<string, unknown>>(
  columns: ColumnDef<T>[]
): DataTableColumnDef<T>[] {
  return columns.map((column) => ({
    id: String(column.accessor),
    header: column.header,
    accessor: column.accessor,
    className: column.className,
    mobile: column.mobile,
    sortable: column.sortable,
    resizable: column.resizable,
    minWidth: column.minWidth,
    initialWidth: column.initialWidth,
    sortValue: column.sortValue,
    render: column.render
      ? (value, row) => column.render!(value as T[keyof T], row)
      : undefined,
  }))
}

export function UBTable<T extends Record<string, unknown>>({
  columns,
  data,
  rowKey,
  onRowClick,
  className,
  striped = true,
  responsive = true,
  sortable = true,
  resizable = true,
  emptyMessage,
}: UBTableProps<T>) {
  return (
    <UBDataTable
      columns={mapColumns(columns)}
      data={data}
      rowKey={rowKey}
      onRowClick={onRowClick}
      className={className}
      striped={striped}
      responsive={responsive}
      sortable={sortable}
      resizable={resizable}
      emptyMessage={emptyMessage}
    />
  )
}
