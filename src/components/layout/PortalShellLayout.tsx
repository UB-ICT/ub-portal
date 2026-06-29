import type { ReactNode } from "react"

import { UBHeader } from "@/components/shared"

type PortalShellLayoutProps = {
  userName: string
  userEmail: string
  userImageSrc?: string | null
  onLogout: () => void
  children: ReactNode
}

export function PortalShellLayout({
  userName,
  userEmail,
  userImageSrc,
  onLogout,
  children,
}: PortalShellLayoutProps) {
  return (
    <div className="flex min-h-svh flex-col bg-muted/30">
      <UBHeader
        userName={userName}
        userEmail={userEmail}
        userImageSrc={userImageSrc ?? undefined}
        onSignOutClick={onLogout}
      />
      <main className="flex-1 p-4 lg:p-8">{children}</main>
    </div>
  )
}
