import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { RequisitionLogEntry } from "@/lib/api/requisition-logs"

import {
  formatRequisitionLogTimestamp,
  getRequisitionLogActionLabel,
  getRequisitionLogActionStyles,
} from "../lib/requisition-log-utils"

type RequisitionLogEntryCardProps = {
  entry: RequisitionLogEntry
  className?: string
}

export function RequisitionLogEntryCard({
  entry,
  className,
}: RequisitionLogEntryCardProps) {
  const actorName = entry.user?.name ?? "Unknown user"

  return (
    <article
      className={cn(
        "rounded-xl border border-border/70 bg-card p-4 shadow-sm",
        className
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <Badge
              variant="outline"
              className={cn(
                "font-medium",
                getRequisitionLogActionStyles(entry.action)
              )}
            >
              {getRequisitionLogActionLabel(entry.action)}
            </Badge>
            <span className="text-sm font-medium text-foreground">
              {actorName}
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            {formatRequisitionLogTimestamp(entry.created_at)}
          </p>
        </div>
      </div>

      {entry.summary ? (
        <p className="mt-3 text-sm text-foreground">{entry.summary}</p>
      ) : null}

      {entry.comments ? (
        <div className="mt-3 rounded-lg border border-border/60 bg-muted/20 px-3 py-2">
          <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
            {entry.action === "approved" || entry.action === "rejected"
              ? "Decision note"
              : "Comment"}
          </p>
          <p className="mt-1 text-sm text-foreground">{entry.comments}</p>
        </div>
      ) : null}
    </article>
  )
}
