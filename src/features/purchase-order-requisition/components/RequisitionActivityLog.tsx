import { MessageSquarePlus, Upload, X } from "lucide-react"
import { useEffect, useId, useState } from "react"

import { UBButton } from "@/components/shared/UBButton"
import { cn } from "@/lib/utils"
import { useRequisitionLogsStore } from "@/store/requisition-logs-store"

import { RequisitionLogEntryCard } from "./RequisitionLogEntryCard"

const PDF_ACCEPT = "application/pdf,.pdf"

type RequisitionActivityLogProps = {
  requisitionId?: number
  className?: string
  allowComments?: boolean
}

function isPdfFile(file: File) {
  return file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")
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
  const [file, setFile] = useState<File | null>(null)
  const [fileError, setFileError] = useState<string | null>(null)
  const fileInputId = useId()

  useEffect(() => {
    if (!requisitionId) {
      return
    }

    void fetchLogs(requisitionId, true)
  }, [fetchLogs, requisitionId])

  const handleFileChange = (nextFile: File | null) => {
    setFileError(null)

    if (!nextFile) {
      setFile(null)
      return
    }

    if (!isPdfFile(nextFile)) {
      setFileError("Only PDF files are allowed.")
      setFile(null)
      return
    }

    if (nextFile.size > 10 * 1024 * 1024) {
      setFileError("PDF must be 10 MB or smaller.")
      setFile(null)
      return
    }

    setFile(nextFile)
  }

  const handleSubmitComment = async () => {
    if (!requisitionId || !comment.trim()) {
      return
    }

    const created = await addComment(requisitionId, {
      comments: comment.trim(),
      file,
    })

    if (created) {
      setComment("")
      setFile(null)
      setFileError(null)
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
          Submissions, approvals, rejections, redirects, and comments for this
          requisition. Comments may include a supporting PDF.
        </p>
      </div>

      {allowComments ? (
        <div className="space-y-3 rounded-xl border border-border/70 bg-card p-4 shadow-sm">
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

          <div className="space-y-2">
            <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
              Supporting PDF{" "}
              <span className="font-normal normal-case tracking-normal text-muted-foreground/80">
                (optional)
              </span>
            </p>
            {file ? (
              <div className="flex items-center justify-between gap-2 rounded-lg border border-border/70 bg-muted/10 px-3 py-2 text-sm">
                <span className="min-w-0 truncate">{file.name}</span>
                <UBButton
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleFileChange(null)}
                  aria-label="Remove supporting PDF"
                >
                  <X className="size-4" />
                </UBButton>
              </div>
            ) : (
              <label
                htmlFor={fileInputId}
                className="flex min-h-10 cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-input bg-background px-3 py-2 text-sm transition-colors hover:border-primary/40 hover:bg-muted/20"
              >
                <Upload className="size-4 shrink-0 text-primary/80" />
                Upload PDF attachment
              </label>
            )}
            <input
              id={fileInputId}
              type="file"
              accept={PDF_ACCEPT}
              className="sr-only"
              onChange={(event) => {
                handleFileChange(event.target.files?.[0] ?? null)
                event.target.value = ""
              }}
            />
            <p className="text-xs text-muted-foreground">
              PDF files only, up to 10 MB.
            </p>
            {fileError ? (
              <p className="text-sm text-destructive">{fileError}</p>
            ) : null}
          </div>

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
