import * as React from "react"

import { cn } from "@/lib/utils"

export type UBInputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label: string
  error?: string
}

export const UBInput = React.forwardRef<HTMLInputElement, UBInputProps>(
  ({ label, error, className, ...props }, ref) => {
    return (
      <div className="w-full">
        <label className="mb-2 block text-xs font-medium uppercase tracking-widest text-muted-foreground">
          {label}
        </label>
        <input
          ref={ref}
          className={cn(
            "w-full rounded-lg border border-input bg-background px-3 py-2 text-sm transition-colors placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-50",
            error && "border-destructive focus:border-destructive focus:ring-destructive/20",
            className
          )}
          {...props}
        />
        {error && (
          <p className="mt-1 text-xs text-destructive">{error}</p>
        )}
      </div>
    )
  }
)

UBInput.displayName = "UBInput"

export type UBSelectProps = React.SelectHTMLAttributes<HTMLSelectElement> & {
  label: string
  options: { value: string; label: string }[]
  error?: string
}

export const UBSelect = React.forwardRef<HTMLSelectElement, UBSelectProps>(
  ({ label, options, error, className, id, ...props }, ref) => {
    const generatedId = React.useId()
    const selectId = id ?? generatedId
    const errorId = `${selectId}-error`

    return (
      <div className="w-full">
        <label
          htmlFor={selectId}
          className="mb-2 block text-xs font-medium uppercase tracking-widest text-muted-foreground"
        >
          {label}
        </label>
        <select
          ref={ref}
          id={selectId}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : undefined}
          className={cn(
            "w-full rounded-lg border border-input bg-background px-3 py-2 pr-10 text-sm transition-colors placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-50",
            error && "border-destructive focus:border-destructive focus:ring-destructive/20",
            className
          )}
          {...props}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {error && <p id={errorId} className="mt-1 text-xs text-destructive">{error}</p>}
      </div>
    )
  }
)

UBSelect.displayName = "UBSelect"

export type UBTextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label: string
  error?: string
}

export const UBTextarea = React.forwardRef<HTMLTextAreaElement, UBTextareaProps>(
  ({ label, error, className, id, ...props }, ref) => {
    const generatedId = React.useId()
    const textareaId = id ?? generatedId
    const errorId = `${textareaId}-error`

    return (
      <div className="w-full">
        <label
          htmlFor={textareaId}
          className="mb-2 block text-xs font-medium uppercase tracking-widest text-muted-foreground"
        >
          {label}
        </label>
        <textarea
          ref={ref}
          id={textareaId}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : undefined}
          className={cn(
            "w-full rounded-lg border border-input bg-background px-3 py-2 text-sm transition-colors placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-50",
            error && "border-destructive focus:border-destructive focus:ring-destructive/20",
            className
          )}
          {...props}
        />
        {error && (
          <p id={errorId} className="mt-1 text-xs text-destructive">
            {error}
          </p>
        )}
      </div>
    )
  }
)

UBTextarea.displayName = "UBTextarea"
