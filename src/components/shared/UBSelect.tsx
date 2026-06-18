import { Plus } from "lucide-react"
import { useState, type ReactNode } from "react"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"

export const UB_SELECT_ADD_NEW_VALUE = "__ub_select_add_new__"

export type UBSelectOption = {
  value: string
  label: string
}

export type UBSelectAddOptionContext = {
  onCreated: (option: UBSelectOption) => void
  onCancel: () => void
}

export type UBSelectAddOptionConfig = {
  label: string
  dialogTitle: string
  dialogDescription?: string
  renderDialogContent: (context: UBSelectAddOptionContext) => ReactNode
}

export type UBSelectProps = {
  label: string
  value: string
  onValueChange: (value: string) => void
  options: UBSelectOption[]
  placeholder?: string
  error?: string
  disabled?: boolean
  className?: string
  addOption?: UBSelectAddOptionConfig
}

export function UBSelect({
  label,
  value,
  onValueChange,
  options,
  placeholder = "Select an option",
  error,
  disabled = false,
  className,
  addOption,
}: UBSelectProps) {
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [selectKey, setSelectKey] = useState(0)
  const labelId = `${label.replace(/\s+/g, "-").toLowerCase()}-label`
  const errorId = `${labelId}-error`

  const handleValueChange = (nextValue: string) => {
    if (addOption && nextValue === UB_SELECT_ADD_NEW_VALUE) {
      setAddDialogOpen(true)
      setSelectKey((current) => current + 1)
      return
    }

    onValueChange(nextValue)
  }

  const handleCreated = (option: UBSelectOption) => {
    onValueChange(option.value)
    setAddDialogOpen(false)
  }

  return (
    <div className={cn("w-full", className)}>
      <label
        id={labelId}
        className="mb-2 block text-xs font-medium uppercase tracking-widest text-muted-foreground"
      >
        {label}
      </label>

      <Select
        key={selectKey}
        value={value || undefined}
        onValueChange={handleValueChange}
        disabled={disabled}
      >
        <SelectTrigger
          aria-labelledby={labelId}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : undefined}
          className={cn(error && "border-destructive focus:ring-destructive/20")}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {addOption ? (
            <>
              <SelectItem
                value={UB_SELECT_ADD_NEW_VALUE}
                className="font-medium text-primary"
              >
                <span className="inline-flex items-center gap-2">
                  <Plus className="size-4" />
                  {addOption.label}
                </span>
              </SelectItem>
              <SelectSeparator />
            </>
          ) : null}
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {error ? (
        <p id={errorId} className="mt-1 text-xs text-destructive">
          {error}
        </p>
      ) : null}

      {addOption ? (
        <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{addOption.dialogTitle}</DialogTitle>
              {addOption.dialogDescription ? (
                <DialogDescription>{addOption.dialogDescription}</DialogDescription>
              ) : null}
            </DialogHeader>
            {addOption.renderDialogContent({
              onCreated: handleCreated,
              onCancel: () => setAddDialogOpen(false),
            })}
          </DialogContent>
        </Dialog>
      ) : null}
    </div>
  )
}
