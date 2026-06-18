import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"

import {
  getRequisitionPriorityConfig,
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
  const selected = getRequisitionPriorityConfig(value)

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
            <SelectItem
              key={priority.value}
              value={priority.value}
              textValue={priority.label}
            >
              <div className="flex flex-col gap-0.5 py-0.5">
                <PriorityOptionLabel
                  label={priority.label}
                  dotClassName={priority.dotClassName}
                />
                <span className="pl-5 text-xs text-muted-foreground">
                  {priority.description}
                </span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {value ? (
        <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
          <span
            aria-hidden
            className={cn(
              "mr-1.5 inline-block size-2 rounded-full align-middle",
              selected.dotClassName
            )}
          />
          {selected.description}
        </p>
      ) : null}

      {error ? (
        <p id={errorId} className="mt-1 text-xs text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  )
}

export type { RequisitionPriority }
