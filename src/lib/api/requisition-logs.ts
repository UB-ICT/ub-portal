import { ApiError, apiRequest } from "@/lib/api/client"
import { buildApiUrl } from "@/lib/config"
import { readStoredAccessToken } from "@/lib/auth/storage"

export type RequisitionLogAction =
  | "created"
  | "updated"
  | "submitted"
  | "approved"
  | "rejected"
  | "comment"
  | "cost_center_review"
  | "forwarded_for_review"
  | "delegated_review_submitted"
  | "cancelled"
  | "closed"

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
  file_name?: string | null
  has_attachment?: boolean
  created_at: string
  updated_at: string
  user?: RequisitionLogUser | null
}

export type CreateRequisitionLogPayload = {
  comments: string
  file?: File | null
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

async function parseJsonResponse<T>(response: Response) {
  const payload = (await response.json()) as T & {
    message?: string
    error?: string
  }

  if (!response.ok) {
    throw new ApiError(
      payload.message || payload.error || `Request failed with status ${response.status}.`,
      response.status,
      payload
    )
  }

  return payload
}

export function getRequisitionLogAttachmentViewUrl(logId: number) {
  return buildApiUrl(`${BASE_PATH}/logs/${logId}/attachment`)
}

export function getRequisitionLogAttachmentDownloadUrl(logId: number) {
  return buildApiUrl(`${BASE_PATH}/logs/${logId}/attachment/download`)
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
  if (payload.file) {
    const formData = new FormData()
    formData.append("comments", payload.comments)
    formData.append("file", payload.file)

    const response = await fetch(
      buildApiUrl(`${BASE_PATH}/requisitions/${requisitionId}/logs`),
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: formData,
      }
    )

    const result = await parseJsonResponse<ApiListResponse<RequisitionLogEntry>>(
      response
    )
    return result.data
  }

  return request<RequisitionLogEntry>(
    `${BASE_PATH}/requisitions/${requisitionId}/logs`,
    {
      method: "POST",
      body: JSON.stringify({ comments: payload.comments }),
    }
  )
}

export async function fetchRequisitionLogAttachmentBlob(logId: number) {
  const response = await fetch(getRequisitionLogAttachmentViewUrl(logId), {
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
    cache: "no-store",
  })

  if (!response.ok) {
    throw new ApiError(
      "Failed to load comment attachment.",
      response.status,
      await response.text()
    )
  }

  return response.blob()
}

export async function downloadRequisitionLogAttachment(logId: number) {
  const response = await fetch(getRequisitionLogAttachmentDownloadUrl(logId), {
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
    cache: "no-store",
  })

  if (!response.ok) {
    throw new ApiError(
      "Failed to download comment attachment.",
      response.status,
      await response.text()
    )
  }

  return response.blob()
}
