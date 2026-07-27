import { apiRequest } from "@/lib/api/client"
import { readStoredAccessToken } from "@/lib/auth/storage"
import type { AdminPermissionRecord } from "@/lib/api/admin-roles"

function getToken(token = readStoredAccessToken()) {
  if (!token) {
    throw new Error("No stored access token is available.")
  }

  return token
}

// Backend returns a plain array (no wrapper/total field), unlike /users.
export async function fetchPermissions(token = readStoredAccessToken()) {
  return apiRequest<AdminPermissionRecord[]>("/permissions", {
    token: getToken(token),
  })
}
