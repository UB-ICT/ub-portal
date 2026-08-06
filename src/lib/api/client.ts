import { buildApiUrl } from "@/lib/config"

type ApiRequestOptions = RequestInit & {
  token?: string | null
}

export class ApiError extends Error {
  status: number
  payload: unknown

  constructor(message: string, status: number, payload: unknown) {
    super(message)
    this.name = "ApiError"
    this.status = status
    this.payload = payload
  }
}

async function parseResponseBody(response: Response) {
  const contentType = response.headers.get("content-type") || ""

  if (contentType.includes("application/json")) {
    return response.json()
  }

  return response.text()
}

function buildErrorMessage(status: number, payload: unknown) {
  if (payload && typeof payload === "object") {
    if ("message" in payload && typeof payload.message === "string") {
      return payload.message
    }

    if ("error" in payload && typeof payload.error === "string") {
      return payload.error
    }
  }

  return `Request failed with status ${status}.`
}

export async function apiRequest<T>(
  endpoint: string,
  options: ApiRequestOptions = {}
) {
  const { token, headers, ...requestInit } = options
  const isFormData = requestInit.body instanceof FormData
  const response = await fetch(buildApiUrl(endpoint), {
    ...requestInit,
    cache: requestInit.cache ?? "no-store",
    headers: {
      Accept: "application/json",
      ...(requestInit.body && !isFormData
        ? { "Content-Type": "application/json" }
        : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
  })

  const payload = await parseResponseBody(response)

  if (!response.ok) {
    throw new ApiError(buildErrorMessage(response.status, payload), response.status, payload)
  }

  return payload as T
}
