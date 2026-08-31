import { useEffect } from "react"

import { registerDeviceToken } from "@/lib/api/notifications"
import {
  isFirebaseMessagingConfigured,
} from "@/lib/firebase/config"
import {
  playNotificationSound,
} from "@/lib/firebase/notification-sound"
import {
  registerFcmDeviceToken,
  showBrowserNotification,
  subscribeToForegroundMessages,
} from "@/lib/firebase/messaging"
import { useNotificationsStore } from "@/store/notifications-store"

export function FcmNotificationListener() {
  useEffect(() => {
    if (!isFirebaseMessagingConfigured()) {
      return
    }

    let unsubscribe: (() => void) | undefined
    let cancelled = false

    const setup = async () => {
      const token = await registerFcmDeviceToken()

      if (cancelled || !token) {
        return
      }

      try {
        await registerDeviceToken(token)
      } catch {
        // Token registration can fail when offline; foreground push may still work.
      }

      unsubscribe = await subscribeToForegroundMessages((payload) => {
        playNotificationSound()
        showBrowserNotification(payload)
        void useNotificationsStore.getState().refreshUnreadCount()
      })
    }

    void setup()

    return () => {
      cancelled = true
      unsubscribe?.()
    }
  }, [])

  return null
}
