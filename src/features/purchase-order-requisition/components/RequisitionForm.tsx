import { Save, Send, X } from "lucide-react"
import { useEffect, useState } from "react"

import { uploadRequisitionQuote } from "@/lib/api/attachments"
import { UBButton } from "@/components/shared/UBButton"
import { UBInput } from "@/components/shared/UBInput"
import type { RequisitionPriority, RequisitionRecord, RequisitionUserStageAction } from "@/lib/api/requisitions"
import { cn } from "@/lib/utils"
import { useRequisitionsStore } from "@/store/requisitions-store"
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
import { RequisitionSupplierQuotes } from "./RequisitionSupplierQuotes"
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
    line_item_number: String(item.line_item_number ?? ""),
    description: item.description,
    quantity: Number(item.quantity),
    unit_cost: Number(item.unit_cost),
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
  const updateRequisitionPurchaseOrderNumber = useRequisitionsStore(
    (state) => state.updateRequisitionPurchaseOrderNumber
  )
  const isSavingPurchaseOrder = useRequisitionsStore(
    (state) => state.isSavingPurchaseOrder
  )
  const fetchLogs = useRequisitionLogsStore((state) => state.fetchLogs)

  const [referenceNumber, setReferenceNumber] = useState("")
  const [costCenterLabel, setCostCenterLabel] = useState("")
  const [costCenterId, setCostCenterId] = useState<number | null>(null)
  const [statusLabel, setStatusLabel] = useState("")
  const [stageLabel, setStageLabel] = useState("")
  const [currencyId, setCurrencyId] = useState("")
  const [priority, setPriority] = useState<RequisitionPriority>("routine")
  const [expectedDeliveryDate, setExpectedDeliveryDate] = useState("")
  const [isRecurring, setIsRecurring] = useState(false)
  const [reminderDate, setReminderDate] = useState("")
  const [supplierQuotes, setSupplierQuotes] = useState<SupplierQuoteDraft[]>([
    createEmptySupplierQuote(),
  ])
  const [lineItems, setLineItems] = useState<RequisitionLineItemDraft[]>([
    createEmptyLineItem(),
  ])
  const [formError, setFormError] = useState<string | null>(null)
  const [isEditable, setIsEditable] = useState(true)
  const [showApprovalActions, setShowApprovalActions] = useState(false)
  const [canApprove, setCanApprove] = useState(false)
  const [userStageAction, setUserStageAction] =
    useState<RequisitionUserStageAction | null>(null)
  const [purchaseOrderNumber, setPurchaseOrderNumber] = useState("")
  const [canEditPurchaseOrderNumber, setCanEditPurchaseOrderNumber] =
    useState(false)
  const [activityComment, setActivityComment] = useState("")

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
    setPriority("routine")
    setExpectedDeliveryDate("")
    setIsRecurring(false)
    setReminderDate("")
    setLineItems([createEmptyLineItem()])
    setFormError(null)
    setIsEditable(true)
    setShowApprovalActions(false)
    setCanApprove(false)
    setUserStageAction(null)
    setPurchaseOrderNumber("")
    setCanEditPurchaseOrderNumber(false)
    setActivityComment("")
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
    setCanEditPurchaseOrderNumber(
      Boolean(requisition.can_edit_purchase_order_number)
    )
    setActivityComment("")
    setFormError(null)
  }

  useEffect(() => {
    void fetchFormData()
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

  const isLoading = isLoadingFormData || (mode === "edit" && isLoadingSelected)
  const isFormDisabled =
    isLoading || isSaving || (mode === "edit" && !isEditable)
  const canAddLineItems = canAddLineItemsToRequisition(statusLabel, mode)
  const showSubmitAction = canSubmitRequisition(statusLabel, mode)
  const requisitionTotal = calculateRequisitionTotalFromLineItems(lineItems)
  const actionButtonsDisabled =
    isLoading || isSaving || (mode === "edit" && !isEditable)
  const isApprovedRequisition = statusLabel.toLowerCase() === "approved"
  const showPurchaseOrderSection = mode === "edit" && isApprovedRequisition

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
      reminder_date: isRecurring ? reminderDate : null,
      suppliers: mapSupplierQuotesToPayload(supplierQuotes),
      items: mapLineItemsForApi(lineItems),
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

  const handleSavePurchaseOrderNumber = async () => {
    if (!requisitionId || !canEditPurchaseOrderNumber) {
      return
    }

    setFormError(null)

    const requisition = await updateRequisitionPurchaseOrderNumber(
      requisitionId,
      {
        purchase_order_number: purchaseOrderNumber.trim() || null,
      }
    )

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
        {mode === "edit" && !isEditable ? (
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

      {showPurchaseOrderSection ? (
        <div className="rounded-xl border border-border/70 bg-card p-4 shadow-sm">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div className="flex-1">
              <UBInput
                label="Purchase order number"
                value={purchaseOrderNumber}
                onChange={(event) => setPurchaseOrderNumber(event.target.value)}
                placeholder={
                  canEditPurchaseOrderNumber
                    ? "Enter the purchase order number"
                    : "Not assigned"
                }
                readOnly={!canEditPurchaseOrderNumber}
                disabled={!canEditPurchaseOrderNumber || isSavingPurchaseOrder}
              />
              <p className="mt-2 text-xs text-muted-foreground">
                {canEditPurchaseOrderNumber
                  ? "Assign the purchase order number after this requisition has been fully approved."
                  : "The purchase order number can only be assigned by a purchase officer after approval."}
              </p>
            </div>
            {canEditPurchaseOrderNumber ? (
              <UBButton
                type="button"
                onClick={() => void handleSavePurchaseOrderNumber()}
                disabled={isSavingPurchaseOrder}
              >
                {isSavingPurchaseOrder ? "Saving..." : "Save PO number"}
              </UBButton>
            ) : null}
          </div>
        </div>
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

      {mode === "edit" && requisitionId && showApprovalActions ? (
        <RequisitionApprovalActions
          requisitionId={requisitionId}
          stageName={stageLabel}
          canAct={canApprove}
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
