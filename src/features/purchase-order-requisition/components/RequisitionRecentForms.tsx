import React, { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { useNavigate } from "react-router-dom"
import { Clock, ChevronLeft, ChevronRight, Info } from "lucide-react"

import { fetchAllForms, type RequisitionForm } from "@/lib/api/dashboard"
import { UBTable, type ColumnDef } from "@/components/shared/UBTable"
import { cn } from "@/lib/utils"

import { mapApiStatusToCardStatus } from "../lib/requisition-mappers"
import { RequisitionNumberBadge } from "./RequisitionNumberBadge"

export type RecentFormsViewProps = {
  forms?: RequisitionForm[]
  isLoading?: boolean
  error?: string | null
  onViewAllForms?: () => void
}

const FORMS_PER_PAGE = 5

// Workflow roles (director-dean, budget-officer, etc.) get a single "time at my stage"
// figure; the requester view gets separate processing/approval totals. The shape of the
// rows tells us which one the backend sent for the current user's role.
function isStageTimingView(
  forms: { time_at_stage_hours?: number | null }[]
): boolean {
  return forms.some((form) => "time_at_stage_hours" in form)
}

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
  const [year, month, day] = dateString.split("-").map(Number)
  return new Date(year, (month ?? 1) - 1, day ?? 1).toLocaleDateString(
    "en-US",
    { month: "short", day: "2-digit", year: "numeric" }
  )
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "BZD",
  }).format(amount)
}

function TimingHeader({ label, title }: { label: string; title: string }) {
  return (
    <span className="inline-flex cursor-help items-center gap-1" title={title}>
      {label}
      <Info className="size-3 text-muted-foreground/70" />
    </span>
  )
}

// Presentational table, reused by the self-fetching RecentFormsTable below as
// well as by role-specific dashboards (e.g. RequesterDashboard) that already
// have this data as props.
export const RecentFormsView: React.FC<RecentFormsViewProps> = ({
  forms = [],
  isLoading = false,
  error = null,
  onViewAllForms,
}) => {
  const [currentPage, setCurrentPage] = useState(1)

  const totalRecords = forms.length
  const totalPages = Math.max(1, Math.ceil(totalRecords / FORMS_PER_PAGE))

  React.useEffect(() => {
    setCurrentPage((page) => (page > totalPages ? totalPages : page))
  }, [totalPages])

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
        Error loading recent forms: {error}
      </div>
    )
  }

  const startIndex = (currentPage - 1) * FORMS_PER_PAGE
  const paginatedForms = forms.slice(startIndex, startIndex + FORMS_PER_PAGE)
  const stageTimingView = isStageTimingView(forms)

  const columns: ColumnDef<RequisitionForm>[] = [
    {
      header: "Ref. No.",
      accessor: "number",
      mobile: true,
      render: (_value, form) => (
        <RequisitionNumberBadge
          number={form.number}
          status={mapApiStatusToCardStatus(
            form.status_name ?? form.current_stage_name
          )}
        />
      ),
    },
    {
      header: "Supplier",
      accessor: "supplier_name",
      mobile: true,
      render: (value) => (
        <span className="text-foreground/90">{String(value) || "-"}</span>
      ),
    },
    {
      header: "Date",
      accessor: "date_prepared",
      mobile: false,
      render: (value) => formatDate(String(value)),
    },
    {
      header: "Amount",
      accessor: "total",
      mobile: true,
      render: (value) => (
        <span className="font-bold text-foreground">
          {formatCurrency(Number(value))}
        </span>
      ),
    },
    {
      header: "Stage",
      accessor: "current_stage_name",
      mobile: true,
      render: (value, form) => (
        <span
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium capitalize shadow-sm",
            getStageBadgeStyles(form.current_stage_name)
          )}
        >
          <Clock className="size-3" />
          {String(value)}
        </span>
      ),
    },
    stageTimingView
      ? {
          header: "Time at My Stage",
          accessor: "time_at_stage_display",
          mobile: false,
          render: (value) => String(value ?? "-"),
        }
      : {
          header: (
            <TimingHeader
              label="Processing Time"
              title="Time from submission to final approval or rejection. Blank while the requisition is still in progress."
            />
          ),
          accessor: "processing_time_display",
          mobile: false,
          render: (value) => String(value ?? "-"),
        },
    ...(stageTimingView
      ? []
      : [
          {
            header: (
              <TimingHeader
                label="Approval Time"
                title="Time from submission to the most recent approval signature. Blank until at least one approval has been given."
              />
            ),
            accessor: "approval_time_display",
            mobile: false,
            render: (value) => String(value ?? "-"),
          } satisfies ColumnDef<RequisitionForm>,
        ]),
  ]

  return (
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

      {paginatedForms.length > 0 ? (
        <UBTable<RequisitionForm>
          columns={columns}
          data={paginatedForms}
          rowKey="id"
          striped={false}
        />
      ) : (
        <p className="py-8 text-center text-sm text-muted-foreground">
          No recent requisition entries found.
        </p>
      )}

      {totalPages > 1 && (
        <div className="mt-2 flex items-center justify-between border-t border-border pt-4">
          <p className="text-xs text-muted-foreground">
            Showing page{" "}
            <span className="font-medium text-foreground">
              {currentPage}
            </span>{" "}
            of{" "}
            <span className="font-medium text-foreground">{totalPages}</span>
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

export const RecentFormsTable: React.FC = () => {
  const navigate = useNavigate()
  const { data, isLoading, error } = useQuery({
    queryKey: ["recent-forms"],
    queryFn: fetchAllForms,
  })

  return (
    <RecentFormsView
      forms={data}
      isLoading={isLoading}
      error={error ? (error as Error).message : null}
      onViewAllForms={() => navigate("/requisitions/forms")}
    />
  )
}
