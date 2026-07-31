import type { Meta, StoryObj } from "@storybook/react-vite"

import {
  componentParameters,
  withPanel,
} from "@/components/shared/storybook"
import type { BudgetComparison } from "@/lib/api/budgets"

import {
  BudgetComparisonTable,
  mapComparisonToDraftRows,
} from "./BudgetComparisonTable"

const mockComparison: BudgetComparison = {
  budget: {
    id: 2,
    cost_center_id: 1,
    budget_year_id: 2,
    status_id: 1,
    stage_id: 1,
    budget_year: { id: 2, label: "2026-2027", submissions_open: true },
  },
  previous_budget: {
    id: 1,
    cost_center_id: 1,
    budget_year_id: 1,
    status_id: 3,
    stage_id: 4,
    budget_year: { id: 1, label: "2025-2026", submissions_open: false },
  },
  years: {
    previous: "2025-2026",
    current: "2026-2027",
  },
  rows: [
    {
      chart_of_account_id: 1,
      account_no: "70301",
      description: "Office Supplies",
      previous: { amount: 12000, notes: "Includes toner" },
      current: { amount: 13500, notes: "Inflation adjustment" },
    },
    {
      chart_of_account_id: 2,
      account_no: "70314",
      description: "Computer Supplies",
      previous: { amount: 8000, notes: null },
      current: { amount: null, notes: null },
    },
  ],
}

const meta = {
  title: "Purchase Order Requisition/BudgetComparisonTable",
  component: BudgetComparisonTable,
  tags: ["autodocs"],
  args: {
    comparison: mockComparison,
    rows: mapComparisonToDraftRows(mockComparison),
    editable: false,
  },
  parameters: componentParameters(
    "Year-over-year budget comparison with line items as rows and years as columns."
  ),
  decorators: [withPanel("max-w-5xl space-y-4 p-6")],
} satisfies Meta<typeof BudgetComparisonTable>

export default meta

type Story = StoryObj<typeof meta>

export const ReadOnly: Story = {}

export const Editable: Story = {
  args: {
    editable: true,
  },
}
