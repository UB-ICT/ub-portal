import { Select as SelectPrimitive } from "radix-ui"
import { Check } from "lucide-react"

import {
  Select,
  SelectContent,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"

import {
  REQUISITION_PRIORITIES,
  type RequisitionPriority,
} from "../lib/requisition-priorities"

type PrioritySelectProps = {
  label?: string
  value: string
  onValueChange: (value: string) => void
  error?: string
  disabled?: boolean
}

function PriorityOptionLabel({
  label,
  dotClassName,
}: {
  label: string
  dotClassName: string
}) {
  return (
    <span className="inline-flex items-center gap-2">
      <span
        aria-hidden
        className={cn("size-2.5 shrink-0 rounded-full", dotClassName)}
      />
      {label}
    </span>
  )
}

export function PrioritySelect({
  label = "Priority",
  value,
  onValueChange,
  error,
  disabled = false,
}: PrioritySelectProps) {
  const labelId = `${label.replace(/\s+/g, "-").toLowerCase()}-label`
  const errorId = `${labelId}-error`

  return (
    <div className="w-full">
      <label
        id={labelId}
        className="mb-2 block text-xs font-medium uppercase tracking-widest text-muted-foreground"
      >
        {label}
      </label>

      <Select
        value={value || undefined}
        onValueChange={onValueChange}
        disabled={disabled}
      >
        <SelectTrigger
          aria-labelledby={labelId}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : undefined}
          className={cn(error && "border-destructive focus:ring-destructive/20")}
        >
          <SelectValue placeholder="Select priority" />
        </SelectTrigger>
        <SelectContent>
          {REQUISITION_PRIORITIES.map((priority) => (
            <SelectPrimitive.Item
              key={priority.value}
              value={priority.value}
              className="relative flex w-full cursor-default items-start gap-2 rounded-lg py-1.5 pr-8 pl-2 text-sm outline-none select-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
            >
              <span className="absolute right-2 flex size-3.5 items-center justify-center pt-1">
                <SelectPrimitive.ItemIndicator>
                  <Check className="size-4" />
                </SelectPrimitive.ItemIndicator>
              </span>
              <div className="flex flex-col gap-0.5 py-0.5">
                <SelectPrimitive.ItemText>
                  <PriorityOptionLabel
                    label={priority.label}
                    dotClassName={priority.dotClassName}
                  />
                </SelectPrimitive.ItemText>
                <span className="pl-5 text-xs text-muted-foreground">
                  {priority.description}
                </span>
              </div>
            </SelectPrimitive.Item>
          ))}
        </SelectContent>
      </Select>

      {error ? (
        <p id={errorId} className="mt-1 text-xs text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  )
}

export type { RequisitionPriority }
