import { Plus, Send } from "lucide-react"
import { useEffect, useMemo, useState } from "react"

import { UBButton } from "@/components/shared/UBButton"
import { UBInput, UBNativeSelect, UBTextarea } from "@/components/shared/UBInput"
import type { BudgetRecord, BudgetYear } from "@/lib/api/budgets"
import type { ChartOfAccount } from "@/lib/api/chart-of-accounts"
import { useBudgetsStore } from "@/store/budgets-store"
import { useChartOfAccountsStore } from "@/store/chart-of-accounts-store"
import { useCostCentersStore } from "@/store/cost-centers-store"
import { useRequisitionsStore } from "@/store/requisitions-store"

import { BudgetApprovalActions } from "../components/BudgetApprovalActions"
import {
  BudgetComparisonTable,
  mapComparisonToDraftRows,
  type BudgetComparisonDraftRow,
} from "../components/BudgetComparisonTable"
import { BudgetUploadPanel } from "../components/BudgetUploadPanel"
import {
  DEFAULT_BUDGET_SEARCH,
  filterBudgets,
  findActiveBudgetForCostCenter,
  type BudgetSearchCriteria,
} from "../lib/budget-utils"
import { BudgetsTable } from "../components/BudgetsTable"
import { SearchBudgets } from "../components/SearchBudgets"

