import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"

import { cn } from "@/lib/utils"
import { UBButton } from "./UBButton"

export type UBCalendarCategory = {
  id: string
  label: string
  color: string
}

export type UBCalendarEvent = {
  id: string
  date: Date | string
  categoryId: string
  title?: string
  time?: string
  location?: string
}

export type UBCalendarViewProps = {
  events?: readonly UBCalendarEvent[]
  categories?: readonly UBCalendarCategory[]
  month?: Date
  defaultMonth?: Date
  selectedDate?: Date
  defaultSelectedDate?: Date
  todayLabel?: string
  showEventPreviewInCells?: boolean
  className?: string
  onMonthChange?: (month: Date) => void
  onDateSelect?: (date: Date) => void
}

const DEFAULT_WEEKDAY_LABELS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"]

function toDateKey(value: Date) {
  return `${value.getFullYear()}-${value.getMonth()}-${value.getDate()}`
}

function startOfDay(value: Date) {
  return new Date(value.getFullYear(), value.getMonth(), value.getDate())
}

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

function getMonthLabel(value: Date) {
  return value.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  })
}

function parseEventDate(value: Date | string) {
  if (value instanceof Date) {
    return startOfDay(value)
  }

  const parsed = new Date(value)

  if (Number.isNaN(parsed.getTime())) {
    return null
  }

  return startOfDay(parsed)
}

function buildMonthDays(viewMonth: Date) {
  const year = viewMonth.getFullYear()
  const monthIndex = viewMonth.getMonth()
  const firstDay = new Date(year, monthIndex, 1)
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate()
  const items: Array<Date | null> = []

  for (let index = 0; index < firstDay.getDay(); index += 1) {
    items.push(null)
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    items.push(new Date(year, monthIndex, day))
  }

  while (items.length % 7 !== 0) {
    items.push(null)
  }

  return items
}

