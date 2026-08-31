export type FirebaseWebConfig = {
  apiKey: string
  authDomain: string
  projectId: string
  storageBucket: string
  messagingSenderId: string
  appId: string
}

function readEnv(name: keyof ImportMetaEnv) {
  const value = import.meta.env[name]

  return typeof value === "string" ? value.trim() : ""
}

export function getFirebaseWebConfig(): FirebaseWebConfig | null {
  const config: FirebaseWebConfig = {
    apiKey: readEnv("VITE_FIREBASE_API_KEY"),
    authDomain: readEnv("VITE_FIREBASE_AUTH_DOMAIN"),
    projectId: readEnv("VITE_FIREBASE_PROJECT_ID"),
    storageBucket: readEnv("VITE_FIREBASE_STORAGE_BUCKET"),
    messagingSenderId: readEnv("VITE_FIREBASE_MESSAGING_SENDER_ID"),
    appId: readEnv("VITE_FIREBASE_APP_ID"),
  }

  const hasRequiredValues = Object.values(config).every((value) => value.length > 0)

  return hasRequiredValues ? config : null
}

export function getFirebaseVapidKey() {
  return readEnv("VITE_FIREBASE_VAPID_KEY")
}

export function isFirebaseMessagingConfigured() {
  return getFirebaseWebConfig() !== null && getFirebaseVapidKey().length > 0
}
