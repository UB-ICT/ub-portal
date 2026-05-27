import { useEffect } from "react"
import { Outlet, useLocation, useNavigate } from "react-router-dom"

import { syncAuthCallbackFromSearch } from "@/lib/auth/storage"

export function RootRoute() {
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    const callbackState = syncAuthCallbackFromSearch(location.search)

    if (callbackState.status === "idle") {
      return
    }

    if (callbackState.status === "error") {
      const searchParams = new URLSearchParams({
        message: callbackState.message,
      })

      navigate(`/login?${searchParams.toString()}`, { replace: true })
      return
    }

    navigate(
      {
        pathname: location.pathname,
        hash: location.hash,
      },
      { replace: true }
    )
  }, [location.hash, location.pathname, location.search, navigate])

  return <Outlet />
}
