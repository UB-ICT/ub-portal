import {
  Ban,
  ChevronLeft,
  ChevronRight,
  Pencil,
  RotateCcw,
  Trash2,
  User as UserIcon,
} from "lucide-react"
import { useState } from "react"

import { UBButton } from "@/components/shared/UBButton"
import { UBTable } from "@/components/shared/UBTable"
import { Badge } from "@/components/ui/badge"
import type { AdminUserRecord } from "@/lib/api/admin-users"
import { cn } from "@/lib/utils"

type UsersTableProps = {
  users: AdminUserRecord[]
  isLoading?: boolean
  // Prevents the signed-in admin from disabling/deleting their own account
  // out from under themselves.
  currentUserEmail?: string | null
  onEdit: (user: AdminUserRecord) => void
  onToggleStatus: (user: AdminUserRecord) => void
  onDelete: (user: AdminUserRecord) => void
}

// Only this many role badges render inline before collapsing into a "+N" badge,
// so a user with many roles doesn't blow out the row height.
const MAX_VISIBLE_ROLES = 2

const PAGE_SIZE = 10

const MS_PER_DAY = 24 * 60 * 60 * 1000

// Relative, Google-Admin-style phrasing ("2 weeks ago", "Hasn't signed in")
// reads faster in a table than an absolute date.
function formatLastActive(lastActive: string | null) {
  if (!lastActive) {
    return "Hasn't signed in"
  }

  const parsed = new Date(lastActive)

  if (Number.isNaN(parsed.getTime())) {
    return "Hasn't signed in"
  }

  const diffDays = Math.floor((Date.now() - parsed.getTime()) / MS_PER_DAY)

  if (diffDays <= 0) {
    return "Today"
  }

  if (diffDays === 1) {
    return "Yesterday"
  }

  if (diffDays < 7) {
    return `${diffDays} days ago`
  }

  if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7)
    return weeks === 1 ? "1 week ago" : `${weeks} weeks ago`
  }

  if (diffDays < 365) {
    const months = Math.floor(diffDays / 30)
    return months === 1 ? "1 month ago" : `${months} months ago`
  }

  const years = Math.floor(diffDays / 365)
  return years === 1 ? "A year ago" : `${years} years ago`
}

function formatLastActiveTime(lastActive: string | null) {
  if (!lastActive) {
    return null
  }

  const parsed = new Date(lastActive)

  if (Number.isNaN(parsed.getTime())) {
    return null
  }

  return parsed.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  })
}

function getStatusBadgeStyles(status: string | null) {
  const normalized = (status ?? "").toLowerCase()

  if (normalized === "active") {
    return "border-green-200 bg-green-50 text-green-800 dark:border-green-900 dark:bg-green-950 dark:text-green-200"
  }

  if (normalized === "disabled" || normalized === "suspended") {
    return "border-red-200 bg-red-50 text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200"
  }

  return "border-border bg-muted/40 text-muted-foreground"
}

export function UsersTable({
  users,
  isLoading = false,
  currentUserEmail,
  onEdit,
  onToggleStatus,
  onDelete,
}: UsersTableProps) {
  const [requestedPage, setRequestedPage] = useState(1)
  const totalPages = Math.max(1, Math.ceil(users.length / PAGE_SIZE))
  // Clamp instead of storing the raw value, so a shrinking list (e.g. a
  // refetch) can't leave the requested page pointing past the last one.
  const currentPage = Math.min(requestedPage, totalPages)

  if (isLoading && users.length === 0) {
    return <p className="px-1 text-sm text-muted-foreground">Loading users...</p>
  }

  const startIndex = (currentPage - 1) * PAGE_SIZE
  const paginatedUsers = users.slice(startIndex, startIndex + PAGE_SIZE)

  return (
    <div className="space-y-3">
      <UBTable
        rowKey="id"
        data={paginatedUsers}
        striped
        columns={[
          {
            header: "User",
            accessor: "name",
            mobile: true,
            render: (_, row) =>
              row.profile_picture ? (
                <div className="flex items-center gap-3">
                  <img
                    src={row.profile_picture}
                    alt=""
                    className="size-8 shrink-0 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-medium text-foreground">{row.name}</p>
                    <p className="text-xs text-muted-foreground">{row.email}</p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
                    <UserIcon className="size-4" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{row.name}</p>
                    <p className="text-xs text-muted-foreground">{row.email}</p>
                  </div>
                </div>
              ),
          },
          {
            header: "Roles",
            accessor: "roles",
            mobile: true,
            render: (_, row) => {
              if (row.roles.length === 0) {
                return <span className="text-muted-foreground">—</span>
              }

              const visibleRoles = row.roles.slice(0, MAX_VISIBLE_ROLES)
              const overflowRoles = row.roles.slice(MAX_VISIBLE_ROLES)

              return (
                <div className="flex flex-wrap gap-1">
                  {visibleRoles.map((role) => (
                    <Badge key={role.id} variant="secondary">
                      {role.role_name}
                    </Badge>
                  ))}
                  {overflowRoles.length > 0 ? (
                    <Badge
                      variant="outline"
                      title={overflowRoles.map((role) => role.role_name).join(", ")}
                    >
                      +{overflowRoles.length}
                    </Badge>
                  ) : null}
                </div>
              )
            },
          },
          {
            header: "Status",
            accessor: "status",
            mobile: true,
            render: (_, row) => (
              <Badge
                variant="outline"
                className={cn("capitalize", getStatusBadgeStyles(row.status))}
              >
                {row.status ?? "Unknown"}
              </Badge>
            ),
          },
          {
            header: "Last active",
            accessor: "last_active",
            render: (_, row) => {
              const timestamp = formatLastActiveTime(row.last_active)

              return (
                <div>
                  <p>{formatLastActive(row.last_active)}</p>
                  {timestamp ? (
                    <p className="text-xs text-muted-foreground">{timestamp}</p>
                  ) : null}
                </div>
              )
            },
          },
          {
            header: "Actions",
            accessor: "id",
            className: "text-right",
            render: (_, row) => {
              const isSelf =
                currentUserEmail != null &&
                row.email.toLowerCase() === currentUserEmail.toLowerCase()
              const isActive = (row.status ?? "").toLowerCase() === "active"

              return (
                <div className="flex flex-wrap justify-end gap-1">
                  <UBButton
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => onEdit(row)}
                    aria-label={`Edit ${row.name} and manage their roles`}
                  >
                    <Pencil className="size-4" />
                  </UBButton>
                  <UBButton
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => onToggleStatus(row)}
                    disabled={isSelf}
                    aria-label={isActive ? `Disable ${row.name}` : `Activate ${row.name}`}
                  >
                    {isActive ? (
                      <Ban className="size-4" />
                    ) : (
                      <RotateCcw className="size-4" />
                    )}
                  </UBButton>
                  <UBButton
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => onDelete(row)}
                    disabled={isSelf}
                    aria-label={`Delete ${row.name}`}
                  >
                    <Trash2 className="size-4" />
                  </UBButton>
                </div>
              )
            },
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
