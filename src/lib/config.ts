export type AppEnvironment = "local" | "development" | "production"

/** Fallback API host when VITE_API_HOST is not set. */
export const DEFAULT_API_HOST = "http://localhost:3031"

const DEFAULT_API_BASE_URL = `${DEFAULT_API_HOST}/api/v1`
const DEFAULT_GOOGLE_SSO_SYSTEM = "portal"
const DEFAULT_APP_TITLE = "UB Portal"
const DEFAULT_PORTAL_HOST = "http://localhost:5173"

function normalizeBaseUrl(url: string) {
  return url.replace(/\/$/, "")
}

function resolveAppEnvironment(): AppEnvironment {
  const configured = import.meta.env.VITE_APP_ENV

  if (
    configured === "local" ||
    configured === "development" ||
    configured === "production"
  ) {
    return configured
  }

  if (import.meta.env.PROD) {
    return "production"
  }

  if (import.meta.env.MODE === "development") {
    return "development"
  }

  return "local"
}

export const APP_ENV = resolveAppEnvironment()
export const IS_PRODUCTION = APP_ENV === "production"
export const IS_DEVELOPMENT = APP_ENV === "development"
export const IS_LOCAL = APP_ENV === "local"

export const API_HOST = normalizeBaseUrl(
  import.meta.env.VITE_API_HOST || DEFAULT_API_HOST
)

export const API_BASE_URL = normalizeBaseUrl(
  import.meta.env.VITE_API_BASE_URL || `${API_HOST}/api/v1`
)

export const GOOGLE_SSO_SYSTEM =
  import.meta.env.VITE_GOOGLE_SSO_SYSTEM || DEFAULT_GOOGLE_SSO_SYSTEM

export const APP_TITLE =
  import.meta.env.VITE_APP_TITLE || DEFAULT_APP_TITLE

export const PORTAL_HOST = normalizeBaseUrl(
  import.meta.env.VITE_PORTAL_HOST || DEFAULT_PORTAL_HOST
)

export function buildApiUrl(endpoint: string) {
  const normalizedEndpoint = endpoint.startsWith("/")
    ? endpoint.slice(1)
    : endpoint

  return `${API_BASE_URL}/${normalizedEndpoint}`
}

export function buildHostUrl(endpoint: string) {
  const normalizedEndpoint = endpoint.startsWith("/")
    ? endpoint.slice(1)
    : endpoint

  return `${API_HOST}/${normalizedEndpoint}`
}

export const appConfig = {
  appEnv: APP_ENV,
  appTitle: APP_TITLE,
  apiHost: API_HOST,
  apiBaseUrl: API_BASE_URL,
  googleSsoSystem: GOOGLE_SSO_SYSTEM,
  portalHost: PORTAL_HOST,
  isProduction: IS_PRODUCTION,
  isDevelopment: IS_DEVELOPMENT,
  isLocal: IS_LOCAL,
} as const
