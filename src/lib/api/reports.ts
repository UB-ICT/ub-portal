import { buildApiUrl } from "@/lib/config"
import { ApiError } from "@/lib/api/client"
import { readStoredAccessToken } from "@/lib/auth/storage"

const BASE_PATH = "/requisitionSystem"

export type RequisitionReportSortField =
  | "number"
  | "total"
  | "cost_center"
  | "supplier"
  | "status"

export type RequisitionReportFilters = {
  dateFrom: string
  dateTo: string
  supplierId?: number
  costCenterId?: number
  statusId?: number
  number?: string
  amountMin?: number
  amountMax?: number
  sortBy?: RequisitionReportSortField
  sortDir?: "asc" | "desc"
}

function getToken(token = readStoredAccessToken()) {
  if (!token) {
    throw new Error("No stored access token is available.")
  }

  return token
}

function buildReportQueryString(filters: RequisitionReportFilters) {
  const params = new URLSearchParams()

  params.set("date_from", filters.dateFrom)
  params.set("date_to", filters.dateTo)

  if (filters.supplierId) {
    params.set("supplier_id", String(filters.supplierId))
  }

  if (filters.costCenterId) {
    params.set("cost_center_id", String(filters.costCenterId))
  }

  if (filters.statusId) {
    params.set("status_id", String(filters.statusId))
  }

  if (filters.number) {
    params.set("number", filters.number)
  }

  if (filters.amountMin !== undefined) {
    params.set("amount_min", String(filters.amountMin))
  }

  if (filters.amountMax !== undefined) {
    params.set("amount_max", String(filters.amountMax))
  }

  if (filters.sortBy) {
    params.set("sort_by", filters.sortBy)
  }

  if (filters.sortDir) {
    params.set("sort_dir", filters.sortDir)
  }

  return params.toString()
}

export async function downloadRequisitionReport(
  filters: RequisitionReportFilters
) {
  const queryString = buildReportQueryString(filters)

  const response = await fetch(
    buildApiUrl(`${BASE_PATH}/requisitions/report?${queryString}`),
    {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${getToken()}`,
      },
    }
  )

  if (!response.ok) {
    const contentType = response.headers.get("content-type") ?? ""
    const payload = contentType.includes("application/json")
      ? await response.json()
      : await response.text()

    throw new ApiError(
      typeof payload?.message === "string"
        ? payload.message
        : `Failed to generate report (status ${response.status}).`,
      response.status,
      payload
    )
  }

  return response.blob()
}
