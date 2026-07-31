import { X } from "lucide-react"
import { useState } from "react"

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
import type { AdminUserRecord } from "@/lib/api/admin-users"
import { useAdminRolesStore } from "@/store/admin-roles-store"
import { useAdminUsersStore } from "@/store/admin-users-store"

type UserRolesDialogProps = {
  open: boolean
  // Looked up live from the users store by the parent (rather than passed as
  // a static snapshot) so newly attached/detached roles show up immediately
  // without needing to close and reopen the dialog.
  user: AdminUserRecord | null
  onOpenChange: (open: boolean) => void
}

export function UserRolesDialog({
  open,
  user,
  onOpenChange,
}: UserRolesDialogProps) {
  const roles = useAdminRolesStore((state) => state.roles)
  const assignRole = useAdminUsersStore((state) => state.assignRole)
  const removeRole = useAdminUsersStore((state) => state.removeRole)
  const isSaving = useAdminUsersStore((state) => state.isSaving)
  const error = useAdminUsersStore((state) => state.error)

  const [selectedRoleId, setSelectedRoleId] = useState("")

  if (!user) {
    return null
  }

  const assignedRoleIds = new Set(user.roles.map((role) => role.id))
  const availableRoles = roles.filter((role) => !assignedRoleIds.has(role.id))

  const handleAdd = async () => {
    if (!selectedRoleId) {
      return
    }

    const added = await assignRole(user.id, selectedRoleId)

    if (added) {
      setSelectedRoleId("")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Manage roles</DialogTitle>
          <DialogDescription>{user.name}&apos;s assigned roles.</DialogDescription>
        </DialogHeader>

        <div className="flex flex-wrap gap-2">
          {user.roles.length === 0 ? (
            <p className="text-sm text-muted-foreground">No roles assigned.</p>
          ) : (
            user.roles.map((role) => (
              <Badge key={role.id} variant="secondary" className="gap-1 pr-1">
                {role.role_name}
                <button
                  type="button"
                  onClick={() => void removeRole(user.id, role.id)}
                  disabled={isSaving}
                  aria-label={`Remove ${role.role_name}`}
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
            label="Add role"
            value={selectedRoleId}
            onValueChange={setSelectedRoleId}
            options={availableRoles.map((role) => ({
              value: role.id,
              label: role.role_name,
            }))}
            placeholder={
              availableRoles.length ? "Select a role" : "All roles assigned"
            }
            disabled={availableRoles.length === 0 || isSaving}
            className="flex-1"
          />
          <UBButton
            type="button"
            onClick={() => void handleAdd()}
            disabled={!selectedRoleId || isSaving}
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
