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

function deleteCookie(name: string) {
  if (!isBrowser()) {
    return
  }

  const secureAttribute = window.location.protocol === "https:" ? "; Secure" : ""
  document.cookie = `${encodeURIComponent(name)}=; Path=${AUTH_COOKIE_PATH}; Max-Age=0; SameSite=Lax${secureAttribute}`
}

export function readStoredAccessToken() {
  const storedToken = getStoredLocalItem(AUTH_TOKEN_KEY)

  if (storedToken) {
    return storedToken
  }

  const legacyCookieToken = readCookie(AUTH_TOKEN_KEY)

  if (!legacyCookieToken) {
    return null
  }

  writeStoredAccessToken(legacyCookieToken)
  return legacyCookieToken
}

export function hasStoredAccessToken() {
  return Boolean(readStoredAccessToken())
}

export function writeStoredAccessToken(token: string) {
  if (!isBrowser()) {
    return
  }

  window.localStorage.setItem(AUTH_TOKEN_KEY, token)
  deleteCookie(AUTH_TOKEN_KEY)
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
  window.localStorage.removeItem(AUTH_TOKEN_KEY)
  window.localStorage.removeItem(AUTH_PROFILE_KEY)
}

const POST_LOGIN_REDIRECT_KEY = "ub_portal_post_login_redirect"

// Survives clearStoredAuth() (different key) so a forced logout that happens
// on the way to a fresh login can still land the user back where they meant to go.
export function writePostLoginRedirect(path: string) {
  if (!isBrowser()) {
    return
  }

  window.localStorage.setItem(POST_LOGIN_REDIRECT_KEY, path)
}

export function consumePostLoginRedirect(): string | null {
  if (!isBrowser()) {
    return null
  }

  const path = window.localStorage.getItem(POST_LOGIN_REDIRECT_KEY)

  if (path) {
    window.localStorage.removeItem(POST_LOGIN_REDIRECT_KEY)
  }

  return path
}

function buildCallbackErrorMessage(errorCode: string) {
  switch (errorCode) {
    case "user_creation_failed":
      return "We could not create your UB Portal account. Please try again."
    case "unauthorized":
      return "Your Google account is not authorized for UB Portal. Ask an administrator to invite you and assign a role."
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
