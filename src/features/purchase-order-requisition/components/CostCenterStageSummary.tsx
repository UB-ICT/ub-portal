import React from "react"
import { useQuery } from "@tanstack/react-query"
import {
  fetchCostCenterStageSummary,
  type CostCenterStageSummaryRow,
  type StageSummary,
} from "@/lib/api/dashboard"
import { ApiError } from "@/lib/api/client"
import { UBTable, type ColumnDef } from "@/components/shared/UBTable"
import { cn } from "@/lib/utils"

export type CostCenterStageSummaryViewProps = {
  stages?: StageSummary[]
  rows?: CostCenterStageSummaryRow[]
  totals?: { by_stage: Record<number, number>; grand_total: number }
  isLoading?: boolean
  error?: string | null
}

// Synthetic row appended to the table data to render the "All Cost Centers"
// totals as a bolded last row, since UBTable has no separate footer slot.
type TableRow = CostCenterStageSummaryRow & { isTotal?: boolean }

const TOTALS_ROW_ID = -1

// Presentational table, reused by the self-fetching CostCenterStageSummaryTable
// below as well as by role-specific dashboards (e.g. RequesterDashboard) that
// already have this data as props.
export const CostCenterStageSummaryView: React.FC<
  CostCenterStageSummaryViewProps
> = ({ stages = [], rows = [], totals, isLoading = false, error = null }) => {
  if (isLoading) {
    return (
      <div className="animate-pulse rounded-2xl border bg-card p-6 text-sm text-muted-foreground">
        Loading cost center summary...
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-6 text-sm text-destructive">
        Error loading cost center summary: {error}
      </div>
    )
  }

  const tableRows: TableRow[] =
    rows.length > 0 && totals
      ? [
          ...rows,
          {
            cost_center_id: TOTALS_ROW_ID,
            cost_center_name: "All Cost Centers",
            stages: totals.by_stage,
            total: totals.grand_total,
            isTotal: true,
          },
        ]
      : rows

  const columns: ColumnDef<TableRow>[] = [
    {
      header: "Cost Center",
      accessor: "cost_center_name",
      mobile: true,
      render: (value, row) => (
        <span className={cn(row.isTotal && "font-bold text-foreground")}>
          {String(value)}
        </span>
      ),
    },
    ...stages.map(
      (stage): ColumnDef<TableRow> => ({
        header: stage.name,
        accessor: "stages",
        className: "text-right",
        mobile: false,
        render: (_value, row) => (
          <span className={cn(row.isTotal && "font-bold text-foreground")}>
            {row.stages[stage.id] ?? 0}
          </span>
        ),
      })
    ),
    {
      header: "Total",
      accessor: "total",
      className: "text-right",
      mobile: true,
      render: (value, row) => (
        <span
          className={cn(
            "font-bold",
            row.isTotal ? "text-foreground" : "text-foreground/90"
          )}
        >
          {String(value)}
        </span>
      ),
    },
  ]

  return (
    <div className="rounded-2xl border bg-card p-6 shadow-sm">
      <div className="flex items-center justify-between pb-4">
        <div>
          <h2 className="text-lg font-semibold text-foreground">
            Summary by Cost Center &amp; Stage
          </h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {totals ? `Total records: ${totals.grand_total}` : null}
          </p>
        </div>
      </div>

      {rows.length > 0 ? (
        <UBTable<TableRow>
          columns={columns}
          data={tableRows}
          rowKey="cost_center_id"
          striped={false}
        />
      ) : (
        <p className="py-8 text-center text-sm text-muted-foreground">
          No requisitions found for your cost centers.
        </p>
      )}
    </div>
  )
}

export const CostCenterStageSummaryTable: React.FC = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["cost-center-stage-summary"],
    queryFn: fetchCostCenterStageSummary,
    retry: false,
  })

  // This view is restricted to Purchase Officers/Super Admins; the dashboard
  // page already hides it for other roles, but if that role signal is ever
  // wrong, silently render nothing rather than showing a scary error box.
  if (error instanceof ApiError && error.status === 403) {
    return null
  }

  return (
    <CostCenterStageSummaryView
      stages={data?.stages}
      rows={data?.data}
      totals={data?.totals}
      isLoading={isLoading}
      error={error ? (error as Error).message : null}
    />
  )
}
