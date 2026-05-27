import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { ApiError, apiRequest } from "@/lib/api/client"
import { buildHostUrl, GOOGLE_SSO_SYSTEM } from "@/lib/config"
import {
  clearStoredAuth,
  readStoredAccessToken,
} from "@/lib/auth/storage"
import type { PortalSessionResponse } from "@/lib/auth/types"

const AUTH_QUERY_KEY = ["auth", "session"] as const

function buildGoogleAuthRedirectUrl() {
  const loginUrl = new URL(buildHostUrl("/auth/google/redirect"))
  loginUrl.searchParams.set("system", GOOGLE_SSO_SYSTEM)

  return loginUrl.toString()
}

function getSessionToken() {
  const token = readStoredAccessToken()

  if (!token) {
    throw new Error("No stored access token is available.")
  }

  return token
}

async function fetchPortalSession() {
  return apiRequest<PortalSessionResponse>("/user", {
    token: getSessionToken(),
  })
}

async function logoutPortalSession() {
  const token = readStoredAccessToken()

  if (!token) {
    return
  }

  try {
    await apiRequest("/auth/logout", {
      method: "POST",
      token,
    })
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      return
    }

    throw error
  }
}

export function getAuthErrorMessage(error: unknown) {
  if (error instanceof ApiError) {
    if (error.status === 401) {
      return "Your session has expired. Please sign in again."
    }

    if (error.status === 403) {
      return "Your account does not have access to UB Portal."
    }

    return error.message
  }

  if (error instanceof Error) {
    return error.message
  }

  return "We could not verify your session. Please sign in again."
}

export function usePortalSessionQuery(enabled = true) {
  const token = readStoredAccessToken()

  return useQuery({
    queryKey: [...AUTH_QUERY_KEY, token],
    queryFn: fetchPortalSession,
    enabled: enabled && Boolean(token),
    staleTime: 1000 * 60 * 5,
    retry: false,
  })
}

export function useStartGoogleLoginMutation() {
  return useMutation({
    mutationFn: async () => {
      window.location.assign(buildGoogleAuthRedirectUrl())
    },
  })
}

export function useLogoutMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: logoutPortalSession,
    onSettled: async () => {
      clearStoredAuth()
      await queryClient.cancelQueries({ queryKey: ["auth"] })
      queryClient.removeQueries({ queryKey: ["auth"] })
    },
  })
}
