import { ChevronLeft, ChevronRight, KeyRound, Pencil, Trash2, Users } from "lucide-react"
import { useState } from "react"

import { UBButton } from "@/components/shared/UBButton"
import { UBTable } from "@/components/shared/UBTable"
import { Badge } from "@/components/ui/badge"
import type { AdminRoleRecord } from "@/lib/api/admin-roles"

type RolesTableProps = {
  roles: AdminRoleRecord[]
  isLoading?: boolean
  onEdit: (role: AdminRoleRecord) => void
  onManagePermissions: (role: AdminRoleRecord) => void
  onDelete: (role: AdminRoleRecord) => void
}

const PAGE_SIZE = 10

export function RolesTable({
  roles,
  isLoading = false,
  onEdit,
  onManagePermissions,
  onDelete,
}: RolesTableProps) {
  const [requestedPage, setRequestedPage] = useState(1)
  const totalPages = Math.max(1, Math.ceil(roles.length / PAGE_SIZE))
  // Clamp instead of storing the raw value, so a shrinking list (e.g. a
  // refetch) can't leave the requested page pointing past the last one.
  const currentPage = Math.min(requestedPage, totalPages)

  if (isLoading && roles.length === 0) {
    return <p className="px-1 text-sm text-muted-foreground">Loading roles...</p>
  }

  const startIndex = (currentPage - 1) * PAGE_SIZE
  const paginatedRoles = roles.slice(startIndex, startIndex + PAGE_SIZE)

  return (
    <div className="space-y-3">
      <UBTable
        rowKey="id"
        data={paginatedRoles}
        striped
        columns={[
          {
            header: "Role",
            accessor: "role_name",
            mobile: true,
            render: (_, row) => (
              <div>
                <p className="font-medium text-foreground">{row.role_name}</p>
                <p className="text-xs text-muted-foreground">
                  {row.description || "No description"}
                </p>
              </div>
            ),
          },
          {
            header: "Permissions",
            accessor: "permissions_count",
            mobile: true,
            render: (_, row) => (
              <Badge
                variant="outline"
                title={
                  row.permissions.length > 0
                    ? row.permissions
                        .map((permission) => permission.action_name)
                        .join(", ")
                    : undefined
                }
              >
                {row.permissions_count}{" "}
                {row.permissions_count === 1 ? "permission" : "permissions"}
              </Badge>
            ),
          },
          {
            header: "Users",
            accessor: "users_count",
            mobile: true,
            render: (_, row) => (
              <Badge variant="outline" className="gap-1">
                <Users className="size-3" />
                {row.users_count}
              </Badge>
            ),
          },
          {
            header: "Actions",
            accessor: "id",
            className: "text-right",
            render: (_, row) => (
              <div className="flex flex-wrap justify-end gap-1">
                <UBButton
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => onEdit(row)}
                  aria-label={`Edit ${row.role_name}`}
                >
                  <Pencil className="size-4" />
                </UBButton>
                <UBButton
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => onManagePermissions(row)}
                  aria-label={`Manage permissions for ${row.role_name}`}
                >
                  <KeyRound className="size-4" />
                </UBButton>
                <UBButton
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => onDelete(row)}
                  aria-label={`Delete ${row.role_name}`}
                >
                  <Trash2 className="size-4" />
                </UBButton>
              </div>
            ),
          },
        ]}
      />

      {totalPages > 1 ? (
        <div className="flex items-center justify-between px-1">
          <p className="text-xs text-muted-foreground">
            Showing page{" "}
            <span className="font-medium text-foreground">{currentPage}</span>{" "}
            of <span className="font-medium text-foreground">{totalPages}</span>
          </p>
          <div className="flex items-center gap-2">
            <UBButton
              type="button"
              size="sm"
              variant="outline"
              onClick={() => setRequestedPage((page) => Math.max(page - 1, 1))}
              disabled={currentPage === 1}
              aria-label="Previous page"
            >
              <ChevronLeft className="size-4" />
            </UBButton>
            <UBButton
              type="button"
              size="sm"
              variant="outline"
              onClick={() =>
                setRequestedPage((page) => Math.min(page + 1, totalPages))
              }
              disabled={currentPage === totalPages}
              aria-label="Next page"
            >
              <ChevronRight className="size-4" />
            </UBButton>
          </div>
        </div>
      ) : null}
    </div>
  )
}
