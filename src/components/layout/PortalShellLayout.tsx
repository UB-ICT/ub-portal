import type { ReactNode } from "react"

import { UBHeader } from "@/components/shared"

type PortalShellLayoutProps = {
  userName: string
  userEmail: string
  onLogout: () => void
  children: ReactNode
}

export function PortalShellLayout({
  userName,
  userEmail,
  onLogout,
  children,
}: PortalShellLayoutProps) {
  return (
    <div className="flex min-h-svh flex-col bg-muted/30">
      <UBHeader
        userName={userName}
        userEmail={userEmail}
        onSignOutClick={onLogout}
      />
      <main className="flex-1 p-4 lg:p-8">{children}</main>
    </div>
  )
}
