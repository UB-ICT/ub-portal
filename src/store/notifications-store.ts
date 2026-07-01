import { create } from "zustand"

import {
  fetchNotifications,
  fetchUnreadNotificationCount,
  markAllNotificationsRead,
  markNotificationRead,
} from "@/lib/api/notifications"
import type { PortalNotification } from "@/lib/api/notifications"
import { readStoredAccessToken } from "@/lib/auth/storage"

type NotificationsState = {
  notifications: PortalNotification[]
  unreadCount: number
  isLoading: boolean
  error: string | null
  hasFetched: boolean
  fetchNotifications: (force?: boolean) => Promise<PortalNotification[]>
  refreshUnreadCount: () => Promise<number>
  markAsRead: (notificationId: string) => Promise<void>
  markAllAsRead: () => Promise<void>
  reset: () => void
}

const initialState = {
  notifications: [] as PortalNotification[],
  unreadCount: 0,
  isLoading: false,
  error: null as string | null,
  hasFetched: false,
}

let notificationsFetchPromise: Promise<PortalNotification[]> | null = null

export const useNotificationsStore = create<NotificationsState>(
  (set, get) => ({
    ...initialState,
    fetchNotifications: async (force = false) => {
      if (!force && get().hasFetched && !get().isLoading) {
        return get().notifications
      }

      if (notificationsFetchPromise) {
        return notificationsFetchPromise
      }

      const token = readStoredAccessToken()

      if (!token) {
        set({ ...initialState, hasFetched: true })
        return []
      }

      notificationsFetchPromise = (async () => {
        set({ isLoading: true, error: null })

        try {
          const { notifications, unreadCount } = await fetchNotifications(
            20,
            token
          )
          set({
            notifications,
            unreadCount,
            isLoading: false,
            error: null,
            hasFetched: true,
          })
          return notifications
        } catch (error) {
          set({
            notifications: [],
            isLoading: false,
            error:
              error instanceof Error
                ? error.message
                : "Failed to load notifications.",
            hasFetched: true,
          })
          return []
        } finally {
          notificationsFetchPromise = null
        }
      })()

      return notificationsFetchPromise
    },
    refreshUnreadCount: async () => {
      const token = readStoredAccessToken()

      if (!token) {
        return 0
      }

      const unreadCount = await fetchUnreadNotificationCount(token)
      set({ unreadCount })
      return unreadCount
    },
    markAsRead: async (notificationId: string) => {
      const notification = get().notifications.find(
        (item) => item.id === notificationId
      )

      if (!notification || notification.read_at) {
        return
      }

      set({
        notifications: get().notifications.map((item) =>
          item.id === notificationId
            ? { ...item, read_at: new Date().toISOString() }
            : item
        ),
        unreadCount: Math.max(0, get().unreadCount - 1),
      })

      await markNotificationRead(notificationId)
    },
    markAllAsRead: async () => {
      const { notifications, unreadCount } = get()

      const nextNotifications = notifications.map((item) => ({
        ...item,
        read_at: item.read_at ?? new Date().toISOString(),
      }))

      set({
        notifications: nextNotifications,
        unreadCount: 0,
      })

      try {
        await markAllNotificationsRead()
      } catch (error) {
        set({
          notifications,
          unreadCount,
          error:
            error instanceof Error
              ? error.message
              : "Failed to mark notifications as read.",
        })
      }
    },
    reset: () => {
      notificationsFetchPromise = null
      set(initialState)
    },
  })
)
