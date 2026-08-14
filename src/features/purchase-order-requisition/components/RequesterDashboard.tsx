import React, { useState } from "react"
import { Clock, ChevronLeft, ChevronRight, Info } from "lucide-react"

import { UBCard } from "@/components/shared/UBCard"
import type {
  CostCenterStageSummaryRow,
  DashboardMetrics,
  RequisitionForm,
  StageSummary,
} from "@/lib/api/dashboard"

import { mapApiStatusToCardStatus } from "../lib/requisition-mappers"
import { CostCenterStageSummaryView } from "./CostCenterStageSummary"
import {
  MonthlySpendReportChart,
  type MonthlySpendPoint,
} from "./MonthlySpendReportChart"
import { RequisitionNumberBadge } from "./RequisitionNumberBadge"
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

const FORMS_PER_PAGE = 5

function getStageBadgeStyles(stage: string) {
  const normalized = stage.toLowerCase()
  if (normalized.includes("requester")) {
    return "bg-red-50 text-red-700 border-red-200"
  }
  if (normalized.includes("director")) {
    return "bg-blue-50 text-blue-700 border-blue-200"
  }
  if (normalized.includes("budget") || normalized.includes("finance")) {
    return "bg-indigo-50 text-indigo-700 border-indigo-200"
  }
  if (normalized.includes("vice") || normalized.includes("vp")) {
    return "bg-purple-50 text-purple-700 border-purple-200"
  }
  return "bg-gray-50 text-gray-700 border-gray-200"
}

function formatDate(dateString: string) {
  const value = dateString.length === 10 ? `${dateString}T00:00:00` : dateString
  return new Date(value).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" })
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "BZD",
  }).format(amount)
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
  const [currentPage, setCurrentPage] = useState(1)

  const totalRecords = forms.length
  const totalPages = Math.max(1, Math.ceil(totalRecords / FORMS_PER_PAGE))

  React.useEffect(() => {
    setCurrentPage((page) => (page > totalPages ? totalPages : page))
  }, [totalPages])

  const startIndex = (currentPage - 1) * FORMS_PER_PAGE
  const paginatedForms = forms.slice(startIndex, startIndex + FORMS_PER_PAGE)
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

      <div className="rounded-2xl border bg-card p-6 shadow-sm">
        <div className="flex items-center justify-between pb-4">
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              My recent forms
            </h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Total records: {totalRecords}
            </p>
          </div>
          <button
            onClick={onViewAllForms}
            className="text-sm font-medium text-purple-700 hover:underline"
          >
            View all &rarr;
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm text-muted-foreground">
            <thead>
              <tr className="border-b border-border text-xs font-semibold tracking-wider text-muted-foreground/70 uppercase">
                <th className="pt-2 pb-3">Ref. No.</th>
                <th className="pt-2 pb-3">Supplier</th>
                <th className="pt-2 pb-3">Date</th>
                <th className="pt-2 pb-3">Amount</th>
                <th className="pt-2 pb-3">Stage</th>
                <th className="pt-2 pb-3">
                  <span
                    className="inline-flex cursor-help items-center gap-1"
                    title="Time from submission to final approval or rejection. Blank while the requisition is still in progress."
                  >
                    Processing Time
                    <Info className="size-3 text-muted-foreground/70" />
                  </span>
                </th>
                <th className="pt-2 pb-3">
                  <span
                    className="inline-flex cursor-help items-center gap-1"
                    title="Time from submission to the most recent approval signature. Blank until at least one approval has been given."
                  >
                    Approval Time
                    <Info className="size-3 text-muted-foreground/70" />
                  </span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isFormsLoading ? (
                <tr>
                  <td
                    colSpan={7}
                    className="py-8 text-center text-muted-foreground"
                  >
                    Loading recent forms...
                  </td>
                </tr>
              ) : formsError ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-destructive">
                    Error loading recent forms: {formsError}
                  </td>
                </tr>
              ) : paginatedForms.length > 0 ? (
                paginatedForms.map((form) => (
                  <tr
                    key={form.id}
                    className="group transition-colors hover:bg-muted/30"
                  >
                    <td className="cursor-pointer py-4">
                      <RequisitionNumberBadge
                        number={form.number}
                        status={mapApiStatusToCardStatus(
                          form.status_name ?? form.current_stage_name
                        )}
                      />
                    </td>
                    <td className="py-4 text-foreground/90">
                      {form.supplier_name || "-"}
                    </td>
                    <td className="py-4">{formatDate(form.date_prepared)}</td>
                    <td className="py-4 font-bold text-foreground">
                      {formatCurrency(form.total)}
                    </td>
                    <td className="py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium capitalize shadow-sm ${getStageBadgeStyles(form.current_stage_name)}`}
                      >
                        <Clock className="size-3" />
                        {form.current_stage_name}
                      </span>
                    </td>
                    <td className="py-4">
                      {form.processing_time_display ?? "-"}
                    </td>
                    <td className="py-4">
                      {form.approval_time_display ?? "-"}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={7}
                    className="py-8 text-center text-muted-foreground"
                  >
                    No recent requisition entries found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="mt-2 flex items-center justify-between border-t border-border pt-4">
            <p className="text-xs text-muted-foreground">
              Showing page{" "}
              <span className="font-medium text-foreground">
                {currentPage}
              </span>{" "}
              of{" "}
              <span className="font-medium text-foreground">
                {totalPages}
              </span>
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((old) => Math.max(old - 1, 1))}
                disabled={currentPage === 1}
                className="inline-flex size-8 items-center justify-center rounded-lg border bg-background text-muted-foreground transition hover:text-foreground disabled:opacity-40"
              >
                <ChevronLeft className="size-4" />
              </button>
              <button
                onClick={() =>
                  setCurrentPage((old) => Math.min(old + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                className="inline-flex size-8 items-center justify-center rounded-lg border bg-background text-muted-foreground transition hover:text-foreground disabled:opacity-40"
              >
                <ChevronRight className="size-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
