import { MessageSquarePlus } from "lucide-react"
import { useEffect, useState } from "react"

import { UBButton } from "@/components/shared/UBButton"
import { cn } from "@/lib/utils"
import { useRequisitionLogsStore } from "@/store/requisition-logs-store"

import { RequisitionLogEntryCard } from "./RequisitionLogEntryCard"

type RequisitionActivityLogProps = {
  requisitionId?: number
  className?: string
  allowComments?: boolean
}

export function RequisitionActivityLog({
  requisitionId,
  className,
  allowComments = true,
}: RequisitionActivityLogProps) {
  const fetchLogs = useRequisitionLogsStore((state) => state.fetchLogs)
  const addComment = useRequisitionLogsStore((state) => state.addComment)
  const logs = useRequisitionLogsStore((state) => state.logs)
  const isLoading = useRequisitionLogsStore((state) => state.isLoading)
  const isSubmittingComment = useRequisitionLogsStore(
    (state) => state.isSubmittingComment
  )
  const error = useRequisitionLogsStore((state) => state.error)

  const [comment, setComment] = useState("")

  useEffect(() => {
    if (!requisitionId) {
      return
    }

    void fetchLogs(requisitionId, true)
  }, [fetchLogs, requisitionId])

  const handleSubmitComment = async () => {
    if (!requisitionId || !comment.trim()) {
      return
    }

    const created = await addComment(requisitionId, {
      comments: comment.trim(),
    })

    if (created) {
      setComment("")
    }
  }

  if (!requisitionId) {
    return (
      <section className={cn("space-y-3", className)}>
        <h3 className="text-sm font-semibold tracking-tight">Activity log</h3>
        <p className="text-sm text-muted-foreground">
          Save the requisition to view its activity history.
        </p>
      </section>
    )
  }

  return (
    <section className={cn("space-y-4", className)}>
      <div>
        <h3 className="text-sm font-semibold tracking-tight">Activity log</h3>
        <p className="text-xs text-muted-foreground">
          Updates, submissions, approvals, rejections, and comments for this
          requisition.
        </p>
      </div>

      {allowComments ? (
        <div className="space-y-2 rounded-xl border border-border/70 bg-card p-4 shadow-sm">
          <label
            htmlFor="requisition-activity-comment"
            className="text-xs font-medium uppercase tracking-widest text-muted-foreground"
          >
            Add comment
          </label>
          <textarea
            id="requisition-activity-comment"
            value={comment}
            onChange={(event) => setComment(event.target.value)}
            rows={3}
            placeholder="Leave a note for reviewers or approvers..."
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm transition-colors placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/20"
          />
          <div className="flex justify-end">
            <UBButton
              type="button"
              size="sm"
              onClick={() => void handleSubmitComment()}
              disabled={isSubmittingComment || !comment.trim()}
            >
              <MessageSquarePlus className="size-4" data-icon="inline-start" />
              Post comment
            </UBButton>
          </div>
        </div>
      ) : null}

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      {isLoading && logs.length === 0 ? (
        <p className="text-sm text-muted-foreground">Loading activity...</p>
      ) : null}

      {!isLoading && logs.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border/80 bg-muted/10 px-4 py-6 text-sm text-muted-foreground">
          No activity recorded yet.
        </div>
      ) : (
        <div className="space-y-3">
          {logs.map((entry) => (
            <RequisitionLogEntryCard key={entry.id} entry={entry} />
          ))}
        </div>
      )}
    </section>
  )
}
