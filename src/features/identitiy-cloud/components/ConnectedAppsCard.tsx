import { useEffect } from "react"

import { UBCard } from "@/components/shared/UBCard"
import { useAdminApplicationsStore } from "@/store/admin-applications-store"

// Small stat tile (shown on the admin dashboard) with the total count of
// applications registered in the catalog, regardless of active/disabled status.
export function ConnectedAppsCard() {
  const total = useAdminApplicationsStore((state) => state.total)
  const fetchCatalog = useAdminApplicationsStore((state) => state.fetchCatalog)

  // fetchCatalog is deduped/cached in the store (see admin-applications-store.ts),
  // so calling it here is safe even if AdminApplications.tsx also calls it -
  // only one network request actually happens.
  useEffect(() => {
    void fetchCatalog()
  }, [fetchCatalog])

  return (
    <UBCard
      subtitle="Connected apps"
      title={String(total)}
      description="Registered in the catalog, across every status"
      className="[&>h3]:text-4xl [&>h3]:font-bold [&>h3]:text-primary"
    />
  )
}