export function PORBudgetsPage() {
  const budgets = useBudgetsStore((state) => state.budgets)
  const budgetYears = useBudgetsStore((state) => state.budgetYears)
  const accessMeta = useBudgetsStore((state) => state.accessMeta)
  const selectedBudget = useBudgetsStore((state) => state.selectedBudget)
  const comparison = useBudgetsStore((state) => state.comparison)
  const isLoading = useBudgetsStore((state) => state.isLoading)
  const isSaving = useBudgetsStore((state) => state.isSaving)
  const isReviewing = useBudgetsStore((state) => state.isReviewing)
  const error = useBudgetsStore((state) => state.error)
  const fetchBudgets = useBudgetsStore((state) => state.fetchBudgets)
  const fetchBudgetYears = useBudgetsStore((state) => state.fetchBudgetYears)
  const fetchBudgetById = useBudgetsStore((state) => state.fetchBudgetById)
  const fetchComparison = useBudgetsStore((state) => state.fetchComparison)
  const createBudget = useBudgetsStore((state) => state.createBudget)
  const updateBudget = useBudgetsStore((state) => state.updateBudget)
  const createBudgetYear = useBudgetsStore((state) => state.createBudgetYear)
  const openSubmissions = useBudgetsStore((state) => state.openSubmissions)
  const closeSubmissions = useBudgetsStore((state) => state.closeSubmissions)

  const assignedCostCenter = useRequisitionsStore(
    (state) => state.assignedCostCenter
  )
  const fetchFormData = useRequisitionsStore((state) => state.fetchFormData)
  const costCenters = useCostCentersStore((state) => state.costCenters)
  const fetchCostCenters = useCostCentersStore((state) => state.fetchCostCenters)
  const chartOfAccounts = useChartOfAccountsStore(
    (state) => state.chartOfAccounts
  )
  const fetchChartOfAccounts = useChartOfAccountsStore(
    (state) => state.fetchChartOfAccounts
  )

  const [searchCriteria, setSearchCriteria] =
    useState<BudgetSearchCriteria>(DEFAULT_BUDGET_SEARCH)
  const [panelMode, setPanelMode] = useState<"list" | "create" | "edit" | "view">(
    "list"
  )
  const [yearId, setYearId] = useState("")
  const [costCenterId, setCostCenterId] = useState("")
  const [notes, setNotes] = useState("")
  const [rows, setRows] = useState<BudgetComparisonDraftRow[]>([])
  const [newYearLabel, setNewYearLabel] = useState("")
  const [accountToAdd, setAccountToAdd] = useState("")
  const [formError, setFormError] = useState<string | null>(null)

  const isFinanceEditor = accessMeta?.is_finance_editor === true
  const isCostCenterUser = accessMeta?.is_cost_center_user === true
  const canManageYears = accessMeta?.can_manage_years === true
  const canUploadBudget = accessMeta?.can_upload_budget === true
  const canCreateBudget = accessMeta?.can_create_budget === true

  useEffect(() => {
    void fetchBudgets()
    void fetchBudgetYears()
    void fetchFormData()
    void fetchChartOfAccounts()
  }, [fetchBudgets, fetchBudgetYears, fetchFormData, fetchChartOfAccounts])

  useEffect(() => {
    if (isFinanceEditor) {
      void fetchCostCenters()
    }
  }, [fetchCostCenters, isFinanceEditor])

  const filteredBudgets = useMemo(
    () => filterBudgets(budgets, searchCriteria),
    [budgets, searchCriteria]
  )

  const openYears = budgetYears.filter((year) => year.submissions_open)
  const createYearOptions = isCostCenterUser ? openYears : budgetYears
  const editable = selectedBudget?.can_edit === true || panelMode === "create"

  const costCenterOptions = useMemo(() => {
    if (isCostCenterUser) {
      if (accessMeta?.assigned_cost_centers?.length) {
        return accessMeta.assigned_cost_centers
      }

      return assignedCostCenter ? [assignedCostCenter] : []
    }

    if (costCenters.length) {
      return costCenters
    }

    return assignedCostCenter ? [assignedCostCenter] : []
  }, [
    accessMeta?.assigned_cost_centers,
    assignedCostCenter,
    costCenters,
    isCostCenterUser,
  ])

  const resetEditor = () => {
    const defaultCostCenterId =
      costCenterOptions.length === 1
        ? String(costCenterOptions[0].id)
        : assignedCostCenter
          ? String(assignedCostCenter.id)
          : ""
    const defaultYearId =
      isCostCenterUser && openYears.length === 1 ? String(openYears[0].id) : ""

    setYearId(defaultYearId)
    setCostCenterId(defaultCostCenterId)
    setNotes("")
    setRows([])
    setAccountToAdd("")
    setFormError(null)
  }

  const openCreate = () => {
    if (!canCreateBudget) {
      setFormError(
        isCostCenterUser
          ? "You can create a budget only after the budget officer requests submissions for a year."
          : "You are not authorized to create a budget."
      )
      return
    }

    resetEditor()
    setPanelMode("create")
  }

  const openBudget = async (
    budget: BudgetRecord,
    mode: "edit" | "view"
  ) => {
    setFormError(null)
    setPanelMode(mode)
    const loaded = await fetchBudgetById(budget.id)
    const loadedComparison = await fetchComparison(budget.id)

    if (!loaded) {
      return
    }

    setYearId(String(loaded.budget_year_id))
    setCostCenterId(String(loaded.cost_center_id))
    setNotes(loaded.notes ?? "")
    setRows(mapComparisonToDraftRows(loadedComparison))
  }

  const handleAddAccount = (accounts: ChartOfAccount[]) => {
    const account = accounts.find((item) => String(item.id) === accountToAdd)

    if (!account) {
      return
    }

    if (rows.some((row) => row.chart_of_account_id === account.id)) {
      setFormError("That account is already on this budget.")
      return
    }

    setRows((current) => [
      ...current,
      {
        chart_of_account_id: account.id,
        account_no: account.account_no,
        description: account.description,
        previousAmount: null,
        previousNotes: null,
        amount: "",
        notes: "",
      },
    ])
    setAccountToAdd("")
    setFormError(null)
  }

  const buildLineItemPayload = () =>
    rows
      .filter((row) => row.amount.trim() !== "")
      .map((row) => ({
        chart_of_account_id: row.chart_of_account_id,
        amount: Number(row.amount),
        notes: row.notes.trim() || null,
      }))

  const handleSave = async (shouldSubmit: boolean) => {
    setFormError(null)

    if (panelMode === "create") {
      if (!yearId || !costCenterId) {
        setFormError("Budget year and cost center are required.")
        return
      }

      if (
        isCostCenterUser &&
        !openYears.some((year) => String(year.id) === yearId)
      ) {
        setFormError(
          "You can only create a budget for a year the budget officer has opened for submissions."
        )
        return
      }

      if (
        isCostCenterUser &&
        !costCenterOptions.some(
          (costCenter) => String(costCenter.id) === costCenterId
        )
      ) {
        setFormError("You can only create budgets for your assigned cost center.")
        return
      }

      const activeBudget = findActiveBudgetForCostCenter(
        budgets,
        Number(costCenterId)
      )

      if (activeBudget) {
        setFormError(
          `This cost center already has an active budget (${activeBudget.status?.name ?? "in progress"}) for ${activeBudget.budget_year?.label ?? "another year"}. Finish or delete it before creating another.`
        )
        return
      }

      const created = await createBudget({
        cost_center_id: Number(costCenterId),
        budget_year_id: Number(yearId),
        notes: notes.trim() || null,
        line_items: buildLineItemPayload(),
        submit: shouldSubmit,
      })

      if (!created) {
        return
      }

      await openBudget(created, shouldSubmit ? "view" : "edit")
      await fetchBudgets(true)
      return
    }

    if (!selectedBudget) {
      return
    }

    const updated = await updateBudget(selectedBudget.id, {
      notes: notes.trim() || null,
      line_items: buildLineItemPayload(),
      submit: shouldSubmit,
    })

    if (!updated) {
      return
    }

    await openBudget(updated, updated.can_edit ? "edit" : "view")
    await fetchBudgets(true)
  }

  return (
    <div className="flex h-full min-h-0 flex-col gap-4 overflow-hidden">
      <header className="flex shrink-0 flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold tracking-tight">Budget</h1>
          <p className="text-sm text-muted-foreground">
            Prepare, compare, submit, and approve cost center budgets by year.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {panelMode !== "list" ? (
            <UBButton
              size="sm"
              variant="outline"
              onClick={() => {
                setPanelMode("list")
                resetEditor()
              }}
            >
              Back to list
            </UBButton>
          ) : canCreateBudget ? (
            <UBButton size="sm" onClick={openCreate}>
              <Plus className="size-4" data-icon="inline-start" />
              New budget
            </UBButton>
          ) : isCostCenterUser ? (
            <p className="max-w-sm text-right text-xs text-muted-foreground">
              New budgets open when the budget officer requests submissions for
              a year.
            </p>
          ) : null}
        </div>
      </header>

      {panelMode === "list" ? (
        <>
          {canManageYears ? (
            <BudgetYearControls
              years={budgetYears}
              newYearLabel={newYearLabel}
              onNewYearLabelChange={setNewYearLabel}
              onCreateYear={async () => {
                if (!/^\d{4}-\d{4}$/.test(newYearLabel.trim())) {
                  setFormError("Use a year label like 2026-2027.")
                  return
                }

                const created = await createBudgetYear(newYearLabel.trim())

                if (created) {
                  setNewYearLabel("")
                  setFormError(null)
                }
              }}
              onOpen={openSubmissions}
              onClose={closeSubmissions}
              isSaving={isSaving}
            />
          ) : isCostCenterUser && openYears.length > 0 ? (
            <div className="rounded-xl border border-border bg-card px-3 py-2 text-sm shadow-sm">
              <span className="text-muted-foreground">Submissions open for </span>
              <span className="font-medium">
                {openYears.map((year) => year.label).join(", ")}
              </span>
            </div>
          ) : null}

          {canUploadBudget ? (
            <BudgetUploadPanel
              years={budgetYears}
              costCenters={costCenterOptions}
              onImported={(budgetId) => {
                void fetchBudgets(true)
                void fetchChartOfAccounts(true)
                void openBudget(
                  { id: budgetId } as BudgetRecord,
                  "view"
                )
              }}
            />
          ) : null}

          <SearchBudgets years={budgetYears} onSearch={setSearchCriteria} />

          {error || formError ? (
            <p className="text-sm text-destructive">{formError ?? error}</p>
          ) : null}

          <div className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain">
            <BudgetsTable
              budgets={filteredBudgets}
              isLoading={isLoading || isSaving}
              onView={(budget) => void openBudget(budget, "view")}
            />
          </div>
        </>
      ) : (
        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-y-contain pb-6">
          {panelMode === "create" ? (
            <div className="grid gap-3 md:grid-cols-2">
              <UBNativeSelect
                label="Budget year"
                options={[
                  { value: "", label: "Select year" },
                  ...createYearOptions.map((year) => ({
                    value: String(year.id),
                    label: year.submissions_open
                      ? `${year.label} (submissions open)`
                      : year.label,
                  })),
                ]}
                value={yearId}
                onChange={(event) => setYearId(event.target.value)}
              />
              <UBNativeSelect
                label="Cost center"
                options={[
                  { value: "", label: "Select cost center" },
                  ...costCenterOptions.map((costCenter) => {
                    const activeBudget = findActiveBudgetForCostCenter(
                      budgets,
                      costCenter.id
                    )

                    return {
                      value: String(costCenter.id),
                      label: activeBudget
                        ? `${costCenter.name} (active: ${activeBudget.budget_year?.label ?? "in progress"})`
                        : costCenter.name,
                    }
                  }),
                ]}
                value={costCenterId}
                onChange={(event) => setCostCenterId(event.target.value)}
                disabled={isCostCenterUser && costCenterOptions.length === 1}
              />
            </div>
          ) : (
            <div className="grid gap-3 md:grid-cols-4">
              <UBInput
                label="Cost center"
                value={selectedBudget?.cost_center?.name ?? "—"}
                readOnly
                disabled
              />
              <UBInput
                label="Year"
                value={selectedBudget?.budget_year?.label ?? "—"}
                readOnly
                disabled
              />
              <UBInput
                label="Status"
                value={selectedBudget?.status?.name ?? "—"}
                readOnly
                disabled
              />
              <UBInput
                label="Stage"
                value={selectedBudget?.stage?.name ?? "—"}
                readOnly
                disabled
              />
            </div>
          )}

          <UBTextarea
            label="Budget notes"
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            rows={3}
            disabled={!editable || isSaving || isReviewing}
          />

          <div className="flex flex-wrap items-end gap-3">
            <div className="min-w-[240px] flex-1">
              <UBNativeSelect
                label="Add account line"
                options={[
                  { value: "", label: "Select account" },
                  ...chartOfAccounts.map((account) => ({
                    value: String(account.id),
                    label: `${account.account_no} — ${account.description}`,
                  })),
                ]}
                value={accountToAdd}
                onChange={(event) => setAccountToAdd(event.target.value)}
                disabled={!editable || isSaving}
              />
            </div>
            <UBButton
              type="button"
              variant="secondary"
              disabled={!editable || !accountToAdd || isSaving}
              onClick={() => handleAddAccount(chartOfAccounts)}
            >
              Add line
            </UBButton>
          </div>

          <BudgetComparisonTable
            comparison={comparison}
            rows={rows}
            editable={editable && !isSaving && !isReviewing}
            onChange={setRows}
          />

          {formError || error ? (
            <p className="text-sm text-destructive">{formError ?? error}</p>
          ) : null}

          {editable ? (
            <div className="flex flex-wrap gap-2">
              <UBButton
                type="button"
                onClick={() => void handleSave(false)}
                disabled={isSaving || isReviewing}
              >
                {isSaving ? "Saving..." : "Save budget"}
              </UBButton>
              {(panelMode === "create" || selectedBudget?.can_submit) && (
                <UBButton
                  type="button"
                  variant="secondary"
                  onClick={() => void handleSave(true)}
                  disabled={isSaving || isReviewing}
                >
                  <Send className="size-4" data-icon="inline-start" />
                  {isSaving || isReviewing ? "Submitting..." : "Submit budget"}
                </UBButton>
              )}
            </div>
          ) : null}

          {selectedBudget?.show_approval_actions ? (
            <BudgetApprovalActions
              budgetId={selectedBudget.id}
              stageName={selectedBudget.stage?.name}
              canAct={Boolean(selectedBudget.can_approve)}
              userStageAction={selectedBudget.user_stage_action}
              onDecision={() => {
                void openBudget(selectedBudget, "view")
                void fetchBudgets(true)
              }}
            />
          ) : null}

          {selectedBudget?.can_activate || selectedBudget?.can_deactivate ? (
            <BudgetLifecycleActions
              canActivate={Boolean(selectedBudget.can_activate)}
              canDeactivate={Boolean(selectedBudget.can_deactivate)}
              isBusy={isReviewing}
              onActivate={async () => {
                const updated = await useBudgetsStore
                  .getState()
                  .activateBudget(selectedBudget.id)
                if (updated) {
                  await openBudget(updated, "view")
                  await fetchBudgets(true)
                }
              }}
              onDeactivate={async () => {
                const updated = await useBudgetsStore
                  .getState()
                  .deactivateBudget(selectedBudget.id)
                if (updated) {
                  await openBudget(updated, "view")
                  await fetchBudgets(true)
                }
              }}
            />
          ) : null}

        </div>
      )}
    </div>
  )
}

