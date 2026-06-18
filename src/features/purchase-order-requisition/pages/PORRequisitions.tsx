import { useState } from "react"
import { Navigate } from "react-router-dom"

import { UBButton } from "@/components/shared/UBButton"
import { RequisitionForm } from "@/features/purchase-order-requisition/components/RequisitionForm"
import { RequisitionPane } from "@/features/purchase-order-requisition/components/RequisitionPane"
import type { RequisitionRecord } from "@/lib/api/requisitions"
import { useRequisitionsStore } from "@/store/requisitions-store"

type PanelMode = "create" | "edit"

export function PORRequisitionsPage() {
  const [panelMode, setPanelMode] = useState<PanelMode>("create")
  const [selectedRequisitionId, setSelectedRequisitionId] = useState<
    number | null
  >(null)
  const fetchRequisitions = useRequisitionsStore(
    (state) => state.fetchRequisitions
  )

  const handleSelectRequisition = (id: number) => {
    setSelectedRequisitionId(id)
    setPanelMode("edit")
  }

  const handleNewRequisition = () => {
    setSelectedRequisitionId(null)
    setPanelMode("create")
  }

  const handleFormSuccess = async (requisition: RequisitionRecord) => {
    await fetchRequisitions(true)
    setSelectedRequisitionId(requisition.id)
    setPanelMode("edit")
  }

  const handleCancel = () => {
    handleNewRequisition()
  }

  return (
    <div className="flex h-full min-h-0 flex-col gap-2 overflow-hidden">
      <header className="flex shrink-0 items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground">
          Search requisitions on the left and create or update on the right.
        </p>
        <UBButton size="sm" onClick={handleNewRequisition}>
          New requisition
        </UBButton>
      </header>

      <div className="flex min-h-0 flex-1 gap-2 overflow-hidden">
        <RequisitionPane
          selectedRequisitionId={selectedRequisitionId}
          onRequisitionSelect={handleSelectRequisition}
        />

        <section className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-xl border border-border bg-card">
          <div className="shrink-0 border-b border-border px-4 py-3">
            <h2 className="text-base font-semibold tracking-tight text-foreground">
              {panelMode === "edit" ? "Update requisition" : "New requisition"}
            </h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {panelMode === "edit"
                ? "Edit the selected requisition and save your changes."
                : "Fill in the details below to create a new requisition."}
            </p>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain p-4">
            <RequisitionForm
              key={panelMode === "create" ? "create" : `edit-${selectedRequisitionId}`}
              mode={panelMode}
              requisitionId={selectedRequisitionId ?? undefined}
              onSuccess={handleFormSuccess}
              onCancel={handleCancel}
            />
          </div>
        </section>
      </div>
    </div>
  )
}

export function PORCreateRequisitionPage() {
  return <Navigate to="/requisitions/forms" replace />
}
