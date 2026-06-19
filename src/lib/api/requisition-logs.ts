import { apiRequest } from "@/lib/api/client"
import { readStoredAccessToken } from "@/lib/auth/storage"

export type RequisitionLogAction =
  | "created"
  | "updated"
  | "submitted"
  | "approved"
  | "rejected"
  | "comment"
  | "cost_center_review"

export type RequisitionLogUser = {
  id: string
  name: string
  email: string
}

export type RequisitionLogEntry = {
  id: number
  requisition_id: number
  user_id: string
  action: RequisitionLogAction
  summary: string | null
  comments: string | null
  created_at: string
  updated_at: string
  user?: RequisitionLogUser | null
}

export type CreateRequisitionLogPayload = {
  comments: string
}

type ApiListResponse<T> = {
  success: boolean
  data: T
  message?: string
}

const BASE_PATH = "/requisitionSystem"

function getToken(token = readStoredAccessToken()) {
  if (!token) {
    throw new Error("No stored access token is available.")
  }

  return token
}

async function request<T>(endpoint: string, options: RequestInit = {}) {
  const response = await apiRequest<ApiListResponse<T>>(endpoint, {
    ...options,
    token: getToken(),
  })

  return response.data
}

export async function fetchRequisitionLogs(requisitionId: number) {
  return request<RequisitionLogEntry[]>(
    `${BASE_PATH}/requisitions/${requisitionId}/logs`
  )
}

export async function createRequisitionLogComment(
  requisitionId: number,
  payload: CreateRequisitionLogPayload
) {
  return request<RequisitionLogEntry>(
    `${BASE_PATH}/requisitions/${requisitionId}/logs`,
    {
      method: "POST",
      body: JSON.stringify(payload),
    }
  )
}
