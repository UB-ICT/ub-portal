import { apiRequest } from "@/lib/api/client"
import { readStoredAccessToken } from "@/lib/auth/storage"
import type { CostCenter } from "@/lib/api/requisitions"

type ApiResponse<T> = {
  success: boolean
  data: T
  message?: string
}

export type { CostCenter }

export type CreateCostCenterPayload = {
  name: string
  number: string
}

export type UpdateCostCenterPayload = CreateCostCenterPayload

const BASE_PATH = "/requisitionSystem/costCenters"

function getToken(token = readStoredAccessToken()) {
  if (!token) {
    throw new Error("No stored access token is available.")
  }

  return token
}

async function request<T>(endpoint: string, options: RequestInit = {}) {
  const response = await apiRequest<ApiResponse<T>>(endpoint, {
    ...options,
    token: getToken(),
  })

  return response.data
}

export async function fetchCostCenters() {
  return request<CostCenter[]>(BASE_PATH)
}

export async function fetchCostCenter(id: number) {
  return request<CostCenter>(`${BASE_PATH}/${id}`)
}

export async function createCostCenter(payload: CreateCostCenterPayload) {
  return request<CostCenter>(BASE_PATH, {
    method: "POST",
    body: JSON.stringify(payload),
  })
}

export async function updateCostCenter(
  id: number,
  payload: UpdateCostCenterPayload
) {
  return request<CostCenter>(`${BASE_PATH}/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  })
}

export async function syncCostCenterUsers(id: number, userIds: string[]) {
  return request<CostCenter>(`${BASE_PATH}/${id}/users`, {
    method: "PUT",
    body: JSON.stringify({ user_ids: userIds }),
  })
}

export async function deleteCostCenter(id: number) {
  return apiRequest<ApiResponse<null>>(`${BASE_PATH}/${id}`, {
    method: "DELETE",
    token: getToken(),
  })
}
