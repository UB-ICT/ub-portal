import { apiRequest } from "@/lib/api/client"
import { readStoredAccessToken } from "@/lib/auth/storage"
import type { CostCenter } from "@/lib/api/requisitions"

type ApiResponse<T> = {
  success: boolean
  data: T
  message?: string
}

const BASE_PATH = "/requisitionSystem/costCenters"

function getToken(token = readStoredAccessToken()) {
  if (!token) {
    throw new Error("No stored access token is available.")
  }

  return token
}

export async function fetchCostCenters() {
  const response = await apiRequest<ApiResponse<CostCenter[]>>(BASE_PATH, {
    token: getToken(),
  })

  return response.data
}
