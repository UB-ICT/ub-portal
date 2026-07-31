import { apiRequest } from "@/lib/api/client"
import { readStoredAccessToken } from "@/lib/auth/storage"

type ApiResponse<T> = {
  success: boolean
  data: T
  message?: string
}

export type ChartOfAccount = {
  id: number
  account_no: string
  description: string
}

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

export async function fetchChartOfAccounts() {
  return request<ChartOfAccount[]>(BASE_PATH)
}
