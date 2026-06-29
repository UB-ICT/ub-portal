import type { ReactNode } from "react"

import { UBDrawer, UBHeader } from "@/components/shared"

type AppLayoutProps = {
  userName: string
  userEmail: string
  userImageSrc?: string | null
  isLoggingOut?: boolean
  onLogout: () => void
  children: ReactNode
}

export function AppLayout({
  userName,
  userEmail,
  userImageSrc,
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
          userImageSrc={userImageSrc ?? undefined}
          onSignOutClick={onLogout}
        />
      }
    >
      <main className="flex h-full min-h-0 flex-col overflow-hidden p-4 lg:p-8">
        {children}
      </main>
    </UBDrawer>
  )
}
