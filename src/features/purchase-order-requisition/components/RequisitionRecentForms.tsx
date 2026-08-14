import React, { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Clock, ChevronLeft, ChevronRight, Info } from "lucide-react"
import { fetchAllForms } from "@/lib/api/dashboard"
import { useNavigate } from "react-router-dom"

import { mapApiStatusToCardStatus } from "../lib/requisition-mappers"
import { RequisitionNumberBadge } from "./RequisitionNumberBadge"

// Workflow roles (director-dean, budget-officer, etc.) get a single "time at my stage"
// figure; the requester view gets separate processing/approval totals. The shape of the
// rows tells us which one the backend sent for the current user's role.
function isStageTimingView(
  forms: { time_at_stage_hours?: number | null }[]
): boolean {
  return forms.some((form) => "time_at_stage_hours" in form)
}

export const RecentFormsTable: React.FC = () => {
  const navigate = useNavigate()
  const {
    data: forms,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["recent-forms"],
    queryFn: fetchAllForms,
  })

  // 🔢 Frontend Pagination State
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 5

  if (isLoading) {
    return (
      <div className="animate-pulse rounded-2xl border bg-card p-6 text-sm text-muted-foreground">
        Loading recent forms...
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-6 text-sm text-destructive">
        Error loading recent forms: {(error as Error).message}
      </div>
    )
  }

  const allForms = forms ?? []
  const totalRecords = allForms.length
  const totalPages = Math.ceil(totalRecords / itemsPerPage)

  // ✂️ Slice the array locally for the current page view
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedForms = allForms.slice(startIndex, endIndex)
  const stageTimingView = isStageTimingView(allForms)

  const getStageBadgeStyles = (stage: string) => {
    const normalize = stage.toLowerCase()
    if (normalize.includes("requester")) {
      return "bg-red-50 text-red-700 border-red-200"
    }
    if (normalize.includes("director")) {
      return "bg-blue-50 text-blue-700 border-blue-200"
    }
    if (normalize.includes("budget") || normalize.includes("finance")) {
      return "bg-indigo-50 text-indigo-700 border-indigo-200"
    }
    if (normalize.includes("vice") || normalize.includes("vp")) {
      return "bg-purple-50 text-purple-700 border-purple-200"
    }
    return "bg-gray-50 text-gray-700 border-gray-200"
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "BZD",
    }).format(amount)
  }

  return (
    <div className="rounded-2xl border bg-card p-6 shadow-sm">
      {/* 🧩 Header Actions section */}
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
          onClick={() => navigate("/requisitions/forms")}
          className="text-sm font-medium text-purple-700 hover:underline"
        >
          View all &rarr;
        </button>
      </div>

      {/* 📊 Responsive Data Grid Table Wrapper */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left text-sm text-muted-foreground">
          <thead>
            <tr className="border-b border-border text-xs font-semibold tracking-wider text-muted-foreground/70 uppercase">
              <th className="pt-2 pb-3">Ref. No.</th>
              <th className="pt-2 pb-3">Supplier</th>
              <th className="pt-2 pb-3">Date</th>
              <th className="pt-2 pb-3">Amount</th>
              <th className="pt-2 pb-3">Stage</th>
              {stageTimingView ? (
                <th className="pt-2 pb-3">Time at My Stage</th>
              ) : (
                <>
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
                </>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {paginatedForms.length > 0 ? (
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
                  {stageTimingView ? (
                    <td className="py-4">
                      {form.time_at_stage_display ?? "-"}
                    </td>
                  ) : (
                    <>
                      <td className="py-4">
                        {form.processing_time_display ?? "-"}
                      </td>
                      <td className="py-4">
                        {form.approval_time_display ?? "-"}
                      </td>
                    </>
                  )}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={stageTimingView ? 6 : 7}
                  className="py-8 text-center text-muted-foreground"
                >
                  No recent requisition entries found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* 🧭 Client-side Pagination Footer Controls */}
      {totalPages > 1 && (
        <div className="mt-2 flex items-center justify-between border-t border-border pt-4">
          <p className="text-xs text-muted-foreground">
            Showing page{" "}
            <span className="font-medium text-foreground">{currentPage}</span>{" "}
            of <span className="font-medium text-foreground">{totalPages}</span>
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
  )
}
