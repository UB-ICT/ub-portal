import { UserMinus, UserPlus } from "lucide-react"
import { useEffect, useMemo, useState, type FormEvent } from "react"

import { UBButton } from "@/components/shared/UBButton"
import { UBInput } from "@/components/shared/UBInput"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import type { CostCenter } from "@/lib/api/requisitions"
import { cn } from "@/lib/utils"
import { useAdminUsersStore } from "@/store/admin-users-store"
import { useCostCentersStore } from "@/store/cost-centers-store"

type CostCenterFormDialogProps = {
  open: boolean
  costCenter?: CostCenter | null
  onOpenChange: (open: boolean) => void
  onSuccess?: (costCenter: CostCenter) => void
}

export function CostCenterFormDialog({
  open,
  costCenter,
  onOpenChange,
  onSuccess,
}: CostCenterFormDialogProps) {
  const createCostCenter = useCostCentersStore((state) => state.createCostCenter)
  const updateCostCenter = useCostCentersStore((state) => state.updateCostCenter)
  const syncCostCenterUsers = useCostCentersStore(
    (state) => state.syncCostCenterUsers
  )
  const isSaving = useCostCentersStore((state) => state.isSaving)
  const error = useCostCentersStore((state) => state.error)

  const users = useAdminUsersStore((state) => state.users)
  const fetchUsers = useAdminUsersStore((state) => state.fetchUsers)

  const [name, setName] = useState("")
  const [number, setNumber] = useState("")
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([])
  const [userSearch, setUserSearch] = useState("")
  const [formError, setFormError] = useState<string | null>(null)

  const isEdit = Boolean(costCenter)

  useEffect(() => {
    if (!open) {
      return
    }

    void fetchUsers()
    setName(costCenter?.name ?? "")
    setNumber(costCenter?.number ?? "")
    setSelectedUserIds((costCenter?.users ?? []).map((user) => user.id))
    setUserSearch("")
    setFormError(null)
  }, [open, costCenter, fetchUsers])

  const filteredUsers = useMemo(() => {
    const needle = userSearch.trim().toLowerCase()

    if (!needle) {
      return users
    }

    return users.filter(
      (user) =>
        user.name.toLowerCase().includes(needle) ||
        user.email.toLowerCase().includes(needle)
    )
  }, [users, userSearch])

  const toggleUser = (userId: string) => {
    setSelectedUserIds((current) =>
      current.includes(userId)
        ? current.filter((id) => id !== userId)
        : [...current, userId]
    )
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setFormError(null)

    if (!name.trim()) {
      setFormError("Cost center name is required.")
      return
    }

    if (!number.trim()) {
      setFormError("Cost center number is required.")
      return
    }

    const payload = {
      name: name.trim(),
      number: number.trim(),
    }

    const saved =
      isEdit && costCenter
        ? await updateCostCenter(costCenter.id, payload)
        : await createCostCenter(payload)

    if (!saved) {
      return
    }

    const withUsers = await syncCostCenterUsers(saved.id, selectedUserIds)

    if (!withUsers) {
      return
    }

    onSuccess?.(withUsers)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Edit cost center" : "Add cost center"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update the cost center details and assigned users."
              : "Create a cost center and optionally assign users."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <UBInput
              label="Number"
              value={number}
              onChange={(event) => setNumber(event.target.value)}
              maxLength={50}
              required
              placeholder="013"
            />
            <UBInput
              label="Name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              maxLength={255}
              required
              placeholder="Information and Communication Technology"
            />
          </div>

          <div className="space-y-3">
            <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
              Assigned users
            </p>
            <UBInput
              label="Search users"
              value={userSearch}
              onChange={(event) => setUserSearch(event.target.value)}
              placeholder="Name or email"
            />
            <div className="max-h-56 space-y-1 overflow-y-auto rounded-xl border p-2">
              {filteredUsers.length === 0 ? (
                <p className="px-2 py-4 text-sm text-muted-foreground">
                  No users found.
                </p>
              ) : (
                filteredUsers.map((user) => {
                  const assigned = selectedUserIds.includes(user.id)

                  return (
                    <div
                      key={user.id}
                      className={cn(
                        "flex items-center justify-between gap-2 rounded-lg px-2 py-2",
                        assigned ? "bg-primary/5" : "hover:bg-muted/50"
                      )}
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">
                          {user.name}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                          {user.email}
                        </p>
                      </div>
                      <UBButton
                        type="button"
                        size="sm"
                        variant={assigned ? "secondary" : "outline"}
                        className="shrink-0"
                        disabled={isSaving}
                        onClick={() => toggleUser(user.id)}
                      >
                        {assigned ? (
                          <>
                            <UserMinus
                              className="size-3.5"
                              data-icon="inline-start"
                            />
                            Remove
                          </>
                        ) : (
                          <>
                            <UserPlus
                              className="size-3.5"
                              data-icon="inline-start"
                            />
                            Add
                          </>
                        )}
                      </UBButton>
                    </div>
                  )
                })
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {selectedUserIds.length} user
              {selectedUserIds.length === 1 ? "" : "s"} selected
            </p>
          </div>

          {formError || error ? (
            <p className="text-sm text-destructive">{formError ?? error}</p>
          ) : null}

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
              {isSaving
                ? "Saving..."
                : isEdit
                  ? "Save changes"
                  : "Create cost center"}
            </UBButton>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
