import { apiRequest } from "@/lib/api/client"
import { readStoredAccessToken } from "@/lib/auth/storage"

export type AdminMenuRole = {
  id: string
  role_name: string
}

export type AdminMenuParent = {
  id: string
  label: string
  path: string
  type: string
} | null

export type AdminMenuRecord = {
  id: string
  label: string
  path: string
  icon: string | null
  type: string
  status: string
  description: string | null
  category: string | null
  parent_id: string | null
  sort_order: number
  roles: AdminMenuRole[]
  roles_count: number
  children_count: number
  parent?: AdminMenuParent
}

export type AdminMenuPayload = {
  label: string
  path: string
  icon?: string | null
  type?: string
  status?: string
  description?: string | null
  category?: string | null
  parent_id?: string | null
  sort_order?: number
  role_ids?: string[]
}

function getToken(token = readStoredAccessToken()) {
  if (!token) {
    throw new Error("No stored access token is available.")
  }

  return token
}

export async function fetchMenus(
  options: { parentId?: string | null; rootsOnly?: boolean } = {},
  token = readStoredAccessToken()
) {
  const params = new URLSearchParams()

  if (options.rootsOnly) {
    params.set("roots_only", "1")
  } else if (options.parentId === null) {
    params.set("parent_id", "null")
  } else if (options.parentId) {
    params.set("parent_id", options.parentId)
  }

  const query = params.toString()

  return apiRequest<AdminMenuRecord[]>(`/menu${query ? `?${query}` : ""}`, {
    token: getToken(token),
  })
}

export async function createMenu(
  payload: AdminMenuPayload,
  token = readStoredAccessToken()
) {
  return apiRequest<AdminMenuRecord>("/menu", {
    method: "POST",
    body: JSON.stringify(payload),
    token: getToken(token),
  })
}

export async function updateMenu(
  id: string,
  payload: Partial<AdminMenuPayload>,
  token = readStoredAccessToken()
) {
  return apiRequest<AdminMenuRecord>(`/menu/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
    token: getToken(token),
  })
}

export async function syncMenuRoles(
  id: string,
  roleIds: string[],
  token = readStoredAccessToken()
) {
  const response = await apiRequest<{ message: string; menu: AdminMenuRecord }>(
    `/menu/${id}/roles`,
    {
      method: "PUT",
      body: JSON.stringify({ role_ids: roleIds }),
      token: getToken(token),
    }
  )

  return response.menu
}

export async function deleteMenu(id: string, token = readStoredAccessToken()) {
  await apiRequest<{ message: string }>(`/menu/${id}`, {
    method: "DELETE",
    token: getToken(token),
  })
}
