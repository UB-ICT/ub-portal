import { useEffect } from "react"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { useSuppliersStore } from "@/store/suppliers-store"

import { isSupplierApproved } from "../lib/supplier-utils"

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
}: SupplierQuoteSelectProps) {
  const suppliers = useSuppliersStore((state) => state.suppliers)
  const isLoading = useSuppliersStore((state) => state.isLoading)
  const fetchSuppliers = useSuppliersStore((state) => state.fetchSuppliers)

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

  return (
    <div className="w-full">
      <label
        id={labelId}
        className="mb-2 block text-xs font-medium uppercase tracking-widest text-muted-foreground"
      >
        {label}
      </label>

      <Select
        value={value || undefined}
        onValueChange={onValueChange}
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
    </div>
  )
}
