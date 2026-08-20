import { apiRequest } from "@/lib/api/client"
import { buildApiUrl } from "@/lib/config"
import { readStoredAccessToken } from "@/lib/auth/storage"
import type { RequisitionAttachment } from "@/lib/api/attachments"
import type { RequisitionPriority } from "@/features/purchase-order-requisition/lib/requisition-priorities"

export type { RequisitionPriority } from "@/features/purchase-order-requisition/lib/requisition-priorities"

type ApiListResponse<T> = {
  success: boolean
  data: T
  message?: string
  count?: number
  meta?: {
    current_page: number
    last_page: number
    per_page: number
    total: number
  }
}

export type CostCenterUser = {
  id: string
  name: string
  email: string
}

export type CostCenter = {
  id: number
  name: string
  number: string | null
  users?: CostCenterUser[]
}

export type RequisitionStatusRecord = {
  id: number
  name: string
}

export type RequisitionStageRecord = {
  id: number
  name: string
}

export type RequisitionUserStageAction =
  | "approved"
  | "rejected"
  | "cost_center_review"

export type RequisitionSupplierPivot = {
  id: number
  name: string
  pivot?: {
    is_recommended: boolean
    quoted_total?: number | string | null
    quote_reference_number?: string | null
  }
}

export type RequisitionLineItemInput = {
  chart_of_account_id: number | null
  quantity: number
  unit_cost: number
  gst_applicable?: boolean
  comments?: string
}

export type RequisitionLineItem = RequisitionLineItemInput & {
  id: number
  line_item_number?: string | null
  description?: string | null
  subtotal?: number | string
  gst_amount?: number | string
  total: number | string
  requisition_id: number
  chart_of_account?: {
    id: number
    account_no: string
    description: string
    parent_id?: number | null
  } | null
}

export type PipelineStageUser = {
  id: string
  name: string
  email: string
}

export type PipelineStage = {
  id: number
  name: string
  sequence?: number
  users?: PipelineStageUser[]
  pivot?: {
    pipeline_id: number
    stage_id: number
    sequence: number
  }
}

export type Pipeline = {
  id: number
  name: string
  stages?: PipelineStage[]
}

export type RequisitionRecord = {
  id: number
  number: string
  requisition_number?: string
  purchase_order_number?: string | null
  purchase_order_file_name?: string | null
  purchase_order_emailed_at?: string | null
  has_purchase_order_file?: boolean
  preferred_supplier_email?: string | null
  cost_center_id: number
  pipeline_id?: number | null
  date_prepared: string
  status_id: number
  currency_id: number
  total: number | string
  stage_id: number
  priority: RequisitionPriority
  description?: string | null
  expected_delivery_date: string | null
  is_recurring: boolean
  requires_downpayment?: boolean
  quote_waiver_reason?: string | null
  reminder_date: string | null
  items?: RequisitionLineItem[]
  suppliers?: RequisitionSupplierPivot[]
  attachments?: RequisitionAttachment[]
  cost_center?: CostCenter
  status?: RequisitionStatusRecord
  stage?: RequisitionStageRecord
  is_editable?: boolean
  can_approve?: boolean
  show_approval_actions?: boolean
  user_stage_action?: RequisitionUserStageAction | null
  can_edit_purchase_order_number?: boolean
  can_upload_purchase_order?: boolean
  can_email_purchase_order?: boolean
  can_cancel?: boolean
  can_close?: boolean
  pipeline?: Pipeline
  current_stage_sequence?: number
  created_at?: string
  updated_at?: string
  tags?: Array<{
    id: number
    name: string
    cost_center_id?: number
  }>
}

export type RequisitionSupplierInput = {
  supplier_id: number
  is_recommended: boolean
  quoted_total?: number | null
  quote_reference_number?: string | null
}

export type CreateRequisitionPayload = {
  cost_center_id: number
  currency_id: number | null
  priority: RequisitionPriority
  description?: string | null
  expected_delivery_date?: string | null
  is_recurring: boolean
  requires_downpayment?: boolean
  quote_waiver_reason?: string | null
  reminder_date?: string | null
  suppliers?: RequisitionSupplierInput[]
  items: RequisitionLineItemInput[]
  tag_ids?: number[]
  submit?: boolean
}

