import { create } from "zustand"

import {
  approveSupplier,
  createSupplier,
  createSupplierQuick,
  deleteSupplier,
  fetchSupplier,
  fetchSuppliers,
  rejectSupplier,
  updateSupplier,
  type CreateSupplierPayload,
  type CreateSupplierQuickPayload,
  type Supplier,
  type SupplierReviewPayload,
  type UpdateSupplierPayload,
} from "@/lib/api/suppliers"
import { readStoredAccessToken } from "@/lib/auth/storage"

type SuppliersState = {
  suppliers: Supplier[]
  selectedSupplier: Supplier | null
  canReviewSuppliers: boolean
  isLoading: boolean
  isSaving: boolean
  error: string | null
  fetchSuppliers: (force?: boolean) => Promise<Supplier[]>
  fetchSupplierById: (id: number) => Promise<Supplier | null>
  createSupplier: (payload: CreateSupplierPayload) => Promise<Supplier | null>
  createSupplierQuick: (
    payload: CreateSupplierQuickPayload
  ) => Promise<Supplier | null>
  updateSupplier: (
    id: number,
    payload: UpdateSupplierPayload
  ) => Promise<Supplier | null>
  deleteSupplier: (id: number) => Promise<boolean>
  approveSupplier: (
    id: number,
    payload?: SupplierReviewPayload
  ) => Promise<Supplier | null>
  rejectSupplier: (
    id: number,
    payload?: SupplierReviewPayload
  ) => Promise<Supplier | null>
  reset: () => void
}

const initialState = {
  suppliers: [] as Supplier[],
  selectedSupplier: null as Supplier | null,
  canReviewSuppliers: false,
  isLoading: false,
  isSaving: false,
  error: null as string | null,
}

let suppliersFetchPromise: Promise<Supplier[]> | null = null

function sortSuppliers(suppliers: Supplier[]) {
  return [...suppliers].sort((left, right) => left.name.localeCompare(right.name))
}

function upsertSupplier(suppliers: Supplier[], supplier: Supplier) {
  const exists = suppliers.some((item) => item.id === supplier.id)

  if (!exists) {
    return sortSuppliers([...suppliers, supplier])
  }

  return sortSuppliers(
    suppliers.map((item) => (item.id === supplier.id ? supplier : item))
  )
}

export const useSuppliersStore = create<SuppliersState>((set, get) => ({
  ...initialState,
  fetchSuppliers: async (force = false) => {
    if (!force && get().suppliers.length > 0 && !get().isLoading) {
      return get().suppliers
    }

    if (suppliersFetchPromise) {
      return suppliersFetchPromise
    }

    const token = readStoredAccessToken()

    if (!token) {
      set({
        suppliers: [],
        canReviewSuppliers: false,
        isLoading: false,
        error: null,
      })
      return []
    }

    suppliersFetchPromise = (async () => {
      set({ isLoading: true, error: null })

      try {
        const { suppliers, meta } = await fetchSuppliers()
        set({
          suppliers,
          canReviewSuppliers: meta.can_review_suppliers,
          isLoading: false,
          error: null,
        })
        return suppliers
      } catch (error) {
        set({
          suppliers: [],
          canReviewSuppliers: false,
          isLoading: false,
          error:
            error instanceof Error
              ? error.message
              : "Failed to load suppliers.",
        })
        return []
      } finally {
        suppliersFetchPromise = null
      }
    })()

    return suppliersFetchPromise
  },
  fetchSupplierById: async (id) => {
    set({ isLoading: true, error: null })

    try {
      const supplier = await fetchSupplier(id)
      set({ selectedSupplier: supplier, isLoading: false, error: null })
      return supplier
    } catch (error) {
      set({
        selectedSupplier: null,
        isLoading: false,
        error:
          error instanceof Error ? error.message : "Failed to load supplier.",
      })
      return null
    }
  },
  createSupplierQuick: async (payload) => {
    set({ isSaving: true, error: null })

    try {
      const supplier = await createSupplierQuick(payload)
      set((state) => ({
        suppliers: upsertSupplier(state.suppliers, supplier),
        isSaving: false,
        error: null,
      }))
      return supplier
    } catch (error) {
      set({
        isSaving: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to create supplier.",
      })
      return null
    }
  },
  createSupplier: async (payload) => {
    set({ isSaving: true, error: null })

    try {
      const supplier = await createSupplier(payload)
      set((state) => ({
        suppliers: upsertSupplier(state.suppliers, supplier),
        isSaving: false,
        error: null,
      }))
      return supplier
    } catch (error) {
      set({
        isSaving: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to create supplier.",
      })
      return null
    }
  },
  updateSupplier: async (id, payload) => {
    set({ isSaving: true, error: null })

    try {
      const supplier = await updateSupplier(id, payload)
      set((state) => ({
        suppliers: upsertSupplier(state.suppliers, supplier),
        selectedSupplier: supplier,
        isSaving: false,
        error: null,
      }))
      return supplier
    } catch (error) {
      set({
        isSaving: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to update supplier.",
      })
      return null
    }
  },
  deleteSupplier: async (id) => {
    set({ isSaving: true, error: null })

    try {
      await deleteSupplier(id)
      set((state) => ({
        suppliers: state.suppliers.filter((item) => item.id !== id),
        selectedSupplier:
          state.selectedSupplier?.id === id ? null : state.selectedSupplier,
        isSaving: false,
        error: null,
      }))
      return true
    } catch (error) {
      set({
        isSaving: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to delete supplier.",
      })
      return false
    }
  },
  approveSupplier: async (id, payload) => {
    set({ isSaving: true, error: null })

    try {
      const supplier = await approveSupplier(id, payload)
      set((state) => ({
        suppliers: upsertSupplier(state.suppliers, supplier),
        isSaving: false,
        error: null,
      }))
      return supplier
    } catch (error) {
      set({
        isSaving: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to approve supplier.",
      })
      return null
    }
  },
  rejectSupplier: async (id, payload) => {
    set({ isSaving: true, error: null })

    try {
      const supplier = await rejectSupplier(id, payload)
      set((state) => ({
        suppliers: upsertSupplier(state.suppliers, supplier),
        isSaving: false,
        error: null,
      }))
      return supplier
    } catch (error) {
      set({
        isSaving: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to reject supplier.",
      })
      return null
    }
  },
  reset: () => {
    suppliersFetchPromise = null
    set(initialState)
  },
}))
