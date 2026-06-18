import { useEffect } from "react"

import { UBSelect } from "@/components/shared/UBSelect"
import { useSuppliersStore } from "@/store/suppliers-store"

import { AddSupplierForm } from "./AddSupplierForm"

type SupplierSelectProps = {
  label?: string
  value: string
  onValueChange: (value: string) => void
  error?: string
  disabled?: boolean
}

export function SupplierSelect({
  label = "Supplier",
  value,
  onValueChange,
  error,
  disabled = false,
}: SupplierSelectProps) {
  const suppliers = useSuppliersStore((state) => state.suppliers)
  const isLoading = useSuppliersStore((state) => state.isLoading)
  const fetchSuppliers = useSuppliersStore((state) => state.fetchSuppliers)

  useEffect(() => {
    void fetchSuppliers()
  }, [fetchSuppliers])

  const options = suppliers.map((supplier) => ({
    value: String(supplier.id),
    label: supplier.name,
  }))

  return (
    <UBSelect
      label={label}
      value={value}
      onValueChange={onValueChange}
      options={options}
      placeholder={isLoading ? "Loading suppliers..." : "Select a supplier"}
      error={error}
      disabled={disabled || isLoading}
      addOption={{
        label: "Add new supplier",
        dialogTitle: "Add supplier",
        dialogDescription:
          "Create a new supplier and select it for this requisition.",
        renderDialogContent: (context) => <AddSupplierForm {...context} />,
      }}
    />
  )
}
