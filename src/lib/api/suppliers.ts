import { apiRequest } from "@/lib/api/client"
import { readStoredAccessToken } from "@/lib/auth/storage"

type ApiResponse<T> = {
  success: boolean
  data: T
  meta?: SupplierListMeta
  message?: string
}

export type SupplierStatus = {
  id: number
  name: string
}

export type Supplier = {
  id: number
  name: string
  contact_person?: string | null
  phone_number?: string | null
  email?: string | null
  TIN?: string | null
  notes?: string | null
  status_id?: number | null
  approved_by_user_id?: string | null
  status?: SupplierStatus | null
}

export type SupplierListMeta = {
  can_review_suppliers: boolean
}

export type CreateSupplierQuickPayload = {
  name: string
  contact_person?: string
  phone_number?: string
  email?: string
  TIN?: string
  notes?: string
}

export type CreateSupplierPayload = {
  name: string
  contact_person: string
  phone_number: string
  email: string
  TIN: string
  notes?: string
}

export type UpdateSupplierPayload = CreateSupplierPayload

export type SupplierReviewPayload = {
  comments?: string
}

const BASE_PATH = "/requisitionSystem/suppliers"

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

  return response
}

export async function fetchSuppliers(options?: { excludeDeleted?: boolean }) {
  const query = options?.excludeDeleted ? "?exclude_deleted=1" : ""
  const response = await request<Supplier[]>(`${BASE_PATH}${query}`)

  return {
    suppliers: response.data,
    meta: response.meta ?? { can_review_suppliers: false },
  }
}

export async function fetchSupplier(id: number) {
  const response = await request<Supplier>(`${BASE_PATH}/${id}`)
  return response.data
}

export async function createSupplierQuick(payload: CreateSupplierQuickPayload) {
  const response = await request<Supplier>(`${BASE_PATH}/quick`, {
    method: "POST",
    body: JSON.stringify(payload),
  })

  return response.data
}

export async function createSupplier(payload: CreateSupplierPayload) {
  const response = await request<Supplier>(BASE_PATH, {
    method: "POST",
    body: JSON.stringify(payload),
  })

  return response.data
}

export async function updateSupplier(id: number, payload: UpdateSupplierPayload) {
  const response = await request<Supplier>(`${BASE_PATH}/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  })

  return response.data
}

export async function deleteSupplier(id: number) {
  const response = await request<Supplier>(`${BASE_PATH}/${id}`, {
    method: "DELETE",
  })

  return response.data
}

export async function approveSupplier(id: number, payload?: SupplierReviewPayload) {
  const response = await request<Supplier>(`${BASE_PATH}/${id}/approve`, {
    method: "POST",
    body: JSON.stringify(payload ?? {}),
  })

  return response.data
}

export async function rejectSupplier(id: number, payload?: SupplierReviewPayload) {
  const response = await request<Supplier>(`${BASE_PATH}/${id}/reject`, {
    method: "POST",
    body: JSON.stringify(payload ?? {}),
  })

  return response.data
}

export async function activateSupplier(id: number) {
  const response = await request<Supplier>(`${BASE_PATH}/${id}/activate`, {
    method: "POST",
  })

  return response.data
}
