import { Ban, Check, MessageSquareWarning, X } from "lucide-react"
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
  const isReviewing = useRequisitionsStore((state) => state.isReviewing)
  const error = useRequisitionsStore((state) => state.error)
  const fetchLogs = useRequisitionLogsStore((state) => state.fetchLogs)

  const [comments, setComments] = useState("")
  const [localError, setLocalError] = useState<string | null>(null)

  const hasRecordedAction = Boolean(userStageAction)
  const approvalActionsDisabled = isReviewing || !canAct || hasRecordedAction
  const cancelDisabled = isReviewing || !canCancel

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

    if (canCancel) {
      return "This requisition is still in progress. As the assigned cost center or director, you can cancel it to stop the approval pipeline."
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
          {canAct ? "Approval decision" : "Cost center action"}
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
          disabled={approvalActionsDisabled && cancelDisabled}
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
      </div>
    </section>
  )
}
