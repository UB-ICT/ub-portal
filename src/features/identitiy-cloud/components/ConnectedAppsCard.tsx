import { useEffect } from "react"

import { UBCard } from "@/components/shared/UBCard"
import { useAdminApplicationsStore } from "@/store/admin-applications-store"

export function ConnectedAppsCard() {
  const total = useAdminApplicationsStore((state) => state.total)
  const fetchCatalog = useAdminApplicationsStore((state) => state.fetchCatalog)

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
