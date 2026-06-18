import { Plus } from "lucide-react"
import { useEffect, useState } from "react"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { UB_SELECT_ADD_NEW_VALUE } from "@/components/shared/UBSelect"
import { cn } from "@/lib/utils"
import { useSuppliersStore } from "@/store/suppliers-store"

import { isSupplierApproved } from "../lib/supplier-utils"
import { AddSupplierForm } from "./AddSupplierForm"

function SupplierNotesHint({ supplierId }: { supplierId: string }) {
  const suppliers = useSuppliersStore((state) => state.suppliers)
  const supplier = suppliers.find((item) => String(item.id) === supplierId)
  const notes = supplier?.notes?.trim()

  if (!notes) {
    return null
  }

  return (
    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{notes}</p>
  )
}

type SupplierQuoteSelectProps = {
  label?: string
  value: string
  onValueChange: (value: string) => void
  error?: string
  disabled?: boolean
  excludeSupplierIds?: string[]
  allowAddSupplier?: boolean
}

function SupplierOptionContent({
  name,
  approved,
}: {
  name: string
  approved: boolean
}) {
  return (
    <span className="flex min-w-0 items-center gap-2">
      <span
        className={cn(
          "truncate",
          !approved && "text-muted-foreground line-through"
        )}
      >
        {name}
      </span>
      {!approved ? (
        <span className="shrink-0 rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-800 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-200">
          Not approved
        </span>
      ) : null}
    </span>
  )
}

export function SupplierQuoteSelect({
  label = "Supplier",
  value,
  onValueChange,
  error,
  disabled = false,
  excludeSupplierIds = [],
  allowAddSupplier = true,
}: SupplierQuoteSelectProps) {
  const suppliers = useSuppliersStore((state) => state.suppliers)
  const isLoading = useSuppliersStore((state) => state.isLoading)
  const fetchSuppliers = useSuppliersStore((state) => state.fetchSuppliers)

  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [selectKey, setSelectKey] = useState(0)

  useEffect(() => {
    void fetchSuppliers()
  }, [fetchSuppliers])

  const labelId = `${label.replace(/\s+/g, "-").toLowerCase()}-label`
  const errorId = `${labelId}-error`

  const availableSuppliers = suppliers.filter(
    (supplier) => !excludeSupplierIds.includes(String(supplier.id))
  )

  const selectedSupplier = suppliers.find(
    (supplier) => String(supplier.id) === value
  )

  const handleValueChange = (nextValue: string) => {
    if (allowAddSupplier && nextValue === UB_SELECT_ADD_NEW_VALUE) {
      setAddDialogOpen(true)
      setSelectKey((current) => current + 1)
      return
    }

    onValueChange(nextValue)
  }

  const handleSupplierCreated = (option: { value: string; label: string }) => {
    onValueChange(option.value)
    setAddDialogOpen(false)
  }

  return (
    <div className="w-full">
      <label
        id={labelId}
        className="mb-2 block text-xs font-medium uppercase tracking-widest text-muted-foreground"
      >
        {label}
      </label>

      <Select
        key={selectKey}
        value={value || undefined}
        onValueChange={handleValueChange}
        disabled={disabled || isLoading}
      >
        <SelectTrigger
          aria-labelledby={labelId}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : undefined}
          className={cn(error && "border-destructive focus:ring-destructive/20")}
        >
          <SelectValue
            placeholder={isLoading ? "Loading suppliers..." : "Select a supplier"}
          >
            {selectedSupplier ? (
              <SupplierOptionContent
                name={selectedSupplier.name}
                approved={isSupplierApproved(selectedSupplier)}
              />
            ) : null}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {allowAddSupplier ? (
            <>
              <SelectItem
                value={UB_SELECT_ADD_NEW_VALUE}
                className="font-medium text-primary"
              >
                <span className="inline-flex items-center gap-2">
                  <Plus className="size-4" />
                  Add new supplier
                </span>
              </SelectItem>
              <SelectSeparator />
            </>
          ) : null}
          {availableSuppliers.map((supplier) => {
            const approved = isSupplierApproved(supplier)

            return (
              <SelectItem
                key={supplier.id}
                value={String(supplier.id)}
                textValue={supplier.name}
              >
                <SupplierOptionContent
                  name={supplier.name}
                  approved={approved}
                />
              </SelectItem>
            )
          })}
        </SelectContent>
      </Select>

      {error ? (
        <p id={errorId} className="mt-1 text-xs text-destructive">
          {error}
        </p>
      ) : null}

      {value ? <SupplierNotesHint supplierId={value} /> : null}

      {allowAddSupplier ? (
        <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add supplier</DialogTitle>
              <DialogDescription>
                Create a new supplier and select it for this quote.
              </DialogDescription>
            </DialogHeader>
            <AddSupplierForm
              onCreated={handleSupplierCreated}
              onCancel={() => setAddDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      ) : null}
    </div>
  )
}
