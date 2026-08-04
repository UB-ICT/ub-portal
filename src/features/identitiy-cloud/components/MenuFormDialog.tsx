import { useEffect, useState, type FormEvent } from "react"

import { UBButton } from "@/components/shared/UBButton"
import { UBInput, UBNativeSelect } from "@/components/shared/UBInput"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import type { AdminMenuPayload, AdminMenuRecord } from "@/lib/api/admin-menus"
import { useAdminMenusStore } from "@/store/admin-menus-store"

type MenuFormDialogProps = {
  open: boolean
  menu?: AdminMenuRecord | null
  defaultParentId?: string | null
  onOpenChange: (open: boolean) => void
}

const TYPE_OPTIONS = [
  { value: "application", label: "Application" },
  { value: "submenu", label: "Submenu" },
  { value: "user-menu", label: "User menu" },
  { value: "external-link", label: "External link" },
]

const STATUS_OPTIONS = [
  { value: "active", label: "Active" },
  { value: "maintenance", label: "Maintenance" },
  { value: "disabled", label: "Disabled" },
]

export function MenuFormDialog({
  open,
  menu,
  defaultParentId = null,
  onOpenChange,
}: MenuFormDialogProps) {
  const roots = useAdminMenusStore((state) => state.roots)
  const createMenu = useAdminMenusStore((state) => state.createMenu)
  const updateMenu = useAdminMenusStore((state) => state.updateMenu)
  const isSaving = useAdminMenusStore((state) => state.isSaving)
  const error = useAdminMenusStore((state) => state.error)

  const isEdit = Boolean(menu)

  const [label, setLabel] = useState("")
  const [path, setPath] = useState("")
  const [icon, setIcon] = useState("")
  const [type, setType] = useState("submenu")
  const [status, setStatus] = useState("active")
  const [parentId, setParentId] = useState<string>("")
  const [sortOrder, setSortOrder] = useState("0")
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState("")
  const [formError, setFormError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) {
      return
    }

    setLabel(menu?.label ?? "")
    setPath(menu?.path ?? "")
    setIcon(menu?.icon ?? "")
    setType(menu?.type ?? (defaultParentId ? "submenu" : "application"))
    setStatus(menu?.status ?? "active")
    setParentId(menu?.parent_id ?? defaultParentId ?? "")
    setSortOrder(String(menu?.sort_order ?? 0))
    setDescription(menu?.description ?? "")
    setCategory(menu?.category ?? "")
    setFormError(null)
  }, [open, menu, defaultParentId])

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setFormError(null)

    if (!label.trim() || !path.trim()) {
      setFormError("Label and path are required.")
      return
    }

    const payload: AdminMenuPayload = {
      label: label.trim(),
      path: path.trim(),
      icon: icon.trim() || null,
      type,
      status,
      description: description.trim() || null,
      category: category.trim() || null,
      parent_id: parentId || null,
      sort_order: Number.parseInt(sortOrder, 10) || 0,
    }

    // Preserve existing role assignments on edit; new items start public
    // until roles are checked in the matrix.
    if (isEdit && menu) {
      payload.role_ids = (menu.roles ?? []).map((role) => role.id)
    } else {
      payload.role_ids = []
    }

    const saved =
      isEdit && menu
        ? await updateMenu(menu.id, payload)
        : await createMenu(payload)

    if (!saved) {
      return
    }

    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit menu item" : "Add menu item"}</DialogTitle>
          <DialogDescription>
            Role visibility is managed in the matrix. This dialog only edits the
            menu item itself.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <UBInput
              label="Label"
              value={label}
              onChange={(event) => setLabel(event.target.value)}
              required
            />
            <UBInput
              label="Path"
              value={path}
              onChange={(event) => setPath(event.target.value)}
              required
              placeholder="/requisitions/forms"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <UBNativeSelect
              label="Type"
              options={TYPE_OPTIONS}
              value={type}
              onChange={(event) => setType(event.target.value)}
            />
            <UBNativeSelect
              label="Status"
              options={STATUS_OPTIONS}
              value={status}
              onChange={(event) => setStatus(event.target.value)}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <UBNativeSelect
              label="Parent application"
              options={[
                { value: "", label: "None (root)" },
                ...roots.map((root) => ({
                  value: root.id,
                  label: `${root.label} (${root.type})`,
                })),
              ]}
              value={parentId}
              onChange={(event) => setParentId(event.target.value)}
            />
            <UBInput
              label="Sort order"
              type="number"
              value={sortOrder}
              onChange={(event) => setSortOrder(event.target.value)}
              min={0}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <UBInput
              label="Icon"
              value={icon}
              onChange={(event) => setIcon(event.target.value)}
              placeholder="building-2"
            />
            <UBInput
              label="Category"
              value={category}
              onChange={(event) => setCategory(event.target.value)}
            />
          </div>

          <UBInput
            label="Description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
          />

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
              {isSaving ? "Saving..." : isEdit ? "Save changes" : "Create"}
            </UBButton>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
