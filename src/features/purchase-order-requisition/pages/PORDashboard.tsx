import React from "react"
import { useNavigate } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import {
  fetchAllForms,
  fetchBalanceOverTime,
  fetchCostCenterStageSummary,
  fetchDashboardMetrics,
} from "@/lib/api/dashboard"
import { ApiError } from "@/lib/api/client"
import { UBCard } from "../../../components/shared/UBCard"
import { RecentFormsTable } from "../components/RequisitionRecentForms"
import { CostCenterStageSummaryTable } from "../components/CostCenterStageSummary"
import { RequesterDashboard } from "../components/RequesterDashboard"

interface PORDashboardPageProps {}

export const PORDashboardPage: React.FC<PORDashboardPageProps> = () => {
  const navigate = useNavigate()

  // 🔄 Fetch metrics dynamically isolated by the user's session token
  const { data, isLoading, error } = useQuery({
    queryKey: ["dashboard-metrics"],
    queryFn: fetchDashboardMetrics,
  })

  const backendRole = data?.roleContext ?? "requester"

  // Differentiate between management workflows and standard requester profiles
  const isWorkflowLayout = backendRole !== "requester"

  // The requester dashboard is the only consumer of these two queries at this
  // level — the workflow layout's RecentFormsTable/CostCenterStageSummaryTable
  // below fetch for themselves — so keep them idle until we know the role.
  const formsQuery = useQuery({
    queryKey: ["recent-forms"],
    queryFn: fetchAllForms,
    enabled: !isWorkflowLayout && !isLoading,
  })

  const costCenterSummaryQuery = useQuery({
    queryKey: ["cost-center-stage-summary"],
    queryFn: fetchCostCenterStageSummary,
    retry: false,
    enabled: !isWorkflowLayout && !isLoading,
  })

  // Trailing 12 months, ending today — matches the backend's own 366-day cap.
  const formatLocalIsoDate = (date: Date) =>
    new Intl.DateTimeFormat("en-CA", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(date)

  const balanceDateTo = formatLocalIsoDate(new Date())
  const balanceDateFrom = formatLocalIsoDate(
    new Date(Date.now() - 365 * 24 * 60 * 60 * 1000)
  )

  const balanceHistoryQuery = useQuery({
    queryKey: ["balance-over-time", balanceDateFrom, balanceDateTo],
    queryFn: () =>
      fetchBalanceOverTime({
        dateFrom: balanceDateFrom,
        dateTo: balanceDateTo,
      }),
    retry: false,
    enabled: !isWorkflowLayout && !isLoading,
  })

  if (isLoading) {
    return (
      <div className="animate-pulse p-8 text-center text-sm font-medium text-muted-foreground">
        Loading your dashboard...
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-8 text-center text-sm font-medium text-destructive">
        Error loading metrics: {(error as Error).message}
      </div>
    )
  }

  const activeMetrics = data?.metrics ?? {}

  if (!isWorkflowLayout) {
    // Cost center summary is optional for a requester (they may have none
    // assigned) — a 403 means "nothing to show", not a real error.
    const costCenterSummaryForbidden =
      costCenterSummaryQuery.error instanceof ApiError &&
      costCenterSummaryQuery.error.status === 403

    return (
      <RequesterDashboard
        metrics={{
          draft: activeMetrics.draft,
          pending: activeMetrics.pending,
          approved: activeMetrics.approved,
          rejected: activeMetrics.rejected,
        }}
        forms={formsQuery.data}
        isFormsLoading={formsQuery.isLoading}
        formsError={
          formsQuery.error ? (formsQuery.error as Error).message : null
        }
        onViewAllForms={() => navigate("/requisitions/forms")}
        costCenterStages={costCenterSummaryQuery.data?.stages}
        costCenterRows={costCenterSummaryQuery.data?.data}
        costCenterTotals={costCenterSummaryQuery.data?.totals}
        isCostCenterSummaryLoading={costCenterSummaryQuery.isLoading}
        costCenterSummaryError={
          costCenterSummaryQuery.error && !costCenterSummaryForbidden
            ? (costCenterSummaryQuery.error as Error).message
            : null
        }
        balanceHistory={balanceHistoryQuery.data}
        isBalanceHistoryLoading={balanceHistoryQuery.isLoading}
        balanceHistoryError={
          balanceHistoryQuery.error
            ? (balanceHistoryQuery.error as Error).message
            : null
        }
        // monthlySpend intentionally omitted: no backend endpoint exists yet
        // for a month-bucketed spend report.
      />
    )
  }

  // Director/Dean approves requisitions directly and never handles supplier requests
  const showSupplierCard = backendRole !== "director-dean"

  const formatRoleName = (role: string) => {
    return role
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
  }

  // 📝 Match the exact dynamic descriptions for the 4th Card (Supplier Requests)
  const getSupplierCardDescription = (role: string): string => {
    switch (role) {
      case "director-dean":
        return "Pending your approval"
      case "budget-officer":
        return "Pending Budget Officer"
      case "vice-president":
        return "Pending VP Approval"
      case "director-of-finance":
        return "Pending Finance Approval"
      case "purchase-officer":
        return "Pending PO Approval"
      default:
        return "Pending review"
    }
  }

  return (
    <div className="h-full min-h-0 w-full space-y-6 overflow-y-auto p-2">
      {/* 🧭 Clean Header Banner */}
      <div className="border-b border-border pb-5">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Purchase Order Requisitions
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Welcome back. Tracking metrics active for:{" "}
          <span className="font-semibold text-primary">
            {formatRoleName(backendRole)}
          </span>
        </p>
      </div>

      {/* 🎴 Secure Grid Layout rendering exactly what your account permits */}
      <div>
        <div
          className={`grid gap-6 sm:grid-cols-2 ${showSupplierCard ? "lg:grid-cols-4" : "lg:grid-cols-3"}`}
        >
          {/* 🏛️ MANAGEMENT WORKFLOW CARD DECK (Exact color matching to your image) */}
          <UBCard
            subtitle="Awaiting My Action"
            title={String(activeMetrics.awaiting_my_action ?? 0)}
            description="Ready for your review"
            className="[&>h3]:text-4xl [&>h3]:font-bold [&>h3]:text-amber-500"
          />

          <UBCard
            subtitle="In Pipeline"
            title={String(activeMetrics.in_pipeline ?? 0)}
            description="All active forms"
            className="[&>h3]:text-4xl [&>h3]:font-bold [&>h3]:text-blue-600"
          />

          <UBCard
            subtitle="Approved This Month"
            title={String(activeMetrics.approved_this_month ?? 0)}
            description="Fully cleared"
            className="[&>h3]:text-4xl [&>h3]:font-bold [&>h3]:text-emerald-600"
          />

          {showSupplierCard && (
            <UBCard
              subtitle="Supplier Requests"
              title={String(activeMetrics.supplier_requests ?? 0)}
              description={getSupplierCardDescription(backendRole)}
              className="[&>h3]:text-4xl [&>h3]:font-bold [&>h3]:text-purple-600"
            />
          )}
        </div>
      </div>

      <CostCenterStageSummaryTable />

      <RecentFormsTable />
    </div>
  )
}
