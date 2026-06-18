import { useCallback } from "react"
import { useNavigate } from "react-router-dom"

import { useLogoutMutation, usePortalSessionQuery } from "@/lib/api/auth"
import { useApplicationMenuStore } from "@/store/application-menu-store"

export function useProtectedPortalSession() {
  const navigate = useNavigate()
  const sessionQuery = usePortalSessionQuery()
  const logoutMutation = useLogoutMutation()
  const user = sessionQuery.data?.user

  const handleLogout = useCallback(async () => {
    await logoutMutation.mutateAsync()
    useApplicationMenuStore.getState().reset()
    navigate("/login", { replace: true })
  }, [logoutMutation, navigate])

  return {
    user,
    handleLogout,
    isLoggingOut: logoutMutation.isPending,
    isReady: Boolean(user),
  }
}
