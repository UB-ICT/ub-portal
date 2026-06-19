import { apiRequest } from "@/lib/api/client"
import { readStoredAccessToken } from "@/lib/auth/storage"
import type { Pipeline } from "@/lib/api/requisitions"

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

export async function fetchPipelines() {
  return request<Pipeline[]>(`${BASE_PATH}/pipelines`)
}

export async function fetchPipeline(id: number) {
  return request<Pipeline>(`${BASE_PATH}/pipelines/${id}`)
}
