import { useState, type FormEvent } from "react"

import { UBButton } from "@/components/shared/UBButton"
import { UBInput, UBTextarea } from "@/components/shared/UBInput"
import type { UBSelectAddOptionContext } from "@/components/shared/UBSelect"
import { useSuppliersStore } from "@/store/suppliers-store"

type AddSupplierFormProps = UBSelectAddOptionContext

export function AddSupplierForm({ onCreated, onCancel }: AddSupplierFormProps) {
  const createSupplierQuick = useSuppliersStore(
    (state) => state.createSupplierQuick
  )
  const isSaving = useSuppliersStore((state) => state.isSaving)
  const error = useSuppliersStore((state) => state.error)

  const [name, setName] = useState("")
  const [contactPerson, setContactPerson] = useState("")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [email, setEmail] = useState("")
  const [tin, setTin] = useState("")
  const [notes, setNotes] = useState("")
  const [formError, setFormError] = useState<string | null>(null)

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setFormError(null)

    if (!name.trim()) {
      setFormError("Supplier name is required.")
      return
    }

    const supplier = await createSupplierQuick({
      name: name.trim(),
      contact_person: contactPerson.trim() || undefined,
      phone_number: phoneNumber.trim() || undefined,
      email: email.trim() || undefined,
      TIN: tin.trim() || undefined,
      notes: notes.trim() || undefined,
    })

    if (!supplier) {
      return
    }

    onCreated({
      value: String(supplier.id),
      label: supplier.name,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <UBInput
        label="Supplier name"
        value={name}
        onChange={(event) => setName(event.target.value)}
        placeholder="Acme Office Supplies"
        required
      />
      <UBInput
        label="Contact person"
        value={contactPerson}
        onChange={(event) => setContactPerson(event.target.value)}
        placeholder="Jane Smith"
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <UBInput
          label="Phone number"
          value={phoneNumber}
          onChange={(event) => setPhoneNumber(event.target.value)}
          placeholder="+501 600 0000"
        />
        <UBInput
          label="Email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="supplier@example.com"
        />
      </div>
      <UBInput
        label="TIN"
        value={tin}
        onChange={(event) => setTin(event.target.value)}
        placeholder="TIN-001"
      />
      <UBTextarea
        label="Notes"
        value={notes}
        onChange={(event) => setNotes(event.target.value)}
        placeholder="Preferred supplier, payment terms, or other details..."
        rows={3}
      />

      {formError ? <p className="text-sm text-destructive">{formError}</p> : null}
      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <div className="flex justify-end gap-2">
        <UBButton type="button" variant="outline" onClick={onCancel} disabled={isSaving}>
          Cancel
        </UBButton>
        <UBButton type="submit" disabled={isSaving}>
          {isSaving ? "Saving..." : "Add supplier"}
        </UBButton>
      </div>
    </form>
  )
}
