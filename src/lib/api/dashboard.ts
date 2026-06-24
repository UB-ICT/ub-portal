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
}

type ApiResponse<T> = {
  success: boolean
  role_context: string // The backend will tell us what role it used!
  metrics: T
  message?: string
}

const BASE_PATH = "requisitionSystem/requisitions/dashboard-metrics"

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
  // Notice we dropped the custom query parameter string layout completely here:
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
