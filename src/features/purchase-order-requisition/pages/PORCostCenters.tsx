import { Plus } from "lucide-react"
import { useEffect, useMemo, useState } from "react"

import { UBButton } from "@/components/shared/UBButton"
import { UBPageHeader } from "@/components/shared/UBPageHeader"
import type { CostCenter } from "@/lib/api/requisitions"
import { useCostCentersStore } from "@/store/cost-centers-store"

import { CostCenterFormDialog } from "../components/CostCenterFormDialog"
import { CostCentersTable } from "../components/CostCentersTable"
import { SearchCostCenters } from "../components/SearchCostCenters"
import {
  DEFAULT_COST_CENTER_SEARCH,
  filterAndSortCostCenters,
  type CostCenterSearchCriteria,
} from "../lib/cost-center-admin-utils"

export function PORCostCentersPage() {
  const costCenters = useCostCentersStore((state) => state.costCenters)
  const isLoading = useCostCentersStore((state) => state.isLoading)
  const isSaving = useCostCentersStore((state) => state.isSaving)
  const error = useCostCentersStore((state) => state.error)
  const fetchCostCenters = useCostCentersStore((state) => state.fetchCostCenters)
  const deleteCostCenter = useCostCentersStore((state) => state.deleteCostCenter)

  const [searchCriteria, setSearchCriteria] = useState<CostCenterSearchCriteria>(
    DEFAULT_COST_CENTER_SEARCH
  )
  const [formOpen, setFormOpen] = useState(false)
  const [editingCostCenter, setEditingCostCenter] = useState<CostCenter | null>(
    null
  )

  useEffect(() => {
    void fetchCostCenters()
  }, [fetchCostCenters])

  const filteredCostCenters = useMemo(
    () => filterAndSortCostCenters(costCenters, searchCriteria),
    [costCenters, searchCriteria]
  )

  const handleAdd = () => {
    setEditingCostCenter(null)
    setFormOpen(true)
  }

  const handleEdit = (costCenter: CostCenter) => {
    setEditingCostCenter(costCenter)
    setFormOpen(true)
  }

  const handleDelete = async (costCenter: CostCenter) => {
    const confirmed = window.confirm(
      `Delete cost center "${costCenter.name}"? This cannot be undone.`
    )

    if (!confirmed) {
      return
    }

    await deleteCostCenter(costCenter.id)
  }

  return (
    <div className="flex h-full min-h-0 flex-col gap-4 overflow-hidden">
      <UBPageHeader
        title="Cost centers"
        description="Manage departments used for requisitions, budgets, and user assignments."
        actions={
          <UBButton size="sm" onClick={handleAdd}>
            <Plus className="size-4" data-icon="inline-start" />
            Add cost center
          </UBButton>
        }
      />

      <SearchCostCenters onSearch={setSearchCriteria} />

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain">
        <CostCentersTable
          costCenters={filteredCostCenters}
          isLoading={isLoading || isSaving}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>

      <CostCenterFormDialog
        open={formOpen}
        costCenter={editingCostCenter}
        onOpenChange={setFormOpen}
        onSuccess={() => void fetchCostCenters(true)}
      />
    </div>
  )
}
