import { useNavigate } from "react-router-dom"

import { AppLayout } from "@/components/layout/AppLayout"
import { StatusScreen } from "@/components/layout/StatusScreen"
import { useLogoutMutation, usePortalSessionQuery } from "@/lib/api/auth"

export function DashboardPage() {
  const navigate = useNavigate()
  const sessionQuery = usePortalSessionQuery()
  const logoutMutation = useLogoutMutation()

  const user = sessionQuery.data?.user
  
  if (sessionQuery.isPending || !user) {
    return (
      <StatusScreen
        title="Preparing your workspace"
        description="Loading your profile, menus, and permissions from UB Portal."
      />
    )
  }

  const handleLogout = async () => {
    await logoutMutation.mutateAsync()
    navigate("/login", { replace: true })
  }

  return (
    <AppLayout
      userName={user.name}
      userEmail={user.email}
      isLoggingOut={logoutMutation.isPending}
      onLogout={handleLogout}
    >
      <div className="space-y-8">
      </div>
    </AppLayout>
  )
}
