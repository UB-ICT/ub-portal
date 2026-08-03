import { Check, Pencil, RotateCcw, Trash2, X } from "lucide-react"
import { useState } from "react"

import { UBButton } from "@/components/shared/UBButton"
import { UBTable } from "@/components/shared/UBTable"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { UBTextarea } from "@/components/shared/UBInput"
import type { Supplier } from "@/lib/api/suppliers"
import { cn } from "@/lib/utils"

import {
  getSupplierStatusStyles,
  supplierIsReviewable,
} from "../lib/supplier-admin-utils"
import { isSupplierDeleted } from "../lib/supplier-utils"

type SuppliersTableProps = {
  suppliers: Supplier[]
  canReviewSuppliers?: boolean
  isLoading?: boolean
  onEdit: (supplier: Supplier) => void
  onDelete: (supplier: Supplier) => void
  onActivate: (supplier: Supplier) => void
  onApprove: (supplier: Supplier, comments?: string) => Promise<void>
  onReject: (supplier: Supplier, comments?: string) => Promise<void>
}

export function SuppliersTable({
  suppliers,
  canReviewSuppliers = false,
  isLoading = false,
  onEdit,
  onDelete,
  onActivate,
  onApprove,
  onReject,
}: SuppliersTableProps) {
  const [reviewSupplier, setReviewSupplier] = useState<Supplier | null>(null)
  const [reviewAction, setReviewAction] = useState<"approve" | "reject" | null>(
    null
  )
  const [reviewComments, setReviewComments] = useState("")
  const [isReviewing, setIsReviewing] = useState(false)

  const openReviewDialog = (
    supplier: Supplier,
    action: "approve" | "reject"
  ) => {
    setReviewSupplier(supplier)
    setReviewAction(action)
    setReviewComments("")
  }

  const closeReviewDialog = () => {
    setReviewSupplier(null)
    setReviewAction(null)
    setReviewComments("")
    setIsReviewing(false)
  }

  const handleReviewSubmit = async () => {
    if (!reviewSupplier || !reviewAction) {
      return
    }

    setIsReviewing(true)

    try {
      if (reviewAction === "approve") {
        await onApprove(reviewSupplier, reviewComments.trim() || undefined)
      } else {
        await onReject(reviewSupplier, reviewComments.trim() || undefined)
      }
      closeReviewDialog()
    } finally {
      setIsReviewing(false)
    }
  }

  if (isLoading && suppliers.length === 0) {
    return (
      <p className="px-1 text-sm text-muted-foreground">Loading suppliers...</p>
    )
  }

  return (
    <>
      <UBTable
        rowKey="id"
        data={suppliers}
        striped
        columns={[
          {
            header: "Supplier",
            accessor: "name",
            mobile: true,
            render: (_, row) => {
              const deleted = isSupplierDeleted(row)

              return (
                <div>
                  <p
                    className={cn(
                      "font-medium",
                      deleted
                        ? "text-destructive line-through decoration-destructive"
                        : "text-foreground"
                    )}
                  >
                    {row.name}
                  </p>
                  <p
                    className={cn(
                      "text-xs",
                      deleted
                        ? "text-destructive line-through decoration-destructive"
                        : "text-muted-foreground"
                    )}
                  >
                    {row.email}
                  </p>
                </div>
              )
            },
          },
          {
            header: "Contact",
            accessor: "contact_person",
            render: (_, row) => {
              const deleted = isSupplierDeleted(row)

              return (
                <div>
                  <p
                    className={cn(
                      deleted &&
                        "text-destructive line-through decoration-destructive"
                    )}
                  >
                    {row.contact_person || "—"}
                  </p>
                  <p
                    className={cn(
                      "text-xs",
                      deleted
                        ? "text-destructive line-through decoration-destructive"
                        : "text-muted-foreground"
                    )}
                  >
                    {row.phone_number || "—"}
                  </p>
                </div>
              )
            },
          },
          {
            header: "Tax ID",
            accessor: "TAX",
            render: (value, row) => {
              const deleted = isSupplierDeleted(row)

              return (
                <span
                  className={cn(
                    deleted &&
                      "text-destructive line-through decoration-destructive"
                  )}
                >
                  {String(value ?? "—")}
                </span>
              )
            },
          },
          {
            header: "Status",
            accessor: "status",
            mobile: true,
            render: (_, row) => {
              const deleted = isSupplierDeleted(row)

              return (
                <Badge
                  variant="outline"
                  className={cn(
                    "font-medium",
                    getSupplierStatusStyles(row.status?.name),
                    deleted &&
                      "text-destructive line-through decoration-destructive"
                  )}
                >
                  {row.status?.name ?? "Unknown"}
                </Badge>
              )
            },
          },
          {
            header: "Actions",
            accessor: "id",
            className: "text-right",
            render: (_, row) => (
              <div className="flex flex-wrap justify-end gap-1">
                {isSupplierDeleted(row) ? (
                  <UBButton
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => onActivate(row)}
                  >
                    <RotateCcw className="size-4" data-icon="inline-start" />
                    Set active
                  </UBButton>
                ) : (
                  <>
                    <UBButton
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => onEdit(row)}
                      aria-label={`Edit ${row.name}`}
                    >
                      <Pencil className="size-4" />
                    </UBButton>
                    <UBButton
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => onDelete(row)}
                      aria-label={`Delete ${row.name}`}
                    >
                      <Trash2 className="size-4" />
                    </UBButton>
                    {canReviewSuppliers && supplierIsReviewable(row) ? (
                      <>
                        <UBButton
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => openReviewDialog(row, "approve")}
                        >
                          <Check className="size-4" data-icon="inline-start" />
                          Approve
                        </UBButton>
                        <UBButton
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => openReviewDialog(row, "reject")}
                        >
                          <X className="size-4" data-icon="inline-start" />
                          Reject
                        </UBButton>
                      </>
                    ) : null}
                  </>
                )}
              </div>
            ),
          },
        ]}
      />

      <Dialog
        open={Boolean(reviewSupplier && reviewAction)}
        onOpenChange={(open) => {
          if (!open) {
            closeReviewDialog()
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {reviewAction === "approve" ? "Approve supplier" : "Reject supplier"}
            </DialogTitle>
            <DialogDescription>
              {reviewAction === "approve"
                ? `Approve ${reviewSupplier?.name} for use on requisitions.`
                : `Reject ${reviewSupplier?.name} and optionally leave a note.`}
            </DialogDescription>
          </DialogHeader>

          <UBTextarea
            label="Comments (optional)"
            value={reviewComments}
            onChange={(event) => setReviewComments(event.target.value)}
            rows={4}
            placeholder="Add a note about this decision..."
          />

          <div className="flex justify-end gap-2">
            <UBButton
              type="button"
              variant="outline"
              onClick={closeReviewDialog}
              disabled={isReviewing}
            >
              Cancel
            </UBButton>
            <UBButton
              type="button"
              onClick={() => void handleReviewSubmit()}
              disabled={isReviewing}
            >
              {isReviewing
                ? "Saving..."
                : reviewAction === "approve"
                  ? "Approve supplier"
                  : "Reject supplier"}
            </UBButton>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
