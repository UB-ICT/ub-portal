import type { Meta, StoryObj } from "@storybook/react-vite"

import { componentParameters, withPanel } from "@/components/shared/storybook"

import { CostCenterStageSummaryView } from "./CostCenterStageSummary"

const stages = [
  { id: 1, name: "Draft" },
  { id: 2, name: "Director's Approval" },
  { id: 3, name: "Budget Officer" },
  { id: 4, name: "VP Approval" },
  { id: 5, name: "Finance Approval" },
  { id: 6, name: "Purchase Officer Approval" },
]

const rows = [
  {
    cost_center_id: 1,
    cost_center_name: "Information and Communication Technology",
    total: 4,
    stages: { 1: 1, 2: 0, 3: 1, 4: 0, 5: 0, 6: 2 },
  },
  {
    cost_center_id: 2,
    cost_center_name: "Registrar's Office",
    total: 2,
    stages: { 1: 0, 2: 1, 3: 0, 4: 0, 5: 0, 6: 1 },
  },
  {
    cost_center_id: 3,
    cost_center_name: "Facilities & Maintenance",
    total: 1,
    stages: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 1 },
  },
]

const totals = {
  by_stage: { 1: 1, 2: 1, 3: 1, 4: 0, 5: 0, 6: 4 },
  grand_total: 7,
}

const meta = {
  title: "Purchase Order Requisition/CostCenterStageSummary",
  component: CostCenterStageSummaryView,
  tags: ["autodocs"],
  args: {
    stages,
    rows,
    totals,
    isLoading: false,
    error: null,
  },
  parameters: componentParameters(
    "Matrix table summarizing open requisitions by cost center and approval stage, with an 'All Cost Centers' totals row."
  ),
  decorators: [withPanel("max-w-4xl space-y-4 p-6")],
} satisfies Meta<typeof CostCenterStageSummaryView>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const SingleCostCenter: Story = {
  args: {
    rows: [rows[0]],
    totals: { by_stage: rows[0].stages, grand_total: rows[0].total },
  },
}

export const SingleRecord: Story = {
  args: {
    rows: [
      {
        cost_center_id: 1,
        cost_center_name: "Information and Communication Technology",
        total: 1,
        stages: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 1 },
      },
    ],
    totals: {
      by_stage: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 1 },
      grand_total: 1,
    },
  },
}

export const Loading: Story = {
  args: {
    rows: [],
    totals: undefined,
    isLoading: true,
  },
}

export const Empty: Story = {
  args: {
    rows: [],
    totals: undefined,
    isLoading: false,
  },
}

export const Error: Story = {
  args: {
    rows: [],
    totals: undefined,
    error: "Unable to reach the reporting service.",
  },
}
