import { X } from "lucide-react"
import { useEffect, useState } from "react"

import { UBButton } from "@/components/shared/UBButton"
import { UBSelect } from "@/components/shared/UBSelect"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import type { AdminRoleRecord } from "@/lib/api/admin-roles"
import { useAdminPermissionsStore } from "@/store/admin-permissions-store"
import { useAdminRolesStore } from "@/store/admin-roles-store"

type RolePermissionsDialogProps = {
  open: boolean
  // Looked up live from the roles store by the parent (rather than passed as
  // a static snapshot) so newly attached/detached permissions show up
  // immediately without needing to close and reopen the dialog.
  role: AdminRoleRecord | null
  onOpenChange: (open: boolean) => void
}

export function RolePermissionsDialog({
  open,
  role,
  onOpenChange,
}: RolePermissionsDialogProps) {
  const permissions = useAdminPermissionsStore((state) => state.permissions)
  const fetchPermissions = useAdminPermissionsStore(
    (state) => state.fetchPermissions
  )
  const assignPermission = useAdminRolesStore((state) => state.assignPermission)
  const removePermission = useAdminRolesStore((state) => state.removePermission)
  const isSaving = useAdminRolesStore((state) => state.isSaving)
  const error = useAdminRolesStore((state) => state.error)

  const [selectedPermissionId, setSelectedPermissionId] = useState("")

  useEffect(() => {
    void fetchPermissions()
  }, [fetchPermissions])

  if (!role) {
    return null
  }

  const assignedPermissionIds = new Set(role.permissions.map((p) => p.id))
  const availablePermissions = permissions.filter(
    (permission) => !assignedPermissionIds.has(permission.id)
  )

  const handleAdd = async () => {
    if (!selectedPermissionId) {
      return
    }

    const added = await assignPermission(role.id, selectedPermissionId)

    if (added) {
      setSelectedPermissionId("")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Manage permissions</DialogTitle>
          <DialogDescription>
            Permissions assigned to the {role.role_name} role.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-wrap gap-2">
          {role.permissions.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No permissions assigned.
            </p>
          ) : (
            role.permissions.map((permission) => (
              <Badge key={permission.id} variant="secondary" className="gap-1 pr-1">
                {permission.category}: {permission.action_name}
                <button
                  type="button"
                  onClick={() => void removePermission(role.id, permission.id)}
                  disabled={isSaving}
                  aria-label={`Remove ${permission.action_name}`}
                  className="rounded-full p-0.5 hover:bg-black/10 disabled:pointer-events-none disabled:opacity-50"
                >
                  <X className="size-3" />
                </button>
              </Badge>
            ))
          )}
        </div>

        <div className="flex items-end gap-2">
          <UBSelect
            label="Add permission"
            value={selectedPermissionId}
            onValueChange={setSelectedPermissionId}
            options={availablePermissions.map((permission) => ({
              value: permission.id,
              label: `${permission.category}: ${permission.action_name}`,
            }))}
            placeholder={
              availablePermissions.length
                ? "Select a permission"
                : "All permissions assigned"
            }
            disabled={availablePermissions.length === 0 || isSaving}
            className="flex-1"
          />
          <UBButton
            type="button"
            onClick={() => void handleAdd()}
            disabled={!selectedPermissionId || isSaving}
          >
            Add
          </UBButton>
        </div>

        {error ? <p className="text-sm text-destructive">{error}</p> : null}

        <div className="flex justify-end">
          <UBButton type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Done
          </UBButton>
        </div>
      </DialogContent>
    </Dialog>
  )
}
