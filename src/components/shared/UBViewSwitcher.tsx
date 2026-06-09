import React from "react"

import { cn } from "@/lib/utils"

export type UBViewSwitcherOption = {
  value: string
  label: string
  icon?: React.ComponentType<{ className?: string }>
}

export type UBViewSwitcherProps = {
  options: readonly UBViewSwitcherOption[]
  value?: string
  defaultValue?: string
  className?: string
  onValueChange?: (value: string) => void
}

export function UBViewSwitcher({
  options,
  value,
  defaultValue,
  className,
  onValueChange,
}: UBViewSwitcherProps) {
  const [internalValue, setInternalValue] = React.useState(
    defaultValue ?? options[0]?.value ?? ""
  )

  const selectedValue = value ?? internalValue

  React.useEffect(() => {
    if (!options.some((option) => option.value === selectedValue)) {
      const fallback = options[0]?.value ?? ""
      setInternalValue(fallback)
      onValueChange?.(fallback)
    }
  }, [onValueChange, options, selectedValue])

  const handleValueChange = (nextValue: string) => {
    if (value === undefined) {
      setInternalValue(nextValue)
    }

    onValueChange?.(nextValue)
  }

  return (
    <div
      className={cn(
        "inline-flex rounded-xl border border-border bg-muted/40 p-1",
        className
      )}
    >
      <div
        role="radiogroup" // Changed from tablist
        aria-label="View switcher"
        className="flex items-center gap-1"
      >
        {options.map((option) => {
          const isActive = option.value === selectedValue
          const Icon = option.icon

          return (
            <button
              key={option.value}
              type="button"
              role="radio" // Changed from tab
              aria-checked={isActive} // Changed from aria-selected
              className={cn(
                "inline-flex h-8 items-center gap-1.5 rounded-lg px-3 text-sm leading-none font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-background hover:text-foreground"
              )}
              onClick={() => handleValueChange(option.value)}
            >
              {Icon ? <Icon className="size-3.5" /> : null}
              {option.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
