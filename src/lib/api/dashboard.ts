import { apiRequest } from "@/lib/api/client"
import { readStoredAccessToken } from "@/lib/auth/storage"

export type DashboardMetrics = {
  awaiting_my_action?: number
  in_pipeline?: number
  approved_this_month?: number
  supplier_requests?: number
  pending?: number
  approved?: number
  rejected?: number
  draft?: number
  avg_processing_time_hours?: number
  avg_approval_time_hours?: number
}

export type RequisitionForm = {
  id: number
  number: string // e.g., REQ-2026-041
  supplier_name: string // e.g., Belize Office Box
  date_prepared: string // e.g., 2026-06-24
  total: number // e.g., 2340.00
  current_stage_name: string // e.g., Director review, Budget review

  // 👤 Requester (or unmapped role) view: totals across the whole pipeline.
  processing_time_hours?: number | null // submission to final approval/rejection; null while still in progress
  processing_time_display?: string | null // e.g., "6 minutes", "2h 15m", "3d 4h"
  approval_time_hours?: number | null // submission to most recent approval signature; null if no approval has happened yet
  approval_time_display?: string | null // e.g., "6 minutes", "2h 15m", "3d 4h"

  // 🏛️ Workflow role view (director-dean, budget-officer, etc.): a single figure for time spent at their own stage.
  time_at_stage_hours?: number | null
  time_at_stage_display?: string | null
}

type ApiResponse<T> = {
  success: boolean
  role_context: string // The backend will tell us what role it used!
  metrics: T
  message?: string
}

type AllFormsApiResponse = {
  success: boolean
  data: RequisitionForm[]
}

export type StageSummary = {
  id: number
  name: string
}

export type CostCenterStageSummaryRow = {
  cost_center_id: number
  cost_center_name: string
  total: number
  stages: Record<number, number> // stage id -> count
}

export type CostCenterStageSummary = {
  stages: StageSummary[]
  data: CostCenterStageSummaryRow[]
  totals: {
    by_stage: Record<number, number> // stage id -> count
    grand_total: number
  }
}

type CostCenterStageSummaryApiResponse = CostCenterStageSummary & {
  success: boolean
  role_context: string
}

const BASE_PATH = "requisitionSystem/requisitions/dashboard-metrics"
const COST_CENTER_STAGE_SUMMARY_PATH =
  "requisitionSystem/requisitions/summary-by-cost-center"

function getToken(token = readStoredAccessToken()) {
  if (!token) {
    throw new Error("No stored access token is available.")
  }
  return token
}

/**
 * Fetch the authentic requisition metrics based on the logged-in user session.
 */
export async function fetchDashboardMetrics() {
  const response = await apiRequest<ApiResponse<DashboardMetrics>>(BASE_PATH, {
    method: "GET",
    token: getToken(),
  })

  // Return both the metrics AND the role_context from the backend so the UI knows what layout to draw
  return {
    metrics: response.metrics,
    roleContext: response.role_context,
  }
}

/**
 * Fetch requisition counts grouped by Cost Center & current Stage, scoped the
 * same way as the metrics above (global roles see every cost center; everyone
 * else sees only their own).
 */
export async function fetchCostCenterStageSummary() {
  const response = await apiRequest<CostCenterStageSummaryApiResponse>(
    COST_CENTER_STAGE_SUMMARY_PATH,
    {
      method: "GET",
      token: getToken(),
    }
  )

  return {
    stages: response.stages,
    data: response.data,
    totals: response.totals,
    roleContext: response.role_context,
  }
}

/**
 * Fetch all respective forms permitted by the active user session token context.
 */
export async function fetchAllForms() {
  const response = await apiRequest<AllFormsApiResponse>(
    "requisitionSystem/requisitions/recent",
    {
      method: "GET",
      token: getToken(),
    }
  )
  return response.data
}
