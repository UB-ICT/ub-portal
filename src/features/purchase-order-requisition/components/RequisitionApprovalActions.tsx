import { Ban, Check, CircleSlash, MessageSquareWarning, X } from "lucide-react"
import { useState } from "react"

import { UBButton } from "@/components/shared/UBButton"
import type { RequisitionUserStageAction } from "@/lib/api/requisitions"
import { cn } from "@/lib/utils"
import { useRequisitionLogsStore } from "@/store/requisition-logs-store"
import { useRequisitionsStore } from "@/store/requisitions-store"

import {
  getRequisitionUserStageActionButtonClass,
  getRequisitionUserStageActionDescription,
  getRequisitionUserStageActionHighlightClass,
  getRequisitionUserStageActionLabel,
} from "../lib/requisition-approval-utils"

type RequisitionApprovalActionsProps = {
  requisitionId: number
  stageName?: string | null
  canAct?: boolean
  canCancel?: boolean
  canClose?: boolean
  userStageAction?: RequisitionUserStageAction | null
  className?: string
  onDecision?: () => void
}

type ReviewAction = "approve" | "reject" | "request-review"

const ACTION_TO_USER_STAGE: Record<
  ReviewAction,
  RequisitionUserStageAction
> = {
  approve: "approved",
  reject: "rejected",
  "request-review": "cost_center_review",
}

