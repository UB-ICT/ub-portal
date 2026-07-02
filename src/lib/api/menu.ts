import { apiRequest } from "@/lib/api/client"
import { readStoredAccessToken } from "@/lib/auth/storage"

export type PortalApplication = {
  id: string
  label: string
  path: string
  icon: string | null
  sort_order: number
}

export type PortalMenuItem = {
  id: string
  label: string
  path: string
  icon: string | null
  sort_order: number
  type?: string | null
  role_id?: string | null
  parent_id?: string | null
}

export type ActiveApplicationMenu = {
  id: string
  label: string
  path: string
  icon: string | null
  sort_order: number
  children: PortalMenuItem[]
}

export type ProfileMenuResponse = {
  user: { name: string; email: string; initials: string }
  navigation: PortalMenuItem[]
  external_links: PortalMenuItem[]
}

export async function fetchMyApplications(token = readStoredAccessToken()) {
  if (!token) {
    return []
  }

  return apiRequest<PortalApplication[]>("/menu/my-applications", { token })
}

export async function fetchProfileMenu(token = readStoredAccessToken()) {
  if (!token) {
    return null
  }

  return apiRequest<ProfileMenuResponse>("/menu/profile", { token })
}

export async function fetchActiveApplicationMenu(
  applicationId: string,
  token = readStoredAccessToken()
) {
  if (!token) {
    throw new Error("No stored access token is available.")
  }

  const searchParams = new URLSearchParams({ application_id: applicationId })

  return apiRequest<ActiveApplicationMenu>(
    `/menu/my-application?${searchParams.toString()}`,
    { token }
  )
}
