import { Upload } from "lucide-react"
import { useEffect, useState, type ChangeEvent, type FormEvent } from "react"

import { UBButton } from "@/components/shared/UBButton"
import { UBInput, UBTextarea } from "@/components/shared/UBInput"
import { UBSelect, type UBSelectOption } from "@/components/shared/UBSelect"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  uploadApplicationIcon,
  type AdminApplicationRecord,
  type AdminApplicationStatus,
} from "@/lib/api/admin-applications"
import { MenuIcon } from "@/lib/menu-icons"
import { cn } from "@/lib/utils"
import { useAdminApplicationsStore } from "@/store/admin-applications-store"

const STATUS_OPTIONS: UBSelectOption[] = [
  { value: "active", label: "Active" },
  { value: "maintenance", label: "Maintenance" },
  { value: "disabled", label: "Disabled" },
]

type ApplicationFormDialogProps = {
  open: boolean
  application?: AdminApplicationRecord | null
  onOpenChange: (open: boolean) => void
  onSuccess?: (application: AdminApplicationRecord) => void
}

export function ApplicationFormDialog({
  open,
  application,
  onOpenChange,
  onSuccess,
}: ApplicationFormDialogProps) {
  const createApplication = useAdminApplicationsStore(
    (state) => state.createApplication
  )
  const updateApplication = useAdminApplicationsStore(
    (state) => state.updateApplication
  )
  const isSaving = useAdminApplicationsStore((state) => state.isSaving)
  const error = useAdminApplicationsStore((state) => state.error)

  const [label, setLabel] = useState("")
  const [path, setPath] = useState("")
  const [icon, setIcon] = useState<string | null>(null)
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState("")
  const [status, setStatus] = useState<AdminApplicationStatus>("active")
  const [formError, setFormError] = useState<string | null>(null)
  const [isUploadingIcon, setIsUploadingIcon] = useState(false)
  const [iconError, setIconError] = useState<string | null>(null)

  const isEdit = Boolean(application)

  useEffect(() => {
    if (!open) {
      return
    }

    setLabel(application?.label ?? "")
    setPath(application?.path ?? "")
    setIcon(application?.icon ?? null)
    setDescription(application?.description ?? "")
    setCategory(application?.category ?? "")
    setStatus(application?.status ?? "active")
    setFormError(null)
    setIconError(null)
  }, [open, application])

  const handleIconFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ""

    if (!file) {
      return
    }

    setIsUploadingIcon(true)
    setIconError(null)

    try {
      const { url } = await uploadApplicationIcon(file)
      setIcon(url)
    } catch (uploadError) {
      setIconError(
        uploadError instanceof Error
          ? uploadError.message
          : "Failed to upload icon."
      )
    } finally {
      setIsUploadingIcon(false)
    }
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setFormError(null)

    if (!label.trim() || !path.trim()) {
      setFormError("Label and path are required.")
      return
    }

    const payload = {
      label: label.trim(),
      path: path.trim(),
      icon: icon ?? undefined,
      description: description.trim() || undefined,
      category: category.trim() || undefined,
      ...(isEdit ? { status } : {}),
    }

    const saved =
      isEdit && application
        ? await updateApplication(application.id, payload)
        : await createApplication(payload)

    if (!saved) {
      return
    }

    onSuccess?.(saved)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit app" : "Connect app"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update the application's catalog details."
              : "Register a new application in the portal catalog."}
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
              placeholder="/requisitions"
              required
            />
          </div>
          <div>
            <label className="mb-2 block text-xs font-medium uppercase tracking-widest text-muted-foreground">
              Icon
            </label>
            <input
              type="file"
              accept="image/*"
              className="sr-only"
              id="application-icon-upload"
              onChange={(event) => void handleIconFileChange(event)}
              disabled={isUploadingIcon}
            />
            <div className="flex items-center gap-3">
              <div className="flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-xl border bg-muted text-primary">
                <MenuIcon
                  icon={icon}
                  label={label || "Application"}
                  className="size-6"
                />
              </div>
              <label
                htmlFor="application-icon-upload"
                className={cn(
                  "inline-flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-border px-3 py-2 text-sm text-muted-foreground hover:bg-muted/50",
                  isUploadingIcon && "pointer-events-none opacity-60"
                )}
              >
                <Upload className="size-4" />
                {isUploadingIcon
                  ? "Uploading..."
                  : icon
                    ? "Replace icon"
                    : "Upload icon"}
              </label>
            </div>
            {iconError ? (
              <p className="mt-1 text-xs text-destructive">{iconError}</p>
            ) : null}
          </div>

          <UBInput
            label="Category"
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            placeholder="Optional category"
          />
          <UBTextarea
            label="Description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            rows={3}
          />
          {isEdit ? (
            <UBSelect
              label="Status"
              value={status}
              onValueChange={(value) =>
                setStatus(value as AdminApplicationStatus)
              }
              options={STATUS_OPTIONS}
            />
          ) : null}

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
              {isSaving ? "Saving..." : isEdit ? "Save changes" : "Connect app"}
            </UBButton>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
