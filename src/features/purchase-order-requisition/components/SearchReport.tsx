import { useEffect, useState } from "react"

import { UBButton } from "@/components/shared/UBButton"
import { UBInput, UBNativeSelect } from "@/components/shared/UBInput"
import type { RequisitionReportFilters } from "@/lib/api/reports"
import { useCostCentersStore } from "@/store/cost-centers-store"
import { useStatusesStore } from "@/store/statuses-store"
import { useSuppliersStore } from "@/store/suppliers-store"
import { cn } from "@/lib/utils"

import { getSelectableSuppliers } from "../lib/supplier-admin-utils"

const SORT_FIELD_OPTIONS = [
  { value: "number", label: "Requisition number" },
  { value: "total", label: "Amount" },
  { value: "cost_center", label: "Department / Cost center" },
  { value: "supplier", label: "Supplier" },
  { value: "status", label: "Status" },
] as const

const SORT_DIR_OPTIONS = [
  { value: "asc", label: "Ascending" },
  { value: "desc", label: "Descending" },
] as const

type ReportFormValues = {
  dateFrom: string
  dateTo: string
  costCenterId: string
  supplierId: string
  statusId: string
  number: string
  amountMin: string
  amountMax: string
  sortBy: string
  sortDir: string
}

function defaultDateRange() {
  const now = new Date()
  const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

  return {
    dateFrom: firstOfMonth.toISOString().slice(0, 10),
    dateTo: now.toISOString().slice(0, 10),
  }
}

const INITIAL_VALUES: ReportFormValues = {
  ...defaultDateRange(),
  costCenterId: "",
  supplierId: "",
  statusId: "",
  number: "",
  amountMin: "",
  amountMax: "",
  sortBy: "number",
  sortDir: "asc",
}

type SearchReportProps = {
  onGenerate: (filters: RequisitionReportFilters) => void
  isGenerating?: boolean
  className?: string
}

export function SearchReport({
  onGenerate,
  isGenerating = false,
  className,
}: SearchReportProps) {
  const [values, setValues] = useState<ReportFormValues>(INITIAL_VALUES)

  const suppliers = useSuppliersStore((state) => state.suppliers)
  const fetchSuppliers = useSuppliersStore((state) => state.fetchSuppliers)
  const costCenters = useCostCentersStore((state) => state.costCenters)
  const fetchCostCenters = useCostCentersStore(
    (state) => state.fetchCostCenters
  )
  const statuses = useStatusesStore((state) => state.statuses)
  const fetchStatuses = useStatusesStore((state) => state.fetchStatuses)

  useEffect(() => {
    void fetchSuppliers()
    void fetchCostCenters()
    void fetchStatuses()
  }, [fetchSuppliers, fetchCostCenters, fetchStatuses])

  const supplierOptions = [
    { value: "", label: "All suppliers" },
    ...getSelectableSuppliers(suppliers).map((supplier) => ({
      value: String(supplier.id),
      label: supplier.name,
    })),
  ]

  const costCenterOptions = [
    { value: "", label: "All departments / cost centers" },
    ...costCenters.map((costCenter) => ({
      value: String(costCenter.id),
      label: costCenter.name,
    })),
  ]

  const statusOptions = [
    { value: "", label: "All statuses" },
    ...statuses.map((status) => ({
      value: String(status.id),
      label: status.name,
    })),
  ]

  const update = (patch: Partial<ReportFormValues>) => {
    setValues((current) => ({ ...current, ...patch }))
  }

  const handleGenerate = () => {
    onGenerate({
      dateFrom: values.dateFrom,
      dateTo: values.dateTo,
      costCenterId: values.costCenterId
        ? Number(values.costCenterId)
        : undefined,
      supplierId: values.supplierId ? Number(values.supplierId) : undefined,
      statusId: values.statusId ? Number(values.statusId) : undefined,
      number: values.number.trim() || undefined,
      amountMin: values.amountMin ? Number(values.amountMin) : undefined,
      amountMax: values.amountMax ? Number(values.amountMax) : undefined,
      sortBy: values.sortBy as RequisitionReportFilters["sortBy"],
      sortDir: values.sortDir as RequisitionReportFilters["sortDir"],
    })
  }

  const canGenerate = Boolean(values.dateFrom && values.dateTo)

  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-card p-4 shadow-sm",
        className
      )}
    >
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <UBInput
          label="From"
          type="date"
          value={values.dateFrom}
          onChange={(event) => update({ dateFrom: event.target.value })}
        />
        <UBInput
          label="To"
          type="date"
          value={values.dateTo}
          onChange={(event) => update({ dateTo: event.target.value })}
        />
        <UBNativeSelect
          label="Department / Cost center"
          options={costCenterOptions}
          value={values.costCenterId}
          onChange={(event) => update({ costCenterId: event.target.value })}
        />
        <UBNativeSelect
          label="Supplier"
          options={supplierOptions}
          value={values.supplierId}
          onChange={(event) => update({ supplierId: event.target.value })}
        />
        <UBNativeSelect
          label="Status"
          options={statusOptions}
          value={values.statusId}
          onChange={(event) => update({ statusId: event.target.value })}
        />
        <UBInput
          label="Requisition number"
          placeholder="000000001"
          value={values.number}
          onChange={(event) => update({ number: event.target.value })}
        />
        <UBInput
          label="Amount min"
          type="number"
          min={0}
          value={values.amountMin}
          onChange={(event) => update({ amountMin: event.target.value })}
        />
        <UBInput
          label="Amount max"
          type="number"
          min={0}
          value={values.amountMax}
          onChange={(event) => update({ amountMax: event.target.value })}
        />
        <UBNativeSelect
          label="Sort by"
          options={[...SORT_FIELD_OPTIONS]}
          value={values.sortBy}
          onChange={(event) => update({ sortBy: event.target.value })}
        />
        <UBNativeSelect
          label="Sort direction"
          options={[...SORT_DIR_OPTIONS]}
          value={values.sortDir}
          onChange={(event) => update({ sortDir: event.target.value })}
        />
      </div>

      <div className="mt-4 flex justify-end">
        <UBButton
          type="button"
          onClick={handleGenerate}
          disabled={!canGenerate || isGenerating}
        >
          {isGenerating ? "Generating..." : "Generate report"}
        </UBButton>
      </div>
    </div>
  )
}
