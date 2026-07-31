import { apiRequest } from "@/lib/api/client"
import { readStoredAccessToken } from "@/lib/auth/storage"

export type AdminPermissionRecord = {
  id: string
  category: string
  action_name: string
}

export type AdminRoleRecord = {
  id: string
  role_name: string
  description: string | null
  permissions: AdminPermissionRecord[]
  permissions_count: number
  users_count: number
}

export type AdminRolePayload = {
  role_name: string
  description?: string | null
}

// Backend returns role.load('permissions') on attach/detach - permissions_count
// and users_count aren't recomputed on that response, so callers should merge
// this onto the previously known role rather than replacing it wholesale.
type RolePermissionsMutation = {
  id: string
  permissions: AdminPermissionRecord[]
}

type RolePermissionMutationResponse = {
  message: string
  role: RolePermissionsMutation
}

function getToken(token = readStoredAccessToken()) {
  if (!token) {
    throw new Error("No stored access token is available.")
  }

  return token
}

// Backend returns a plain array (no wrapper/total field), unlike /users.
export async function fetchRoles(token = readStoredAccessToken()) {
  return apiRequest<AdminRoleRecord[]>("/roles", {
    token: getToken(token),
  })
}

export async function createRole(
  payload: AdminRolePayload,
  token = readStoredAccessToken()
) {
  return apiRequest<AdminRoleRecord>("/roles", {
    method: "POST",
    body: JSON.stringify(payload),
    token: getToken(token),
  })
}

export async function updateRole(
  id: string,
  payload: Partial<AdminRolePayload>,
  token = readStoredAccessToken()
) {
  return apiRequest<AdminRoleRecord>(`/roles/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
    token: getToken(token),
  })
}

export async function deleteRole(id: string, token = readStoredAccessToken()) {
  await apiRequest<{ message: string }>(`/roles/${id}`, {
    method: "DELETE",
    token: getToken(token),
  })
}

export async function attachRolePermission(
  roleId: string,
  permissionId: string,
  token = readStoredAccessToken()
) {
  const response = await apiRequest<RolePermissionMutationResponse>(
    `/roles/${roleId}/permissions/attach`,
    {
      method: "POST",
      body: JSON.stringify({ permission_ids: [permissionId] }),
      token: getToken(token),
    }
  )

  return response.role
}

export async function detachRolePermission(
  roleId: string,
  permissionId: string,
  token = readStoredAccessToken()
) {
  const response = await apiRequest<RolePermissionMutationResponse>(
    `/roles/${roleId}/permissions/${permissionId}`,
    {
      method: "DELETE",
      token: getToken(token),
    }
  )

  return response.role
}
