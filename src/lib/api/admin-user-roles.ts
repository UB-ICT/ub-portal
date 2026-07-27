import { apiRequest } from "@/lib/api/client"
import { readStoredAccessToken } from "@/lib/auth/storage"

export type UserRoleAssignment = {
  user_id: string
  role_id: string
  user_name: string
  user_email: string
  role_name: string
}

type UserRoleMutationResponse = {
  success: boolean
  message: string
  data: UserRoleAssignment
}

function getToken(token = readStoredAccessToken()) {
  if (!token) {
    throw new Error("No stored access token is available.")
  }

  return token
}

export async function attachUserRole(
  userId: string,
  roleId: string,
  token = readStoredAccessToken()
) {
  const response = await apiRequest<UserRoleMutationResponse>("/user-roles", {
    method: "POST",
    body: JSON.stringify({ user_id: userId, role_id: roleId }),
    token: getToken(token),
  })

  return response.data
}

export async function detachUserRole(
  userId: string,
  roleId: string,
  token = readStoredAccessToken()
) {
  await apiRequest<{ success: boolean; message: string }>(
    `/user-roles/${userId}/${roleId}`,
    {
      method: "DELETE",
      token: getToken(token),
    }
  )
}
