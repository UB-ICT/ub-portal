import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { Navigate, useSearchParams } from "react-router-dom"

import { UBButton } from "@/components/shared/UBButton"
import { LoadingSpinner } from "@/components/shared/LoadingSpinner"
import {
  RequisitionForm,
  type RequisitionFormAutosave,
} from "@/features/purchase-order-requisition/components/RequisitionForm"
import { RequisitionNumberBadge } from "@/features/purchase-order-requisition/components/RequisitionNumberBadge"
import { RequisitionPane } from "@/features/purchase-order-requisition/components/RequisitionPane"
import { mapPipelineToTimelineSteps } from "@/features/purchase-order-requisition/lib/pipeline-utils"
import { mapApiStatusToCardStatus } from "@/features/purchase-order-requisition/lib/requisition-mappers"
import {
  readStoredRequisitionSelection,
  resolveInitialRequisitionSelection,
  writeStoredRequisitionSelection,
  type StoredRequisitionSelection,
} from "@/features/purchase-order-requisition/lib/requisition-selection-storage"
import { UBTimeline } from "@/components/shared/UBTimeline"
import type { RequisitionRecord } from "@/lib/api/requisitions"
import { useRequisitionsStore } from "@/store/requisitions-store"

type PanelMode = "create" | "edit"

function resolveActiveRequisition(
  requisitions: RequisitionRecord[],
  selectedRequisition: RequisitionRecord | null,
  selectedRequisitionId: number | null
) {
  if (
    selectedRequisitionId &&
    selectedRequisition?.id === selectedRequisitionId
  ) {
    return selectedRequisition
  }

  return requisitions.find((requisition) => requisition.id === selectedRequisitionId)
}

function applySelectionState(
  selection: StoredRequisitionSelection,
  setters: {
    setSelectedRequisitionId: (id: number | null) => void
    setPanelMode: (mode: PanelMode) => void
    setFormInstanceKey: (key: string) => void
  }
) {
  if (selection.mode === "create") {
    setters.setSelectedRequisitionId(null)
    setters.setPanelMode("create")
    setters.setFormInstanceKey(`new-${Date.now()}`)
    return
  }

  setters.setSelectedRequisitionId(selection.requisitionId)
  setters.setPanelMode("edit")
  setters.setFormInstanceKey(`r-${selection.requisitionId}`)
}

