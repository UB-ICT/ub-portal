import type { ReactNode } from "react"

import { UBDrawer, UBHeader } from "@/components/shared"

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
  onLogout,
  children,
}: AppLayoutProps) {
  return (
    <UBDrawer
      persistent
      overlay={false}
      defaultOpen
      header={
        <UBHeader
          userName={userName}
          userEmail={userEmail}
          onSignOutClick={onLogout}
        />
      }
    >
      <main className="p-4 lg:p-8">{children}</main>
    </UBDrawer>
  )
}
