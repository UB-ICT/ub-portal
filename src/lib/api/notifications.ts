import { apiRequest } from "@/lib/api/client"
import { readStoredAccessToken } from "@/lib/auth/storage"

export type NotificationData = {
  type: string
  message: string
  requisition_id?: string
  requisition_number?: string
  supplier_id?: string
  supplier_name?: string
  submitted_by?: string | null
}

export type PortalNotification = {
  id: string
  type: string
  data: NotificationData
  read_at: string | null
  created_at: string
  updated_at: string
}

type NotificationsListResponse = {
  success: boolean
  unread_count: number
  data: PortalNotification[]
}

type UnreadCountResponse = {
  success: boolean
  count: number
}

export async function fetchNotifications(
  limit = 20,
  token = readStoredAccessToken()
) {
  if (!token) {
    return { notifications: [] as PortalNotification[], unreadCount: 0 }
  }

  const response = await apiRequest<NotificationsListResponse>(
    `/notifications?limit=${limit}`,
    { token }
  )

  return { notifications: response.data, unreadCount: response.unread_count }
}

export async function fetchUnreadNotificationCount(
  token = readStoredAccessToken()
) {
  if (!token) {
    return 0
  }

  const response = await apiRequest<UnreadCountResponse>(
    "/notifications/unread-count",
    { token }
  )

  return response.count
}

export async function markNotificationRead(
  notificationId: string,
  token = readStoredAccessToken()
) {
  if (!token) {
    return
  }

  await apiRequest(`/notifications/${notificationId}/read`, {
    method: "POST",
    token,
  })
}

export async function markAllNotificationsRead(
  token = readStoredAccessToken()
) {
  if (!token) {
    return
  }

  await apiRequest("/notifications/read-all", { method: "POST", token })
}
