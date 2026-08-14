import { Plus, SlidersHorizontal, X } from "lucide-react"
import { useEffect, useMemo, useState } from "react"

import { UBButton } from "@/components/shared/UBButton"
import { UBInput } from "@/components/shared/UBInput"
import { UBSelect, type UBSelectOption } from "@/components/shared/UBSelect"
import { UserFormDialog } from "@/features/identitiy-cloud/components/UserFormDialog"
import { UsersTable } from "@/features/identitiy-cloud/components/UsersTable"
import { useProtectedPortalSession } from "@/hooks/useProtectedPortalSession"
import type { AdminUserRecord } from "@/lib/api/admin-users"
import { useAdminRolesStore } from "@/store/admin-roles-store"
import { useAdminUsersStore } from "@/store/admin-users-store"

const ALL_ROLES_VALUE = "all"
const ALL_STATUSES_VALUE = "all"

export const AdminUsersPage = () => {
  const { user: currentUser } = useProtectedPortalSession()

  const users = useAdminUsersStore((state) => state.users)
  const isLoading = useAdminUsersStore((state) => state.isLoading)
  const error = useAdminUsersStore((state) => state.error)
  const fetchUsers = useAdminUsersStore((state) => state.fetchUsers)
  const updateUser = useAdminUsersStore((state) => state.updateUser)
  const deleteUser = useAdminUsersStore((state) => state.deleteUser)

  const roles = useAdminRolesStore((state) => state.roles)
  const fetchRoles = useAdminRolesStore((state) => state.fetchRoles)

  const [userDialogOpen, setUserDialogOpen] = useState(false)
  // Holds an id rather than a snapshot so the dialog reflects role
  // attach/detach changes live, without needing to close and reopen it.
  // Null means "create" mode.
  const [editingUserId, setEditingUserId] = useState<string | null>(null)
  const editingUser = users.find((user) => user.id === editingUserId) ?? null
  // Bumped every time the dialog opens, forcing it to remount so its form
  // fields start fresh instead of carrying over the previous attempt.
  const [userDialogKey, setUserDialogKey] = useState(0)

  const [filtersOpen, setFiltersOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [roleFilter, setRoleFilter] = useState(ALL_ROLES_VALUE)
  const [statusFilter, setStatusFilter] = useState(ALL_STATUSES_VALUE)

  useEffect(() => {
    void fetchUsers()
    void fetchRoles()
  }, [fetchUsers, fetchRoles])

  const roleOptions: UBSelectOption[] = useMemo(
    () => [
      { value: ALL_ROLES_VALUE, label: "All roles" },
      ...roles.map((role) => ({
        value: role.role_name,
        label: role.role_name,
      })),
    ],
    [roles]
  )

  const statusOptions: UBSelectOption[] = useMemo(() => {
    const uniqueStatuses = Array.from(
      new Set(
        users
          .map((user) => user.status)
          .filter((status): status is string => Boolean(status))
      )
    )

    return [
      { value: ALL_STATUSES_VALUE, label: "All statuses" },
      ...uniqueStatuses.map((status) => ({
        value: status,
        label: status.charAt(0).toUpperCase() + status.slice(1),
      })),
    ]
  }, [users])

  const hasActiveFilters =
    searchQuery.trim() !== "" ||
    roleFilter !== ALL_ROLES_VALUE ||
    statusFilter !== ALL_STATUSES_VALUE

  const filteredUsers = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase()

    return users.filter((user) => {
      const matchesQuery =
        normalizedQuery === "" ||
        user.name.toLowerCase().includes(normalizedQuery) ||
        user.email.toLowerCase().includes(normalizedQuery)
      const matchesRole =
        roleFilter === ALL_ROLES_VALUE ||
        user.roles.some((role) => role.role_name === roleFilter)
      const matchesStatus =
        statusFilter === ALL_STATUSES_VALUE || user.status === statusFilter

      return matchesQuery && matchesRole && matchesStatus
    })
  }, [users, searchQuery, roleFilter, statusFilter])

  const handleClearFilters = () => {
    setSearchQuery("")
    setRoleFilter(ALL_ROLES_VALUE)
    setStatusFilter(ALL_STATUSES_VALUE)
  }

  const handleOpenAddUser = () => {
    setEditingUserId(null)
    setUserDialogKey((key) => key + 1)
    setUserDialogOpen(true)
  }

  const handleEditUser = (user: AdminUserRecord) => {
    setEditingUserId(user.id)
    setUserDialogKey((key) => key + 1)
    setUserDialogOpen(true)
  }

  const handleToggleStatus = async (user: AdminUserRecord) => {
    const isActive = (user.status ?? "").toLowerCase() === "active"

    if (isActive) {
      const confirmed = window.confirm(
        `Disable ${user.name}? They will no longer be able to sign in until reactivated.`
      )

      if (!confirmed) {
        return
      }
    }

    await updateUser(user.id, { status: isActive ? "disabled" : "active" })
  }

  const handleDeleteUser = async (user: AdminUserRecord) => {
    const confirmed = window.confirm(
      `Delete ${user.name}? This permanently removes their account and cannot be undone.`
    )

    if (!confirmed) {
      return
    }

    await deleteUser(user.id)
  }

  return (
    <div className="flex h-full min-h-0 flex-col gap-4 overflow-hidden">
      <div className="shrink-0 border-b border-border pb-5">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Users
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Every account registered in the portal, with its assigned roles.
        </p>
      </div>

      {error ? (
        <p className="shrink-0 text-sm text-destructive">{error}</p>
      ) : null}

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-lg border border-border bg-card">
        <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3">
          <p className="text-sm text-muted-foreground">
            Showing{" "}
            <span className="font-medium text-foreground">
              {filteredUsers.length}
            </span>{" "}
            of{" "}
            <span className="font-medium text-foreground">{users.length}</span>{" "}
            users
          </p>
          <UBButton size="sm" onClick={handleOpenAddUser}>
            <Plus className="size-4" data-icon="inline-start" />
            Add new user
          </UBButton>
        </div>

        <div className="shrink-0 space-y-3 border-b border-border px-4 py-3">
          <div className="flex flex-wrap items-center gap-2">
            <UBButton
              type="button"
              size="sm"
              variant={filtersOpen ? "secondary" : "outline"}
              className="rounded-full"
              onClick={() => setFiltersOpen((open) => !open)}
              aria-expanded={filtersOpen}
            >
              <SlidersHorizontal className="size-4" data-icon="inline-start" />
              Add a filter
            </UBButton>

            {hasActiveFilters ? (
              <UBButton
                type="button"
                size="sm"
                variant="ghost"
                onClick={handleClearFilters}
              >
                <X className="size-4" data-icon="inline-start" />
                Clear filters
              </UBButton>
            ) : null}
          </div>

          {filtersOpen ? (
            <div className="grid gap-3 sm:grid-cols-3 lg:max-w-2xl">
              <UBInput
                label="Search"
                placeholder="Name or email..."
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
              />
              <UBSelect
                label="Role"
                value={roleFilter}
                onValueChange={setRoleFilter}
                options={roleOptions}
              />
              <UBSelect
                label="Status"
                value={statusFilter}
                onValueChange={setStatusFilter}
                options={statusOptions}
              />
            </div>
          ) : null}
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain p-4">
          <UsersTable
            users={filteredUsers}
            isLoading={isLoading}
            currentUserEmail={currentUser?.email}
            onEdit={handleEditUser}
            onToggleStatus={(user) => void handleToggleStatus(user)}
            onDelete={(user) => void handleDeleteUser(user)}
          />
        </div>
      </div>

      <UserFormDialog
        key={userDialogKey}
        open={userDialogOpen}
        user={editingUser}
        onOpenChange={setUserDialogOpen}
      />
    </div>
  )
}

export default AdminUsersPage
