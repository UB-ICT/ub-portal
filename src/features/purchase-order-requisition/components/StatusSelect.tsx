import { useEffect } from "react"

import { UBSelect } from "@/components/shared/UBSelect"
import { useStatusesStore } from "@/store/statuses-store"

type StatusSelectProps = {
  label?: string
  value: string
  onValueChange: (value: string) => void
  error?: string
  disabled?: boolean
}

export function StatusSelect({
  label = "Status",
  value,
  onValueChange,
  error,
  disabled = false,
}: StatusSelectProps) {
  const statuses = useStatusesStore((state) => state.statuses)
  const isLoading = useStatusesStore((state) => state.isLoading)
  const fetchStatuses = useStatusesStore((state) => state.fetchStatuses)

  useEffect(() => {
    void fetchStatuses()
  }, [fetchStatuses])

  const options = statuses.map((status) => ({
    value: String(status.id),
    label: status.name,
  }))

  return (
    <UBSelect
      label={label}
      value={value}
      onValueChange={onValueChange}
      options={options}
      placeholder={isLoading ? "Loading statuses..." : "Select a status"}
      error={error}
      disabled={disabled || isLoading}
    />
  )
}
