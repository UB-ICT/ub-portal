import { apiRequest } from "@/lib/api/client"
import { readStoredAccessToken } from "@/lib/auth/storage"
import { DEFAULT_GST_RATE_PERCENT } from "@/features/purchase-order-requisition/lib/line-pricing"

type ApiResponse<T> = {
  success: boolean
  data: T
  message?: string
}

export async function fetchGstRate(token = readStoredAccessToken()) {
  if (!token) {
    return DEFAULT_GST_RATE_PERCENT
  }

  try {
    const response = await apiRequest<
      ApiResponse<{ key: string; rate_percent: number }>
    >("/requisitionSystem/settings/gst-rate", { token })

    return Number(response.data.rate_percent) || DEFAULT_GST_RATE_PERCENT
  } catch {
    return DEFAULT_GST_RATE_PERCENT
  }
}