type BudgetLifecycleActionsProps = {
  canActivate: boolean
  canDeactivate: boolean
  isBusy: boolean
  onActivate: () => Promise<void>
  onDeactivate: () => Promise<void>
}

function BudgetLifecycleActions({
  canActivate,
  canDeactivate,
  isBusy,
  onActivate,
  onDeactivate,
}: BudgetLifecycleActionsProps) {
  return (
    <section className="space-y-3 rounded-xl border border-border/70 bg-card p-4 shadow-sm">
      <div>
        <h3 className="text-sm font-semibold tracking-tight">Budget status</h3>
        <p className="text-xs text-muted-foreground">
          {canActivate
            ? "Activate this approved budget to make it the live budget for the cost center. Any previously active budget for that center becomes inactive."
            : "Deactivate the live budget when it should no longer be in force."}
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        {canActivate ? (
          <UBButton
            type="button"
            disabled={isBusy}
            onClick={() => void onActivate()}
          >
            {isBusy ? "Processing..." : "Activate budget"}
          </UBButton>
        ) : null}
        {canDeactivate ? (
          <UBButton
            type="button"
            variant="outline"
            disabled={isBusy}
            onClick={() => void onDeactivate()}
          >
            {isBusy ? "Processing..." : "Set inactive"}
          </UBButton>
        ) : null}
      </div>
    </section>
  )
}

