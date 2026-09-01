import { useCallback, useEffect, useMemo, useRef, useState } from "react"

import type {
  DataTableColumnDef,
  DataTableSortState,
  SortDirection,
} from "./types"

const DEFAULT_MIN_WIDTH = 72
const DEFAULT_INITIAL_WIDTH = 160

type ColumnMeta<T> = {
  id: string
  sortable: boolean
  resizable: boolean
  minWidth: number
  initialWidth: number
  getSortValue: (row: T) => string | number | boolean | null | undefined
}

function compareValues(
  left: string | number | boolean | null | undefined,
  right: string | number | boolean | null | undefined
) {
  if (left == null && right == null) {
    return 0
  }

  if (left == null) {
    return 1
  }

  if (right == null) {
    return -1
  }

  if (typeof left === "number" && typeof right === "number") {
    return left - right
  }

  if (typeof left === "boolean" && typeof right === "boolean") {
    return Number(left) - Number(right)
  }

  return String(left).localeCompare(String(right), undefined, {
    numeric: true,
    sensitivity: "base",
  })
}

export function resolveColumnId<T>(
  column: DataTableColumnDef<T>,
  index: number
) {
  if (column.id) {
    return column.id
  }

  if (column.accessor) {
    return String(column.accessor)
  }

  return `column-${index}`
}

function buildColumnMeta<T>(
  columns: DataTableColumnDef<T>[],
  sortable: boolean,
  resizable: boolean
): ColumnMeta<T>[] {
  return columns.map((column, index) => {
    const id = resolveColumnId(column, index)

    return {
      id,
      sortable: sortable && column.sortable !== false,
      resizable: resizable && column.resizable !== false,
      minWidth: column.minWidth ?? DEFAULT_MIN_WIDTH,
      initialWidth: column.initialWidth ?? DEFAULT_INITIAL_WIDTH,
      getSortValue: (row: T) => {
        if (column.sortValue) {
          return column.sortValue(row)
        }

        if (column.accessorFn) {
          return column.accessorFn(row) as
            | string
            | number
            | boolean
            | null
            | undefined
        }

        if (column.accessor) {
          return row[column.accessor] as
            | string
            | number
            | boolean
            | null
            | undefined
        }

        return null
      },
    }
  })
}

export function useColumnLayout<T extends Record<string, unknown>>({
  columns,
  data,
  sortable = true,
  resizable = true,
  onSortedDataChange,
}: {
  columns: DataTableColumnDef<T>[]
  data: T[]
  sortable?: boolean
  resizable?: boolean
  onSortedDataChange?: (rows: T[]) => void
}) {
  const columnMeta = useMemo(
    () => buildColumnMeta(columns, sortable, resizable),
    [columns, sortable, resizable]
  )

  const [sortState, setSortState] = useState<DataTableSortState>(null)
  const [columnWidths, setColumnWidths] = useState<Record<string, number>>(
    () =>
      Object.fromEntries(
        columnMeta.map((column) => [column.id, column.initialWidth])
      )
  )

  const resizingRef = useRef<{
    columnId: string
    startX: number
    startWidth: number
    minWidth: number
  } | null>(null)

  useEffect(() => {
    setColumnWidths((current) => {
      const next = { ...current }
      let changed = false

      for (const column of columnMeta) {
        if (next[column.id] == null) {
          next[column.id] = column.initialWidth
          changed = true
        }
      }

      return changed ? next : current
    })
  }, [columnMeta])

  const sortRows = useCallback(
    (rows: T[], state: DataTableSortState) => {
      if (!state) {
        return rows
      }

      const activeColumn = columnMeta.find(
        (column) => column.id === state.columnId
      )

      if (!activeColumn) {
        return rows
      }

      const direction = state.direction === "asc" ? 1 : -1

      return [...rows].sort((left, right) => {
        const comparison = compareValues(
          activeColumn.getSortValue(left),
          activeColumn.getSortValue(right)
        )

        return comparison * direction
      })
    },
    [columnMeta]
  )

  const sortedData = useMemo(
    () => sortRows(data, sortState),
    [data, sortRows, sortState]
  )

  const toggleSort = useCallback(
    (columnId: string) => {
      const nextState: DataTableSortState = (() => {
        if (!sortState || sortState.columnId !== columnId) {
          return { columnId, direction: "asc" }
        }

        if (sortState.direction === "asc") {
          return { columnId, direction: "desc" }
        }

        return null
      })()

      setSortState(nextState)

      if (onSortedDataChange && nextState) {
        onSortedDataChange(sortRows(data, nextState))
      }
    },
    [data, onSortedDataChange, sortRows, sortState]
  )

  const startResize = useCallback(
    (columnId: string, clientX: number) => {
      const column = columnMeta.find((entry) => entry.id === columnId)

      if (!column) {
        return
      }

      resizingRef.current = {
        columnId,
        startX: clientX,
        startWidth: columnWidths[columnId] ?? column.initialWidth,
        minWidth: column.minWidth,
      }
    },
    [columnMeta, columnWidths]
  )

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      const resizing = resizingRef.current

      if (!resizing) {
        return
      }

      const nextWidth = Math.max(
        resizing.minWidth,
        resizing.startWidth + (event.clientX - resizing.startX)
      )

      setColumnWidths((current) => ({
        ...current,
        [resizing.columnId]: nextWidth,
      }))
    }

    const handleMouseUp = () => {
      resizingRef.current = null
    }

    window.addEventListener("mousemove", handleMouseMove)
    window.addEventListener("mouseup", handleMouseUp)

    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("mouseup", handleMouseUp)
    }
  }, [])

  return {
    columnMeta,
    columnWidths,
    sortState,
    sortedData,
    toggleSort,
    startResize,
  }
}

export type { SortDirection }
