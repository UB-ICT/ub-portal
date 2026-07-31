import type { Meta, StoryObj } from "@storybook/react-vite"

import {
  componentParameters,
  withPanel,
} from "@/components/shared/storybook"
import type { BudgetRecord } from "@/lib/api/budgets"

import { BudgetsTable } from "./BudgetsTable"

const mockBudgets: BudgetRecord[] = [
  {
    id: 1,
    cost_center_id: 1,
    budget_year_id: 1,
    status_id: 1,
    stage_id: 1,
    can_edit: true,
    cost_center: { id: 1, name: "ICT" },
    budget_year: { id: 1, label: "2026-2027", submissions_open: true },
    status: { id: 1, name: "Draft" },
    stage: { id: 1, name: "Cost Center Draft" },
    line_items: [{ chart_of_account_id: 1, amount: 13500 }],
  },
  {
    id: 2,
    cost_center_id: 2,
    budget_year_id: 1,
    status_id: 2,
    stage_id: 2,
    can_edit: false,
    cost_center: { id: 2, name: "Library" },
    budget_year: { id: 1, label: "2026-2027", submissions_open: true },
    status: { id: 2, name: "Pending" },
    stage: { id: 2, name: "Budget Officer Review" },
    line_items: [{ chart_of_account_id: 1, amount: 22000 }],
  },
]

const meta = {
  title: "Purchase Order Requisition/BudgetsTable",
  component: BudgetsTable,
  tags: ["autodocs"],
  args: {
    budgets: mockBudgets,
    isLoading: false,
    onView: () => undefined,
  },
  parameters: componentParameters(
    "List of cost center budgets. Click a row to view the budget."
  ),
  decorators: [withPanel("max-w-5xl space-y-4 p-6")],
} satisfies Meta<typeof BudgetsTable>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Empty: Story = {
  args: {
    budgets: [],
  },
}
