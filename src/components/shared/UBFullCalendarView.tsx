import * as React from "react"

import {
  UBCalendarView,
  type UBCalendarCategory,
  type UBCalendarEvent,
} from "./UBCalendarView"
import { UBDayEventsPanel, type UBDayEventItem } from "./UBDayEventsPanel"

export type UBFullCalendarEvent = UBCalendarEvent & {
  primaryActionLabel?: string
  secondaryActionLabel?: string
}

export type UBFullCalendarViewProps = {
  events?: readonly UBFullCalendarEvent[]
  categories?: readonly UBCalendarCategory[]
  month?: Date
  defaultMonth?: Date
  selectedDate?: Date
  defaultSelectedDate?: Date
  todayLabel?: string
  headingLabel?: string
  emptyStateText?: string
  className?: string
  onMonthChange?: (month: Date) => void
  onDateSelect?: (date: Date) => void
  onEventClick?: (event: UBFullCalendarEvent) => void
  onPrimaryAction?: (event: UBFullCalendarEvent) => void
  onSecondaryAction?: (event: UBFullCalendarEvent) => void
}

function startOfDay(value: Date) {
  return new Date(value.getFullYear(), value.getMonth(), value.getDate())
}

function parseDate(value: Date | string) {
  const parsed = value instanceof Date ? value : new Date(value)

  if (Number.isNaN(parsed.getTime())) {
    return null
  }

  return startOfDay(parsed)
}

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

export function UBFullCalendarView({
  events = [],
  categories = [],
  month,
  defaultMonth,
  selectedDate,
  defaultSelectedDate,
  todayLabel = "Today",
  headingLabel = "EVENTS ON",
  emptyStateText = "No events scheduled.",
  className,
  onMonthChange,
  onDateSelect,
  onEventClick,
  onPrimaryAction,
  onSecondaryAction,
}: UBFullCalendarViewProps) {
  const [internalMonth, setInternalMonth] = React.useState(defaultMonth ?? new Date())
  const [internalSelectedDate, setInternalSelectedDate] = React.useState<Date | undefined>(
    defaultSelectedDate ?? parseDate(events[0]?.date ?? "") ?? defaultMonth
  )

  React.useEffect(() => {
    if (defaultMonth) {
      setInternalMonth(defaultMonth)
    }
  }, [defaultMonth])

  React.useEffect(() => {
    if (defaultSelectedDate) {
      setInternalSelectedDate(defaultSelectedDate)
    }
  }, [defaultSelectedDate])

  const activeMonth = month ?? internalMonth
  const activeDate = selectedDate ?? internalSelectedDate ?? activeMonth

  const categoryById = React.useMemo(
    () => new Map(categories.map((category) => [category.id, category])),
    [categories]
  )

  const selectedDayEvents = React.useMemo(() => {
    const normalizedActiveDate = startOfDay(activeDate)

    return events.filter((event) => {
      const parsed = parseDate(event.date)

      return parsed ? isSameDay(parsed, normalizedActiveDate) : false
    })
  }, [activeDate, events])

  const panelEvents = React.useMemo<UBDayEventItem[]>(() => {
    return selectedDayEvents.map((event) => {
      const category = categoryById.get(event.categoryId)

      return {
        id: event.id,
        title: event.title ?? "Event",
        time: event.time,
        location: event.location,
        category: category?.label,
        categoryColor: category?.color,
        primaryActionLabel: event.primaryActionLabel,
        secondaryActionLabel: event.secondaryActionLabel,
      }
    })
  }, [categoryById, selectedDayEvents])

  return (
    <section className={className}>
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_20rem] 2xl:grid-cols-[minmax(0,1.55fr)_21rem]">
        <UBCalendarView
          events={events}
          categories={categories}
          month={activeMonth}
          selectedDate={activeDate}
          todayLabel={todayLabel}
          showEventPreviewInCells={false}
          onMonthChange={(nextMonth) => {
            if (!month) {
              setInternalMonth(nextMonth)
            }

            onMonthChange?.(nextMonth)
          }}
          onDateSelect={(nextDate) => {
            if (!selectedDate) {
              setInternalSelectedDate(nextDate)
            }

            onDateSelect?.(nextDate)
          }}
        />

        <UBDayEventsPanel
          date={activeDate}
          events={panelEvents}
          headingLabel={headingLabel}
          emptyStateText={emptyStateText}
          className="h-full"
          onEventClick={(eventItem) => {
            const sourceEvent = selectedDayEvents.find((event) => event.id === eventItem.id)

            if (sourceEvent) {
              onEventClick?.(sourceEvent)
            }
          }}
          onPrimaryAction={(eventItem) => {
            const sourceEvent = selectedDayEvents.find((event) => event.id === eventItem.id)

            if (sourceEvent) {
              onPrimaryAction?.(sourceEvent)
            }
          }}
          onSecondaryAction={(eventItem) => {
            const sourceEvent = selectedDayEvents.find((event) => event.id === eventItem.id)

            if (sourceEvent) {
              onSecondaryAction?.(sourceEvent)
            }
          }}
        />
      </div>
    </section>
  )
}