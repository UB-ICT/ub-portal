import { useEffect, useRef } from "react"
import { Outlet, useLocation, useNavigate } from "react-router-dom"

import {
  consumePostLoginRedirect,
  syncAuthCallbackFromSearch,
} from "@/lib/auth/storage"
import { DEFAULT_PORTAL_APP_PATH } from "@/lib/auth/default-app"

export function RootRoute() {
  const location = useLocation()
  const navigate = useNavigate()
  // Guards against this effect running twice for the same callback URL (e.g.
  // React StrictMode's double-invoke): consumePostLoginRedirect() deletes on
  // read, so a second pass would find it gone and fall back to the wrong target.
  const processedSearchRef = useRef<string | null>(null)

  useEffect(() => {
    if (processedSearchRef.current === location.search) {
      return
    }

    const callbackState = syncAuthCallbackFromSearch(location.search)

    if (callbackState.status === "idle") {
      return
    }

    processedSearchRef.current = location.search

    if (callbackState.status === "error") {
      consumePostLoginRedirect()

      const searchParams = new URLSearchParams({
        message: callbackState.message,
      })

      navigate(`/login?${searchParams.toString()}`, { replace: true })
      return
    }

    const redirectTarget = consumePostLoginRedirect()
    const shouldUseDefaultApp =
      !redirectTarget &&
      (location.pathname === "/" || location.pathname === "")

    navigate(
      redirectTarget
        ? { pathname: redirectTarget }
        : shouldUseDefaultApp
          ? { pathname: DEFAULT_PORTAL_APP_PATH }
          : { pathname: location.pathname, hash: location.hash },
      { replace: true }
    )
  }, [location.hash, location.pathname, location.search, navigate])

  return <Outlet />
}
