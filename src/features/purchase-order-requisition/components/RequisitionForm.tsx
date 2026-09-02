import { Save, Send, X } from "lucide-react"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useBlocker } from "react-router-dom"

import { fetchOperationalBudgetLineItems } from "@/lib/api/budgets"
import type { ChartOfAccount } from "@/lib/api/chart-of-accounts"
import { UBButton } from "@/components/shared/UBButton"
import { LoadingSpinner } from "@/components/shared/LoadingSpinner"
import { UBInput } from "@/components/shared/UBInput"
import type { RequisitionPriority, RequisitionRecord, RequisitionUserStageAction } from "@/lib/api/requisitions"
import { flushRequisitionDraftKeepalive } from "@/lib/api/requisitions"
import type { RequisitionTag } from "@/lib/api/tags"
import { cn } from "@/lib/utils"
import { fetchGstRate } from "@/lib/api/requisition-settings"
import { useRequisitionQuotesStore } from "@/store/requisition-quotes-store"
import { useRequisitionsStore } from "@/store/requisitions-store"
import { DEFAULT_GST_RATE_PERCENT } from "../lib/line-pricing"
import { normalizeRequisitionPriority } from "../lib/requisition-priorities"
import {
  clearRequisitionDraftSnapshot,
  readRequisitionDraftSnapshot,
  writeRequisitionDraftSnapshot,
} from "../lib/requisition-draft-storage"
import {
  applyRecommendedSupplierDefaults,
  createEmptySupplierQuote,
  mapDraftSupplierQuotesToPayload,
  mapRequisitionQuotesFromRecord,
  mapSupplierQuotesToPayload,
  validateSupplierQuotes,
  type SupplierQuoteDraft,
} from "../lib/supplier-quotes"

import {
  calculateRequisitionTotalFromLineItems,
  createEmptyLineItem,
  isLineItemsValid,
  mapDraftLineItemsForApi,
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
import { RequisitionNumberBadge } from "./RequisitionNumberBadge"
import { mapApiStatusToCardStatus, toDateInputValue } from "../lib/requisition-mappers"
import {
  canAddLineItemsToRequisition,
  canCostCenterEditRequisition,
  canRemoveLineItemsFromRequisition,
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
    total: Number(
      item.subtotal ?? Number(item.quantity) * Number(item.unit_cost)
    ),
    gst_applicable: Boolean(item.gst_applicable),
    comments: item.comments ?? "",
  }))
}

async function syncPendingQuoteUploads(
  requisitionId: number,
  quotes: SupplierQuoteDraft[]
): Promise<SupplierQuoteDraft[]> {
  // Quote PDF uploads are owned by RequisitionSupplierQuotes (immediate upload
  // on file select). Autosave must NOT re-upload here — a second POST deletes
  // the first attachment for that supplier and races the UI attachmentId.
  void requisitionId
  return applyRecommendedSupplierDefaults(quotes)
}

/**
 * Prefer live rows that still hold a local File / attachment over a stale
 * sync snapshot. Autosave often finishes with quote state from before the
 * user picked a PDF; never let that wipe a newer live row.
 */
function mergeQuotesAfterSync(
  syncedQuotes: SupplierQuoteDraft[],
  liveQuotes: SupplierQuoteDraft[]
): SupplierQuoteDraft[] {
  const syncedByClientId = new Map(
    syncedQuotes.map((quote) => [quote.clientId, quote])
  )
  const liveClientIds = new Set(liveQuotes.map((quote) => quote.clientId))

  const merged = liveQuotes.map((live) => {
    const synced = syncedByClientId.get(live.clientId)

    // Live row still has a pending File that sync never saw — keep it.
    if (live.file && !live.attachmentId) {
      return live
    }

    // Live already uploaded; prefer the richer of live vs synced.
    if (live.attachmentId || live.file || live.fileName) {
      if (!synced) {
        return live
      }

      return {
        ...synced,
        ...live,
        attachmentId: live.attachmentId ?? synced.attachmentId,
        file: live.file ?? synced.file,
        fileName: live.fileName || synced.fileName,
        previewUrl: live.previewUrl ?? synced.previewUrl,
      }
    }

    if (synced) {
      return synced
    }

    return live
  })

  for (const synced of syncedQuotes) {
    if (!liveClientIds.has(synced.clientId)) {
      merged.push(synced)
    }
  }

  return applyRecommendedSupplierDefaults(merged)
}

