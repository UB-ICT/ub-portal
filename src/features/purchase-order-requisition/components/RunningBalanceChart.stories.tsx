import type { Meta, StoryObj } from "@storybook/react-vite"

import {
  componentParameters,
  withPanel,
} from "@/components/shared/storybook"

import {
  RunningBalanceChart,
  type BalanceOverTimePoint,
} from "./RunningBalanceChart"

const dates = [
  "2026-07-01",
  "2026-07-08",
  "2026-07-15",
  "2026-07-22",
  "2026-07-29",
  "2026-08-05",
]

const singleCostCenterData: BalanceOverTimePoint[] = [
  1200, 3400, 5100, 6800, 8900, 9600,
].map((spentCumulative, index) => ({
  date: dates[index],
  cost_center_id: 10,
  cost_center_name: "Faculty of Science",
  spent_cumulative: spentCumulative,
  allocated: 15000,
  balance: 15000 - spentCumulative,
}))

const multiCostCenterData: BalanceOverTimePoint[] = dates.flatMap(
  (date, index) => [
    {
      date,
      cost_center_id: 10,
      cost_center_name: "Faculty of Science",
      spent_cumulative: [1200, 3400, 5100, 6800, 8900, 9600][index],
      allocated: 15000,
      balance: 15000 - [1200, 3400, 5100, 6800, 8900, 9600][index],
    },
    {
      date,
      cost_center_id: 11,
      cost_center_name: "Faculty of Science - Library",
      spent_cumulative: [400, 900, 2100, 2600, 3000, 3500][index],
      allocated: 4000,
      balance: 4000 - [400, 900, 2100, 2600, 3000, 3500][index],
    },
    {
      date,
      cost_center_id: 12,
      cost_center_name: "Faculty of Science - Field Station",
      spent_cumulative: [800, 2200, 4600, 6400, 7200, 8100][index],
      allocated: 7500,
      balance: 7500 - [800, 2200, 4600, 6400, 7200, 8100][index],
    },
  ]
)

const meta = {
  title: "Purchase Order Requisition/RunningBalanceChart",
  component: RunningBalanceChart,
  tags: ["autodocs"],
  args: {
    data: singleCostCenterData,
    isLoading: false,
    error: null,
  },
  parameters: componentParameters(
    "Cumulative spend vs. allocated budget over time. Renders a single spend-vs-ceiling line for one cost center, or a per-cost-center remaining-balance comparison when the requester has more than one."
  ),
  decorators: [withPanel("max-w-3xl space-y-4 p-6")],
} satisfies Meta<typeof RunningBalanceChart>

export default meta

type Story = StoryObj<typeof meta>

export const SingleCostCenter: Story = {}

export const MultipleCostCenters: Story = {
  args: {
    data: multiCostCenterData,
  },
}

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
