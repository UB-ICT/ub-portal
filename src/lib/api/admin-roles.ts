import { apiRequest } from "@/lib/api/client"
import { readStoredAccessToken } from "@/lib/auth/storage"

export type AdminRoleRecord = {
  id: string
  role_name: string
  description: string | null
  permissions_count: number
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
