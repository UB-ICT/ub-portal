import React from "react"

import { UBCard } from "@/components/shared/UBCard"
import type {
  CostCenterStageSummaryRow,
  DashboardMetrics,
  RequisitionForm,
  StageSummary,
} from "@/lib/api/dashboard"

import { CostCenterStageSummaryView } from "./CostCenterStageSummary"
import {
  MonthlySpendReportChart,
  type MonthlySpendPoint,
} from "./MonthlySpendReportChart"
import { RecentFormsView } from "./RequisitionRecentForms"
import {
  RunningBalanceChart,
  type BalanceOverTimePoint,
} from "./RunningBalanceChart"

export type RequesterDashboardMetrics = Pick<
  DashboardMetrics,
  "draft" | "pending" | "approved" | "rejected"
>

export type RequesterDashboardProps = {
  metrics?: RequesterDashboardMetrics
  isMetricsLoading?: boolean
  metricsError?: string | null
  forms?: RequisitionForm[]
  isFormsLoading?: boolean
  formsError?: string | null
  onViewAllForms?: () => void
  costCenterStages?: StageSummary[]
  costCenterRows?: CostCenterStageSummaryRow[]
  costCenterTotals?: { by_stage: Record<number, number>; grand_total: number }
  isCostCenterSummaryLoading?: boolean
  costCenterSummaryError?: string | null
  balanceHistory?: BalanceOverTimePoint[]
  isBalanceHistoryLoading?: boolean
  balanceHistoryError?: string | null
  monthlySpend?: MonthlySpendPoint[]
  isMonthlySpendLoading?: boolean
  monthlySpendError?: string | null
}

export const RequesterDashboard: React.FC<RequesterDashboardProps> = ({
  metrics,
  isMetricsLoading = false,
  metricsError = null,
  forms = [],
  isFormsLoading = false,
  formsError = null,
  onViewAllForms,
  costCenterStages,
  costCenterRows,
  costCenterTotals,
  isCostCenterSummaryLoading = false,
  costCenterSummaryError = null,
  balanceHistory = [],
  isBalanceHistoryLoading = false,
  balanceHistoryError = null,
  monthlySpend = [],
  isMonthlySpendLoading = false,
  monthlySpendError = null,
}) => {
  return (
    <div className="h-full min-h-0 w-full space-y-6 overflow-y-auto p-2">
      <div className="border-b border-border pb-5">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          My Requisitions
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Welcome back. Here&apos;s where your requisitions stand.
        </p>
      </div>

      {metricsError ? (
        <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-6 text-sm text-destructive">
          Error loading metrics: {metricsError}
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <UBCard
            subtitle="Draft"
            title={isMetricsLoading ? "-" : String(metrics?.draft ?? 0)}
            description="Not yet submitted"
            className="[&>h3]:text-4xl [&>h3]:font-bold [&>h3]:text-slate-500"
          />

          <UBCard
            subtitle="In Review"
            title={isMetricsLoading ? "-" : String(metrics?.pending ?? 0)}
            description="Awaiting Director/Dean's approval"
            className="[&>h3]:text-4xl [&>h3]:font-bold [&>h3]:text-amber-500"
          />

          <UBCard
            subtitle="Approved"
            title={isMetricsLoading ? "-" : String(metrics?.approved ?? 0)}
            description="Cleared for PO"
            className="[&>h3]:text-4xl [&>h3]:font-bold [&>h3]:text-emerald-600"
          />

          <UBCard
            subtitle="Rejected"
            title={isMetricsLoading ? "-" : String(metrics?.rejected ?? 0)}
            description="Needs follow-up"
            className="[&>h3]:text-4xl [&>h3]:font-bold [&>h3]:text-red-600"
          />
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <RunningBalanceChart
          data={balanceHistory}
          isLoading={isBalanceHistoryLoading}
          error={balanceHistoryError}
        />
        <MonthlySpendReportChart
          data={monthlySpend}
          isLoading={isMonthlySpendLoading}
          error={monthlySpendError}
        />
      </div>

      <CostCenterStageSummaryView
        stages={costCenterStages}
        rows={costCenterRows}
        totals={costCenterTotals}
        isLoading={isCostCenterSummaryLoading}
        error={costCenterSummaryError}
      />

      <RecentFormsView
        forms={forms}
        isLoading={isFormsLoading}
        error={formsError}
        onViewAllForms={onViewAllForms}
      />
    </div>
  )
}
