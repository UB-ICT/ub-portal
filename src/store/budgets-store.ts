import { create } from "zustand"

import {
  approveBudget,
  activateBudget,
  closeBudgetYearSubmissions,
  createBudget,
  createBudgetYear,
  deactivateBudget,
  deleteBudget,
  fetchBudget,
  fetchBudgetComparison,
  fetchBudgetLogs,
  fetchBudgetYears,
  fetchBudgets,
  importBudgetFromSpreadsheet,
  openBudgetYearSubmissions,
  rejectBudget,
  requestBudgetReview,
  submitBudget,
  updateBudget,
  type BudgetApprovalPayload,
  type BudgetAccessMeta,
  type BudgetComparison,
  type BudgetImportPayload,
  type BudgetLogEntry,
  type BudgetRecord,
  type BudgetYear,
  type CreateBudgetPayload,
  type UpdateBudgetPayload,
} from "@/lib/api/budgets"
import { readStoredAccessToken } from "@/lib/auth/storage"

type BudgetsState = {
  budgets: BudgetRecord[]
  budgetYears: BudgetYear[]
  accessMeta: BudgetAccessMeta | null
  selectedBudget: BudgetRecord | null
  comparison: BudgetComparison | null
  logs: BudgetLogEntry[]
  isLoading: boolean
  isLoadingYears: boolean
  isLoadingSelected: boolean
  isSaving: boolean
  isReviewing: boolean
  error: string | null
  fetchBudgets: (force?: boolean) => Promise<BudgetRecord[]>
  fetchBudgetYears: (force?: boolean) => Promise<BudgetYear[]>
  fetchBudgetById: (id: number) => Promise<BudgetRecord | null>
  fetchComparison: (id: number) => Promise<BudgetComparison | null>
  fetchLogs: (id: number, force?: boolean) => Promise<BudgetLogEntry[]>
  createBudget: (payload: CreateBudgetPayload) => Promise<BudgetRecord | null>
  importBudget: (payload: BudgetImportPayload) => Promise<BudgetRecord | null>
  updateBudget: (
    id: number,
    payload: UpdateBudgetPayload
  ) => Promise<BudgetRecord | null>
  deleteBudget: (id: number) => Promise<boolean>
  submitBudget: (
    id: number,
    payload?: BudgetApprovalPayload
  ) => Promise<BudgetRecord | null>
  approveBudget: (
    id: number,
    payload?: BudgetApprovalPayload
  ) => Promise<BudgetRecord | null>
  rejectBudget: (
    id: number,
    payload?: BudgetApprovalPayload
  ) => Promise<BudgetRecord | null>
  requestBudgetReview: (
    id: number,
    payload?: BudgetApprovalPayload
  ) => Promise<BudgetRecord | null>
  activateBudget: (
    id: number,
    payload?: BudgetApprovalPayload
  ) => Promise<BudgetRecord | null>
  deactivateBudget: (
    id: number,
    payload?: BudgetApprovalPayload
  ) => Promise<BudgetRecord | null>
  createBudgetYear: (label: string) => Promise<BudgetYear | null>
  openSubmissions: (id: number) => Promise<BudgetYear | null>
  closeSubmissions: (id: number) => Promise<BudgetYear | null>
  reset: () => void
}

const initialState = {
  budgets: [] as BudgetRecord[],
  budgetYears: [] as BudgetYear[],
  accessMeta: null as BudgetAccessMeta | null,
  selectedBudget: null as BudgetRecord | null,
  comparison: null as BudgetComparison | null,
  logs: [] as BudgetLogEntry[],
  isLoading: false,
  isLoadingYears: false,
  isLoadingSelected: false,
  isSaving: false,
  isReviewing: false,
  error: null as string | null,
}

let budgetsFetchPromise: Promise<BudgetRecord[]> | null = null
let yearsFetchPromise: Promise<BudgetYear[]> | null = null

function upsertBudget(budgets: BudgetRecord[], budget: BudgetRecord) {
  const exists = budgets.some((item) => item.id === budget.id)

  if (!exists) {
    return [budget, ...budgets]
  }

  return budgets.map((item) => (item.id === budget.id ? budget : item))
}

function withRefreshedCreateAccess(
  meta: BudgetAccessMeta | null,
  years: BudgetYear[]
): BudgetAccessMeta | null {
  if (!meta) {
    return null
  }

  if (meta.is_finance_editor) {
    return { ...meta, can_create_budget: true }
  }

  if (meta.is_cost_center_user) {
    return {
      ...meta,
      can_create_budget:
        years.some((year) => year.submissions_open) &&
        meta.assigned_cost_centers.length > 0,
    }
  }

  return { ...meta, can_create_budget: false }
}

