import { useNavigate } from "react-router-dom"

import { AppLayout } from "@/components/layout/AppLayout"
import { StatusScreen } from "@/components/layout/StatusScreen"
import { UBCreatePost } from "@/components/shared/UBCreatePost"
import { useLogoutMutation, usePortalSessionQuery } from "@/lib/api/auth"

export function CreatePostPage() {
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
      <div className="py-4">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Create Post
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Share announcements, news, or updates with the UB community.
          </p>
        </div>

        <UBCreatePost
          onBack={() => navigate(-1)}
          onSubmit={(values) => {
            console.info("Post submitted", values)
            navigate("/")
          }}
        />
      </div>
    </AppLayout>
  )
}
