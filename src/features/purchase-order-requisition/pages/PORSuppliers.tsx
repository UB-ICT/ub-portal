import { Plus } from "lucide-react"
import { useEffect, useMemo, useState } from "react"

import { UBButton } from "@/components/shared/UBButton"
import type { Supplier } from "@/lib/api/suppliers"
import { useSuppliersStore } from "@/store/suppliers-store"

import {
  DEFAULT_SUPPLIER_SEARCH,
  filterAndSortSuppliers,
  type SupplierSearchCriteria,
} from "../lib/supplier-admin-utils"
import { SearchSuppliers } from "../components/SearchSuppliers"
import { SupplierFormDialog } from "../components/SupplierFormDialog"
import { SuppliersTable } from "../components/SuppliersTable"

export function PORSuppliersPage() {
  const suppliers = useSuppliersStore((state) => state.suppliers)
  const canReviewSuppliers = useSuppliersStore(
    (state) => state.canReviewSuppliers
  )
  const isLoading = useSuppliersStore((state) => state.isLoading)
  const isSaving = useSuppliersStore((state) => state.isSaving)
  const error = useSuppliersStore((state) => state.error)
  const fetchSuppliers = useSuppliersStore((state) => state.fetchSuppliers)
  const deleteSupplier = useSuppliersStore((state) => state.deleteSupplier)
  const activateSupplier = useSuppliersStore((state) => state.activateSupplier)
  const approveSupplier = useSuppliersStore((state) => state.approveSupplier)
  const rejectSupplier = useSuppliersStore((state) => state.rejectSupplier)

  const [searchCriteria, setSearchCriteria] =
    useState<SupplierSearchCriteria>(DEFAULT_SUPPLIER_SEARCH)
  const [formOpen, setFormOpen] = useState(false)
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null)

  useEffect(() => {
    void fetchSuppliers()
  }, [fetchSuppliers])

  const filteredSuppliers = useMemo(
    () => filterAndSortSuppliers(suppliers, searchCriteria),
    [suppliers, searchCriteria]
  )

  const handleAddSupplier = () => {
    setEditingSupplier(null)
    setFormOpen(true)
  }

  const handleEditSupplier = (supplier: Supplier) => {
    setEditingSupplier(supplier)
    setFormOpen(true)
  }

  const handleDeleteSupplier = async (supplier: Supplier) => {
    const confirmed = window.confirm(
      `Mark ${supplier.name} as deleted? The supplier will be removed from requisition quotes but remain visible in this list.`
    )

    if (!confirmed) {
      return
    }

    await deleteSupplier(supplier.id)
  }

  const handleActivateSupplier = async (supplier: Supplier) => {
    const confirmed = window.confirm(
      `Set ${supplier.name} to active? The supplier will be approved and available on requisitions again.`
    )

    if (!confirmed) {
      return
    }

    await activateSupplier(supplier.id)
  }

  return (
    <div className="flex h-full min-h-0 flex-col gap-4 overflow-hidden">
      <header className="flex shrink-0 flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold tracking-tight">Suppliers</h1>
          <p className="text-sm text-muted-foreground">
            Manage vendor records and finance approvals.
          </p>
        </div>
        <UBButton size="sm" onClick={handleAddSupplier}>
          <Plus className="size-4" data-icon="inline-start" />
          Add supplier
        </UBButton>
      </header>

      <SearchSuppliers onSearch={setSearchCriteria} />

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain">
        <SuppliersTable
          suppliers={filteredSuppliers}
          canReviewSuppliers={canReviewSuppliers}
          isLoading={isLoading || isSaving}
          onEdit={handleEditSupplier}
          onDelete={handleDeleteSupplier}
          onActivate={handleActivateSupplier}
          onApprove={async (supplier: Supplier, comments?: string) => {
            await approveSupplier(supplier.id, { comments })
          }}
          onReject={async (supplier: Supplier, comments?: string) => {
            await rejectSupplier(supplier.id, { comments })
          }}
        />
      </div>

      <SupplierFormDialog
        open={formOpen}
        supplier={editingSupplier}
        onOpenChange={setFormOpen}
        onSuccess={() => void fetchSuppliers(true)}
      />
    </div>
  )
}
