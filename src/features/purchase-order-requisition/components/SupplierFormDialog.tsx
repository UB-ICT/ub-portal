import { useEffect, useState, type FormEvent } from "react"

import { UBButton } from "@/components/shared/UBButton"
import { UBInput, UBTextarea } from "@/components/shared/UBInput"
import { UBRadioButton } from "@/components/shared/UBRadioButton"
import { UBSelect } from "@/components/shared/UBSelect"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  fetchBanks,
  fetchPaymentTerms,
  type Bank,
  type PaymentTerm,
  type Supplier,
} from "@/lib/api/suppliers"
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
  const [address, setAddress] = useState("")
  const [paymentTermId, setPaymentTermId] = useState("")
  const [bankId, setBankId] = useState("")
  const [accountNumber, setAccountNumber] = useState("")
  const [routingNumber, setRoutingNumber] = useState("")
  const [preparedBy, setPreparedBy] = useState("")
  const [banks, setBanks] = useState<Bank[]>([])
  const [paymentTerms, setPaymentTerms] = useState<PaymentTerm[]>([])
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
    setTin(supplier?.TAX ?? supplier?.TIN ?? "")
    setNotes(supplier?.notes ?? "")
    setAddress(supplier?.address?.street ?? "")
    setPaymentTermId(
      supplier?.payment_term_id ? String(supplier.payment_term_id) : ""
    )
    setBankId(
      supplier?.bank_account?.bank_id
        ? String(supplier.bank_account.bank_id)
        : ""
    )
    setAccountNumber(supplier?.bank_account?.account_number ?? "")
    setRoutingNumber(supplier?.bank_account?.routing_number ?? "")
    setPreparedBy(supplier?.prepared_by ?? "")
    setFormError(null)
  }, [open, supplier])

  useEffect(() => {
    if (!open) {
      return
    }

    fetchBanks()
      .then(setBanks)
      .catch(() => setBanks([]))

    fetchPaymentTerms()
      .then(setPaymentTerms)
      .catch(() => setPaymentTerms([]))
  }, [open])

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setFormError(null)

    if (!name.trim()) {
      setFormError("Supplier name is required.")
      return
    }

    if (!contactPerson.trim() || !phoneNumber.trim() || !email.trim() || !tin.trim()) {
      setFormError("Contact person, phone, email, and Tax ID are required.")
      return
    }

    const payload = {
      name: name.trim(),
      contact_person: contactPerson.trim(),
      phone_number: phoneNumber.trim(),
      email: email.trim(),
      TAX: tin.trim(),
      notes: notes.trim() || undefined,
      payment_term_id: paymentTermId ? Number(paymentTermId) : undefined,
      prepared_by: preparedBy.trim() || undefined,
      address: address.trim() ? { street: address.trim() } : undefined,
      bank: bankId
        ? {
            bank_id: Number(bankId),
            account_number: accountNumber.trim() || undefined,
            routing_number: routingNumber.trim() || undefined,
          }
        : undefined,
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
              label="Tax ID"
              value={tin}
              onChange={(event) => setTin(event.target.value)}
              required
            />
          </div>
          <UBInput
            label="Address"
            value={address}
            onChange={(event) => setAddress(event.target.value)}
          />

          <UBRadioButton
            label="Payment terms"
            value={paymentTermId}
            onValueChange={setPaymentTermId}
            options={paymentTerms.map((term) => ({
              value: String(term.id),
              label: term.name,
            }))}
            orientation="horizontal"
          />

          <div className="grid gap-4 sm:grid-cols-3">
            <UBSelect
              label="Bank"
              value={bankId}
              onValueChange={setBankId}
              options={banks.map((bank) => ({
                value: String(bank.id),
                label: bank.name,
              }))}
              placeholder="Select a bank"
            />
            <UBInput
              label="Account number"
              value={accountNumber}
              onChange={(event) => setAccountNumber(event.target.value)}
            />
            <UBInput
              label="Bank routing number"
              value={routingNumber}
              onChange={(event) => setRoutingNumber(event.target.value)}
            />
          </div>

          <UBInput
            label="Prepared by"
            value={preparedBy}
            onChange={(event) => setPreparedBy(event.target.value)}
          />

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
