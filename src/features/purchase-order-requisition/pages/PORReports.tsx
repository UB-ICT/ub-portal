import React from "react"
import { useMutation, useQuery } from "@tanstack/react-query"

import { UBPageHeader } from "@/components/shared/UBPageHeader"
import { fetchDashboardMetrics } from "@/lib/api/dashboard"
import {
  downloadRequisitionReport,
  type RequisitionReportFilters,
} from "@/lib/api/reports"

import { SearchReport } from "../components/SearchReport"

const ALLOWED_REPORT_ROLES = [
  "budget-officer",
  "director-of-finance",
  "purchase-officer",
  "vice-president",
  "super-admin",
]

function triggerBlobDownload(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement("a")
  anchor.href = url
  anchor.download = fileName
  anchor.click()
  URL.revokeObjectURL(url)
}

export const PORReportsPage: React.FC = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["dashboard-metrics"],
    queryFn: fetchDashboardMetrics,
  })

  const backendRole = data?.roleContext ?? "requester"
  const canViewReport = ALLOWED_REPORT_ROLES.includes(backendRole)

  const downloadMutation = useMutation({
    mutationFn: (filters: RequisitionReportFilters) =>
      downloadRequisitionReport(filters),
    onSuccess: (blob) => {
      triggerBlobDownload(blob, `requisition-report_${Date.now()}.xlsx`)
    },
  })

  if (isLoading) {
    return (
      <div className="animate-pulse p-8 text-center text-sm font-medium text-muted-foreground">
        Loading...
      </div>
    )
  }

  if (!canViewReport) {
    return (
      <div className="p-8 text-center text-sm font-medium text-muted-foreground">
        You don't have access to this report.
      </div>
    )
  }

  return (
    <div className="flex h-full min-h-0 flex-col gap-4 overflow-y-auto">
      <UBPageHeader
        title="Requisition Report"
        description="Filter requisitions by status, cost center, supplier, and date, then export to Excel."
      />

      <SearchReport
        onGenerate={(filters) => downloadMutation.mutate(filters)}
        isGenerating={downloadMutation.isPending}
      />

      {downloadMutation.isError ? (
        <p className="text-sm text-destructive">
          {downloadMutation.error instanceof Error
            ? downloadMutation.error.message
            : "Failed to generate report."}
        </p>
      ) : null}
    </div>
  )
}
