import { Link } from "react-router-dom"

import { UBButton } from "@/components/shared"
import { hasStoredAccessToken } from "@/lib/auth/storage"

export function NotFoundPage() {
  const homeTarget = hasStoredAccessToken() ? "/" : "/login"

  return (
    <div className="flex min-h-svh items-center justify-center bg-muted/30 px-6">
      <div className="w-full max-w-lg rounded-[2rem] border bg-card p-10 text-center shadow-sm">
        <p className="text-sm font-medium uppercase tracking-[0.25em] text-muted-foreground">
          404
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight">
          Page not found
        </h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          The page you requested is not part of the current UB Portal route map.
        </p>
        <UBButton asChild className="mt-6">
          <Link to={homeTarget}>Return to portal</Link>
        </UBButton>
      </div>
    </div>
  )
}
