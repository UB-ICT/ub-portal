import { create } from "zustand"

import { fetchCurrencies, type Currency } from "@/lib/api/currencies"
import { readStoredAccessToken } from "@/lib/auth/storage"

type CurrenciesState = {
  currencies: Currency[]
  isLoading: boolean
  error: string | null
  fetchCurrencies: (force?: boolean) => Promise<Currency[]>
  reset: () => void
}

const initialState = {
  currencies: [] as Currency[],
  isLoading: false,
  error: null as string | null,
}

let currenciesFetchPromise: Promise<Currency[]> | null = null

export const useCurrenciesStore = create<CurrenciesState>((set, get) => ({
  ...initialState,
  fetchCurrencies: async (force = false) => {
    if (!force && get().currencies.length > 0 && !get().isLoading) {
      return get().currencies
    }

    if (currenciesFetchPromise) {
      return currenciesFetchPromise
    }

    const token = readStoredAccessToken()

    if (!token) {
      set({ currencies: [], isLoading: false, error: null })
      return []
    }

    currenciesFetchPromise = (async () => {
      set({ isLoading: true, error: null })

      try {
        const currencies = await fetchCurrencies()
        set({
          currencies: [...currencies].sort((left, right) =>
            left.name.localeCompare(right.name)
          ),
          isLoading: false,
          error: null,
        })
        return currencies
      } catch (error) {
        set({
          currencies: [],
          isLoading: false,
          error:
            error instanceof Error
              ? error.message
              : "Failed to load currencies.",
        })
        return []
      } finally {
        currenciesFetchPromise = null
      }
    })()

    return currenciesFetchPromise
  },
  reset: () => {
    currenciesFetchPromise = null
    set(initialState)
  },
}))
