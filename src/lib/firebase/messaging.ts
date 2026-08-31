import { initializeApp, type FirebaseApp } from "firebase/app"
import {
  getMessaging,
  getToken,
  isSupported,
  onMessage,
  type MessagePayload,
  type Messaging,
} from "firebase/messaging"

import {
  getFirebaseVapidKey,
  getFirebaseWebConfig,
  isFirebaseMessagingConfigured,
} from "@/lib/firebase/config"

const SERVICE_WORKER_PATH = "/firebase-messaging-sw.js"

let firebaseApp: FirebaseApp | null = null
let messagingClient: Messaging | null = null
let serviceWorkerRegistration: ServiceWorkerRegistration | null = null

async function ensureServiceWorkerRegistration() {
  if (serviceWorkerRegistration) {
    return serviceWorkerRegistration
  }

  if (!("serviceWorker" in navigator)) {
    return null
  }

  serviceWorkerRegistration = await navigator.serviceWorker.register(
    SERVICE_WORKER_PATH
  )

  return serviceWorkerRegistration
}

async function ensureMessagingClient() {
  if (messagingClient) {
    return messagingClient
  }

  if (!(await isSupported()) || !isFirebaseMessagingConfigured()) {
    return null
  }

  const config = getFirebaseWebConfig()

  if (!config) {
    return null
  }

  firebaseApp = initializeApp(config)
  messagingClient = getMessaging(firebaseApp)

  return messagingClient
}

export async function requestNotificationPermission() {
  if (!("Notification" in window)) {
    return "denied" as NotificationPermission
  }

  if (Notification.permission === "granted") {
    return Notification.permission
  }

  if (Notification.permission === "denied") {
    return Notification.permission
  }

  return Notification.requestPermission()
}

export async function registerFcmDeviceToken() {
  const permission = await requestNotificationPermission()

  if (permission !== "granted") {
    return null
  }

  const messaging = await ensureMessagingClient()

  if (!messaging) {
    return null
  }

  const registration = await ensureServiceWorkerRegistration()

  if (!registration) {
    return null
  }

  const vapidKey = getFirebaseVapidKey()

  if (!vapidKey) {
    return null
  }

  return getToken(messaging, {
    vapidKey,
    serviceWorkerRegistration: registration,
  })
}

export async function subscribeToForegroundMessages(
  handler: (payload: MessagePayload) => void
) {
  const messaging = await ensureMessagingClient()

  if (!messaging) {
    return () => undefined
  }

  return onMessage(messaging, handler)
}

export function showBrowserNotification(payload: MessagePayload) {
  if (!("Notification" in window) || Notification.permission !== "granted") {
    return
  }

  const title =
    payload.notification?.title ?? "New requisition notification"
  const body =
    payload.notification?.body ??
    (typeof payload.data?.message === "string" ? payload.data.message : "")

  const requisitionId = payload.data?.requisition_id
  const url =
    typeof payload.data?.url === "string"
      ? payload.data.url
      : requisitionId
        ? `/requisitions/forms?requisition=${requisitionId}`
        : "/"

  const notification = new Notification(title, {
    body,
    icon: "/vite.svg",
    tag: payload.data?.type ?? "portal-notification",
    data: {
      url,
      requisition_id: requisitionId,
    },
  })

  notification.onclick = () => {
    window.focus()
    window.location.assign(url)
    notification.close()
  }
}
