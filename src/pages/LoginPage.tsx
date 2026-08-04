import { AlertCircle } from "lucide-react"
import { Navigate, useSearchParams } from "react-router-dom"

import { AuthLayout } from "@/components/layout/AuthLayout"
import { UBButton } from "@/components/shared"
import { useStartGoogleLoginMutation } from "@/lib/api/auth"
import { DEFAULT_PORTAL_APP_PATH } from "@/lib/auth/default-app"
import { hasStoredAccessToken } from "@/lib/auth/storage"

function GoogleMark() {
  return (
    <svg
      aria-hidden="true"
      className="size-4"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.96 5.96 0 0 1-2.21 3.31v2.77h3.57a10.83 10.83 0 0 0 3.28-8.09Z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A10.99 10.99 0 0 0 12 23Z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09A6.58 6.58 0 0 1 5.49 12c0-.73.13-1.43.35-2.09V7.07H2.18A11.01 11.01 0 0 0 1 12c0 1.78.43 3.45 1.18 4.93l2.85-2.22.81-.62Z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1A10.99 10.99 0 0 0 2.18 7.07l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38Z"
        fill="#EA4335"
      />
    </svg>
  )
}

export function LoginPage() {
  const [searchParams] = useSearchParams()
  const loginMutation = useStartGoogleLoginMutation()
  const message = searchParams.get("message")

  if (hasStoredAccessToken()) {
    return <Navigate to={DEFAULT_PORTAL_APP_PATH} replace />
  }

  return (
    <AuthLayout
      title="University of Belize Portal"
      description="Sign in once with your UB Google account to access UB Applications"
    >
      <div className="space-y-6">
        <div className="space-y-2">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">
            Sign in
          </p>
          <h2 className="text-2xl font-semibold tracking-tight">
            Continue to UB Portal
          </h2>
          <p className="text-sm leading-6 text-muted-foreground">
            Use your University of Belize Google account. The portal will route
            you back into the application after authentication.
          </p>
        </div>

        {message ? (
          <div className="flex items-start gap-3 rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            <AlertCircle className="mt-0.5 size-4 shrink-0" />
            <p>{message}</p>
          </div>
        ) : null}

        <div className="space-y-3">
          <UBButton
            className="h-11 w-full justify-center"
            variant="outline"
            onClick={() => loginMutation.mutate()}
            disabled={loginMutation.isPending}
          >
            <GoogleMark />
            {loginMutation.isPending
              ? "Redirecting to Google..."
              : "Continue with Google"}
          </UBButton>

          <p className="text-center text-xs leading-5 text-muted-foreground">
            If authentication succeeds, the backend will return a session token
            and your profile to the React app.
          </p>
        </div>
      </div>
    </AuthLayout>
  )
}
