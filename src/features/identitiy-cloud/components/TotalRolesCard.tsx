import { useEffect } from "react"

import { UBCard } from "@/components/shared/UBCard"
import { useAdminRolesStore } from "@/store/admin-roles-store"

export function TotalRolesCard() {
  const total = useAdminRolesStore((state) => state.total)
  const fetchRoles = useAdminRolesStore((state) => state.fetchRoles)

  useEffect(() => {
    void fetchRoles()
  }, [fetchRoles])

  return (
    <UBCard
      subtitle="Total roles"
      title={String(total)}
      description="Roles defined across the identity system"
      className="[&>h3]:text-4xl [&>h3]:font-bold [&>h3]:text-primary"
    />
  )
}
