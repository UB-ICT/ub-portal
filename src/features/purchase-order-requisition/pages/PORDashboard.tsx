import React from "react"
import { useQuery } from "@tanstack/react-query"
import { fetchDashboardMetrics } from "@/lib/api/dashboard"
import { UBCard } from "../../../components/shared/UBCard" // Adjust import path

interface PORDashboardPageProps {}

export const PORDashboardPage: React.FC<PORDashboardPageProps> = () => {
  // 🔄 Fetch metrics dynamically isolated by the user's session token
  const { data, isLoading, error } = useQuery({
    queryKey: ["dashboard-metrics"],
    queryFn: fetchDashboardMetrics,
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
  const backendRole = data?.roleContext ?? "requester"

  // Differentiate between management workflows and standard requester profiles
  const isWorkflowLayout = backendRole !== "requester"

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
    <div className="space-y-6 p-8">
      {/* 🧭 Clean Header Banner */}
      <div className="border-b border-border pb-5">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
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
        {isWorkflowLayout ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
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

            <UBCard
              subtitle="Supplier Requests"
              title={String(activeMetrics.supplier_requests ?? 0)}
              description={getSupplierCardDescription(backendRole)}
              className="[&>h3]:text-4xl [&>h3]:font-bold [&>h3]:text-purple-600"
            />
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {/* 📝 NATIVE REQUESTER CARD DECK (Exact color matching to your image) */}
            <UBCard
              subtitle="In Review"
              title={String(activeMetrics.pending ?? 0)}
              description="Awaiting decision"
              className="[&>h3]:text-4xl [&>h3]:font-bold [&>h3]:text-amber-500"
            />

            <UBCard
              subtitle="Approved"
              title={String(activeMetrics.approved ?? 0)}
              description="Cleared for PO"
              className="[&>h3]:text-4xl [&>h3]:font-bold [&>h3]:text-emerald-600"
            />

            <UBCard
              subtitle="Rejected"
              title={String(activeMetrics.rejected ?? 0)}
              description="Needs follow-up"
              className="[&>h3]:text-4xl [&>h3]:font-bold [&>h3]:text-red-600"
            />
          </div>
        )}
      </div>
    </div>
  )
}
