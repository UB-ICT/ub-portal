import React from "react"

import { ConnectedAppsCard } from "@/features/identitiy-cloud/components/ConnectedAppsCard"
import { TotalRolesCard } from "@/features/identitiy-cloud/components/TotalRolesCard"
import { TotalUsersCard } from "@/features/identitiy-cloud/components/TotalUsersCard"

export const AdminDashboard: React.FC = () => {
  return (
    <div className="h-full min-h-screen w-full space-y-6 overflow-y-auto p-8">
      <div className="border-b border-border pb-5">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Admin Console Overview
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Snapshot of the portal's administrative state.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <TotalUsersCard />
        <TotalRolesCard />
        <ConnectedAppsCard />
      </div>
    </div>
  )
}
