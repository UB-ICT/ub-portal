import type { Meta, StoryObj } from "@storybook/react-vite"

import {
  componentParameters,
  withPanel,
} from "@/components/shared/storybook"

import {
  MonthlySpendReportChart,
  type MonthlySpendPoint,
} from "./MonthlySpendReportChart"

const mockData: MonthlySpendPoint[] = [
  { month: "2026-02", spent: 2400 },
  { month: "2026-03", spent: 4100 },
  { month: "2026-04", spent: 3200 },
  { month: "2026-05", spent: 5600 },
  { month: "2026-06", spent: 4800 },
  { month: "2026-07", spent: 6100 },
]

const meta = {
  title: "Purchase Order Requisition/MonthlySpendReportChart",
  component: MonthlySpendReportChart,
  tags: ["autodocs"],
  args: {
    data: mockData,
    isLoading: false,
    error: null,
  },
  parameters: componentParameters(
    "Total requisition spend per month, as a single-series bar chart."
  ),
  decorators: [withPanel("max-w-3xl space-y-4 p-6")],
} satisfies Meta<typeof MonthlySpendReportChart>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Loading: Story = {
  args: {
    data: [],
    isLoading: true,
  },
}

export const Empty: Story = {
  args: {
    data: [],
  },
}

export const WithError: Story = {
  args: {
    data: [],
    error: "Network request failed.",
  },
}
