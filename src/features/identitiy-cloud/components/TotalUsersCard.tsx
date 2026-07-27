import { useEffect } from "react"

import { UBCard } from "@/components/shared/UBCard"
import { useAdminUsersStore } from "@/store/admin-users-store"

export function TotalUsersCard() {
  const total = useAdminUsersStore((state) => state.total)
  const fetchUsers = useAdminUsersStore((state) => state.fetchUsers)

  useEffect(() => {
    void fetchUsers()
  }, [fetchUsers])

  return (
    <UBCard
      subtitle="Total users"
      title={String(total)}
      description="Registered accounts across the portal"
      className="[&>h3]:text-4xl [&>h3]:font-bold [&>h3]:text-primary"
    />
  )
}
