import { apiRequest } from "@/lib/api/client"
import { readStoredAccessToken } from "@/lib/auth/storage"

export type AdminApplicationStatus = "active" | "maintenance" | "disabled"

export type AdminApplicationRecord = {
  id: string
  label: string
  path: string
  icon: string | null
  status: AdminApplicationStatus
  description: string | null
  category: string | null
  sort_order: number
}

export type ApplicationCatalog = {
  total: number
  applications: AdminApplicationRecord[]
}

export type ApplicationPayload = {
  label: string
  path: string
  icon?: string | null
  status?: AdminApplicationStatus
  description?: string | null
  category?: string | null
  role_id?: string | null
  parent_id?: string | null
  sort_order?: number
}

function getToken(token = readStoredAccessToken()) {
  if (!token) {
    throw new Error("No stored access token is available.")
  }

  return token
}

export async function fetchApplicationCatalog(token = readStoredAccessToken()) {
  return apiRequest<ApplicationCatalog>("/menu/catalog", {
    token: getToken(token),
  })
}

export async function createApplication(
  payload: ApplicationPayload,
  token = readStoredAccessToken()
) {
  return apiRequest<AdminApplicationRecord>("/menu", {
    method: "POST",
    body: JSON.stringify(payload),
    token: getToken(token),
  })
}

export async function uploadApplicationIcon(
  file: File,
  token = readStoredAccessToken()
) {
  const formData = new FormData()
  formData.append("icon", file)

  return apiRequest<{ url: string }>("/menu/icon", {
    method: "POST",
    body: formData,
    token: getToken(token),
  })
}

export async function updateApplication(
  id: string,
  payload: Partial<ApplicationPayload>,
  token = readStoredAccessToken()
) {
  return apiRequest<AdminApplicationRecord>(`/menu/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
    token: getToken(token),
  })
}
