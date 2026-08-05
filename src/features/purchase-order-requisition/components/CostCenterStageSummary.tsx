import React from "react"
import { useQuery } from "@tanstack/react-query"
import { fetchCostCenterStageSummary } from "@/lib/api/dashboard"
import { ApiError } from "@/lib/api/client"
import { UBButton } from "@/components/shared/UBButton"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface CostCenterStageSummaryTableProps {
  // "card" (default) wraps the table in its own bordered card with a title.
  // "bare" omits that wrapper/title so the table can sit inside another
  // container (e.g. a dialog) that already provides its own heading.
  variant?: "card" | "bare"
}

export const CostCenterStageSummaryTable: React.FC<
  CostCenterStageSummaryTableProps
> = ({ variant = "card" }) => {
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

  const table = (
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
  )

  if (variant === "bare") {
    return table
  }

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

      {table}
    </div>
  )
}

// Dashboard teaser: shows the grand total and a "View All" button that
// opens the full cross-tab table in a dialog, keeping the dashboard compact
// for the Purchase Officer/Super Admin roles that see this section.
export const CostCenterStageSummaryCard: React.FC = () => {
  const [open, setOpen] = React.useState(false)
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

  const totals = data?.totals
  const costCenterCount = data?.data?.length ?? 0
  const isScoped = data?.scope === "assigned"

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <div className="flex items-center justify-between gap-4 rounded-2xl border bg-card p-6 shadow-sm">
        <div>
          <h2 className="text-lg font-semibold text-foreground">
            Summary by Cost Center &amp; Stage
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {totals
              ? `${totals.grand_total} requisitions across ${costCenterCount} cost center${costCenterCount === 1 ? "" : "s"}`
              : "No requisitions found for your cost centers."}
            {isScoped ? " (your assigned cost centers)" : null}
          </p>
        </div>
        <DialogTrigger asChild>
          <UBButton variant="outline">View All</UBButton>
        </DialogTrigger>
      </div>
      <DialogContent className="max-h-[85vh] w-[95vw] max-w-5xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Summary by Cost Center &amp; Stage
            {isScoped ? " — Your Cost Centers" : null}
          </DialogTitle>
        </DialogHeader>
        <CostCenterStageSummaryTable variant="bare" />
      </DialogContent>
    </Dialog>
  )
}
