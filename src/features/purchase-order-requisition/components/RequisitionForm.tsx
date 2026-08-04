import { Save, Send, X } from "lucide-react"
import { useEffect, useMemo, useState } from "react"

import { uploadRequisitionQuote } from "@/lib/api/attachments"
import { fetchOperationalBudgetLineItems } from "@/lib/api/budgets"
import type { ChartOfAccount } from "@/lib/api/chart-of-accounts"
import { UBButton } from "@/components/shared/UBButton"
import { UBInput } from "@/components/shared/UBInput"
import type { RequisitionPriority, RequisitionRecord, RequisitionUserStageAction } from "@/lib/api/requisitions"
import type { RequisitionTag } from "@/lib/api/tags"
import { cn } from "@/lib/utils"
import { fetchGstRate } from "@/lib/api/requisition-settings"
import { useRequisitionsStore } from "@/store/requisitions-store"
import type { DiscountType } from "../lib/line-pricing"
import { DEFAULT_GST_RATE_PERCENT } from "../lib/line-pricing"
import { normalizeRequisitionPriority } from "../lib/requisition-priorities"
import {
  createEmptySupplierQuote,
  mapSupplierQuoteToUploadMeta,
  mapSupplierQuotesToPayload,
  revokeSupplierQuotePreviews,
  validateSupplierQuotes,
  type SupplierQuoteDraft,
} from "../lib/supplier-quotes"

import {
  createEmptyLineItem,
  calculateRequisitionTotalFromLineItems,
  isLineItemsValid,
  mapLineItemsForApi,
  RequisitionLineItemsTable,
  type RequisitionLineItemDraft,
} from "./RequisitionLineItemsTable"
import { CurrencySelect } from "./CurrencySelect"
import { PrioritySelect } from "./PrioritySelect"
import { RequisitionTagPicker } from "./RequisitionTagPicker"
import { RequisitionSupplierQuotes } from "./RequisitionSupplierQuotes"
import { RequisitionPurchaseOrderSection } from "./RequisitionPurchaseOrderSection"
import { RequisitionActivityLog } from "./RequisitionActivityLog"
import { RequisitionApprovalActions } from "./RequisitionApprovalActions"
import { toDateInputValue } from "../lib/requisition-mappers"
import {
  canAddLineItemsToRequisition,
  canCostCenterEditRequisition,
  canSubmitRequisition,
} from "../lib/requisition-log-utils"
import { useRequisitionLogsStore } from "@/store/requisition-logs-store"

function mapApiItemsToDrafts(
  items: NonNullable<RequisitionRecord["items"]>
): RequisitionLineItemDraft[] {
  return items.map((item) => ({
    id: String(item.id),
    chart_of_account_id: item.chart_of_account_id ?? item.chart_of_account?.id ?? null,
    account_no:
      item.chart_of_account?.account_no ??
      String(item.line_item_number ?? ""),
    description:
      item.chart_of_account?.description ?? item.description ?? "",
    quantity: Number(item.quantity),
    unit_cost: Number(item.unit_cost),
    gst_applicable: Boolean(item.gst_applicable),
    comments: item.comments ?? "",
  }))
}

async function syncPendingQuoteUploads(
  requisitionId: number,
  quotes: SupplierQuoteDraft[]
) {
  for (const quote of quotes) {
    if (quote.file && quote.supplierId) {
      await uploadRequisitionQuote(
        requisitionId,
        Number(quote.supplierId),
        quote.file,
        mapSupplierQuoteToUploadMeta(quote)
      )
    }
  }
}

export type RequisitionFormMode = "create" | "edit"

type RequisitionFormProps = {
  mode: RequisitionFormMode
  requisitionId?: number
  className?: string
  onSuccess?: (requisition: RequisitionRecord) => void
  onCancel?: () => void
}