export function RequisitionApprovalActions({
  requisitionId,
  stageName,
  canAct = false,
  canCancel = false,
  canClose = false,
  userStageAction = null,
  className,
  onDecision,
}: RequisitionApprovalActionsProps) {
  const approveRequisition = useRequisitionsStore(
    (state) => state.approveRequisition
  )
  const rejectRequisition = useRequisitionsStore(
    (state) => state.rejectRequisition
  )
  const requestRequisitionReview = useRequisitionsStore(
    (state) => state.requestRequisitionReview
  )
  const cancelRequisition = useRequisitionsStore(
    (state) => state.cancelRequisition
  )
  const closeRequisition = useRequisitionsStore(
    (state) => state.closeRequisition
  )
  const isReviewing = useRequisitionsStore((state) => state.isReviewing)
  const error = useRequisitionsStore((state) => state.error)
  const fetchLogs = useRequisitionLogsStore((state) => state.fetchLogs)

  const [comments, setComments] = useState("")
  const [localError, setLocalError] = useState<string | null>(null)

  const hasRecordedAction = Boolean(userStageAction)
  const approvalActionsDisabled = isReviewing || !canAct || hasRecordedAction
  const cancelDisabled = isReviewing || !canCancel
  const closeDisabled = isReviewing || !canClose

  const handleDecision = async (action: ReviewAction) => {
    if (approvalActionsDisabled) {
      return
    }

    setLocalError(null)

    const payload = {
      comments: comments.trim() || null,
    }

    const requisition =
      action === "approve"
        ? await approveRequisition(requisitionId, payload)
        : action === "reject"
          ? await rejectRequisition(requisitionId, payload)
          : await requestRequisitionReview(requisitionId, payload)

    if (!requisition) {
      return
    }

    setComments("")
    await fetchLogs(requisitionId, true)
    onDecision?.()
  }

  const handleCancel = async () => {
    if (cancelDisabled) {
      return
    }

    const confirmed = window.confirm(
      "Cancel this requisition? It will stop moving through approval and cannot be approved, rejected, or sent back for review."
    )

    if (!confirmed) {
      return
    }

    setLocalError(null)

    const requisition = await cancelRequisition(requisitionId, {
      comments: comments.trim() || null,
    })

    if (!requisition) {
      return
    }

    setComments("")
    await fetchLogs(requisitionId, true)
    onDecision?.()
  }

  const handleClose = async () => {
    if (closeDisabled) {
      return
    }

    const confirmed = window.confirm(
      "Close this requisition? This marks it as discontinued / not processed and ends the workflow."
    )

    if (!confirmed) {
      return
    }

    setLocalError(null)

    const requisition = await closeRequisition(requisitionId, {
      comments: comments.trim() || null,
    })

    if (!requisition) {
      return
    }

    setComments("")
    await fetchLogs(requisitionId, true)
    onDecision?.()
  }

  const sectionDescription = (() => {
    if (hasRecordedAction && userStageAction) {
      return getRequisitionUserStageActionDescription(userStageAction, stageName)
    }

    if (canAct && stageName) {
      return `You are acting at the ${stageName} stage. Approve to advance the pipeline, reject to stop it, or request more information from the cost center.`
    }

    if (canAct) {
      return "Approve to advance the pipeline, reject to stop it, or request more information from the cost center."
    }

    if (canClose || canCancel) {
      return "You can cancel to withdraw this requisition from approval, or close it to mark it as discontinued / not processed."
    }

    return ""
  })()

  return (
    <section
      className={cn(
        "space-y-3 rounded-xl border border-border/70 bg-card p-4 shadow-sm",
        className
      )}
    >
      <div>
        <h3 className="text-sm font-semibold tracking-tight">
          {canAct ? "Approval decision" : "Requisition actions"}
        </h3>
        {sectionDescription ? (
          <p className="text-xs text-muted-foreground">{sectionDescription}</p>
        ) : null}
      </div>

      {hasRecordedAction && userStageAction ? (
        <div
          className={cn(
            "rounded-lg border px-4 py-3 text-sm font-medium",
            getRequisitionUserStageActionHighlightClass(userStageAction)
          )}
        >
          {getRequisitionUserStageActionLabel(userStageAction)}
        </div>
      ) : null}

      <div className="space-y-2">
        <label
          htmlFor="requisition-approval-comments"
          className="text-xs font-medium uppercase tracking-widest text-muted-foreground"
        >
          Review note (optional)
        </label>
        <textarea
          id="requisition-approval-comments"
          value={comments}
          onChange={(event) => setComments(event.target.value)}
          rows={3}
          placeholder="Add review notes for the activity log..."
          disabled={approvalActionsDisabled && cancelDisabled && closeDisabled}
          className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm transition-colors placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-50"
        />
      </div>

      {localError || error ? (
        <p className="text-sm text-destructive">{localError ?? error}</p>
      ) : null}

      <div className="flex flex-wrap gap-2">
        {canAct ? (
          <>
            <UBButton
              type="button"
              onClick={() => void handleDecision("approve")}
              disabled={approvalActionsDisabled}
              className={getRequisitionUserStageActionButtonClass(
                "approved",
                userStageAction === ACTION_TO_USER_STAGE.approve
              )}
            >
              <Check className="size-4" data-icon="inline-start" />
              {isReviewing ? "Processing..." : "Approve"}
            </UBButton>
            <UBButton
              type="button"
              variant="outline"
              onClick={() => void handleDecision("request-review")}
              disabled={approvalActionsDisabled}
              className={getRequisitionUserStageActionButtonClass(
                "cost_center_review",
                userStageAction === ACTION_TO_USER_STAGE["request-review"]
              )}
            >
              <MessageSquareWarning className="size-4" data-icon="inline-start" />
              Request more information
            </UBButton>
            <UBButton
              type="button"
              variant="outline"
              onClick={() => void handleDecision("reject")}
              disabled={approvalActionsDisabled}
              className={cn(
                !hasRecordedAction &&
                  "border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive",
                getRequisitionUserStageActionButtonClass(
                  "rejected",
                  userStageAction === ACTION_TO_USER_STAGE.reject
                )
              )}
            >
              <X className="size-4" data-icon="inline-start" />
              Reject
            </UBButton>
          </>
        ) : null}
        {canCancel ? (
          <UBButton
            type="button"
            variant="destructive"
            onClick={() => void handleCancel()}
            disabled={cancelDisabled}
          >
            <Ban className="size-4" data-icon="inline-start" />
            {isReviewing ? "Cancelling..." : "Cancel requisition"}
          </UBButton>
        ) : null}
        {canClose ? (
          <UBButton
            type="button"
            variant="outline"
            onClick={() => void handleClose()}
            disabled={closeDisabled}
            className="border-slate-400 text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-900"
          >
            <CircleSlash className="size-4" data-icon="inline-start" />
            {isReviewing ? "Closing..." : "Close requisition"}
          </UBButton>
        ) : null}
      </div>
    </section>
  )
}
