import { apiRequest } from "@/lib/api/client"
import { readStoredAccessToken } from "@/lib/auth/storage"

type ApiResponse<T> = {
  success: boolean
  data: T
  message?: string
}

export type Currency = {
  id: number
  name: string
  symbol: string
}

const BASE_PATH = "/requisitionSystem/currencies"

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

export async function fetchCurrencies() {
  return request<Currency[]>(BASE_PATH)
}
