import { create } from "zustand"

import {
  createChartOfAccount,
  deleteChartOfAccount,
  fetchChartOfAccounts,
  updateChartOfAccount,
  type ChartOfAccount,
  type CreateChartOfAccountPayload,
  type UpdateChartOfAccountPayload,
} from "@/lib/api/chart-of-accounts"
import { readStoredAccessToken } from "@/lib/auth/storage"

type ChartOfAccountsState = {
  chartOfAccounts: ChartOfAccount[]
  isLoading: boolean
  isSaving: boolean
  error: string | null
  fetchChartOfAccounts: (force?: boolean) => Promise<ChartOfAccount[]>
  createChartOfAccount: (
    payload: CreateChartOfAccountPayload
  ) => Promise<ChartOfAccount | null>
  updateChartOfAccount: (
    id: number,
    payload: UpdateChartOfAccountPayload
  ) => Promise<ChartOfAccount | null>
  deleteChartOfAccount: (id: number) => Promise<boolean>
  reset: () => void
}

const initialState = {
  chartOfAccounts: [] as ChartOfAccount[],
  isLoading: false,
  isSaving: false,
  error: null as string | null,
}

let chartOfAccountsFetchPromise: Promise<ChartOfAccount[]> | null = null

function sortAccounts(accounts: ChartOfAccount[]) {
  return [...accounts].sort((left, right) =>
    left.account_no.localeCompare(right.account_no)
  )
}

function upsertAccount(accounts: ChartOfAccount[], account: ChartOfAccount) {
  const exists = accounts.some((item) => item.id === account.id)

  if (!exists) {
    return sortAccounts([...accounts, account])
  }

  return sortAccounts(
    accounts.map((item) => (item.id === account.id ? account : item))
  )
}

export const useChartOfAccountsStore = create<ChartOfAccountsState>(
  (set, get) => ({
    ...initialState,
    fetchChartOfAccounts: async (force = false) => {
      if (!force && get().chartOfAccounts.length > 0 && !get().isLoading) {
        return get().chartOfAccounts
      }

      if (chartOfAccountsFetchPromise) {
        return chartOfAccountsFetchPromise
      }

      const token = readStoredAccessToken()

      if (!token) {
        set({ chartOfAccounts: [], isLoading: false, error: null })
        return []
      }

      chartOfAccountsFetchPromise = (async () => {
        set({ isLoading: true, error: null })

        try {
          const chartOfAccounts = await fetchChartOfAccounts()
          set({
            chartOfAccounts: sortAccounts(chartOfAccounts),
            isLoading: false,
            error: null,
          })
          return chartOfAccounts
        } catch (error) {
          set({
            chartOfAccounts: [],
            isLoading: false,
            error:
              error instanceof Error
                ? error.message
                : "Failed to load accounts.",
          })
          return []
        } finally {
          chartOfAccountsFetchPromise = null
        }
      })()

      return chartOfAccountsFetchPromise
    },
    createChartOfAccount: async (payload) => {
      set({ isSaving: true, error: null })

      try {
        const account = await createChartOfAccount(payload)
        set((state) => ({
          chartOfAccounts: upsertAccount(state.chartOfAccounts, account),
          isSaving: false,
          error: null,
        }))
        return account
      } catch (error) {
        set({
          isSaving: false,
          error:
            error instanceof Error
              ? error.message
              : "Failed to create account.",
        })
        return null
      }
    },
    updateChartOfAccount: async (id, payload) => {
      set({ isSaving: true, error: null })

      try {
        const account = await updateChartOfAccount(id, payload)
        set((state) => ({
          chartOfAccounts: upsertAccount(state.chartOfAccounts, account),
          isSaving: false,
          error: null,
        }))
        return account
      } catch (error) {
        set({
          isSaving: false,
          error:
            error instanceof Error
              ? error.message
              : "Failed to update account.",
        })
        return null
      }
    },
    deleteChartOfAccount: async (id) => {
      set({ isSaving: true, error: null })

      try {
        await deleteChartOfAccount(id)
        set((state) => ({
          chartOfAccounts: state.chartOfAccounts.filter(
            (item) => item.id !== id
          ),
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
              : "Failed to delete account.",
        })
        return false
      }
    },
    reset: () => {
      chartOfAccountsFetchPromise = null
      set(initialState)
    },
  })
)
