const DEFAULT_API_HOST = "http://localhost:3031"

export const API_HOST = import.meta.env.VITE_API_HOST || DEFAULT_API_HOST
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || `${API_HOST}/api/v1`
export const GOOGLE_SSO_SYSTEM =
  import.meta.env.VITE_GOOGLE_SSO_SYSTEM || "annual"

export function buildApiUrl(endpoint: string) {
  const normalizedEndpoint = endpoint.startsWith("/")
    ? endpoint.slice(1)
    : endpoint

  return `${API_BASE_URL.replace(/\/$/, "")}/${normalizedEndpoint}`
}

export function buildHostUrl(endpoint: string) {
  const normalizedEndpoint = endpoint.startsWith("/")
    ? endpoint.slice(1)
    : endpoint

  return `${API_HOST.replace(/\/$/, "")}/${normalizedEndpoint}`
}
