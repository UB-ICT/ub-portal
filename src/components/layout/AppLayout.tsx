import type { ReactNode } from "react"

import { UBHeader } from "@/components/shared"

type AppLayoutProps = {
  userName: string
  userEmail: string
  isLoggingOut?: boolean
  onLogout: () => void
  children: ReactNode
}

export function AppLayout({
  userName,
  userEmail,
  isLoggingOut = false,
  onLogout,
  children,
}: AppLayoutProps) {
  return (
    <div className="min-h-svh bg-muted/30">
      <UBHeader
        userName={userName}
        userEmail={userEmail}
        isLoggingOut={isLoggingOut}
        onLogout={onLogout}
      />

      <main className="mx-auto max-w-7xl px-6 py-8 lg:px-8">{children}</main>
    </div>
  )
}