export function PORRequisitionsPage() {
  const [panelMode, setPanelMode] = useState<PanelMode>("create")
  const [selectedRequisitionId, setSelectedRequisitionId] = useState<number | null>(null)
  const [formInstanceKey, setFormInstanceKey] = useState(() => `new-${Date.now()}`)
  const [hasResolvedSelection, setHasResolvedSelection] = useState(false)
  const autosaveRef = useRef<RequisitionFormAutosave | null>(null)
  const [searchParams, setSearchParams] = useSearchParams()
  const initialRequisitionParam = useRef(searchParams.get("requisition"))

  const requisitions = useRequisitionsStore((state) => state.requisitions)
  const selectedRequisition = useRequisitionsStore(
    (state) => state.selectedRequisition
  )
  const approvalPipeline = useRequisitionsStore((state) => state.approvalPipeline)
  const isLoadingPipeline = useRequisitionsStore(
    (state) => state.isLoadingPipeline
  )
  const fetchRequisitions = useRequisitionsStore((state) => state.fetchRequisitions)
  const fetchApprovalPipeline = useRequisitionsStore(
    (state) => state.fetchApprovalPipeline
  )

  const activeRequisition = resolveActiveRequisition(
    requisitions,
    selectedRequisition,
    selectedRequisitionId
  )

  const persistSelection = useCallback((selection: StoredRequisitionSelection) => {
    writeStoredRequisitionSelection(selection)
  }, [])

  useEffect(() => {
    void fetchApprovalPipeline()
  }, [fetchApprovalPipeline])

  useEffect(() => {
    const refreshVisibleData = () => {
      if (document.visibilityState !== "visible") {
        return
      }

      void fetchRequisitions(true)
      if (selectedRequisitionId) {
        void useRequisitionsStore.getState().fetchRequisitionById(selectedRequisitionId)
      }
    }

    window.addEventListener("focus", refreshVisibleData)
    document.addEventListener("visibilitychange", refreshVisibleData)

    return () => {
      window.removeEventListener("focus", refreshVisibleData)
      document.removeEventListener("visibilitychange", refreshVisibleData)
    }
  }, [fetchRequisitions, selectedRequisitionId])

  useEffect(() => {
    let cancelled = false

    void (async () => {
      const list = await fetchRequisitions(true)
      if (cancelled) {
        return
      }

      const queryId = Number(initialRequisitionParam.current)
      const preferredId =
        Number.isFinite(queryId) && queryId > 0 ? queryId : null

      const resolved = resolveInitialRequisitionSelection(
        list,
        readStoredRequisitionSelection(),
        preferredId
      )

      applySelectionState(resolved, {
        setSelectedRequisitionId,
        setPanelMode,
        setFormInstanceKey,
      })
      writeStoredRequisitionSelection(resolved)
      setHasResolvedSelection(true)

      if (preferredId) {
        setSearchParams(
          (current) => {
            if (!current.has("requisition")) {
              return current
            }
            const next = new URLSearchParams(current)
            next.delete("requisition")
            return next
          },
          { replace: true }
        )
      }
    })()

    return () => {
      cancelled = true
    }
  }, [fetchRequisitions, setSearchParams])

  useEffect(() => {
    if (!hasResolvedSelection) {
      return
    }

    const queryId = Number(searchParams.get("requisition"))
    if (!Number.isFinite(queryId) || queryId <= 0) {
      return
    }

    const exists = requisitions.some((requisition) => requisition.id === queryId)
    if (!exists) {
      return
    }

    applySelectionState(
      { mode: "edit", requisitionId: queryId },
      {
        setSelectedRequisitionId,
        setPanelMode,
        setFormInstanceKey,
      }
    )
    writeStoredRequisitionSelection({ mode: "edit", requisitionId: queryId })

    setSearchParams(
      (current) => {
        if (!current.has("requisition")) {
          return current
        }
        const next = new URLSearchParams(current)
        next.delete("requisition")
        return next
      },
      { replace: true }
    )
  }, [
    hasResolvedSelection,
    requisitions,
    searchParams,
    setSearchParams,
  ])

  const runAfterAutosave = useCallback(async (action: () => void) => {
    const autosave = autosaveRef.current
    if (autosave) {
      const saved = await autosave()
      if (!saved) {
        return
      }
    }
    action()
  }, [])

  const handleSelectRequisition = (id: number) => {
    void runAfterAutosave(() => {
      setSelectedRequisitionId(id)
      setPanelMode("edit")
      setFormInstanceKey(`r-${id}`)
      persistSelection({ mode: "edit", requisitionId: id })
    })
  }

  const handleNewRequisition = () => {
    void runAfterAutosave(() => {
      setSelectedRequisitionId(null)
      setPanelMode("create")
      setFormInstanceKey(`new-${Date.now()}`)
      persistSelection({ mode: "create" })
    })
  }

  const handleFormSuccess = async (requisition: RequisitionRecord) => {
    await fetchRequisitions(true)
    setSelectedRequisitionId(requisition.id)
    setPanelMode("edit")
    setFormInstanceKey(`r-${requisition.id}`)
    persistSelection({ mode: "edit", requisitionId: requisition.id })
  }

  const handleDraftSaved = async (requisition: RequisitionRecord) => {
    await fetchRequisitions(true)
    // Keep formInstanceKey stable so the in-progress form is not remounted.
    setSelectedRequisitionId(requisition.id)
    setPanelMode("edit")
    persistSelection({ mode: "edit", requisitionId: requisition.id })
  }

  const handleDecisionComplete = async (decidedId: number) => {
    const previousList = requisitions
    const decidedIndex = previousList.findIndex(
      (requisition) => requisition.id === decidedId
    )
    const preferredNextId =
      decidedIndex >= 0
        ? (previousList[decidedIndex + 1]?.id ??
          previousList[decidedIndex - 1]?.id ??
          null)
        : null

    const list = await fetchRequisitions(true)

    // Still in this user's list (e.g. cost-center cancel) — stay on it.
    if (list.some((requisition) => requisition.id === decidedId)) {
      setSelectedRequisitionId(decidedId)
      setPanelMode("edit")
      setFormInstanceKey(`r-${decidedId}-${Date.now()}`)
      persistSelection({ mode: "edit", requisitionId: decidedId })
      return
    }

    const nextId =
      preferredNextId != null &&
      list.some((requisition) => requisition.id === preferredNextId)
        ? preferredNextId
        : (list[0]?.id ?? null)

    if (nextId != null) {
      setSelectedRequisitionId(nextId)
      setPanelMode("edit")
      setFormInstanceKey(`r-${nextId}`)
      persistSelection({ mode: "edit", requisitionId: nextId })
      return
    }

    setSelectedRequisitionId(null)
    setPanelMode("create")
    setFormInstanceKey(`new-${Date.now()}`)
    persistSelection({ mode: "create" })
  }

  const handleRegisterAutosave = useCallback(
    (autosave: RequisitionFormAutosave | null) => {
      autosaveRef.current = autosave
    },
    []
  )

  const handleCancel = () => {
    void runAfterAutosave(() => {
      setSelectedRequisitionId(null)
      setPanelMode("create")
      setFormInstanceKey(`new-${Date.now()}`)
      persistSelection({ mode: "create" })
    })
  }

  const pipeline = activeRequisition?.pipeline ?? approvalPipeline
  const timelineSteps = useMemo(
    () => mapPipelineToTimelineSteps(pipeline),
    [pipeline]
  )
  const currentStep = activeRequisition?.current_stage_sequence ?? 1

  return (
    <div className="flex h-full min-h-0 flex-col gap-2 overflow-hidden">
      <header className="flex shrink-0 items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground">
          Search requisitions on the left and create or update on the right.
          Progress is saved as a draft automatically while you work, and when
          you leave this page or refresh.
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
            {panelMode === "edit" && activeRequisition?.number ? (
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <RequisitionNumberBadge
                  number={
                    activeRequisition.requisition_number ??
                    activeRequisition.number
                  }
                  status={mapApiStatusToCardStatus(
                    activeRequisition.status?.name
                  )}
                />
                <p className="text-xs text-muted-foreground">
                  Edit the selected requisition and save your changes.
                </p>
              </div>
            ) : (
              <p className="mt-0.5 text-xs text-muted-foreground">
                Fill in the details below to create a new requisition. A unique
                requisition number is assigned on save.
              </p>
            )}
          </div>

          <div className="shrink-0 border-b bg-muted/30 p-4">
            {isLoadingPipeline && timelineSteps.length === 0 ? (
              <LoadingSpinner
                className="py-4"
                label="Loading approval pipeline..."
              />
            ) : timelineSteps.length > 0 ? (
              <UBTimeline
                timelineTitle={
                  panelMode === "edit" ? "Approval Progress" : "Pipeline Preview"
                }
                steps={timelineSteps}
                currentStep={currentStep}
                className="border-none bg-transparent p-0 shadow-none"
              />
            ) : (
              <p className="text-sm text-muted-foreground">
                No pipeline stages are configured.
              </p>
            )}
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain p-4">
            {!hasResolvedSelection ? (
              <LoadingSpinner label="Loading requisition..." />
            ) : (
              <RequisitionForm
                key={formInstanceKey}
                mode={panelMode}
                requisitionId={selectedRequisitionId ?? undefined}
                onSuccess={handleFormSuccess}
                onDraftSaved={handleDraftSaved}
                onDecisionComplete={handleDecisionComplete}
                onRegisterAutosave={handleRegisterAutosave}
                onCancel={handleCancel}
              />
            )}
          </div>
        </section>
      </div>
    </div>
  )
}

export function PORCreateRequisitionPage() {
  return <Navigate to="/requisitions/forms" replace />
}
