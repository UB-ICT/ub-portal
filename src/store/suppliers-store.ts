import { create } from "zustand"

import {
  createSupplier,
  deleteSupplier,
  fetchSupplier,
  fetchSuppliers,
  updateSupplier,
  type CreateSupplierPayload,
  type Supplier,
  type UpdateSupplierPayload,
} from "@/lib/api/suppliers"
import { readStoredAccessToken } from "@/lib/auth/storage"

type SuppliersState = {
  suppliers: Supplier[]
  selectedSupplier: Supplier | null
  isLoading: boolean
  isSaving: boolean
  error: string | null
  fetchSuppliers: (force?: boolean) => Promise<Supplier[]>
  fetchSupplierById: (id: number) => Promise<Supplier | null>
  createSupplier: (payload: CreateSupplierPayload) => Promise<Supplier | null>
  updateSupplier: (
    id: number,
    payload: UpdateSupplierPayload
  ) => Promise<Supplier | null>
  deleteSupplier: (id: number) => Promise<boolean>
  reset: () => void
}

const initialState = {
  suppliers: [] as Supplier[],
  selectedSupplier: null as Supplier | null,
  isLoading: false,
  isSaving: false,
  error: null as string | null,
}

let suppliersFetchPromise: Promise<Supplier[]> | null = null

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
      set({ suppliers: [], isLoading: false, error: null })
      return []
    }

    suppliersFetchPromise = (async () => {
      set({ isLoading: true, error: null })

      try {
        const suppliers = await fetchSuppliers()
        set({ suppliers, isLoading: false, error: null })
        return suppliers
      } catch (error) {
        set({
          suppliers: [],
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
  createSupplier: async (payload) => {
    set({ isSaving: true, error: null })

    try {
      const supplier = await createSupplier(payload)
      set((state) => ({
        suppliers: [...state.suppliers, supplier].sort((left, right) =>
          left.name.localeCompare(right.name)
        ),
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
        suppliers: state.suppliers
          .map((item) => (item.id === id ? supplier : item))
          .sort((left, right) => left.name.localeCompare(right.name)),
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
  reset: () => {
    suppliersFetchPromise = null
    set(initialState)
  },
}))
