import type { Meta, StoryObj } from "@storybook/react-vite"

import {
  componentParameters,
  withFullscreenCanvas,
} from "@/components/shared/storybook"
import type {
  CostCenterStageSummaryRow,
  RequisitionForm,
  StageSummary,
} from "@/lib/api/dashboard"

import type { MonthlySpendPoint } from "./MonthlySpendReportChart"
import {
  RequesterDashboard,
  type RequesterDashboardMetrics,
} from "./RequesterDashboard"
import type { BalanceOverTimePoint } from "./RunningBalanceChart"

const mockMetrics: RequesterDashboardMetrics = {
  draft: 3,
  pending: 5,
  approved: 12,
  rejected: 2,
}

const mockCostCenterStages: StageSummary[] = [
  { id: 1, name: "Director review" },
  { id: 2, name: "Budget review" },
  { id: 3, name: "Purchase Officer" },
]

const mockCostCenterRows: CostCenterStageSummaryRow[] = [
  {
    cost_center_id: 10,
    cost_center_name: "Faculty of Science",
    total: 8,
    stages: { 1: 2, 2: 1, 3: 5 },
  },
  {
    cost_center_id: 11,
    cost_center_name: "Faculty of Science - Library",
    total: 3,
    stages: { 1: 1, 2: 0, 3: 2 },
  },
]

const mockCostCenterTotals = {
  by_stage: { 1: 3, 2: 1, 3: 7 },
  grand_total: 11,
}

const balanceDates = [
  "2026-07-01",
  "2026-07-08",
  "2026-07-15",
  "2026-07-22",
  "2026-07-29",
  "2026-08-05",
]

const mockBalanceHistory: BalanceOverTimePoint[] = [
  1200, 3400, 5100, 6800, 8900, 9600,
].map((spentCumulative, index) => ({
  date: balanceDates[index],
  cost_center_id: 10,
  cost_center_name: "Faculty of Science",
  spent_cumulative: spentCumulative,
  allocated: 15000,
  balance: 15000 - spentCumulative,
}))

const mockMonthlySpend: MonthlySpendPoint[] = [
  { month: "2026-02", spent: 2400 },
  { month: "2026-03", spent: 4100 },
  { month: "2026-04", spent: 3200 },
  { month: "2026-05", spent: 5600 },
  { month: "2026-06", spent: 4800 },
  { month: "2026-07", spent: 6100 },
]

const mockForms: RequisitionForm[] = [
  {
    id: 1,
    number: "000000012",
    supplier_name: "Belize Office Box",
    date_prepared: "2026-07-28",
    total: 2340,
    status_name: "In Review",
    current_stage_name: "Director review",
    processing_time_hours: null,
    processing_time_display: null,
    approval_time_hours: null,
    approval_time_display: null,
  },
  {
    id: 2,
    number: "000000011",
    supplier_name: "Caribbean Tech Supplies",
    date_prepared: "2026-07-21",
    total: 985.5,
    status_name: "Approved",
    current_stage_name: "Purchase Officer",
    processing_time_hours: 26,
    processing_time_display: "1d 2h",
    approval_time_hours: 20,
    approval_time_display: "20h",
  },
  {
    id: 3,
    number: "000000010",
    supplier_name: "Belize Print & Copy",
    date_prepared: "2026-07-15",
    total: 410,
    status_name: "Rejected",
    current_stage_name: "Budget review",
    processing_time_hours: 8,
    processing_time_display: "8h",
    approval_time_hours: null,
    approval_time_display: null,
  },
  {
    id: 4,
    number: "000000009",
    supplier_name: "Northern Hardware Co.",
    date_prepared: "2026-07-10",
    total: 5600,
    status_name: "Approved",
    current_stage_name: "Finance review",
    processing_time_hours: 72,
    processing_time_display: "3d",
    approval_time_hours: 65,
    approval_time_display: "2d 17h",
  },
  {
    id: 5,
    number: "000000008",
    supplier_name: "Reef Office Solutions",
    date_prepared: "2026-07-02",
    total: 1275,
    status_name: "Approved",
    current_stage_name: "Vice President",
    processing_time_hours: 40,
    processing_time_display: "1d 16h",
    approval_time_hours: 30,
    approval_time_display: "1d 6h",
  },
  {
    id: 6,
    number: "000000007",
    supplier_name: "Cayo Farm Supplies",
    date_prepared: "2026-06-25",
    total: 320,
    status_name: "Approved",
    current_stage_name: "Purchase Officer",
    processing_time_hours: 12,
    processing_time_display: "12h",
    approval_time_hours: 10,
    approval_time_display: "10h",
  },
]

const meta = {
  title: "Purchase Order Requisition/RequesterDashboard",
  component: RequesterDashboard,
  tags: ["autodocs"],
  args: {
    metrics: mockMetrics,
    isMetricsLoading: false,
    metricsError: null,
    forms: mockForms,
    isFormsLoading: false,
    formsError: null,
    onViewAllForms: () => undefined,
    costCenterStages: mockCostCenterStages,
    costCenterRows: mockCostCenterRows,
    costCenterTotals: mockCostCenterTotals,
    isCostCenterSummaryLoading: false,
    costCenterSummaryError: null,
    balanceHistory: mockBalanceHistory,
    isBalanceHistoryLoading: false,
    balanceHistoryError: null,
    monthlySpend: mockMonthlySpend,
    isMonthlySpendLoading: false,
    monthlySpendError: null,
  },
  parameters: componentParameters(
    "Requester-specific dashboard: draft/in-review/approved/rejected counts plus a paginated table of the requester's recent forms.",
    "fullscreen"
  ),
  decorators: [withFullscreenCanvas("min-h-svh bg-muted/30 p-6")],
} satisfies Meta<typeof RequesterDashboard>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Loading: Story = {
  args: {
    metrics: undefined,
    isMetricsLoading: true,
    forms: [],
    isFormsLoading: true,
    costCenterStages: undefined,
    costCenterRows: undefined,
    isCostCenterSummaryLoading: true,
    balanceHistory: [],
    isBalanceHistoryLoading: true,
    monthlySpend: [],
    isMonthlySpendLoading: true,
  },
}

export const Empty: Story = {
  args: {
    metrics: { draft: 0, pending: 0, approved: 0, rejected: 0 },
    forms: [],
    costCenterStages: mockCostCenterStages,
    costCenterRows: [],
    costCenterTotals: { by_stage: {}, grand_total: 0 },
    balanceHistory: [],
    monthlySpend: [],
  },
}

export const NoAssignedCostCenters: Story = {
  args: {
    costCenterStages: [],
    costCenterRows: [],
    costCenterTotals: { by_stage: {}, grand_total: 0 },
    balanceHistory: [],
    monthlySpend: [],
  },
}

export const WithErrors: Story = {
  args: {
    metrics: undefined,
    metricsError: "Network request failed.",
    forms: [],
    formsError: "Network request failed.",
    costCenterStages: undefined,
    costCenterRows: undefined,
    costCenterSummaryError: "Network request failed.",
    balanceHistory: [],
    balanceHistoryError: "Network request failed.",
    monthlySpend: [],
    monthlySpendError: "Network request failed.",
  },
}

export const OnePage: Story = {
  args: {
    forms: mockForms.slice(0, 3),
  },
}
