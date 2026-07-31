import { Upload } from "lucide-react"
import { useId, useState, type FormEvent } from "react"

import { UBButton } from "@/components/shared/UBButton"
import { UBNativeSelect, UBTextarea } from "@/components/shared/UBInput"
import type { BudgetYear } from "@/lib/api/budgets"
import type { CostCenter } from "@/lib/api/requisitions"
import { cn } from "@/lib/utils"
import { useBudgetsStore } from "@/store/budgets-store"

import { formatBudgetAmount } from "../lib/budget-utils"

type BudgetUploadPanelProps = {
  years: BudgetYear[]
  costCenters: Array<Pick<CostCenter, "id" | "name">>
  className?: string
  onImported?: (budgetId: number) => void
}

const STATUS_OPTIONS = [
  { value: "Draft", label: "Draft" },
  { value: "Approved", label: "Approved" },
  { value: "Active", label: "Active" },
]

export function BudgetUploadPanel({
  years,
  costCenters,
  className,
  onImported,
}: BudgetUploadPanelProps) {
  const importBudget = useBudgetsStore((state) => state.importBudget)
  const isSaving = useBudgetsStore((state) => state.isSaving)
  const error = useBudgetsStore((state) => state.error)

  const fileInputId = useId()
  const [yearId, setYearId] = useState("")
  const [costCenterId, setCostCenterId] = useState("")
  const [status, setStatus] = useState("Draft")
  const [notes, setNotes] = useState("")
  const [syncAccounts, setSyncAccounts] = useState(true)
  const [file, setFile] = useState<File | null>(null)
  const [formError, setFormError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setFormError(null)
    setSuccessMessage(null)

    if (!yearId || !costCenterId) {
      setFormError("Budget year and cost center are required.")
      return
    }

    if (!file) {
      setFormError("Choose an Excel file to upload (.xlsx).")
      return
    }

    const budget = await importBudget({
      file,
      cost_center_id: Number(costCenterId),
      budget_year_id: Number(yearId),
      notes: notes.trim() || null,
      status: status as "Draft" | "Approved" | "Active",
      sync_accounts: syncAccounts,
    })

    if (!budget) {
      return
    }

    const total =
      budget.line_items?.reduce((sum, item) => sum + Number(item.amount || 0), 0) ??
      0

    setSuccessMessage(
      `Imported ${budget.line_items?.length ?? 0} line items totaling ${formatBudgetAmount(total)} for ${budget.cost_center?.name ?? "cost center"} (${budget.budget_year?.label ?? "year"}).`
    )
    setFile(null)
    onImported?.(budget.id)
  }

  return (
    <section
      className={cn(
        "rounded-xl border border-border bg-card p-4 shadow-sm",
        className
      )}
    >
      <div className="mb-3">
        <h2 className="text-sm font-semibold tracking-tight">Upload budget</h2>
        <p className="text-xs text-muted-foreground">
          Upload an Excel cash-flow file (column A = account number, B =
          description, C = amount) to create or replace a budget for a cost
          center and year.
        </p>
      </div>

      <form onSubmit={(event) => void handleSubmit(event)} className="space-y-3">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <UBNativeSelect
            label="Budget year"
            options={[
              { value: "", label: "Select year" },
              ...years.map((year) => ({
                value: String(year.id),
                label: year.label,
              })),
            ]}
            value={yearId}
            onChange={(event) => setYearId(event.target.value)}
          />
          <UBNativeSelect
            label="Cost center"
            options={[
              { value: "", label: "Select cost center" },
              ...costCenters.map((costCenter) => ({
                value: String(costCenter.id),
                label: costCenter.name,
              })),
            ]}
            value={costCenterId}
            onChange={(event) => setCostCenterId(event.target.value)}
          />
          <UBNativeSelect
            label="Initial status"
            options={STATUS_OPTIONS}
            value={status}
            onChange={(event) => setStatus(event.target.value)}
          />
          <div>
            <label
              htmlFor={fileInputId}
              className="mb-2 block text-xs font-medium uppercase tracking-widest text-muted-foreground"
            >
              Spreadsheet
            </label>
            <input
              id={fileInputId}
              type="file"
              accept=".xlsx,.xls,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,text/csv"
              className="block w-full text-sm file:mr-3 file:rounded-md file:border-0 file:bg-muted file:px-3 file:py-2 file:text-sm file:font-medium"
              onChange={(event) => {
                setFile(event.target.files?.[0] ?? null)
                setSuccessMessage(null)
              }}
            />
            {file ? (
              <p className="mt-1 truncate text-xs text-muted-foreground">
                {file.name}
              </p>
            ) : null}
          </div>
        </div>

        <UBTextarea
          label="Notes (optional)"
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          rows={2}
          placeholder="e.g. FY26-27 ICT cash flow projection"
        />

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={syncAccounts}
            onChange={(event) => setSyncAccounts(event.target.checked)}
            className="size-4 rounded border-input"
          />
          <span>Create/update chart of accounts from the file</span>
        </label>

        {formError || error ? (
          <p className="text-sm text-destructive">{formError ?? error}</p>
        ) : null}
        {successMessage ? (
          <p className="text-sm text-emerald-700 dark:text-emerald-400">
            {successMessage}
          </p>
        ) : null}

        <div className="flex justify-end">
          <UBButton type="submit" disabled={isSaving}>
            <Upload className="size-4" data-icon="inline-start" />
            {isSaving ? "Uploading..." : "Upload budget"}
          </UBButton>
        </div>
      </form>
    </section>
  )
}
