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
  chart_of_account_id: number
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
  discount_amount?: number | string
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
  discount_type?: "none" | "percent" | "amount" | null
  discount_value?: number | string | null
  discount_amount?: number | string | null
  stage_id: number
  priority: RequisitionPriority
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
  expected_delivery_date?: string | null
  is_recurring: boolean
  requires_downpayment?: boolean
  quote_waiver_reason?: string | null
  reminder_date?: string | null
  discount_type?: "none" | "percent" | "amount"
  discount_value?: number
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

export async function fetchRequisitions() {
  return request<RequisitionRecord[]>(`${BASE_PATH}/requisitions`)
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
