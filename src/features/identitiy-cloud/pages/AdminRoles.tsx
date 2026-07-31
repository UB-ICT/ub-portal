import { Plus } from "lucide-react"
import { useEffect, useMemo, useState } from "react"

import { UBButton } from "@/components/shared/UBButton"
import { UBInput } from "@/components/shared/UBInput"
import { RoleFormDialog } from "@/features/identitiy-cloud/components/RoleFormDialog"
import { RolePermissionsDialog } from "@/features/identitiy-cloud/components/RolePermissionsDialog"
import { RolesTable } from "@/features/identitiy-cloud/components/RolesTable"
import type { AdminRoleRecord } from "@/lib/api/admin-roles"
import { useAdminRolesStore } from "@/store/admin-roles-store"

export const AdminRolesPage = () => {
  const roles = useAdminRolesStore((state) => state.roles)
  const isLoading = useAdminRolesStore((state) => state.isLoading)
  const error = useAdminRolesStore((state) => state.error)
  const fetchRoles = useAdminRolesStore((state) => state.fetchRoles)
  const deleteRole = useAdminRolesStore((state) => state.deleteRole)

  const [roleDialogOpen, setRoleDialogOpen] = useState(false)
  // When set, the dialog edits this role; null means "create" mode.
  const [editingRole, setEditingRole] = useState<AdminRoleRecord | null>(null)
  // Bumped every time the dialog opens, forcing it to remount so its form
  // fields start fresh instead of carrying over the previous attempt.
  const [roleDialogKey, setRoleDialogKey] = useState(0)

  // Holds an id rather than a snapshot so the dialog reflects permission
  // attach/detach changes live, without needing to close and reopen it.
  const [permissionsRoleId, setPermissionsRoleId] = useState<string | null>(null)
  const permissionsRole =
    roles.find((role) => role.id === permissionsRoleId) ?? null

  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    void fetchRoles()
  }, [fetchRoles])

  const filteredRoles = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase()

    if (normalizedQuery === "") {
      return roles
    }

    return roles.filter(
      (role) =>
        role.role_name.toLowerCase().includes(normalizedQuery) ||
        (role.description ?? "").toLowerCase().includes(normalizedQuery)
    )
  }, [roles, searchQuery])

  const handleOpenAddRole = () => {
    setEditingRole(null)
    setRoleDialogKey((key) => key + 1)
    setRoleDialogOpen(true)
  }

  const handleEditRole = (role: AdminRoleRecord) => {
    setEditingRole(role)
    setRoleDialogKey((key) => key + 1)
    setRoleDialogOpen(true)
  }

  const handleManagePermissions = (role: AdminRoleRecord) => {
    setPermissionsRoleId(role.id)
  }

  const handleDeleteRole = async (role: AdminRoleRecord) => {
    const warning =
      role.users_count > 0
        ? `Delete "${role.role_name}"? ${role.users_count} user(s) currently have this role and will lose it. This cannot be undone.`
        : `Delete "${role.role_name}"? This cannot be undone.`

    const confirmed = window.confirm(warning)

    if (!confirmed) {
      return
    }

    await deleteRole(role.id)
  }

  return (
    <div className="flex h-full min-h-0 flex-col gap-4 overflow-hidden">
      <div className="shrink-0 border-b border-border pb-5">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Roles
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Every role defined in the identity system, with its permissions and users.
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
              {filteredRoles.length}
            </span>{" "}
            of{" "}
            <span className="font-medium text-foreground">{roles.length}</span>{" "}
            roles
          </p>
          <UBButton size="sm" onClick={handleOpenAddRole}>
            <Plus className="size-4" data-icon="inline-start" />
            Add new role
          </UBButton>
        </div>

        <div className="shrink-0 border-b border-border px-4 py-3">
          <UBInput
            label="Search"
            placeholder="Role name or description..."
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            className="lg:max-w-sm"
          />
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain p-4">
          <RolesTable
            roles={filteredRoles}
            isLoading={isLoading}
            onEdit={handleEditRole}
            onManagePermissions={handleManagePermissions}
            onDelete={(role) => void handleDeleteRole(role)}
          />
        </div>
      </div>

      <RoleFormDialog
        key={roleDialogKey}
        open={roleDialogOpen}
        role={editingRole}
        onOpenChange={setRoleDialogOpen}
      />

      <RolePermissionsDialog
        open={permissionsRoleId !== null}
        role={permissionsRole}
        onOpenChange={(open) => {
          if (!open) {
            setPermissionsRoleId(null)
          }
        }}
      />
    </div>
  )
}

export default AdminRolesPage
