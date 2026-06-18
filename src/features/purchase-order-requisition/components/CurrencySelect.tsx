import { useEffect } from "react"

import { UBSelect } from "@/components/shared/UBSelect"
import { useCurrenciesStore } from "@/store/currencies-store"

type CurrencySelectProps = {
  label?: string
  value: string
  onValueChange: (value: string) => void
  error?: string
  disabled?: boolean
}

export function CurrencySelect({
  label = "Currency",
  value,
  onValueChange,
  error,
  disabled = false,
}: CurrencySelectProps) {
  const currencies = useCurrenciesStore((state) => state.currencies)
  const isLoading = useCurrenciesStore((state) => state.isLoading)
  const fetchCurrencies = useCurrenciesStore((state) => state.fetchCurrencies)

  useEffect(() => {
    void fetchCurrencies()
  }, [fetchCurrencies])

  const options = currencies.map((currency) => ({
    value: String(currency.id),
    label: `${currency.name} (${currency.symbol})`,
  }))

  return (
    <UBSelect
      label={label}
      value={value}
      onValueChange={onValueChange}
      options={options}
      placeholder={isLoading ? "Loading currencies..." : "Select a currency"}
      error={error}
      disabled={disabled || isLoading}
    />
  )
}