function hasPendingQuoteUploads(quotes: SupplierQuoteDraft[]) {
  return quotes.some(
    (quote) => Boolean(quote.file && quote.supplierId && !quote.attachmentId)
  )
}

/** Prefer whichever quote row still has a local PDF or server attachment. */
function preferRicherQuote(
  incoming: SupplierQuoteDraft,
  current?: SupplierQuoteDraft
): SupplierQuoteDraft {
  if (!current) {
    return incoming
  }

  const incomingHasDoc = Boolean(
    incoming.file || incoming.attachmentId || incoming.fileName
  )
  const currentHasDoc = Boolean(
    current.file || current.attachmentId || current.fileName
  )

  if (currentHasDoc && !incomingHasDoc) {
    return current
  }

  return {
    ...current,
    ...incoming,
    attachmentId: incoming.attachmentId ?? current.attachmentId,
    file: incoming.file ?? current.file,
    fileName: incoming.fileName || current.fileName,
    previewUrl: incoming.previewUrl ?? current.previewUrl,
  }
}

function mergeQuoteListsPreferringDocuments(
  incoming: SupplierQuoteDraft[],
  current: SupplierQuoteDraft[]
): SupplierQuoteDraft[] {
  const currentByClientId = new Map(
    current.map((quote) => [quote.clientId, quote])
  )
  const seen = new Set<string>()
  const merged: SupplierQuoteDraft[] = []

  for (const quote of incoming) {
    seen.add(quote.clientId)
    merged.push(preferRicherQuote(quote, currentByClientId.get(quote.clientId)))
  }

  for (const quote of current) {
    if (seen.has(quote.clientId)) {
      continue
    }
    // Keep live rows that still have a document and were missing from a
    // stale incoming snapshot (classic autosave race).
    if (quote.file || quote.attachmentId || quote.fileName) {
      merged.push(quote)
    }
  }

  return applyRecommendedSupplierDefaults(
    merged.length > 0 ? merged : current
  )
}

export type RequisitionFormMode = "create" | "edit"

export type RequisitionFormAutosave = () => Promise<boolean>

type RequisitionFormProps = {
  mode: RequisitionFormMode
  requisitionId?: number
  className?: string
  onSuccess?: (requisition: RequisitionRecord) => void
  /** Fired after a background draft save (navigate-away / panel switch). */
  onDraftSaved?: (requisition: RequisitionRecord) => void
  /**
   * After approve / reject / request-review / cancel / close — parent can
   * move selection to the next visible requisition.
   */
  onDecisionComplete?: (requisitionId: number) => void
  /** Lets the parent trigger the same full-draft save before in-page navigation. */
  onRegisterAutosave?: (autosave: RequisitionFormAutosave | null) => void
  onCancel?: () => void
}

