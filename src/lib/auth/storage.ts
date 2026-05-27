import type { AuthCallbackState, StoredAuthProfile } from "@/lib/auth/types"

export const AUTH_TOKEN_KEY = "access_token"
export const AUTH_PROFILE_KEY = "ub_portal_auth_profile"
const AUTH_COOKIE_PATH = "/"

function isBrowser() {
  return typeof window !== "undefined"
}

function getStoredLocalItem(key: string) {
  if (!isBrowser()) {
    return null
  }

  return window.localStorage.getItem(key)
}

function readCookie(name: string) {
  if (!isBrowser()) {
    return null
  }

  const cookiePrefix = `${encodeURIComponent(name)}=`
  const matchingCookie = document.cookie
    .split("; ")
    .find((cookie) => cookie.startsWith(cookiePrefix))

  if (!matchingCookie) {
    return null
  }

  return decodeURIComponent(matchingCookie.slice(cookiePrefix.length))
}

function writeCookie(name: string, value: string) {
  if (!isBrowser()) {
    return
  }

  const secureAttribute = window.location.protocol === "https:" ? "; Secure" : ""
  document.cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)}; Path=${AUTH_COOKIE_PATH}; SameSite=Lax${secureAttribute}`
}

function deleteCookie(name: string) {
  if (!isBrowser()) {
    return
  }

  const secureAttribute = window.location.protocol === "https:" ? "; Secure" : ""
  document.cookie = `${encodeURIComponent(name)}=; Path=${AUTH_COOKIE_PATH}; Max-Age=0; SameSite=Lax${secureAttribute}`
}

export function readStoredAccessToken() {
  return readCookie(AUTH_TOKEN_KEY)
}

export function hasStoredAccessToken() {
  return Boolean(readStoredAccessToken())
}

export function writeStoredAccessToken(token: string) {
  writeCookie(AUTH_TOKEN_KEY, token)
}

export function readStoredAuthProfile(): StoredAuthProfile | null {
  const rawProfile = getStoredLocalItem(AUTH_PROFILE_KEY)

  if (!rawProfile) {
    return null
  }

  try {
    const parsedProfile = JSON.parse(rawProfile) as Partial<StoredAuthProfile>

    if (!parsedProfile.name || !parsedProfile.email) {
      return null
    }

    return {
      name: parsedProfile.name,
      email: parsedProfile.email,
      system: parsedProfile.system ?? null,
    }
  } catch {
    return null
  }
}

export function writeStoredAuthProfile(profile: StoredAuthProfile) {
  if (!isBrowser()) {
    return
  }

  window.localStorage.setItem(AUTH_PROFILE_KEY, JSON.stringify(profile))
}

export function clearStoredAuth() {
  if (!isBrowser()) {
    return
  }

  deleteCookie(AUTH_TOKEN_KEY)
  window.localStorage.removeItem(AUTH_PROFILE_KEY)
}

function buildCallbackErrorMessage(errorCode: string) {
  switch (errorCode) {
    case "user_creation_failed":
      return "We could not create your UB Portal account. Please try again."
    case "unauthorized":
      return "Your Google account is not authorized for UB Portal."
    case "callback_failed":
      return "Google sign-in could not be completed. Please try again."
    default:
      return "Google sign-in failed. Please try again."
  }
}

export function syncAuthCallbackFromSearch(search: string): AuthCallbackState {
  if (!isBrowser()) {
    return { status: "idle" }
  }

  const searchParams = new URLSearchParams(search)
  const error = searchParams.get("error")
  const token = searchParams.get("token")
  const name = searchParams.get("name")
  const email = searchParams.get("email")
  const system = searchParams.get("system")

  const hasCallbackParams = [error, token, name, email, system].some(
    (value) => value !== null
  )

  if (!hasCallbackParams) {
    return { status: "idle" }
  }

  if (error) {
    clearStoredAuth()
    return {
      status: "error",
      message: buildCallbackErrorMessage(error),
    }
  }

  if (token) {
    writeStoredAccessToken(token)
  }

  const previousProfile = readStoredAuthProfile()
  const resolvedName = name?.trim() || previousProfile?.name
  const resolvedEmail = email?.trim() || previousProfile?.email

  if (resolvedName && resolvedEmail) {
    writeStoredAuthProfile({
      name: resolvedName,
      email: resolvedEmail,
      system,
    })
  }

  return { status: "success" }
}
