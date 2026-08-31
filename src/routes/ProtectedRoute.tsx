import { Navigate, Outlet } from "react-router-dom"

import { FcmNotificationListener } from "@/components/notifications/FcmNotificationListener"
import { StatusScreen } from "@/components/layout/StatusScreen"
import {
  getAuthErrorMessage,
  usePortalSessionQuery,
} from "@/lib/api/auth"
import { ApiError } from "@/lib/api/client"
import { clearStoredAuth, hasStoredAccessToken } from "@/lib/auth/storage"

function isAuthFailure(error: unknown) {
  return (
    error instanceof ApiError &&
    (error.status === 401 || error.status === 403)
  )
}

export function ProtectedRoute() {
  const hasToken = hasStoredAccessToken()
  const sessionQuery = usePortalSessionQuery(hasToken)

  if (!hasToken) {
    return <Navigate to="/login" replace />
  }

  if (sessionQuery.isPending) {
    return (
      <StatusScreen
        title="Loading your portal"
        description="Checking your UB Portal session and available access."
      />
    )
  }

  if (sessionQuery.isError) {
    const message = getAuthErrorMessage(sessionQuery.error)

    if (isAuthFailure(sessionQuery.error)) {
      clearStoredAuth()

      return (
        <Navigate
          to={`/login?message=${encodeURIComponent(message)}`}
          replace
        />
      )
    }

    return (
      <StatusScreen
        title="Could not reach UB Portal"
        description={message}
      />
    )
  }

  return (
    <>
      <FcmNotificationListener />
      <Outlet />
    </>
  )
}
