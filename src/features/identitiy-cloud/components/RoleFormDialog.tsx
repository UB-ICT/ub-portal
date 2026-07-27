import { useState, type FormEvent } from "react"

import { UBButton } from "@/components/shared/UBButton"
import { UBInput, UBTextarea } from "@/components/shared/UBInput"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import type { AdminRoleRecord } from "@/lib/api/admin-roles"
import { useAdminRolesStore } from "@/store/admin-roles-store"

type RoleFormDialogProps = {
  open: boolean
  // When set, the dialog edits this role; when null/undefined it's in
  // "create" mode. isEdit below derives from this.
  role?: AdminRoleRecord | null
  onOpenChange: (open: boolean) => void
  onSuccess?: (role: AdminRoleRecord) => void
}

export function RoleFormDialog({
  open,
  role,
  onOpenChange,
  onSuccess,
}: RoleFormDialogProps) {
  const createRole = useAdminRolesStore((state) => state.createRole)
  const updateRole = useAdminRolesStore((state) => state.updateRole)
  const isSaving = useAdminRolesStore((state) => state.isSaving)
  const error = useAdminRolesStore((state) => state.error)

  const isEdit = Boolean(role)

  const [roleName, setRoleName] = useState(role?.role_name ?? "")
  const [description, setDescription] = useState(role?.description ?? "")
  const [formError, setFormError] = useState<string | null>(null)

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setFormError(null)

    if (!roleName.trim()) {
      setFormError("Role name is required.")
      return
    }

    const payload = {
      role_name: roleName.trim(),
      description: description.trim() || undefined,
    }

    const saved =
      isEdit && role
        ? await updateRole(role.id, payload)
        : await createRole(payload)

    // createRole/updateRole return null on failure (the error message is
    // already surfaced via the store's `error` state below), so just leave
    // the dialog open for the user to retry.
    if (!saved) {
      return
    }

    onSuccess?.(saved)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit role" : "Add new role"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update this role's name and description."
              : "Create a new role. Permissions can be assigned afterward."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <UBInput
            label="Role name"
            value={roleName}
            onChange={(event) => setRoleName(event.target.value)}
            required
          />
          <UBTextarea
            label="Description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            rows={3}
            placeholder="Optional description"
          />

          {formError ? <p className="text-sm text-destructive">{formError}</p> : null}
          {error ? <p className="text-sm text-destructive">{error}</p> : null}

          <div className="flex justify-end gap-2">
            <UBButton
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSaving}
            >
              Cancel
            </UBButton>
            <UBButton type="submit" disabled={isSaving}>
              {isSaving ? "Saving..." : isEdit ? "Save changes" : "Add role"}
            </UBButton>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