export function UBCalendarView({
  events = [],
  categories = [],
  month,
  defaultMonth,
  selectedDate,
  defaultSelectedDate,
  todayLabel = "Today",
  showEventPreviewInCells = true,
  className,
  onMonthChange,
  onDateSelect,
}: UBCalendarViewProps) {
  const [internalMonth, setInternalMonth] = React.useState(
    startOfDay(defaultMonth ?? new Date())
  )
  const [internalSelectedDate, setInternalSelectedDate] = React.useState<Date | undefined>(
    defaultSelectedDate ? startOfDay(defaultSelectedDate) : undefined
  )

  const viewMonth = startOfDay(month ?? internalMonth)
  const activeDate = selectedDate ? startOfDay(selectedDate) : internalSelectedDate
  const today = startOfDay(new Date())

  const categoryById = React.useMemo(
    () => new Map(categories.map((category) => [category.id, category])),
    [categories]
  )

  const eventsByDate = React.useMemo(() => {
    const map = new Map<string, UBCalendarEvent[]>()

    for (const event of events) {
      const parsed = parseEventDate(event.date)

      if (!parsed) {
        continue
      }

      const key = toDateKey(parsed)
      const existing = map.get(key)

      if (existing) {
        existing.push(event)
      } else {
        map.set(key, [event])
      }
    }

    return map
  }, [events])

  const monthDays = React.useMemo(() => buildMonthDays(viewMonth), [viewMonth])

  const updateMonth = (nextMonth: Date) => {
    const normalized = startOfDay(nextMonth)

    if (!month) {
      setInternalMonth(normalized)
    }

    onMonthChange?.(normalized)
  }

  const selectDate = (date: Date) => {
    if (!selectedDate) {
      setInternalSelectedDate(date)
    }

    onDateSelect?.(date)
  }

  return (
    <section className={cn("w-full rounded-4xl border border-border bg-muted/20 p-6", className)}>
      <header className="mb-5 flex items-center justify-between gap-3">
        <h2 className="text-4xl leading-none font-semibold tracking-tight text-foreground">
          {getMonthLabel(viewMonth)}
        </h2>

        <div className="flex items-center gap-2">
          <UBButton
            type="button"
            aria-label="Previous month"
            variant="outline"
            size="icon-sm"
            className="rounded-xl"
            onClick={() => updateMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() - 1, 1))}
          >
            <ChevronLeft className="size-4" />
          </UBButton>

          <UBButton
            type="button"
            variant="outline"
            size="sm"
            className="h-9 rounded-xl px-4"
            onClick={() => updateMonth(today)}
          >
            {todayLabel}
          </UBButton>

          <UBButton
            type="button"
            aria-label="Next month"
            variant="outline"
            size="icon-sm"
            className="rounded-xl"
            onClick={() => updateMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 1))}
          >
            <ChevronRight className="size-4" />
          </UBButton>
        </div>
      </header>

      <div className="grid grid-cols-7 gap-2">
        {DEFAULT_WEEKDAY_LABELS.map((label) => (
          <p
            key={label}
            className="pb-1 text-center text-xs font-medium tracking-[0.08em] text-muted-foreground"
          >
            {label}
          </p>
        ))}

        {monthDays.map((dateValue, index) => {
          if (!dateValue) {
            return <div key={`empty-${index}`} className="min-h-[7rem] sm:min-h-[8.5rem]" />
          }

          const dateEvents = eventsByDate.get(toDateKey(dateValue)) ?? []
          const uniqueCategoryIds = [...new Set(dateEvents.map((event) => event.categoryId))]
          const isSelected = activeDate ? isSameDay(activeDate, dateValue) : false
          const isToday = isSameDay(today, dateValue)

          return (
            <button
              key={toDateKey(dateValue)}
              type="button"
              className={cn(
                "flex min-h-[7rem] flex-col rounded-2xl border border-border/90 p-2 text-left transition-colors sm:min-h-[8.5rem]",
                isSelected
                  ? "border-primary bg-primary/10 shadow-[inset_0_0_0_1px_var(--primary)]"
                  : "bg-background hover:bg-muted/40"
              )}
              onClick={() => selectDate(dateValue)}
            >
              <span
                className={cn(
                  "text-sm font-medium",
                  isToday ? "text-primary" : "text-foreground"
                )}
              >
                {dateValue.getDate()}
              </span>

              {showEventPreviewInCells ? (
                <div className="mt-1 space-y-1">
                  {dateEvents.slice(0, 2).map((event) => {
                    const category = categoryById.get(event.categoryId)

                    return (
                      <div
                        key={event.id}
                        className="rounded-md border border-border/70 bg-muted/35 px-1.5 py-1"
                        style={category ? { borderLeftColor: category.color, borderLeftWidth: 3 } : undefined}
                      >
                        {event.time ? (
                          <p className="truncate text-[10px] leading-none font-medium text-muted-foreground">
                            {event.time}
                          </p>
                        ) : null}
                        <p className="truncate text-[10px] leading-tight font-medium text-foreground">
                          {event.title ?? "Event"}
                        </p>
                      </div>
                    )
                  })}
                  {dateEvents.length > 2 ? (
                    <p className="text-[10px] text-muted-foreground">+{dateEvents.length - 2} more</p>
                  ) : null}
                </div>
              ) : null}

              <span className="mt-auto flex items-center gap-1">
                {uniqueCategoryIds.slice(0, 4).map((categoryId) => {
                  const category = categoryById.get(categoryId)

                  if (!category) {
                    return null
                  }

                  return (
                    <span
                      key={`${toDateKey(dateValue)}-${categoryId}`}
                      className="inline-block size-2 rounded-full"
                      style={{ backgroundColor: category.color }}
                    />
                  )
                })}
              </span>
            </button>
          )
        })}
      </div>

      {categories.length ? (
        <footer className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2">
          {categories.map((category) => (
            <p key={category.id} className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
              <span
                className="inline-block size-2 rounded-full"
                style={{ backgroundColor: category.color }}
              />
              <span>{category.label}</span>
            </p>
          ))}
        </footer>
      ) : null}

    </section>
  )
}