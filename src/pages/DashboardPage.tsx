import { Navigate } from "react-router-dom"

import { StatusScreen } from "@/components/layout/StatusScreen"
import { usePortalSessionQuery } from "@/lib/api/auth"
import { resolveDefaultAppPath } from "@/lib/auth/default-app"
import { hasStoredAccessToken } from "@/lib/auth/storage"

export function DashboardPage() {
  const hasToken = hasStoredAccessToken()
  const sessionQuery = usePortalSessionQuery(hasToken)

  if (!hasToken) {
    return <Navigate to="/login" replace />
  }

  if (sessionQuery.isPending) {
    return (
      <StatusScreen
        title="Loading your portal"
        description="Opening your default application."
      />
    )
  }

  return (
    <Navigate
      to={resolveDefaultAppPath(sessionQuery.data?.user?.default_application)}
      replace
    />
  )
}