export type UpdateRequisitionPayload = CreateRequisitionPayload & {
  number?: string
  activity_comment?: string | null
}

export type RequisitionApprovalPayload = {
  comments?: string | null
}

export type UpdateRequisitionPurchaseOrderPayload = {
  purchase_order_number?: string | null
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

async function requestPage<T>(endpoint: string, options: RequestInit = {}) {
  return apiRequest<ApiListResponse<T>>(endpoint, {
    ...options,
    token: getToken(),
  })
}

export async function fetchRequisitions() {
  const perPage = 50
  let page = 1
  let lastPage = 1
  const all: RequisitionRecord[] = []

  do {
    const response = await requestPage<RequisitionRecord[]>(
      `${BASE_PATH}/requisitions?page=${page}&per_page=${perPage}`
    )
    all.push(...(response.data ?? []))
    lastPage = response.meta?.last_page ?? 1
    page += 1
  } while (page <= lastPage)

  return all
}

export async function fetchRequisition(id: number) {
  return request<RequisitionRecord>(`${BASE_PATH}/requisitions/${id}`)
}

export async function createRequisition(payload: CreateRequisitionPayload) {
  return request<RequisitionRecord>(`${BASE_PATH}/requisitions`, {
    method: "POST",
    body: JSON.stringify(payload),
  })
}

export async function updateRequisition(
  id: number,
  payload: UpdateRequisitionPayload
) {
  return request<RequisitionRecord>(`${BASE_PATH}/requisitions/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  })
}

/**
 * Best-effort draft flush for page unload. Uses fetch keepalive so the
 * browser can finish the request after the document is torn down.
 */
export function flushRequisitionDraftKeepalive(
  payload: CreateRequisitionPayload | UpdateRequisitionPayload,
  requisitionId?: number | null
) {
  const token = readStoredAccessToken()
  if (!token) {
    return
  }

  const path =
    requisitionId != null
      ? `${BASE_PATH}/requisitions/${requisitionId}`
      : `${BASE_PATH}/requisitions`

  void fetch(buildApiUrl(path), {
    method: requisitionId != null ? "PUT" : "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
    keepalive: true,
  }).catch(() => {
    // Unload flush is best-effort.
  })
}

export async function approveRequisition(
  id: number,
  payload: RequisitionApprovalPayload = {}
) {
  return request<RequisitionRecord>(`${BASE_PATH}/requisitions/${id}/approve`, {
    method: "POST",
    body: JSON.stringify(payload),
  })
}

export async function rejectRequisition(
  id: number,
  payload: RequisitionApprovalPayload = {}
) {
  return request<RequisitionRecord>(`${BASE_PATH}/requisitions/${id}/reject`, {
    method: "POST",
    body: JSON.stringify(payload),
  })
}

export async function requestRequisitionReview(
  id: number,
  payload: RequisitionApprovalPayload = {}
) {
  return request<RequisitionRecord>(
    `${BASE_PATH}/requisitions/${id}/request-review`,
    {
      method: "POST",
      body: JSON.stringify(payload),
    }
  )
}

export async function cancelRequisition(
  id: number,
  payload: RequisitionApprovalPayload = {}
) {
  return request<RequisitionRecord>(`${BASE_PATH}/requisitions/${id}/cancel`, {
    method: "POST",
    body: JSON.stringify(payload),
  })
}

export async function closeRequisition(
  id: number,
  payload: RequisitionApprovalPayload = {}
) {
  return request<RequisitionRecord>(`${BASE_PATH}/requisitions/${id}/close`, {
    method: "POST",
    body: JSON.stringify(payload),
  })
}

export async function updateRequisitionPurchaseOrderNumber(
  id: number,
  payload: UpdateRequisitionPurchaseOrderPayload
) {
  return request<RequisitionRecord>(
    `${BASE_PATH}/requisitions/${id}/purchase-order-number`,
    {
      method: "PATCH",
      body: JSON.stringify(payload),
    }
  )
}

export async function uploadRequisitionPurchaseOrder(
  id: number,
  file: File,
  purchaseOrderNumber?: string | null
) {
  const formData = new FormData()
  formData.append("file", file)

  if (purchaseOrderNumber !== undefined && purchaseOrderNumber !== null) {
    formData.append("purchase_order_number", purchaseOrderNumber)
  }

  const response = await apiRequest<ApiListResponse<RequisitionRecord>>(
    `${BASE_PATH}/requisitions/${id}/purchase-order`,
    {
      method: "POST",
      token: getToken(),
      body: formData,
    }
  )

  return response.data
}

export function getRequisitionPurchaseOrderDownloadUrl(id: number) {
  return `${BASE_PATH}/requisitions/${id}/purchase-order/download`
}

export function getRequisitionPrintUrl(id: number) {
  return `${BASE_PATH}/requisitions/${id}/print`
}

export function getRequisitionExportUrl(id: number) {
  return `${BASE_PATH}/requisitions/${id}/export`
}

async function fetchRequisitionPrintResponse(id: number) {
  const headers = {
    Accept: "application/pdf",
    Authorization: `Bearer ${getToken()}`,
  }

  const printResponse = await fetch(buildApiUrl(getRequisitionPrintUrl(id)), {
    headers,
    cache: "no-store",
  })

  // Older API deploys only expose /export; fall back when /print is missing.
  if (printResponse.status === 404) {
    return fetch(buildApiUrl(getRequisitionExportUrl(id)), {
      headers,
      cache: "no-store",
    })
  }

  return printResponse
}

export async function downloadRequisitionPrintPdf(
  id: number,
  fallbackFileName = "requisition.pdf"
) {
  const response = await fetchRequisitionPrintResponse(id)

  if (!response.ok) {
    let message = "Failed to generate requisition PDF."
    try {
      const payload = (await response.json()) as { message?: string }
      if (payload.message) {
        message = payload.message
      }
    } catch {
      if (response.status === 404) {
        message =
          "Print endpoint not found. Deploy the latest API, then try again."
      } else if (response.status >= 500) {
        message =
          "The API failed while generating the PDF. Check the API logs and try again."
      }
    }
    throw new Error(message)
  }

  const buffer = await response.arrayBuffer()
  const bytes = new Uint8Array(buffer)

  // Reject ZIP / non-PDF payloads so we never open or save a broken file.
  const isPdf =
    bytes.length >= 5 &&
    bytes[0] === 0x25 && // %
    bytes[1] === 0x50 && // P
    bytes[2] === 0x44 && // D
    bytes[3] === 0x46 && // F
    bytes[4] === 0x2d // -
  const isZip = bytes.length >= 2 && bytes[0] === 0x50 && bytes[1] === 0x4b

  if (isZip || !isPdf) {
    throw new Error(
      isZip
        ? "Server returned a ZIP export instead of a print PDF. Redeploy the API with the merged print PDF, then try again."
        : "Server returned an invalid PDF. Please try again."
    )
  }

  const disposition = response.headers.get("content-disposition") ?? ""
  const matched = /filename=\"([^\"]+)\"/i.exec(disposition)
  const fileName = matched?.[1] || fallbackFileName
  const blob = new Blob([buffer], { type: "application/pdf" })
  const url = URL.createObjectURL(blob)

  const printWindow = window.open(url, "_blank", "noopener,noreferrer")
  if (printWindow) {
    const triggerPrint = () => {
      try {
        printWindow.focus()
        printWindow.print()
      } catch {
        // ignore
      }
    }
    printWindow.addEventListener("load", triggerPrint)
    window.setTimeout(triggerPrint, 750)
  } else {
    const anchor = document.createElement("a")
    anchor.href = url
    anchor.download = fileName
    anchor.click()
  }

  window.setTimeout(() => URL.revokeObjectURL(url), 60_000)
}

export async function emailRequisitionPurchaseOrder(
  id: number,
  payload: { message?: string | null } = {}
) {
  return request<RequisitionRecord>(
    `${BASE_PATH}/requisitions/${id}/purchase-order/email`,
    {
      method: "POST",
      body: JSON.stringify(payload),
    }
  )
}

export async function deleteRequisition(id: number) {
  return apiRequest<ApiListResponse<null>>(`${BASE_PATH}/requisitions/${id}`, {
    method: "DELETE",
    token: getToken(),
  })
}

export async function fetchAssignedCostCenter() {
  return request<CostCenter | null>(`${BASE_PATH}/costCenters/assigned/me`)
}
