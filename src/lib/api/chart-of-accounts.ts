import { apiRequest } from "@/lib/api/client"
import { readStoredAccessToken } from "@/lib/auth/storage"

type ApiResponse<T> = {
  success: boolean
  data: T
  message?: string
}

export type ChartOfAccount = {
  id: number
  parent_id?: number | null
  account_no: string
  description: string
  parent?: Pick<ChartOfAccount, "id" | "account_no" | "description"> | null
  children?: ChartOfAccount[]
}

export type CreateChartOfAccountPayload = {
  account_no: string
  description: string
  parent_id?: number | null
}

export type UpdateChartOfAccountPayload = CreateChartOfAccountPayload

const BASE_PATH = "/requisitionSystem/chartOfAccounts"

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

export async function fetchChartOfAccounts(search?: string) {
  const query = search?.trim()
    ? `?search=${encodeURIComponent(search.trim())}`
    : ""

  return request<ChartOfAccount[]>(`${BASE_PATH}${query}`)
}

export async function fetchChartOfAccount(id: number) {
  return request<ChartOfAccount>(`${BASE_PATH}/${id}`)
}

export async function createChartOfAccount(
  payload: CreateChartOfAccountPayload
) {
  return request<ChartOfAccount>(BASE_PATH, {
    method: "POST",
    body: JSON.stringify(payload),
  })
}

export async function updateChartOfAccount(
  id: number,
  payload: UpdateChartOfAccountPayload
) {
  return request<ChartOfAccount>(`${BASE_PATH}/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  })
}

export async function deleteChartOfAccount(id: number) {
  return apiRequest<ApiResponse<null>>(`${BASE_PATH}/${id}`, {
    method: "DELETE",
    token: getToken(),
  })
}
