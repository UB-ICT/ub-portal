import { useState, type FormEvent } from "react"

import { UBButton } from "@/components/shared/UBButton"
import { UBInput } from "@/components/shared/UBInput"
import { UBSelect, type UBSelectOption } from "@/components/shared/UBSelect"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import type { AdminUserRecord } from "@/lib/api/admin-users"
import { cn } from "@/lib/utils"
import { useAdminRolesStore } from "@/store/admin-roles-store"
import { useAdminUsersStore } from "@/store/admin-users-store"

const STATUS_OPTIONS: UBSelectOption[] = [
  { value: "active", label: "Active" },
  { value: "disabled", label: "Disabled" },
]

type UserFormDialogProps = {
  open: boolean
  // When set, the dialog edits this user; when null/undefined it's in
  // "create" mode. isEdit below derives from this.
  user?: AdminUserRecord | null
  onOpenChange: (open: boolean) => void
  onSuccess?: (user: AdminUserRecord) => void
}

export function UserFormDialog({
  open,
  user,
  onOpenChange,
  onSuccess,
}: UserFormDialogProps) {
  const createUser = useAdminUsersStore((state) => state.createUser)
  const updateUser = useAdminUsersStore((state) => state.updateUser)
  const assignRole = useAdminUsersStore((state) => state.assignRole)
  const error = useAdminUsersStore((state) => state.error)

  const roles = useAdminRolesStore((state) => state.roles)

  const isEdit = Boolean(user)

  const [name, setName] = useState(user?.name ?? "")
  const [email, setEmail] = useState(user?.email ?? "")
  const [status, setStatus] = useState(user?.status ?? "active")
  // Initial roles to attach right after creation - only relevant in create
  // mode. Editing an existing user's roles happens in UserRolesDialog instead.
  const [selectedRoleIds, setSelectedRoleIds] = useState<string[]>([])
  const [formError, setFormError] = useState<string | null>(null)
  // Local flag (rather than relying solely on the store's isSaving) so the
  // form stays disabled through the whole create -> attach-roles sequence,
  // since each assignRole call flips the store's isSaving off as soon as it
  // finishes, even while sibling role-attach calls are still in flight.
  const [isSubmitting, setIsSubmitting] = useState(false)

  const toggleRole = (roleId: string) => {
    setSelectedRoleIds((current) =>
      current.includes(roleId)
        ? current.filter((id) => id !== roleId)
        : [...current, roleId]
    )
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setFormError(null)

    if (!name.trim() || !email.trim()) {
      setFormError("Name and email are required.")
      return
    }

    setIsSubmitting(true)

    try {
      const payload = { name: name.trim(), email: email.trim(), status }

      const saved =
        isEdit && user
          ? await updateUser(user.id, payload)
          : await createUser(payload)

      // createUser/updateUser return null on failure (the error message is
      // already surfaced via the store's `error` state below), so just leave
      // the dialog open for the user to retry.
      if (!saved) {
        return
      }

      if (!isEdit && selectedRoleIds.length > 0) {
        await Promise.all(
          selectedRoleIds.map((roleId) => assignRole(saved.id, roleId))
        )
      }

      onSuccess?.(saved)
      onOpenChange(false)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit user" : "Add new user"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update this user's account details."
              : "Create a new account in the portal."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <UBInput
            label="Name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
          />
          <UBInput
            label="Email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
          <UBSelect
            label="Status"
            value={status}
            onValueChange={setStatus}
            options={STATUS_OPTIONS}
          />

          {!isEdit ? (
            <div>
              <label className="mb-2 block text-xs font-medium uppercase tracking-widest text-muted-foreground">
                Roles
              </label>
              {roles.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No roles available yet.
                </p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {roles.map((role) => {
                    const checked = selectedRoleIds.includes(role.id)

                    return (
                      <label
                        key={role.id}
                        className={cn(
                          "inline-flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-1.5 text-sm transition-colors",
                          checked
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-input text-foreground hover:bg-muted/50"
                        )}
                      >
                        <input
                          type="checkbox"
                          className="sr-only"
                          checked={checked}
                          onChange={() => toggleRole(role.id)}
                        />
                        {role.role_name}
                      </label>
                    )
                  })}
                </div>
              )}
            </div>
          ) : null}

          {formError ? <p className="text-sm text-destructive">{formError}</p> : null}
          {error ? <p className="text-sm text-destructive">{error}</p> : null}

          <div className="flex justify-end gap-2">
            <UBButton
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </UBButton>
            <UBButton type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : isEdit ? "Save changes" : "Add user"}
            </UBButton>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
