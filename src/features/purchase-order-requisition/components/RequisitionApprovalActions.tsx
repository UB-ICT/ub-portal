import { Check, MessageSquareWarning, X } from "lucide-react"
import { useState } from "react"

import { UBButton } from "@/components/shared/UBButton"
import { cn } from "@/lib/utils"
import { useRequisitionLogsStore } from "@/store/requisition-logs-store"
import { useRequisitionsStore } from "@/store/requisitions-store"

type RequisitionApprovalActionsProps = {
  requisitionId: number
  stageName?: string | null
  className?: string
  onDecision?: () => void
}

type ReviewAction = "approve" | "reject" | "request-review"

export function RequisitionApprovalActions({
  requisitionId,
  stageName,
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
  const isReviewing = useRequisitionsStore((state) => state.isReviewing)
  const error = useRequisitionsStore((state) => state.error)
  const fetchLogs = useRequisitionLogsStore((state) => state.fetchLogs)

  const [comments, setComments] = useState("")
  const [localError, setLocalError] = useState<string | null>(null)

  const handleDecision = async (action: ReviewAction) => {
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

  return (
    <section
      className={cn(
        "space-y-3 rounded-xl border border-border/70 bg-card p-4 shadow-sm",
        className
      )}
    >
      <div>
        <h3 className="text-sm font-semibold tracking-tight">Approval decision</h3>
        <p className="text-xs text-muted-foreground">
          {stageName
            ? `You are acting at the ${stageName} stage. Approve to advance the pipeline, reject to stop it, or request more information from the cost center.`
            : "Approve to advance the pipeline, reject to stop it, or request more information from the cost center."}
        </p>
      </div>

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
          disabled={isReviewing}
          className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm transition-colors placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-50"
        />
      </div>

      {localError || error ? (
        <p className="text-sm text-destructive">{localError ?? error}</p>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <UBButton
          type="button"
          onClick={() => void handleDecision("approve")}
          disabled={isReviewing}
        >
          <Check className="size-4" data-icon="inline-start" />
          {isReviewing ? "Processing..." : "Approve"}
        </UBButton>
        <UBButton
          type="button"
          variant="outline"
          onClick={() => void handleDecision("request-review")}
          disabled={isReviewing}
        >
          <MessageSquareWarning className="size-4" data-icon="inline-start" />
          Request more information
        </UBButton>
        <UBButton
          type="button"
          variant="outline"
          onClick={() => void handleDecision("reject")}
          disabled={isReviewing}
          className="border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive"
        >
          <X className="size-4" data-icon="inline-start" />
          Reject
        </UBButton>
      </div>
    </section>
  )
}
