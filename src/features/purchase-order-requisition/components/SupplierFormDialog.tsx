import { useEffect, useState, type FormEvent } from "react"

import { UBButton } from "@/components/shared/UBButton"
import { UBInput, UBTextarea } from "@/components/shared/UBInput"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import type { Supplier } from "@/lib/api/suppliers"
import { useSuppliersStore } from "@/store/suppliers-store"

type SupplierFormDialogProps = {
  open: boolean
  supplier?: Supplier | null
  onOpenChange: (open: boolean) => void
  onSuccess?: (supplier: Supplier) => void
}

export function SupplierFormDialog({
  open,
  supplier,
  onOpenChange,
  onSuccess,
}: SupplierFormDialogProps) {
  const createSupplier = useSuppliersStore((state) => state.createSupplier)
  const updateSupplier = useSuppliersStore((state) => state.updateSupplier)
  const isSaving = useSuppliersStore((state) => state.isSaving)
  const error = useSuppliersStore((state) => state.error)

  const [name, setName] = useState("")
  const [contactPerson, setContactPerson] = useState("")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [email, setEmail] = useState("")
  const [tin, setTin] = useState("")
  const [notes, setNotes] = useState("")
  const [formError, setFormError] = useState<string | null>(null)

  const isEdit = Boolean(supplier)

  useEffect(() => {
    if (!open) {
      return
    }

    setName(supplier?.name ?? "")
    setContactPerson(supplier?.contact_person ?? "")
    setPhoneNumber(supplier?.phone_number ?? "")
    setEmail(supplier?.email ?? "")
    setTin(supplier?.TIN ?? "")
    setNotes(supplier?.notes ?? "")
    setFormError(null)
  }, [open, supplier])

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setFormError(null)

    if (!name.trim()) {
      setFormError("Supplier name is required.")
      return
    }

    if (!contactPerson.trim() || !phoneNumber.trim() || !email.trim() || !tin.trim()) {
      setFormError("Contact person, phone, email, and TIN are required.")
      return
    }

    const payload = {
      name: name.trim(),
      contact_person: contactPerson.trim(),
      phone_number: phoneNumber.trim(),
      email: email.trim(),
      TIN: tin.trim(),
      notes: notes.trim() || undefined,
    }

    const saved = isEdit && supplier
      ? await updateSupplier(supplier.id, payload)
      : await createSupplier(payload)

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
          <DialogTitle>{isEdit ? "Edit supplier" : "Add supplier"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update supplier contact details."
              : "Create a supplier with contact details."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <UBInput
            label="Supplier name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <UBInput
              label="Contact person"
              value={contactPerson}
              onChange={(event) => setContactPerson(event.target.value)}
              required
            />
            <UBInput
              label="Phone number"
              value={phoneNumber}
              onChange={(event) => setPhoneNumber(event.target.value)}
              required
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <UBInput
              label="Email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
            <UBInput
              label="TIN"
              value={tin}
              onChange={(event) => setTin(event.target.value)}
              required
            />
          </div>
          <UBTextarea
            label="Notes"
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            rows={3}
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
              {isSaving ? "Saving..." : isEdit ? "Save changes" : "Add supplier"}
            </UBButton>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
