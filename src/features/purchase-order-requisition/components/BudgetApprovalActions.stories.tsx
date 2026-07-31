import type { Meta, StoryObj } from "@storybook/react-vite"
import { useState } from "react"

import {
  componentParameters,
  withPanel,
} from "@/components/shared/storybook"
import { useBudgetsStore } from "@/store/budgets-store"

import { BudgetApprovalActions } from "./BudgetApprovalActions"

const meta = {
  title: "Purchase Order Requisition/BudgetApprovalActions",
  component: BudgetApprovalActions,
  tags: ["autodocs"],
  args: {
    budgetId: 1,
    stageName: "Budget Officer Review",
    canAct: true,
    userStageAction: null,
  },
  parameters: componentParameters(
    "Approve, reject, or send a budget back to the cost center for review."
  ),
  decorators: [withPanel("max-w-xl space-y-4 p-6")],
  beforeEach: () => {
    useBudgetsStore.setState({
      isReviewing: false,
      error: null,
      approveBudget: async () => ({
        id: 1,
        cost_center_id: 1,
        budget_year_id: 1,
        status_id: 2,
        stage_id: 3,
      }),
      rejectBudget: async () => ({
        id: 1,
        cost_center_id: 1,
        budget_year_id: 1,
        status_id: 4,
        stage_id: 2,
      }),
      requestBudgetReview: async () => ({
        id: 1,
        cost_center_id: 1,
        budget_year_id: 1,
        status_id: 6,
        stage_id: 1,
      }),
    })
  },
} satisfies Meta<typeof BudgetApprovalActions>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => {
    const [key, setKey] = useState(0)

    return (
      <BudgetApprovalActions
        key={key}
        {...args}
        onDecision={() => setKey((value) => value + 1)}
      />
    )
  },
}

export const AlreadyActed: Story = {
  args: {
    canAct: false,
    userStageAction: "approved",
  },
}
