import { Check, MessageSquareWarning, X } from "lucide-react"
import { useState } from "react"

import { UBButton } from "@/components/shared/UBButton"
import type { BudgetUserStageAction } from "@/lib/api/budgets"
import { cn } from "@/lib/utils"
import { useBudgetsStore } from "@/store/budgets-store"

type BudgetApprovalActionsProps = {
  budgetId: number
  stageName?: string | null
  canAct?: boolean
  userStageAction?: BudgetUserStageAction | null
  className?: string
  onDecision?: () => void
}

type ReviewAction = "approve" | "reject" | "request-review"

export function BudgetApprovalActions({
  budgetId,
  stageName,
  canAct = false,
  userStageAction = null,
  className,
  onDecision,
}: BudgetApprovalActionsProps) {
  const approveBudget = useBudgetsStore((state) => state.approveBudget)
  const rejectBudget = useBudgetsStore((state) => state.rejectBudget)
  const requestBudgetReview = useBudgetsStore(
    (state) => state.requestBudgetReview
  )
  const isReviewing = useBudgetsStore((state) => state.isReviewing)
  const error = useBudgetsStore((state) => state.error)

  const [comments, setComments] = useState("")
  const [localError, setLocalError] = useState<string | null>(null)

  const hasRecordedAction = Boolean(userStageAction)
  const actionsDisabled = isReviewing || !canAct || hasRecordedAction

  const handleDecision = async (action: ReviewAction) => {
    if (actionsDisabled) {
      return
    }

    setLocalError(null)

    const payload = { comments: comments.trim() || null }

    const budget =
      action === "approve"
        ? await approveBudget(budgetId, payload)
        : action === "reject"
          ? await rejectBudget(budgetId, payload)
          : await requestBudgetReview(budgetId, payload)

    if (!budget) {
      return
    }

    setComments("")
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
        <h3 className="text-sm font-semibold tracking-tight">Budget review</h3>
        <p className="text-xs text-muted-foreground">
          {hasRecordedAction && userStageAction
            ? `You already recorded a ${userStageAction.replaceAll("_", " ")} decision${stageName ? ` at ${stageName}` : ""}.`
            : stageName
              ? `You are acting at the ${stageName} stage. Approve to advance, reject to stop, or send back to the cost center.`
              : "Approve to advance, reject to stop, or send back to the cost center."}
        </p>
      </div>

      <div className="space-y-2">
        <label
          htmlFor="budget-approval-comments"
          className="text-xs font-medium uppercase tracking-widest text-muted-foreground"
        >
          Review note (optional)
        </label>
        <textarea
          id="budget-approval-comments"
          value={comments}
          onChange={(event) => setComments(event.target.value)}
          rows={3}
          disabled={actionsDisabled}
          placeholder="Add review notes for the activity log..."
          className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-50"
        />
      </div>

      {localError || error ? (
        <p className="text-sm text-destructive">{localError ?? error}</p>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <UBButton
          type="button"
          onClick={() => void handleDecision("approve")}
          disabled={actionsDisabled}
        >
          <Check className="size-4" data-icon="inline-start" />
          {isReviewing ? "Processing..." : "Approve"}
        </UBButton>
        <UBButton
          type="button"
          variant="outline"
          onClick={() => void handleDecision("request-review")}
          disabled={actionsDisabled}
        >
          <MessageSquareWarning className="size-4" data-icon="inline-start" />
          Request more information
        </UBButton>
        <UBButton
          type="button"
          variant="outline"
          onClick={() => void handleDecision("reject")}
          disabled={actionsDisabled}
          className="border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive"
        >
          <X className="size-4" data-icon="inline-start" />
          Reject
        </UBButton>
      </div>
    </section>
  )
}
