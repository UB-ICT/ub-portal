import type { ReactNode } from "react"

import { UBDrawer, UBHeader } from "@/components/shared"
import type { UBDrawerItem } from "@/components/shared"

type AppLayoutProps = {
  userName: string
  userEmail: string
  userImageSrc?: string | null
  isLoggingOut?: boolean
  showSearch?: boolean
  showAdminActions?: boolean
  onLogout: () => void
  children: ReactNode
  appLabel?: string
  menuItems?: UBDrawerItem[]
}

export function AppLayout({
  userName,
  userEmail,
  userImageSrc,
  showSearch,
  showAdminActions,
  onLogout,
  children,
  appLabel,
  menuItems,
}: AppLayoutProps) {
  return (
    <UBDrawer
      persistent
      overlay={false}
      defaultOpen
      appLabel={appLabel}
      items={menuItems}
      header={
        <UBHeader
          userName={userName}
          userEmail={userEmail}
          userImageSrc={userImageSrc ?? undefined}
          showSearch={showSearch}
          showAdminActions={showAdminActions}
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
