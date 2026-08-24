import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { cn } from "@/lib/utils"

export type UBRadioOption = {
  value: string
  label: string
  description?: string
  disabled?: boolean
}

export type UBRadioButtonProps = {
  label: string
  value: string
  onValueChange: (value: string) => void
  options: UBRadioOption[]
  error?: string
  disabled?: boolean
  orientation?: "vertical" | "horizontal"
  className?: string
}

export function UBRadioButton({
  label,
  value,
  onValueChange,
  options,
  error,
  disabled = false,
  orientation = "vertical",
  className,
}: UBRadioButtonProps) {
  const groupId = `${label.replace(/\s+/g, "-").toLowerCase()}-radio-group`
  const errorId = `${groupId}-error`

  return (
    <div className={cn("w-full", className)}>
      <span
        id={groupId}
        className="mb-2 block text-xs font-medium uppercase tracking-widest text-muted-foreground"
      >
        {label}
      </span>

      <RadioGroup
        value={value}
        onValueChange={onValueChange}
        disabled={disabled}
        aria-labelledby={groupId}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
        className={cn(
          orientation === "horizontal" && "grid-flow-col auto-cols-max gap-6"
        )}
      >
        {options.map((option) => {
          const optionId = `${groupId}-${option.value}`

          return (
            <div key={option.value} className="flex items-start gap-2">
              <RadioGroupItem
                id={optionId}
                value={option.value}
                disabled={option.disabled}
                className="mt-0.5"
              />
              <label htmlFor={optionId} className="text-sm leading-none">
                <span
                  className={cn(
                    "font-medium text-foreground",
                    (disabled || option.disabled) && "opacity-50"
                  )}
                >
                  {option.label}
                </span>
                {option.description ? (
                  <p className="mt-1 text-xs font-normal leading-snug text-muted-foreground">
                    {option.description}
                  </p>
                ) : null}
              </label>
            </div>
          )
        })}
      </RadioGroup>

      {error ? (
        <p id={errorId} className="mt-1 text-xs text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  )
}
