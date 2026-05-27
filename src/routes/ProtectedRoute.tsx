import { Navigate, Outlet } from "react-router-dom"

import { StatusScreen } from "@/components/layout/StatusScreen"
import {
  getAuthErrorMessage,
  usePortalSessionQuery,
} from "@/lib/api/auth"
import { clearStoredAuth, hasStoredAccessToken } from "@/lib/auth/storage"

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
    clearStoredAuth()

    return (
      <Navigate
        to={`/login?message=${encodeURIComponent(message)}`}
        replace
      />
    )
  }

  return <Outlet />
}
