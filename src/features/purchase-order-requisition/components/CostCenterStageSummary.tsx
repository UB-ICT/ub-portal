import React from "react"
import { useQuery } from "@tanstack/react-query"
import { fetchCostCenterStageSummary } from "@/lib/api/dashboard"
import { ApiError } from "@/lib/api/client"

export const CostCenterStageSummaryTable: React.FC = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["cost-center-stage-summary"],
    queryFn: fetchCostCenterStageSummary,
    retry: false,
  })

  if (isLoading) {
    return (
      <div className="animate-pulse rounded-2xl border bg-card p-6 text-sm text-muted-foreground">
        Loading cost center summary...
      </div>
    )
  }

  // This view is restricted to Purchase Officers/Super Admins; the dashboard
  // page already hides it for other roles, but if that role signal is ever
  // wrong, silently render nothing rather than showing a scary error box.
  if (error instanceof ApiError && error.status === 403) {
    return null
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-6 text-sm text-destructive">
        Error loading cost center summary: {(error as Error).message}
      </div>
    )
  }

  const stages = data?.stages ?? []
  const rows = data?.data ?? []
  const totals = data?.totals

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

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left text-sm text-muted-foreground">
          <thead>
            <tr className="border-b border-border text-xs font-semibold tracking-wider text-muted-foreground/70 uppercase">
              <th className="pt-2 pb-3">Cost Center</th>
              {stages.map((stage) => (
                <th key={stage.id} className="pt-2 pb-3 text-right">
                  {stage.name}
                </th>
              ))}
              <th className="pt-2 pb-3 text-right">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.length > 0 ? (
              rows.map((row) => (
                <tr
                  key={row.cost_center_id}
                  className="transition-colors hover:bg-muted/30"
                >
                  <td className="py-4 font-semibold text-foreground/90">
                    {row.cost_center_name}
                  </td>
                  {stages.map((stage) => (
                    <td key={stage.id} className="py-4 text-right">
                      {row.stages[stage.id] ?? 0}
                    </td>
                  ))}
                  <td className="py-4 text-right font-bold text-foreground">
                    {row.total}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={stages.length + 2}
                  className="py-8 text-center text-muted-foreground"
                >
                  No requisitions found for your cost centers.
                </td>
              </tr>
            )}
          </tbody>
          {rows.length > 0 && totals && (
            <tfoot>
              <tr className="border-t border-border font-semibold text-foreground">
                <td className="pt-3">All Cost Centers</td>
                {stages.map((stage) => (
                  <td key={stage.id} className="pt-3 text-right">
                    {totals.by_stage[stage.id] ?? 0}
                  </td>
                ))}
                <td className="pt-3 text-right">{totals.grand_total}</td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  )
}
