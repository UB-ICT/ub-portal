import { apiRequest } from "@/lib/api/client"
import { readStoredAccessToken } from "@/lib/auth/storage"
import type { RequisitionAttachment } from "@/lib/api/attachments"
import type { RequisitionPriority } from "@/features/purchase-order-requisition/lib/requisition-priorities"

export type { RequisitionPriority } from "@/features/purchase-order-requisition/lib/requisition-priorities"

type ApiListResponse<T> = {
  success: boolean
  data: T
  message?: string
}

export type CostCenter = {
  id: number
  name: string
}

export type RequisitionStatusRecord = {
  id: number
  name: string
}

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
  line_item_number: string
  description: string
  quantity: number
  unit_cost: number
  comments?: string
}

export type RequisitionLineItem = RequisitionLineItemInput & {
  id: number
  line_item_number: string
  total: number | string
  requisition_id: number
}

export type PipelineStage = {
  id: number
  name: string
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
  cost_center_id: number
  date_prepared: string
  status_id: number
  currency_id: number
  total: number | string
  stage_id: number
  priority: RequisitionPriority
  expected_delivery_date: string | null
  is_recurring: boolean
  reminder_date: string | null
  items?: RequisitionLineItem[]
  suppliers?: RequisitionSupplierPivot[]
  attachments?: RequisitionAttachment[]
  cost_center?: CostCenter
  status?: RequisitionStatusRecord
  is_editable?: boolean
  pipeline?: Pipeline
  current_stage_sequence?: number
}

export type RequisitionSupplierInput = {
  supplier_id: number
  is_recommended: boolean
  quoted_total?: number | null
  quote_reference_number?: string | null
}

export type CreateRequisitionPayload = {
  cost_center_id: number
  currency_id: number
  priority: RequisitionPriority
  expected_delivery_date?: string | null
  is_recurring: boolean
  reminder_date?: string | null
  suppliers?: RequisitionSupplierInput[]
  items: RequisitionLineItemInput[]
}

export type UpdateRequisitionPayload = CreateRequisitionPayload & {
  number?: string
  activity_comment?: string | null
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

export async function deleteRequisition(id: number) {
  return apiRequest<ApiListResponse<null>>(`${BASE_PATH}/requisitions/${id}`, {
    method: "DELETE",
    token: getToken(),
  })
}

export async function fetchAssignedCostCenter() {
  return request<CostCenter | null>(`${BASE_PATH}/costCenters/assigned/me`)
}
