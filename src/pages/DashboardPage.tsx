import { FilePlus2 } from "lucide-react"
import { useNavigate } from "react-router-dom"

import { AppLayout } from "@/components/layout/AppLayout"
import { StatusScreen } from "@/components/layout/StatusScreen"
import { UBButton } from "@/components/shared"
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
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
          <UBButton
            size="default"
            onClick={() => navigate("/posts/create")}
          >
            <FilePlus2 className="size-4" />
            Create Post
          </UBButton>
        </div>
      </div>
    </AppLayout>
  )
}