export const useBudgetsStore = create<BudgetsState>((set, get) => ({
  ...initialState,
  fetchBudgets: async (force = false) => {
    if (!force && get().budgets.length > 0 && !get().isLoading) {
      return get().budgets
    }

    if (budgetsFetchPromise) {
      return budgetsFetchPromise
    }

    if (!readStoredAccessToken()) {
      set({ budgets: [], isLoading: false, error: null })
      return []
    }

    budgetsFetchPromise = (async () => {
      set({ isLoading: true, error: null })

      try {
        const budgets = await fetchBudgets()
        set({ budgets, isLoading: false, error: null })
        return budgets
      } catch (error) {
        set({
          budgets: [],
          isLoading: false,
          error:
            error instanceof Error ? error.message : "Failed to load budgets.",
        })
        return []
      } finally {
        budgetsFetchPromise = null
      }
    })()

    return budgetsFetchPromise
  },
  fetchBudgetYears: async (force = false) => {
    if (!force && get().budgetYears.length > 0 && !get().isLoadingYears) {
      return get().budgetYears
    }

    if (yearsFetchPromise) {
      return yearsFetchPromise
    }

    if (!readStoredAccessToken()) {
      set({ budgetYears: [], accessMeta: null, isLoadingYears: false, error: null })
      return []
    }

    yearsFetchPromise = (async () => {
      set({ isLoadingYears: true, error: null })

      try {
        const { years, meta } = await fetchBudgetYears()
        set({
          budgetYears: years,
          accessMeta: meta,
          isLoadingYears: false,
          error: null,
        })
        return years
      } catch (error) {
        set({
          budgetYears: [],
          accessMeta: null,
          isLoadingYears: false,
          error:
            error instanceof Error
              ? error.message
              : "Failed to load budget years.",
        })
        return []
      } finally {
        yearsFetchPromise = null
      }
    })()

    return yearsFetchPromise
  },
  fetchBudgetById: async (id) => {
    set({ isLoadingSelected: true, error: null })

    try {
      const budget = await fetchBudget(id)
      set({
        selectedBudget: budget,
        budgets: upsertBudget(get().budgets, budget),
        isLoadingSelected: false,
        error: null,
      })
      return budget
    } catch (error) {
      set({
        selectedBudget: null,
        isLoadingSelected: false,
        error:
          error instanceof Error ? error.message : "Failed to load budget.",
      })
      return null
    }
  },
  fetchComparison: async (id) => {
    try {
      const comparison = await fetchBudgetComparison(id)
      set({ comparison, error: null })
      return comparison
    } catch (error) {
      set({
        comparison: null,
        error:
          error instanceof Error
            ? error.message
            : "Failed to load budget comparison.",
      })
      return null
    }
  },
  fetchLogs: async (id) => {
    try {
      const logs = await fetchBudgetLogs(id)
      set({ logs, error: null })
      return logs
    } catch (error) {
      set({
        logs: [],
        error:
          error instanceof Error
            ? error.message
            : "Failed to load budget activity.",
      })
      return []
    }
  },
  createBudget: async (payload) => {
    set({ isSaving: true, error: null })

    try {
      const budget = await createBudget(payload)
      set((state) => ({
        budgets: upsertBudget(state.budgets, budget),
        selectedBudget: budget,
        isSaving: false,
        error: null,
      }))
      return budget
    } catch (error) {
      set({
        isSaving: false,
        error:
          error instanceof Error ? error.message : "Failed to create budget.",
      })
      return null
    }
  },
  importBudget: async (payload) => {
    set({ isSaving: true, error: null })

    try {
      const result = await importBudgetFromSpreadsheet(payload)
      set((state) => ({
        budgets: upsertBudget(state.budgets, result.budget),
        selectedBudget: result.budget,
        isSaving: false,
        error: null,
      }))
      return result.budget
    } catch (error) {
      set({
        isSaving: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to import budget spreadsheet.",
      })
      return null
    }
  },
  updateBudget: async (id, payload) => {
    set({ isSaving: true, error: null })

    try {
      const budget = await updateBudget(id, payload)
      set((state) => ({
        budgets: upsertBudget(state.budgets, budget),
        selectedBudget: budget,
        isSaving: false,
        error: null,
      }))
      return budget
    } catch (error) {
      set({
        isSaving: false,
        error:
          error instanceof Error ? error.message : "Failed to update budget.",
      })
      return null
    }
  },
  deleteBudget: async (id) => {
    set({ isSaving: true, error: null })

    try {
      await deleteBudget(id)
      set((state) => ({
        budgets: state.budgets.filter((item) => item.id !== id),
        selectedBudget:
          state.selectedBudget?.id === id ? null : state.selectedBudget,
        isSaving: false,
        error: null,
      }))
      return true
    } catch (error) {
      set({
        isSaving: false,
        error:
          error instanceof Error ? error.message : "Failed to delete budget.",
      })
      return false
    }
  },
  submitBudget: async (id, payload) => {
    set({ isReviewing: true, error: null })

    try {
      const budget = await submitBudget(id, payload)
      set((state) => ({
        budgets: upsertBudget(state.budgets, budget),
        selectedBudget: budget,
        isReviewing: false,
        error: null,
      }))
      return budget
    } catch (error) {
      set({
        isReviewing: false,
        error:
          error instanceof Error ? error.message : "Failed to submit budget.",
      })
      return null
    }
  },
  approveBudget: async (id, payload) => {
    set({ isReviewing: true, error: null })

    try {
      const budget = await approveBudget(id, payload)
      set((state) => ({
        budgets: upsertBudget(state.budgets, budget),
        selectedBudget: budget,
        isReviewing: false,
        error: null,
      }))
      return budget
    } catch (error) {
      set({
        isReviewing: false,
        error:
          error instanceof Error ? error.message : "Failed to approve budget.",
      })
      return null
    }
  },
  rejectBudget: async (id, payload) => {
    set({ isReviewing: true, error: null })

    try {
      const budget = await rejectBudget(id, payload)
      set((state) => ({
        budgets: upsertBudget(state.budgets, budget),
        selectedBudget: budget,
        isReviewing: false,
        error: null,
      }))
      return budget
    } catch (error) {
      set({
        isReviewing: false,
        error:
          error instanceof Error ? error.message : "Failed to reject budget.",
      })
      return null
    }
  },
  requestBudgetReview: async (id, payload) => {
    set({ isReviewing: true, error: null })

    try {
      const budget = await requestBudgetReview(id, payload)
      set((state) => ({
        budgets: upsertBudget(state.budgets, budget),
        selectedBudget: budget,
        isReviewing: false,
        error: null,
      }))
      return budget
    } catch (error) {
      set({
        isReviewing: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to send budget back for review.",
      })
      return null
    }
  },
  activateBudget: async (id, payload) => {
    set({ isReviewing: true, error: null })

    try {
      const budget = await activateBudget(id, payload)
      set((state) => ({
        budgets: upsertBudget(state.budgets, budget),
        selectedBudget: budget,
        isReviewing: false,
        error: null,
      }))
      return budget
    } catch (error) {
      set({
        isReviewing: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to activate budget.",
      })
      return null
    }
  },
  deactivateBudget: async (id, payload) => {
    set({ isReviewing: true, error: null })

    try {
      const budget = await deactivateBudget(id, payload)
      set((state) => ({
        budgets: upsertBudget(state.budgets, budget),
        selectedBudget: budget,
        isReviewing: false,
        error: null,
      }))
      return budget
    } catch (error) {
      set({
        isReviewing: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to deactivate budget.",
      })
      return null
    }
  },
  createBudgetYear: async (label) => {
    set({ isSaving: true, error: null })

    try {
      const year = await createBudgetYear({ label })
      set((state) => ({
        budgetYears: [...state.budgetYears, year].sort((a, b) =>
          b.label.localeCompare(a.label)
        ),
        isSaving: false,
        error: null,
      }))
      return year
    } catch (error) {
      set({
        isSaving: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to create budget year.",
      })
      return null
    }
  },
  openSubmissions: async (id) => {
    set({ isSaving: true, error: null })

    try {
      const year = await openBudgetYearSubmissions(id)
      set((state) => {
        const budgetYears = state.budgetYears.map((item) =>
          item.id === id ? year : item
        )

        return {
          budgetYears,
          accessMeta: withRefreshedCreateAccess(state.accessMeta, budgetYears),
          isSaving: false,
          error: null,
        }
      })
      return year
    } catch (error) {
      set({
        isSaving: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to open budget submissions.",
      })
      return null
    }
  },
  closeSubmissions: async (id) => {
    set({ isSaving: true, error: null })

    try {
      const year = await closeBudgetYearSubmissions(id)
      set((state) => {
        const budgetYears = state.budgetYears.map((item) =>
          item.id === id ? year : item
        )

        return {
          budgetYears,
          accessMeta: withRefreshedCreateAccess(state.accessMeta, budgetYears),
          isSaving: false,
          error: null,
        }
      })
      return year
    } catch (error) {
      set({
        isSaving: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to close budget submissions.",
      })
      return null
    }
  },
  reset: () => {
    budgetsFetchPromise = null
    yearsFetchPromise = null
    set(initialState)
  },
}))
