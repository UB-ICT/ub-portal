import { apiRequest } from "@/lib/api/client"
import { readStoredAccessToken } from "@/lib/auth/storage"

export type AdminUserRole = {
  id: string
  role_name: string
}

export type AdminUserRecord = {
  id: string
  name: string
  email: string
  status: string | null
  last_active: string | null
  profile_picture: string | null
  roles: AdminUserRole[]
}

type UsersIndexResponse = {
  success: boolean
  data: AdminUserRecord[]
  count: number
}

type UserMutationResponse = {
  success: boolean
  message: string
  data: AdminUserRecord
}

export type AdminUserPayload = {
  name: string
  email: string
  status?: string
}

function getToken(token = readStoredAccessToken()) {
  if (!token) {
    throw new Error("No stored access token is available.")
  }

  return token
}

export async function fetchUsers(token = readStoredAccessToken()) {
  return apiRequest<UsersIndexResponse>("/users", {
    token: getToken(token),
  })
}

export async function createUser(
  payload: AdminUserPayload,
  token = readStoredAccessToken()
) {
  const response = await apiRequest<UserMutationResponse>("/users", {
    method: "POST",
    body: JSON.stringify(payload),
    token: getToken(token),
  })

  return response.data
}

export async function updateUser(
  id: string,
  payload: Partial<AdminUserPayload>,
  token = readStoredAccessToken()
) {
  const response = await apiRequest<UserMutationResponse>(`/users/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
    token: getToken(token),
  })

  return response.data
}

export async function deleteUser(id: string, token = readStoredAccessToken()) {
  await apiRequest<{ success: boolean; message: string }>(`/users/${id}`, {
    method: "DELETE",
    token: getToken(token),
  })
}
