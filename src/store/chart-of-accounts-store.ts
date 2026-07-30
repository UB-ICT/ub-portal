import { create } from "zustand"

import {
  fetchChartOfAccounts,
  type ChartOfAccount,
} from "@/lib/api/chart-of-accounts"
import { readStoredAccessToken } from "@/lib/auth/storage"

type ChartOfAccountsState = {
  chartOfAccounts: ChartOfAccount[]
  isLoading: boolean
  error: string | null
  fetchChartOfAccounts: (force?: boolean) => Promise<ChartOfAccount[]>
  reset: () => void
}

const initialState = {
  chartOfAccounts: [] as ChartOfAccount[],
  isLoading: false,
  error: null as string | null,
}

let chartOfAccountsFetchPromise: Promise<ChartOfAccount[]> | null = null

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
            chartOfAccounts: [...chartOfAccounts].sort((left, right) =>
              left.account_no.localeCompare(right.account_no)
            ),
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
                : "Failed to load the chart of accounts.",
          })
          return []
        } finally {
          chartOfAccountsFetchPromise = null
        }
      })()

      return chartOfAccountsFetchPromise
    },
    reset: () => {
      chartOfAccountsFetchPromise = null
      set(initialState)
    },
  })
)
