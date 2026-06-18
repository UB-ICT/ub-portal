import { apiRequest } from "@/lib/api/client"
import { readStoredAccessToken } from "@/lib/auth/storage"

type ApiResponse<T> = {
  success: boolean
  data: T
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
  status?: SupplierStatus | null
}

export type CreateSupplierPayload = {
  name: string
  contact_person?: string
  phone_number?: string
  email?: string
  TIN?: string
  notes?: string
}

export type UpdateSupplierPayload = CreateSupplierPayload

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

  return response.data
}

export async function fetchSuppliers() {
  return request<Supplier[]>(BASE_PATH)
}

export async function fetchSupplier(id: number) {
  return request<Supplier>(`${BASE_PATH}/${id}`)
}

export async function createSupplier(payload: CreateSupplierPayload) {
  return request<Supplier>(BASE_PATH, {
    method: "POST",
    body: JSON.stringify(payload),
  })
}

export async function updateSupplier(id: number, payload: UpdateSupplierPayload) {
  return request<Supplier>(`${BASE_PATH}/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  })
}

export async function deleteSupplier(id: number) {
  return apiRequest<ApiResponse<null>>(`${BASE_PATH}/${id}`, {
    method: "DELETE",
    token: getToken(),
  })
}
