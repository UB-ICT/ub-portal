import { UBTable } from "@/components/shared/UBTable"
import type { BudgetRecord } from "@/lib/api/budgets"

import { formatBudgetAmount } from "../lib/budget-utils"

type BudgetsTableProps = {
  budgets: BudgetRecord[]
  isLoading?: boolean
  onView: (budget: BudgetRecord) => void
}

function budgetTotal(budget: BudgetRecord) {
  return (budget.line_items ?? []).reduce(
    (sum, item) => sum + Number(item.amount || 0),
    0
  )
}

export function BudgetsTable({
  budgets,
  isLoading = false,
  onView,
}: BudgetsTableProps) {
  if (isLoading && budgets.length === 0) {
    return (
      <p className="px-1 text-sm text-muted-foreground">Loading budgets...</p>
    )
  }

  if (!isLoading && budgets.length === 0) {
    return (
      <p className="px-1 text-sm text-muted-foreground">No budgets found.</p>
    )
  }

  return (
    <UBTable
      rowKey="id"
      data={budgets}
      striped
      onRowClick={onView}
      columns={[
        {
          header: "Cost center",
          accessor: "cost_center_id",
          mobile: true,
          render: (_, budget) => budget.cost_center?.name ?? "—",
        },
        {
          header: "Year",
          accessor: "budget_year_id",
          mobile: true,
          render: (_, budget) => budget.budget_year?.label ?? "—",
        },
        {
          header: "Status",
          accessor: "status_id",
          render: (_, budget) => budget.status?.name ?? "—",
        },
        {
          header: "Stage",
          accessor: "stage_id",
          render: (_, budget) => budget.stage?.name ?? "—",
        },
        {
          header: "Total",
          accessor: "id",
          render: (_, budget) => formatBudgetAmount(budgetTotal(budget)),
        },
      ]}
    />
  )
}