type BudgetYearControlsProps = {
  years: BudgetYear[]
  newYearLabel: string
  onNewYearLabelChange: (value: string) => void
  onCreateYear: () => Promise<void>
  onOpen: (id: number) => Promise<BudgetYear | null>
  onClose: (id: number) => Promise<BudgetYear | null>
  isSaving: boolean
}

function BudgetYearControls({
  years,
  newYearLabel,
  onNewYearLabelChange,
  onCreateYear,
  onOpen,
  onClose,
  isSaving,
}: BudgetYearControlsProps) {
  return (
    <div className="rounded-xl border border-border bg-card p-3 shadow-sm">
      <div className="mb-3 flex flex-wrap items-end gap-3">
        <div className="min-w-[180px]">
          <UBInput
            label="New budget year"
            placeholder="2026-2027"
            value={newYearLabel}
            onChange={(event) => onNewYearLabelChange(event.target.value)}
          />
        </div>
        <UBButton
          type="button"
          size="sm"
          variant="secondary"
          disabled={isSaving || !newYearLabel.trim()}
          onClick={() => void onCreateYear()}
        >
          Create year
        </UBButton>
      </div>
      <div className="flex flex-wrap gap-2">
        {years.map((year) => (
          <div
            key={year.id}
            className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm"
          >
            <span className="font-medium">{year.label}</span>
            <span className="text-xs text-muted-foreground">
              {year.submissions_open ? "Submissions open" : "Closed"}
            </span>
            {year.submissions_open ? (
              <UBButton
                type="button"
                size="sm"
                variant="outline"
                disabled={isSaving}
                onClick={() => void onClose(year.id)}
              >
                Close
              </UBButton>
            ) : (
              <UBButton
                type="button"
                size="sm"
                variant="outline"
                disabled={isSaving}
                onClick={() => void onOpen(year.id)}
              >
                Request submissions
              </UBButton>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