export function RequisitionForm({
  mode,
  requisitionId,
  className,
  onSuccess,
  onDraftSaved,
  onDecisionComplete,
  onRegisterAutosave,
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
  const selectedRequisition = useRequisitionsStore(
    (state) => state.selectedRequisition
  )
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
  const [currentStageSequence, setCurrentStageSequence] = useState<number | null>(
    null
  )
  const [currencyId, setCurrencyId] = useState("")
  const [priority, setPriority] = useState<RequisitionPriority>("standard")
  const [description, setDescription] = useState("")
  const [expectedDeliveryDate, setExpectedDeliveryDate] = useState("")
  const [isRecurring, setIsRecurring] = useState(false)
  const [requiresDownpayment, setRequiresDownpayment] = useState(false)
  const [reminderDate, setReminderDate] = useState("")
  const [quoteWaiverReason, setQuoteWaiverReason] = useState("")
  const [supplierQuotes, setSupplierQuotes] = useState<SupplierQuoteDraft[]>([
    createEmptySupplierQuote(),
  ])
  const [lineItems, setLineItems] = useState<RequisitionLineItemDraft[]>([
    createEmptyLineItem(),
  ])
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
  const [isDirty, setIsDirty] = useState(false)
  const skipDirtyTrackingRef = useRef(true)
  const isDirtyRef = useRef(false)
  const autosaveInFlightRef = useRef<Promise<boolean> | null>(null)
  const autosaveQueuedRef = useRef(false)
  const supplierQuotesRef = useRef(supplierQuotes)
  const skipNextServerHydrationRef = useRef(false)
  const persistedRequisitionIdRef = useRef<number | null>(requisitionId ?? null)
  const hydratedUpdatedAtRef = useRef<string | null>(null)
  const [serverRevision, setServerRevision] = useState<string | null>(null)
  const [draftRequisitionId, setDraftRequisitionId] = useState<number | null>(
    requisitionId ?? null
  )
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Keep the ref in lockstep with every quote update — including ones that
  // have not flushed through React yet — so in-flight autosaves cannot read
  // a stale list and wipe a just-selected PDF.
  const replaceSupplierQuotes = (
    next:
      | SupplierQuoteDraft[]
      | ((current: SupplierQuoteDraft[]) => SupplierQuoteDraft[])
  ) => {
    if (typeof next === "function") {
      setSupplierQuotes((current) => {
        const resolved = next(current)
        supplierQuotesRef.current = resolved
        return resolved
      })
      return
    }

    supplierQuotesRef.current = next
    setSupplierQuotes(next)
  }

  useEffect(() => {
    persistedRequisitionIdRef.current = requisitionId ?? persistedRequisitionIdRef.current
    // Never clear a known draft id just because the parent prop is still null
    // during create→edit transition — quote uploads need that id for POST.
    if (requisitionId) {
      setDraftRequisitionId(requisitionId)
      useRequisitionQuotesStore.getState().setActiveRequisitionId(requisitionId)
    }
  }, [requisitionId])

  const beginQuietUpdate = () => {
    skipDirtyTrackingRef.current = true
  }

  const endQuietUpdate = () => {
    isDirtyRef.current = false
    setIsDirty(false)
    // Keep dirty tracking suppressed until after hydrate effects flush.
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        skipDirtyTrackingRef.current = false
      })
    })
  }

  const applyRequisitionState = (requisition: RequisitionRecord) => {
    beginQuietUpdate()
    setReferenceNumber(requisition.requisition_number ?? requisition.number)
    setCostCenterLabel(requisition.cost_center?.name ?? "")
    setCostCenterId(requisition.cost_center_id)
    setStatusLabel(requisition.status?.name ?? "")
    setStageLabel(requisition.stage?.name ?? "")
    setCurrentStageSequence(requisition.current_stage_sequence ?? null)
    setCurrencyId(String(requisition.currency_id))
    setPriority(normalizeRequisitionPriority(requisition.priority))
    setDescription(requisition.description ?? "")
    setExpectedDeliveryDate(
      requisition.expected_delivery_date
        ? toDateInputValue(requisition.expected_delivery_date)
        : ""
    )
    setIsRecurring(Boolean(requisition.is_recurring))
    setRequiresDownpayment(Boolean(requisition.requires_downpayment))
    setQuoteWaiverReason(requisition.quote_waiver_reason ?? "")
    setReminderDate(
      requisition.reminder_date
        ? toDateInputValue(requisition.reminder_date)
        : ""
    )
    setLineItems((current) => {
      if (requisition.items !== undefined) {
        return requisition.items.length
          ? mapApiItemsToDrafts(requisition.items)
          : [createEmptyLineItem()]
      }

      return current.length > 0 ? current : [createEmptyLineItem()]
    })
    replaceSupplierQuotes((current) => {
      const hasServerQuoteData =
        requisition.suppliers !== undefined ||
        requisition.attachments !== undefined

      if (hasServerQuoteData) {
        const fromServer = mapRequisitionQuotesFromRecord(requisition)
        if (
          fromServer.some(
            (quote) => quote.supplierId || quote.attachmentId || quote.fileName
          )
        ) {
          return fromServer
        }
      }

      const isPlaceholder =
        current.length === 0 ||
        (current.length === 1 &&
          !current[0].supplierId &&
          !current[0].attachmentId &&
          !current[0].file &&
          !current[0].fileName)

      if (!isPlaceholder) {
        return current
      }

      return mapRequisitionQuotesFromRecord(requisition)
    })
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
    setSelectedTags((current) => {
      if (requisition.tags !== undefined) {
        return requisition.tags.map((tag) => ({
          id: tag.id,
          name: tag.name,
          cost_center_id: tag.cost_center_id ?? requisition.cost_center_id,
        }))
      }

      return current
    })
    setActivityComment("")
    setFormError(null)
    const nextRevision = requisition.updated_at ?? null
    hydratedUpdatedAtRef.current = nextRevision
    setServerRevision(nextRevision)
    endQuietUpdate()
  }

  useEffect(() => {
    void fetchFormData()
    void fetchGstRate().then(setGstRatePercent)
  }, [fetchFormData])

  useEffect(() => {
    persistedRequisitionIdRef.current = requisitionId ?? null
  }, [requisitionId])

  useEffect(() => {
    if (requisitionId) {
      if (skipNextServerHydrationRef.current) {
        skipNextServerHydrationRef.current = false
        return
      }

      void fetchRequisitionById(requisitionId).then((requisition) => {
        if (
          !requisition ||
          requisition.id !== persistedRequisitionIdRef.current
        ) {
          return
        }

        applyRequisitionState(requisition)

        // Local draft overlays are only for in-progress editable work.
        // Applying them on locked review stages was showing reviewers stale
        // fields after the cost center had already resubmitted updates.
        const editable = canCostCenterEditRequisition(
          requisition.status?.name,
          requisition.is_editable
        )
        if (!editable) {
          clearRequisitionDraftSnapshot(requisitionId)
          return
        }

        const snapshot = readRequisitionDraftSnapshot(requisitionId)
        if (!snapshot) {
          return
        }

        const serverUpdatedAt = Date.parse(requisition.updated_at ?? "")
        if (
          Number.isFinite(serverUpdatedAt) &&
          snapshot.updatedAt < serverUpdatedAt
        ) {
          // Server is newer than the local draft — drop the stale snapshot.
          clearRequisitionDraftSnapshot(requisitionId)
          return
        }

        beginQuietUpdate()
        if (snapshot.currencyId) {
          setCurrencyId(snapshot.currencyId)
        }
        setPriority(snapshot.priority)
        setDescription(snapshot.description ?? "")
        setExpectedDeliveryDate(snapshot.expectedDeliveryDate)
        setIsRecurring(snapshot.isRecurring)
        setRequiresDownpayment(snapshot.requiresDownpayment)
        setReminderDate(snapshot.reminderDate)
        setQuoteWaiverReason(snapshot.quoteWaiverReason)
        if (snapshot.selectedTags.length > 0) {
          setSelectedTags(snapshot.selectedTags)
        }
        if (snapshot.lineItems.length > 0) {
          setLineItems(snapshot.lineItems)
        }
        const pendingLocalQuotes = snapshot.supplierQuotes.filter(
          (quote) => quote.supplierId && !quote.attachmentId
        )
        if (pendingLocalQuotes.length > 0) {
          replaceSupplierQuotes((current) => {
            if (
              current.some(
                (quote) => quote.file || quote.attachmentId || quote.fileName
              )
            ) {
              return current
            }

            const serverQuotes = current.filter((quote) => quote.attachmentId)
            const extras = pendingLocalQuotes
              .map((quote) => ({
                ...quote,
                file: null,
                previewUrl: null,
              }))
              .filter(
                (quote) =>
                  !serverQuotes.some(
                    (serverQuote) => serverQuote.supplierId === quote.supplierId
                  )
              )

            return serverQuotes.length > 0 || extras.length > 0
              ? [...serverQuotes, ...extras]
              : current
          })
        }
        endQuietUpdate()
      })
      return
    }

    // Fresh create: restore any in-progress local draft from a prior refresh.
    const snapshot = readRequisitionDraftSnapshot(null)
    if (!snapshot) {
      beginQuietUpdate()
      endQuietUpdate()
      return
    }

    beginQuietUpdate()
    setCurrencyId(snapshot.currencyId)
    setPriority(snapshot.priority)
    setDescription(snapshot.description ?? "")
    setExpectedDeliveryDate(snapshot.expectedDeliveryDate)
    setIsRecurring(snapshot.isRecurring)
    setRequiresDownpayment(snapshot.requiresDownpayment)
    setReminderDate(snapshot.reminderDate)
    setQuoteWaiverReason(snapshot.quoteWaiverReason)
    setActivityComment(snapshot.activityComment)
    setSelectedTags(snapshot.selectedTags)
    setLineItems(
      snapshot.lineItems.length > 0
        ? snapshot.lineItems
        : [createEmptyLineItem()]
    )
    replaceSupplierQuotes(
      snapshot.supplierQuotes.length > 0
        ? snapshot.supplierQuotes.map((quote) => ({
            ...quote,
            file: null,
            previewUrl: null,
          }))
        : [createEmptySupplierQuote()]
    )
    endQuietUpdate()
    isDirtyRef.current = true
    setIsDirty(true)
  }, [requisitionId, fetchRequisitionById])

  // When the page refetches the open requisition (focus/visibility), re-apply
  // server fields for reviewers so they do not keep a stale in-memory form.
  useEffect(() => {
    if (!requisitionId || !selectedRequisition) {
      return
    }

    if (selectedRequisition.id !== requisitionId) {
      return
    }

    // Wait for the initial hydrate so a leftover list row cannot paint first.
    if (hydratedUpdatedAtRef.current === null) {
      return
    }

    const nextUpdatedAt = selectedRequisition.updated_at ?? null
    if (!nextUpdatedAt || nextUpdatedAt === hydratedUpdatedAtRef.current) {
      return
    }

    const editable = canCostCenterEditRequisition(
      selectedRequisition.status?.name,
      selectedRequisition.is_editable
    )
    // Never clobber an editable cost-center form from a background refetch —
    // autosave bumps updated_at and would wipe in-progress quote Files.
    if (editable) {
      return
    }

    void fetchRequisitionById(requisitionId).then((requisition) => {
      if (
        !requisition ||
        requisition.id !== persistedRequisitionIdRef.current
      ) {
        return
      }

      applyRequisitionState(requisition)
      clearRequisitionDraftSnapshot(requisitionId)
    })
  }, [
    requisitionId,
    selectedRequisition?.updated_at,
    fetchRequisitionById,
  ])

  useEffect(() => {
    if (!requisitionId && assignedCostCenter) {
      setCostCenterLabel(assignedCostCenter.name)
      setCostCenterId(assignedCostCenter.id)
    }
  }, [assignedCostCenter, requisitionId])

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
  // Quote uploads must stay interactive during autosave/load — disabling the
  // section was preventing the file input from firing and the POST never ran.
  const quotesDisabled = isTerminalRequisition || (mode === "edit" && !isEditable)
  const canAddLineItems = canAddLineItemsToRequisition(statusLabel, mode)
  const canRemoveLineItems = canRemoveLineItemsFromRequisition(
    statusLabel,
    mode,
    currentStageSequence
  )
  const showSubmitAction = canSubmitRequisition(statusLabel, mode)
  const requisitionTotal = calculateRequisitionTotalFromLineItems(
    lineItems,
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

    if (shouldSubmit && !currencyId) {
      return "Please select a currency."
    }

    if (shouldSubmit) {
      const supplierQuoteError = validateSupplierQuotes(
        supplierQuotes,
        requisitionTotal,
        quoteWaiverReason
      )

      if (supplierQuoteError) {
        return supplierQuoteError
      }
    }

    if (isRecurring && !reminderDate) {
      return "Please set a reminder date for recurring requisitions."
    }

    if (shouldSubmit && !isLineItemsValid(lineItems)) {
      return "Each line item needs a line number, description, quantity, and unit cost."
    }

    return null
  }

  const buildDraftPayload = (shouldSubmit: boolean) => {
    const items = shouldSubmit
      ? mapLineItemsForApi(lineItems)
      : mapDraftLineItemsForApi(lineItems)

    return {
      cost_center_id: costCenterId as number,
      currency_id: currencyId ? Number(currencyId) : null,
      priority,
      description: description.trim() || null,
      expected_delivery_date: expectedDeliveryDate || null,
      is_recurring: isRecurring,
      requires_downpayment: requiresDownpayment,
      quote_waiver_reason: quoteWaiverReason.trim() || null,
      reminder_date: isRecurring ? reminderDate : null,
      suppliers: shouldSubmit
        ? mapSupplierQuotesToPayload(supplierQuotes)
        : mapDraftSupplierQuotesToPayload(supplierQuotes),
      items,
      tag_ids: selectedTags.map((tag) => tag.id),
      submit: shouldSubmit,
    }
  }

  const writeLocalDraftSnapshot = () => {
    writeRequisitionDraftSnapshot(persistedRequisitionIdRef.current, {
      currencyId,
      priority,
      description,
      expectedDeliveryDate,
      isRecurring,
      requiresDownpayment,
      reminderDate,
      quoteWaiverReason,
      activityComment,
      selectedTagIds: selectedTags.map((tag) => tag.id),
      selectedTags,
      lineItems,
      supplierQuotes,
    })
  }

  const hasMeaningfulDraftProgress = () =>
    Boolean(currencyId) ||
    description.trim() !== "" ||
    mapDraftLineItemsForApi(lineItems).length > 0 ||
    mapDraftSupplierQuotesToPayload(supplierQuotes).length > 0 ||
    mapSupplierQuotesToPayload(supplierQuotes).length > 0 ||
    selectedTags.length > 0 ||
    Boolean(expectedDeliveryDate) ||
    isRecurring ||
    requiresDownpayment ||
    quoteWaiverReason.trim() !== "" ||
    Boolean(persistedRequisitionIdRef.current)

  const persistRequisition = async (
    shouldSubmit: boolean,
    options?: { source?: "explicit" | "autosave" }
  ): Promise<RequisitionRecord | null> => {
    const source = options?.source ?? "explicit"
    setFormError(null)

    const validationError = validateForm(shouldSubmit)

    if (validationError) {
      if (source !== "autosave") {
        setFormError(validationError)
      }
      return null
    }

    if (!costCenterId) {
      return null
    }

    const payload = buildDraftPayload(shouldSubmit)
    const silent = source === "autosave"
    const existingId = persistedRequisitionIdRef.current

    const requisition =
      existingId != null
        ? await updateRequisition(
            existingId,
            {
              ...payload,
              activity_comment:
                source === "explicit" ? activityComment.trim() || null : null,
            },
            { silent }
          )
        : await createRequisition(payload, { silent })

    if (!requisition) {
      return null
    }

    let pendingQuoteUploadsRemain = false

    try {
      // Always sync the latest quotes — not the closure snapshot from when
      // persist started — so a PDF selected mid-autosave is not dropped.
      const quotesToSync = supplierQuotesRef.current
      const syncedQuotes = await syncPendingQuoteUploads(
        requisition.id,
        quotesToSync
      )
      // Re-read after the await: the user may have picked a PDF while we were
      // saving. Prefer any live document over a stale sync snapshot.
      const mergedQuotes = mergeQuoteListsPreferringDocuments(
        mergeQuotesAfterSync(syncedQuotes, supplierQuotesRef.current),
        supplierQuotesRef.current
      )
      pendingQuoteUploadsRemain = hasPendingQuoteUploads(mergedQuotes)

      beginQuietUpdate()
      replaceSupplierQuotes(mergedQuotes)
      if (pendingQuoteUploadsRemain) {
        // Keep dirty so a follow-up autosave uploads the newer file(s).
        isDirtyRef.current = true
        setIsDirty(true)
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            skipDirtyTrackingRef.current = false
          })
        })
      } else {
        endQuietUpdate()
      }

      // Keep a local snapshot after draft saves so navigate-away / refresh can
      // restore incomplete fields that the server may still be catching up on.
      writeRequisitionDraftSnapshot(requisition.id, {
        currencyId,
        priority,
        description,
        expectedDeliveryDate,
        isRecurring,
        requiresDownpayment,
        reminderDate,
        quoteWaiverReason,
        activityComment,
        selectedTagIds: selectedTags.map((tag) => tag.id),
        selectedTags,
        lineItems,
        supplierQuotes: supplierQuotesRef.current,
      })
      clearRequisitionDraftSnapshot(null)
    } catch (uploadError) {
      setFormError(
        uploadError instanceof Error
          ? uploadError.message
          : "Requisition saved, but one or more quote uploads failed."
      )
      // Still keep the requisition id so later saves update the same draft.
      persistedRequisitionIdRef.current = requisition.id
      setDraftRequisitionId(requisition.id)
      useRequisitionQuotesStore.getState().setActiveRequisitionId(requisition.id)
      writeLocalDraftSnapshot()
      return null
    }

    persistedRequisitionIdRef.current = requisition.id
    setDraftRequisitionId(requisition.id)
    useRequisitionQuotesStore.getState().setActiveRequisitionId(requisition.id)

    if (!pendingQuoteUploadsRemain) {
      isDirtyRef.current = false
      setIsDirty(false)
    }

    if (shouldSubmit) {
      clearRequisitionDraftSnapshot(requisition.id)
      clearRequisitionDraftSnapshot(null)
    }

    const finishHeaderUpdate = () => {
      beginQuietUpdate()
      setReferenceNumber(requisition.requisition_number ?? requisition.number)
      setStatusLabel(requisition.status?.name ?? "")
      setStageLabel(requisition.stage?.name ?? "")
      setCurrentStageSequence(requisition.current_stage_sequence ?? null)
      if (pendingQuoteUploadsRemain) {
        isDirtyRef.current = true
        setIsDirty(true)
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            skipDirtyTrackingRef.current = false
          })
        })
      } else {
        endQuietUpdate()
      }
    }

    if (source === "explicit" && shouldSubmit && existingId != null) {
      applyRequisitionState(requisition)
      setActivityComment("")
      await fetchLogs(requisition.id, true)
    } else if (source === "autosave") {
      finishHeaderUpdate()

      if (existingId == null) {
        skipNextServerHydrationRef.current = true
      }
    } else if (source === "explicit" && !shouldSubmit) {
      // Keep current in-progress form state after draft save; only refresh headers.
      finishHeaderUpdate()
      if (existingId == null) {
        skipNextServerHydrationRef.current = true
      }
    }

    if (source === "autosave") {
      onDraftSaved?.(requisition)
    } else if (shouldSubmit) {
      onSuccess?.(requisition)
    } else {
      // Explicit draft save — keep editing the same draft without remount wipe.
      onDraftSaved?.(requisition)
    }

    return requisition
  }

  const autosaveDraft = useCallback(async () => {
    if (!isDirtyRef.current || !isEditable) {
      return true
    }

    writeLocalDraftSnapshot()

    // Empty / untouched create forms should not block navigation.
    if (!hasMeaningfulDraftProgress()) {
      isDirtyRef.current = false
      setIsDirty(false)
      clearRequisitionDraftSnapshot(persistedRequisitionIdRef.current)
      return true
    }

    if (autosaveInFlightRef.current) {
      // A newer edit happened while saving (e.g. PDF picked mid-flight).
      // Retry once the in-flight save finishes so we don't drop that work.
      autosaveQueuedRef.current = true
      return autosaveInFlightRef.current
    }

    const run = (async () => {
      const saved = await persistRequisition(false, { source: "autosave" })
      return saved !== null
    })()

    autosaveInFlightRef.current = run

    try {
      const result = await run

      if (autosaveQueuedRef.current) {
        autosaveQueuedRef.current = false
        if (isDirtyRef.current) {
          return autosaveDraft()
        }
      }

      return result
    } finally {
      if (autosaveInFlightRef.current === run) {
        autosaveInFlightRef.current = null
      }
    }
  }, [
    activityComment,
    costCenterId,
    createRequisition,
    currencyId,
    description,
    expectedDeliveryDate,
    fetchLogs,
    isEditable,
    isRecurring,
    lineItems,
    onDraftSaved,
    priority,
    quoteWaiverReason,
    reminderDate,
    requiresDownpayment,
    selectedTags,
    supplierQuotes,
    updateRequisition,
  ])

  useEffect(() => {
    onRegisterAutosave?.(autosaveDraft)
    return () => onRegisterAutosave?.(null)
  }, [autosaveDraft, onRegisterAutosave])

  useEffect(() => {
    if (skipDirtyTrackingRef.current) {
      return
    }
    isDirtyRef.current = true
    setIsDirty(true)
    writeLocalDraftSnapshot()
  }, [
    activityComment,
    currencyId,
    description,
    expectedDeliveryDate,
    isRecurring,
    lineItems,
    priority,
    quoteWaiverReason,
    reminderDate,
    requiresDownpayment,
    selectedTags,
    supplierQuotes,
  ])

  // Debounced server autosave while the user edits.
  useEffect(() => {
    if (!isDirty || !isEditable) {
      return
    }

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }

    debounceTimerRef.current = setTimeout(() => {
      void autosaveDraft()
    }, 1500)

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
    }
  }, [autosaveDraft, isDirty, isEditable])

  const shouldBlockNavigation = isDirty && isEditable && !isSaving
  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      shouldBlockNavigation &&
      currentLocation.pathname !== nextLocation.pathname
  )

  useEffect(() => {
    if (blocker.state !== "blocked") {
      return
    }

    let cancelled = false

    void (async () => {
      const saved = await autosaveDraft()
      if (cancelled) {
        return
      }

      if (saved) {
        blocker.proceed?.()
      } else {
        blocker.reset?.()
      }
    })()

    return () => {
      cancelled = true
    }
  }, [autosaveDraft, blocker])

  useEffect(() => {
    if (!isEditable) {
      return
    }

    const flushOnLeave = () => {
      if (!isDirtyRef.current || !costCenterId) {
        return
      }

      writeLocalDraftSnapshot()

      if (!hasMeaningfulDraftProgress()) {
        return
      }

      const payload = {
        ...buildDraftPayload(false),
        submit: false,
      }

      flushRequisitionDraftKeepalive(
        payload,
        persistedRequisitionIdRef.current
      )
    }

    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!isDirtyRef.current) {
        return
      }
      flushOnLeave()
      event.preventDefault()
      event.returnValue = ""
    }

    window.addEventListener("pagehide", flushOnLeave)
    window.addEventListener("beforeunload", onBeforeUnload)
    return () => {
      window.removeEventListener("pagehide", flushOnLeave)
      window.removeEventListener("beforeunload", onBeforeUnload)
    }
  }, [
    activityComment,
    costCenterId,
    currencyId,
    description,
    expectedDeliveryDate,
    isEditable,
    isRecurring,
    lineItems,
    priority,
    quoteWaiverReason,
    reminderDate,
    requiresDownpayment,
    selectedTags,
    supplierQuotes,
  ])

  const handleApprovalDecision = async () => {
    if (!requisitionId) {
      return
    }

    if (onDecisionComplete) {
      onDecisionComplete(requisitionId)
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
    <div className={cn("relative flex flex-col gap-6", className)}>
      {isLoading ? (
        <div className="absolute inset-0 z-10 flex items-start justify-center rounded-lg bg-background/70 pt-16 backdrop-blur-[1px]">
          <LoadingSpinner label="Loading requisition..." />
        </div>
      ) : null}
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
        {mode === "edit" &&
        selectedRequisition?.is_delegated_cost_center_review &&
        selectedRequisition.reviewing_cost_center ? (
          <div className="rounded-lg border border-indigo-200 bg-indigo-50 px-4 py-3 text-sm text-indigo-900 dark:border-indigo-900 dark:bg-indigo-950 dark:text-indigo-100">
            {isEditable
              ? `You are completing a delegated review for ${selectedRequisition.reviewing_cost_center.name}. The owning cost center remains ${selectedRequisition.cost_center?.name ?? "unchanged"}.`
              : `${selectedRequisition.reviewing_cost_center.name} is currently reviewing this requisition on behalf of the budget officer. The owning cost center remains ${selectedRequisition.cost_center?.name ?? "unchanged"}.`}
          </div>
        ) : null}
      <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-4">
        {referenceNumber ? (
          <div className="flex flex-col justify-end md:col-span-2 xl:col-span-4">
            <span className="mb-2 block text-xs font-medium uppercase tracking-widest text-muted-foreground">
              Requisition number
            </span>
            <div className="flex flex-wrap items-center gap-2">
              <RequisitionNumberBadge
                number={referenceNumber}
                status={mapApiStatusToCardStatus(statusLabel)}
                className="h-10 px-3 text-sm"
              />
              {statusLabel ? (
                <span className="text-sm text-muted-foreground">
                  Status: {statusLabel}
                </span>
              ) : null}
            </div>
          </div>
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

      <div className="space-y-2">
        <label
          htmlFor="requisition-description"
          className="text-xs font-medium uppercase tracking-widest text-muted-foreground"
        >
          Description{" "}
          <span className="font-normal normal-case tracking-normal text-muted-foreground/80">
            (optional)
          </span>
        </label>
        <textarea
          id="requisition-description"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          rows={4}
          maxLength={5000}
          disabled={isFormDisabled}
          placeholder="Add general details about this requisition..."
          className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm transition-colors placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-50"
        />
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
        onChange={replaceSupplierQuotes}
        quoteWaiverReason={quoteWaiverReason}
        onQuoteWaiverReasonChange={setQuoteWaiverReason}
        requisitionId={requisitionId ?? draftRequisitionId ?? undefined}
        refreshKey={serverRevision}
        requisitionTotal={requisitionTotal}
        disabled={quotesDisabled}
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
        gstRatePercent={gstRatePercent}
        budgetAccounts={lineItemAccountOptions}
        isLoadingBudgetAccounts={isLoadingBudgetAccounts}
        budgetAccountsError={budgetAccountsError}
        disabled={isFormDisabled}
        allowAddItems={canAddLineItems}
        allowRemoveItems={canRemoveLineItems}
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
        <RequisitionActivityLog
          requisitionId={requisitionId}
          refreshKey={serverRevision}
        />
      ) : null}
    </div>
  )
}
