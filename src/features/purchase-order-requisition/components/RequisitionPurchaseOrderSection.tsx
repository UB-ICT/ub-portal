import { useId, useRef, useState } from "react"
import { Download, Mail, Upload } from "lucide-react"

import { UBButton } from "@/components/shared/UBButton"
import { UBInput } from "@/components/shared/UBInput"
import { buildApiUrl } from "@/lib/config"
import { readStoredAccessToken } from "@/lib/auth/storage"
import { getRequisitionPurchaseOrderDownloadUrl } from "@/lib/api/requisitions"
import { useRequisitionsStore } from "@/store/requisitions-store"

type RequisitionPurchaseOrderSectionProps = {
  requisitionId: number
  purchaseOrderNumber: string
  onPurchaseOrderNumberChange: (value: string) => void
  canEdit: boolean
  canUpload: boolean
  canEmail: boolean
  fileName?: string | null
  emailedAt?: string | null
  preferredSupplierEmail?: string | null
  onUpdated: () => void | Promise<void>
}

export function RequisitionPurchaseOrderSection({
  requisitionId,
  purchaseOrderNumber,
  onPurchaseOrderNumberChange,
  canEdit,
  canUpload,
  canEmail,
  fileName,
  emailedAt,
  preferredSupplierEmail,
  onUpdated,
}: RequisitionPurchaseOrderSectionProps) {
  const fileInputId = useId()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [emailMessage, setEmailMessage] = useState("")
  const [localError, setLocalError] = useState<string | null>(null)

  const isSavingPurchaseOrder = useRequisitionsStore(
    (state) => state.isSavingPurchaseOrder
  )
  const isEmailingPurchaseOrder = useRequisitionsStore(
    (state) => state.isEmailingPurchaseOrder
  )
  const updateRequisitionPurchaseOrderNumber = useRequisitionsStore(
    (state) => state.updateRequisitionPurchaseOrderNumber
  )
  const uploadRequisitionPurchaseOrder = useRequisitionsStore(
    (state) => state.uploadRequisitionPurchaseOrder
  )
  const emailRequisitionPurchaseOrder = useRequisitionsStore(
    (state) => state.emailRequisitionPurchaseOrder
  )
  const storeError = useRequisitionsStore((state) => state.error)

  const handleSaveNumber = async () => {
    setLocalError(null)
    const requisition = await updateRequisitionPurchaseOrderNumber(
      requisitionId,
      {
        purchase_order_number: purchaseOrderNumber.trim() || null,
      }
    )

    if (requisition) {
      await onUpdated()
    }
  }

  const handleUpload = async (file: File | null) => {
    if (!file) {
      return
    }

    if (file.type !== "application/pdf") {
      setLocalError("Upload a PDF purchase order.")
      return
    }

    setLocalError(null)
    const requisition = await uploadRequisitionPurchaseOrder(
      requisitionId,
      file,
      purchaseOrderNumber.trim() || null
    )

    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }

    if (requisition) {
      await onUpdated()
    }
  }

  const handleDownload = async () => {
    try {
      const response = await fetch(
        buildApiUrl(getRequisitionPurchaseOrderDownloadUrl(requisitionId)),
        {
          headers: {
            Accept: "application/pdf",
            Authorization: `Bearer ${readStoredAccessToken()}`,
          },
        }
      )

      if (!response.ok) {
        throw new Error("Failed to download purchase order.")
      }

      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const anchor = document.createElement("a")
      anchor.href = url
      anchor.download = fileName || "purchase-order.pdf"
      anchor.click()
      URL.revokeObjectURL(url)
    } catch (error) {
      setLocalError(
        error instanceof Error
          ? error.message
          : "Failed to download purchase order."
      )
    }
  }

  const handleEmail = async () => {
    setLocalError(null)
    const requisition = await emailRequisitionPurchaseOrder(requisitionId, {
      message: emailMessage.trim() || null,
    })

    if (requisition) {
      setEmailMessage("")
      await onUpdated()
    }
  }

  return (
    <div className="rounded-xl border border-border/70 bg-card p-4 shadow-sm">
      <div className="mb-3">
        <h3 className="text-sm font-semibold tracking-tight">Purchase order</h3>
        <p className="text-xs text-muted-foreground">
          {canEdit
            ? "Set the PO number, upload the PO PDF, and email it to the preferred supplier after the requisition is approved."
            : "Purchase order details for this requisition."}
        </p>
      </div>

      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div className="flex-1">
          <UBInput
            label="Purchase order number"
            value={purchaseOrderNumber}
            onChange={(event) => onPurchaseOrderNumberChange(event.target.value)}
            placeholder={canEdit ? "Enter the purchase order number" : "Not assigned"}
            readOnly={!canEdit}
            disabled={!canEdit || isSavingPurchaseOrder}
          />
        </div>
        {canEdit ? (
          <UBButton
            type="button"
            onClick={() => void handleSaveNumber()}
            disabled={isSavingPurchaseOrder}
          >
            {isSavingPurchaseOrder ? "Saving..." : "Save PO number"}
          </UBButton>
        ) : null}
      </div>

      <div className="mt-4 space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          {fileName ? (
            <p className="text-sm text-foreground">
              Uploaded: <span className="font-medium">{fileName}</span>
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">No PO PDF uploaded yet.</p>
          )}

          {fileName ? (
            <UBButton
              type="button"
              variant="outline"
              size="sm"
              onClick={() => void handleDownload()}
            >
              <Download className="size-4" data-icon="inline-start" />
              Download
            </UBButton>
          ) : null}

          {canUpload ? (
            <>
              <input
                ref={fileInputRef}
                id={fileInputId}
                type="file"
                accept="application/pdf"
                className="sr-only"
                onChange={(event) =>
                  void handleUpload(event.target.files?.[0] ?? null)
                }
                disabled={isSavingPurchaseOrder}
              />
              <UBButton
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={isSavingPurchaseOrder}
              >
                <Upload className="size-4" data-icon="inline-start" />
                {fileName ? "Replace PO PDF" : "Upload PO PDF"}
              </UBButton>
            </>
          ) : null}
        </div>

        {emailedAt ? (
          <p className="text-xs text-muted-foreground">
            Last emailed {new Date(emailedAt).toLocaleString()}
            {preferredSupplierEmail ? ` to ${preferredSupplierEmail}` : ""}.
          </p>
        ) : null}

        {canEdit || canEmail ? (
          <div className="rounded-lg border border-border/60 bg-muted/10 p-3">
            <UBInput
              label="Email note (optional)"
              value={emailMessage}
              onChange={(event) => setEmailMessage(event.target.value)}
              placeholder="Optional message to include with the PO"
              disabled={!canEmail || isEmailingPurchaseOrder}
            />
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <UBButton
                type="button"
                onClick={() => void handleEmail()}
                disabled={!canEmail || isEmailingPurchaseOrder}
              >
                <Mail className="size-4" data-icon="inline-start" />
                {isEmailingPurchaseOrder
                  ? "Sending..."
                  : preferredSupplierEmail
                    ? `Email PO to ${preferredSupplierEmail}`
                    : "Email PO to supplier"}
              </UBButton>
              {!canEmail && !fileName ? (
                <p className="text-xs text-muted-foreground">
                  Upload a PO PDF to enable emailing.
                </p>
              ) : null}
              {!canEmail && fileName && !preferredSupplierEmail ? (
                <p className="text-xs text-muted-foreground">
                  Preferred supplier needs an email address.
                </p>
              ) : null}
            </div>
          </div>
        ) : null}
      </div>

      {localError || storeError ? (
        <p className="mt-3 text-sm text-destructive">
          {localError || storeError}
        </p>
      ) : null}
    </div>
  )
}