export function RequisitionForm({
  mode,
  requisitionId,
  className,
  onSuccess,
  onCancel,
}: RequisitionFormProps) {
  const assignedCostCenter = useRequisitionsStore(
    (state) => state.assignedCostCenter
  )
  const isLoadingFormData = useRequisitionsStore(
    (state) => state.isLoadingFormData
  )
  const isLoadingSelected = useRequisitionsStore(
    (state) => state.isLoadingSelected
  )
  const isSaving = useRequisitionsStore((state) => state.isSaving)
  const isReviewing = useRequisitionsStore((state) => state.isReviewing)
  const error = useRequisitionsStore((state) => state.error)
  const fetchFormData = useRequisitionsStore((state) => state.fetchFormData)
  const fetchRequisitionById = useRequisitionsStore(
    (state) => state.fetchRequisitionById
  )
  const createRequisition = useRequisitionsStore(
    (state) => state.createRequisition
  )
  const updateRequisition = useRequisitionsStore(
    (state) => state.updateRequisition
  )
  const fetchLogs = useRequisitionLogsStore((state) => state.fetchLogs)

  const [referenceNumber, setReferenceNumber] = useState("")
  const [costCenterLabel, setCostCenterLabel] = useState("")
  const [costCenterId, setCostCenterId] = useState<number | null>(null)
  const [statusLabel, setStatusLabel] = useState("")
  const [stageLabel, setStageLabel] = useState("")
  const [currencyId, setCurrencyId] = useState("")
  const [priority, setPriority] = useState<RequisitionPriority>("standard")
  const [expectedDeliveryDate, setExpectedDeliveryDate] = useState("")
  const [isRecurring, setIsRecurring] = useState(false)
  const [requiresDownpayment, setRequiresDownpayment] = useState(false)
  const [reminderDate, setReminderDate] = useState("")
  const [supplierQuotes, setSupplierQuotes] = useState<SupplierQuoteDraft[]>([
    createEmptySupplierQuote(),
  ])
  const [lineItems, setLineItems] = useState<RequisitionLineItemDraft[]>([
    createEmptyLineItem(),
  ])
  const [discountType, setDiscountType] = useState<DiscountType>("none")
  const [discountValue, setDiscountValue] = useState(0)
  const [gstRatePercent, setGstRatePercent] = useState(DEFAULT_GST_RATE_PERCENT)
  const [formError, setFormError] = useState<string | null>(null)
  const [isEditable, setIsEditable] = useState(true)
  const [showApprovalActions, setShowApprovalActions] = useState(false)
  const [canApprove, setCanApprove] = useState(false)
  const [userStageAction, setUserStageAction] =
    useState<RequisitionUserStageAction | null>(null)
  const [purchaseOrderNumber, setPurchaseOrderNumber] = useState("")
  const [purchaseOrderFileName, setPurchaseOrderFileName] = useState<
    string | null
  >(null)
  const [purchaseOrderEmailedAt, setPurchaseOrderEmailedAt] = useState<
    string | null
  >(null)
  const [preferredSupplierEmail, setPreferredSupplierEmail] = useState<
    string | null
  >(null)
  const [canEditPurchaseOrderNumber, setCanEditPurchaseOrderNumber] =
    useState(false)
  const [canUploadPurchaseOrder, setCanUploadPurchaseOrder] = useState(false)
  const [canEmailPurchaseOrder, setCanEmailPurchaseOrder] = useState(false)
  const [canCancelRequisition, setCanCancelRequisition] = useState(false)
  const [canCloseRequisition, setCanCloseRequisition] = useState(false)
  const [activityComment, setActivityComment] = useState("")
  const [selectedTags, setSelectedTags] = useState<RequisitionTag[]>([])
  const [budgetAccounts, setBudgetAccounts] = useState<ChartOfAccount[]>([])
  const [isLoadingBudgetAccounts, setIsLoadingBudgetAccounts] = useState(false)
  const [budgetAccountsError, setBudgetAccountsError] = useState<string | null>(
    null
  )

  const resetCreateForm = () => {
    setSupplierQuotes((current) => {
      revokeSupplierQuotePreviews(current)
      return [createEmptySupplierQuote()]
    })
    setReferenceNumber("")
    setCostCenterLabel(assignedCostCenter?.name ?? "")
    setCostCenterId(assignedCostCenter?.id ?? null)
    setStatusLabel("")
    setStageLabel("")
    setCurrencyId("")
    setPriority("standard")
    setExpectedDeliveryDate("")
    setIsRecurring(false)
    setRequiresDownpayment(false)
    setReminderDate("")
    setLineItems([createEmptyLineItem()])
    setDiscountType("none")
    setDiscountValue(0)
    setFormError(null)
    setIsEditable(true)
    setShowApprovalActions(false)
    setCanApprove(false)
    setUserStageAction(null)
    setPurchaseOrderNumber("")
    setPurchaseOrderFileName(null)
    setPurchaseOrderEmailedAt(null)
    setPreferredSupplierEmail(null)
    setCanEditPurchaseOrderNumber(false)
    setCanUploadPurchaseOrder(false)
    setCanEmailPurchaseOrder(false)
    setCanCancelRequisition(false)
    setCanCloseRequisition(false)
    setActivityComment("")
    setSelectedTags([])
  }

  const applyRequisitionState = (requisition: RequisitionRecord) => {
    setReferenceNumber(requisition.number)
    setCostCenterLabel(requisition.cost_center?.name ?? "")
    setCostCenterId(requisition.cost_center_id)
    setStatusLabel(requisition.status?.name ?? "")
    setStageLabel(requisition.stage?.name ?? "")
    setCurrencyId(String(requisition.currency_id))
    setPriority(normalizeRequisitionPriority(requisition.priority))
    setExpectedDeliveryDate(
      requisition.expected_delivery_date
        ? toDateInputValue(requisition.expected_delivery_date)
        : ""
    )
    setIsRecurring(Boolean(requisition.is_recurring))
    setRequiresDownpayment(Boolean(requisition.requires_downpayment))
    setReminderDate(
      requisition.reminder_date
        ? toDateInputValue(requisition.reminder_date)
        : ""
    )
    setLineItems(
      requisition.items?.length
        ? mapApiItemsToDrafts(requisition.items)
        : [createEmptyLineItem()]
    )
    setDiscountType(
      (requisition.discount_type as DiscountType | null | undefined) ?? "none"
    )
    setDiscountValue(Number(requisition.discount_value ?? 0))
    setIsEditable(
      canCostCenterEditRequisition(
        requisition.status?.name,
        requisition.is_editable
      )
    )
    setCanApprove(Boolean(requisition.can_approve))
    setShowApprovalActions(Boolean(requisition.show_approval_actions))
    setUserStageAction(requisition.user_stage_action ?? null)
    setPurchaseOrderNumber(requisition.purchase_order_number ?? "")
    setPurchaseOrderFileName(requisition.purchase_order_file_name ?? null)
    setPurchaseOrderEmailedAt(requisition.purchase_order_emailed_at ?? null)
    setPreferredSupplierEmail(requisition.preferred_supplier_email ?? null)
    setCanEditPurchaseOrderNumber(
      Boolean(requisition.can_edit_purchase_order_number)
    )
    setCanUploadPurchaseOrder(Boolean(requisition.can_upload_purchase_order))
    setCanEmailPurchaseOrder(Boolean(requisition.can_email_purchase_order))
    setCanCancelRequisition(Boolean(requisition.can_cancel))
    setCanCloseRequisition(Boolean(requisition.can_close))
    setSelectedTags(
      (requisition.tags ?? []).map((tag) => ({
        id: tag.id,
        name: tag.name,
        cost_center_id: tag.cost_center_id ?? requisition.cost_center_id,
      }))
    )
    setActivityComment("")
    setFormError(null)
  }

  useEffect(() => {
    void fetchFormData()
    void fetchGstRate().then(setGstRatePercent)
  }, [fetchFormData])

  useEffect(() => {
    if (mode === "create") {
      resetCreateForm()
      return
    }

    if (!requisitionId) {
      return
    }

    void fetchRequisitionById(requisitionId).then((requisition) => {
      if (!requisition) {
        return
      }

      applyRequisitionState(requisition)
    })
  }, [mode, requisitionId, fetchRequisitionById])

  useEffect(() => {
    if (mode === "create" && assignedCostCenter) {
      setCostCenterLabel(assignedCostCenter.name)
      setCostCenterId(assignedCostCenter.id)
    }
  }, [assignedCostCenter, mode])

  useEffect(() => {
    if (!costCenterId) {
      setBudgetAccounts([])
      setBudgetAccountsError(null)
      return
    }

    let cancelled = false

    setIsLoadingBudgetAccounts(true)
    setBudgetAccountsError(null)

    void fetchOperationalBudgetLineItems(costCenterId)
      .then((payload) => {
        if (cancelled) {
          return
        }

        const accounts = (payload?.line_items ?? [])
          .map((line) => line.chart_of_account)
          .filter((account): account is ChartOfAccount => Boolean(account))

        setBudgetAccounts(accounts)

        if (!payload || accounts.length === 0) {
          setBudgetAccountsError(
            "No active budget line items are available for this cost center."
          )
        }
      })
      .catch((error: unknown) => {
        if (cancelled) {
          return
        }

        setBudgetAccounts([])
        setBudgetAccountsError(
          error instanceof Error
            ? error.message
            : "Failed to load active budget line items."
        )
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoadingBudgetAccounts(false)
        }
      })

    return () => {
      cancelled = true
    }
  }, [costCenterId])

  const lineItemAccountOptions = useMemo(() => {
    const byId = new Map(
      budgetAccounts.map((account) => [account.id, account] as const)
    )

    for (const item of lineItems) {
      if (
        item.chart_of_account_id &&
        item.account_no &&
        !byId.has(item.chart_of_account_id)
      ) {
        byId.set(item.chart_of_account_id, {
          id: item.chart_of_account_id,
          account_no: item.account_no,
          description: item.description,
        })
      }
    }

    return Array.from(byId.values())
  }, [budgetAccounts, lineItems])

  const isLoading = isLoadingFormData || (mode === "edit" && isLoadingSelected)
  const isCancelledRequisition = statusLabel.toLowerCase() === "cancelled"
  const isClosedRequisition = statusLabel.toLowerCase() === "closed"
  const isTerminalRequisition = isCancelledRequisition || isClosedRequisition
  const isFormDisabled =
    isLoading ||
    isSaving ||
    isReviewing ||
    (mode === "edit" && !isEditable)
  const canAddLineItems = canAddLineItemsToRequisition(statusLabel, mode)
  const showSubmitAction = canSubmitRequisition(statusLabel, mode)
  const requisitionTotal = calculateRequisitionTotalFromLineItems(
    lineItems,
    discountType,
    discountValue,
    gstRatePercent
  )
  const actionButtonsDisabled =
    isLoading || isSaving || isReviewing || (mode === "edit" && !isEditable)
  const isApprovedRequisition = statusLabel.toLowerCase() === "approved"
  const showPurchaseOrderSection =
    mode === "edit" &&
    (canEditPurchaseOrderNumber ||
      canUploadPurchaseOrder ||
      canEmailPurchaseOrder ||
      Boolean(purchaseOrderNumber) ||
      Boolean(purchaseOrderFileName) ||
      isApprovedRequisition)

  const validateForm = (shouldSubmit: boolean) => {
    if (!costCenterId) {
      return "No cost center is available for this requisition."
    }

    if (!currencyId) {
      return "Please select a currency."
    }

    if (shouldSubmit) {
      const supplierQuoteError = validateSupplierQuotes(
        supplierQuotes,
        requisitionTotal
      )

      if (supplierQuoteError) {
        return supplierQuoteError
      }
    }

    if (isRecurring && !reminderDate) {
      return "Please set a reminder date for recurring requisitions."
    }

    if (!isLineItemsValid(lineItems)) {
      return "Each line item needs a line number, description, quantity, and unit cost."
    }

    return null
  }

  const persistRequisition = async (shouldSubmit: boolean) => {
    setFormError(null)

    const validationError = validateForm(shouldSubmit)

    if (validationError) {
      setFormError(validationError)
      return
    }

    const payload = {
      cost_center_id: costCenterId as number,
      currency_id: Number(currencyId),
      priority,
      expected_delivery_date: expectedDeliveryDate || null,
      is_recurring: isRecurring,
      requires_downpayment: requiresDownpayment,
      reminder_date: isRecurring ? reminderDate : null,
      suppliers: mapSupplierQuotesToPayload(supplierQuotes),
      items: mapLineItemsForApi(lineItems),
      discount_type: discountType,
      discount_value: discountType === "none" ? 0 : discountValue,
      tag_ids: selectedTags.map((tag) => tag.id),
      submit: shouldSubmit,
    }

    const requisition =
      mode === "edit" && requisitionId
        ? await updateRequisition(requisitionId, {
            ...payload,
            number: referenceNumber,
            activity_comment: activityComment.trim() || null,
          })
        : await createRequisition(payload)

    if (!requisition) {
      return
    }

    try {
      await syncPendingQuoteUploads(requisition.id, supplierQuotes)
    } catch (uploadError) {
      setFormError(
        uploadError instanceof Error
          ? uploadError.message
          : "Requisition saved, but one or more quote uploads failed."
      )
      return
    }

    if (mode === "edit") {
      applyRequisitionState(requisition)
      setActivityComment("")
      await fetchLogs(requisition.id, true)
    }

    onSuccess?.(requisition)
  }

  const handleApprovalDecision = async () => {
    if (!requisitionId) {
      return
    }

    const requisition = await fetchRequisitionById(requisitionId)

    if (requisition) {
      applyRequisitionState(requisition)
    }
  }

  const handlePurchaseOrderUpdated = async () => {
    if (!requisitionId) {
      return
    }

    const requisition = await fetchRequisitionById(requisitionId)

    if (!requisition) {
      return
    }

    applyRequisitionState(requisition)
    await fetchLogs(requisition.id, true)
    onSuccess?.(requisition)
  }

  return (
    <div className={cn("flex flex-col gap-6", className)}>
      <div className="flex flex-col gap-4">
        {mode === "edit" && isCancelledRequisition ? (
          <div className="rounded-lg border border-slate-300 bg-slate-100 px-4 py-3 text-sm text-slate-800 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
            This requisition has been cancelled and is no longer moving through
            the approval pipeline.
          </div>
        ) : null}
        {mode === "edit" && isClosedRequisition ? (
          <div className="rounded-lg border border-slate-300 bg-slate-100 px-4 py-3 text-sm text-slate-800 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
            This requisition has been closed as discontinued / not processed.
          </div>
        ) : null}
        {mode === "edit" && !isEditable && !isTerminalRequisition ? (
          <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-100">
            This requisition is locked while it is under review. It can only be
            edited again when the status is set to Cost Center Review.
          </div>
        ) : null}
      <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-4">
        {mode === "edit" ? (
          <>
            <UBInput label="Reference" value={referenceNumber} readOnly disabled />
            <UBInput label="Status" value={statusLabel || "—"} readOnly disabled />
          </>
        ) : null}
        <UBInput
          label="Cost center"
          value={
            isLoading
              ? "Loading..."
              : costCenterLabel || "No cost center assigned"
          }
          readOnly
          disabled
        />
        <CurrencySelect
          value={currencyId}
          onValueChange={setCurrencyId}
          disabled={isFormDisabled}
        />
        <PrioritySelect
          value={priority}
          onValueChange={(value) =>
            setPriority(value as RequisitionPriority)
          }
          disabled={isFormDisabled}
        />
        <UBInput
          label="Expected delivery date"
          type="date"
          value={expectedDeliveryDate}
          onChange={(event) => setExpectedDeliveryDate(event.target.value)}
          disabled={isFormDisabled}
        />
        <div className="flex flex-col justify-end">
          <label className="mb-2 flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={isRecurring}
              onChange={(event) => {
                setIsRecurring(event.target.checked)
                if (!event.target.checked) {
                  setReminderDate("")
                }
              }}
              disabled={isFormDisabled}
              className="size-4 rounded border-input"
            />
            <span>Recurring requisition</span>
          </label>
        </div>
        <div className="flex flex-col justify-end">
          <label className="mb-2 flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={requiresDownpayment}
              onChange={(event) =>
                setRequiresDownpayment(event.target.checked)
              }
              disabled={isFormDisabled}
              className="size-4 rounded border-input"
            />
            <span>50% downpayment required</span>
          </label>
        </div>
        {isRecurring ? (
          <UBInput
            label="Reminder date"
            type="date"
            value={reminderDate}
            onChange={(event) => setReminderDate(event.target.value)}
            disabled={isFormDisabled}
            required
          />
        ) : null}
      </div>

      <RequisitionTagPicker
        costCenterId={costCenterId}
        selectedTags={selectedTags}
        onChange={setSelectedTags}
        disabled={isFormDisabled}
      />

      {showPurchaseOrderSection && requisitionId ? (
        <RequisitionPurchaseOrderSection
          requisitionId={requisitionId}
          purchaseOrderNumber={purchaseOrderNumber}
          onPurchaseOrderNumberChange={setPurchaseOrderNumber}
          canEdit={canEditPurchaseOrderNumber}
          canUpload={canUploadPurchaseOrder}
          canEmail={canEmailPurchaseOrder}
          fileName={purchaseOrderFileName}
          emailedAt={purchaseOrderEmailedAt}
          preferredSupplierEmail={preferredSupplierEmail}
          onUpdated={handlePurchaseOrderUpdated}
        />
      ) : null}

      <RequisitionSupplierQuotes
        quotes={supplierQuotes}
        onChange={setSupplierQuotes}
        requisitionId={mode === "edit" ? requisitionId : undefined}
        requisitionTotal={requisitionTotal}
        disabled={isFormDisabled}
      />

      {mode === "edit" && isEditable ? (
        <div className="space-y-2">
          <label
            htmlFor="requisition-update-comment"
            className="text-xs font-medium uppercase tracking-widest text-muted-foreground"
          >
            Update note (optional)
          </label>
          <textarea
            id="requisition-update-comment"
            value={activityComment}
            onChange={(event) => setActivityComment(event.target.value)}
            rows={3}
            placeholder="Add a note about this update for the activity log..."
            disabled={isFormDisabled}
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm transition-colors placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>
      ) : null}

      <RequisitionLineItemsTable
        items={lineItems}
        onChange={setLineItems}
        discountType={discountType}
        discountValue={discountValue}
        onDiscountTypeChange={setDiscountType}
        onDiscountValueChange={setDiscountValue}
        gstRatePercent={gstRatePercent}
        budgetAccounts={lineItemAccountOptions}
        isLoadingBudgetAccounts={isLoadingBudgetAccounts}
        budgetAccountsError={budgetAccountsError}
        disabled={isFormDisabled}
        allowAddItems={canAddLineItems}
        footerActions={
          <>
            <UBButton
              type="button"
              onClick={() => void persistRequisition(false)}
              disabled={actionButtonsDisabled}
            >
              <Save className="size-4" data-icon="inline-start" />
              {isSaving
                ? "Saving..."
                : mode === "edit"
                  ? "Update requisition"
                  : "Save draft"}
            </UBButton>
            {showSubmitAction ? (
              <UBButton
                type="button"
                variant="secondary"
                onClick={() => void persistRequisition(true)}
                disabled={actionButtonsDisabled}
              >
                <Send className="size-4" data-icon="inline-start" />
                {isSaving
                  ? "Submitting..."
                  : mode === "edit"
                    ? "Submit requisition"
                    : "Create & submit"}
              </UBButton>
            ) : null}
            {onCancel ? (
              <UBButton
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={actionButtonsDisabled}
              >
                <X className="size-4" data-icon="inline-start" />
                Cancel
              </UBButton>
            ) : null}
          </>
        }
      />

      {formError ? (
        <p className="text-sm text-destructive">{formError}</p>
      ) : null}
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      </div>

      {mode === "edit" &&
      requisitionId &&
      (showApprovalActions || canCancelRequisition || canCloseRequisition) ? (
        <RequisitionApprovalActions
          requisitionId={requisitionId}
          stageName={stageLabel}
          canAct={canApprove}
          canCancel={canCancelRequisition}
          canClose={canCloseRequisition}
          userStageAction={userStageAction}
          onDecision={() => void handleApprovalDecision()}
        />
      ) : null}

      {mode === "edit" && requisitionId ? (
        <RequisitionActivityLog requisitionId={requisitionId} />
      ) : null}
    </div>
  )
}
