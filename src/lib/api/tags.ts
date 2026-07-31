import { apiRequest } from "@/lib/api/client"
import { readStoredAccessToken } from "@/lib/auth/storage"

export type RequisitionTag = {
  id: number
  name: string
  cost_center_id: number
}

type ApiDataResponse<T> = {
  success: boolean
  data: T
  message?: string
}

const BASE_PATH = "/requisitionSystem/tags"

function getToken(token = readStoredAccessToken()) {
  if (!token) {
    throw new Error("No stored access token is available.")
  }

  return token
}

async function request<T>(endpoint: string, options: RequestInit = {}) {
  const response = await apiRequest<ApiDataResponse<T>>(endpoint, {
    ...options,
    token: getToken(),
  })

  return response.data
}

export async function fetchTags(costCenterId: number, search = "") {
  const params = new URLSearchParams({
    cost_center_id: String(costCenterId),
  })

  if (search.trim()) {
    params.set("search", search.trim())
  }

  return request<RequisitionTag[]>(`${BASE_PATH}?${params.toString()}`)
}

export async function createTag(payload: {
  name: string
  cost_center_id: number
}) {
  return request<RequisitionTag>(BASE_PATH, {
    method: "POST",
    body: JSON.stringify(payload),
  })
}

export async function updateTag(
  id: number,
  payload: { name: string; cost_center_id?: number }
) {
  return request<RequisitionTag>(`${BASE_PATH}/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  })
}

export async function deleteTag(id: number) {
  return request<null>(`${BASE_PATH}/${id}`, {
    method: "DELETE",
  })
}
