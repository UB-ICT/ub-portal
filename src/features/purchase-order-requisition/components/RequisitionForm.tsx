import { Save, X } from "lucide-react"
import { useEffect, useState, type FormEvent } from "react"

import { uploadRequisitionQuote } from "@/lib/api/attachments"
import { UBButton } from "@/components/shared/UBButton"
import { UBInput } from "@/components/shared/UBInput"
import type { RequisitionPriority, RequisitionRecord } from "@/lib/api/requisitions"
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
import { toDateInputValue } from "../lib/requisition-mappers"
import { canCostCenterEditRequisition, canAddLineItemsToRequisition } from "../lib/requisition-log-utils"
import { useRequisitionLogsStore } from "@/store/requisition-logs-store"

function mapApiItemsToDrafts(
  items: NonNullable<RequisitionRecord["items"]>
): RequisitionLineItemDraft[] {
  return items.map((item) => ({
    id: String(item.id),
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
  const fetchLogs = useRequisitionLogsStore((state) => state.fetchLogs)

  const [referenceNumber, setReferenceNumber] = useState("")
  const [costCenterLabel, setCostCenterLabel] = useState("")
  const [costCenterId, setCostCenterId] = useState<number | null>(null)
  const [statusLabel, setStatusLabel] = useState("")
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
    setCurrencyId("")
    setPriority("routine")
    setExpectedDeliveryDate("")
    setIsRecurring(false)
    setReminderDate("")
    setLineItems([createEmptyLineItem()])
    setFormError(null)
    setIsEditable(true)
    setActivityComment("")
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

      setReferenceNumber(requisition.number)
      setCostCenterLabel(requisition.cost_center?.name ?? "")
      setCostCenterId(requisition.cost_center_id)
      setStatusLabel(requisition.status?.name ?? "")
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
      setActivityComment("")
      setFormError(null)
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
  const requisitionTotal = calculateRequisitionTotalFromLineItems(lineItems)

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setFormError(null)

    if (!costCenterId) {
      setFormError("No cost center is available for this requisition.")
      return
    }

    if (!currencyId) {
      setFormError("Please select a currency.")
      return
    }

    const supplierQuoteError = validateSupplierQuotes(
      supplierQuotes,
      requisitionTotal
    )

    if (supplierQuoteError) {
      setFormError(supplierQuoteError)
      return
    }

    if (isRecurring && !reminderDate) {
      setFormError("Please set a reminder date for recurring requisitions.")
      return
    }

    if (!isLineItemsValid(lineItems)) {
      setFormError("Each line item needs a description, quantity, and unit cost.")
      return
    }

    const payload = {
      cost_center_id: costCenterId,
      currency_id: Number(currencyId),
      priority,
      expected_delivery_date: expectedDeliveryDate || null,
      is_recurring: isRecurring,
      reminder_date: isRecurring ? reminderDate : null,
      suppliers: mapSupplierQuotesToPayload(supplierQuotes),
      items: mapLineItemsForApi(lineItems),
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
      setActivityComment("")
      await fetchLogs(requisition.id, true)
    }

    onSuccess?.(requisition)
  }

  return (
    <div className={cn("flex flex-col gap-6", className)}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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
            <UBButton type="submit" disabled={isFormDisabled}>
              <Save className="size-4" data-icon="inline-start" />
              {isSaving
                ? "Saving..."
                : mode === "edit"
                  ? "Update requisition"
                  : "Create requisition"}
            </UBButton>
            {onCancel ? (
              <UBButton
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isSaving}
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
      </form>

      {mode === "edit" && requisitionId ? (
        <RequisitionActivityLog requisitionId={requisitionId} />
      ) : null}
    </div>
  )
}
