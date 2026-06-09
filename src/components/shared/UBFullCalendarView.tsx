import React from "react"

import {
  UBCalendarView,
  type UBCalendarCategory,
  type UBCalendarEvent,
} from "./UBCalendarView"
import { UBDayEventsPanel, type UBDayEventItem } from "./UBDayEventsPanel"

/**
 * Extended calendar event structure containing layout-specific button configuration labels.
 */
export type UBFullCalendarEvent = UBCalendarEvent & {
  primaryActionLabel?: string
  secondaryActionLabel?: string
}

export type UBFullCalendarViewProps = {
  events?: readonly UBFullCalendarEvent[]
  categories?: readonly UBCalendarCategory[]
  /* Support Date objects, ISO strings, or Epoch timestamps to bypass strict wrapper limitations */
  month?: Date | string | number
  defaultMonth?: Date | string | number
  selectedDate?: Date | string | number
  defaultSelectedDate?: Date | string | number
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

/**
 * Strips time markers, standardizing a Date instance strictly to 00:00:00 local time.
 */
function startOfDay(value: Date) {
  return new Date(value.getFullYear(), value.getMonth(), value.getDate())
}

/**
 * A destructive-safe Date parser supporting multi-type representations.
 * Prevents native `new Date("YYYY-MM-DD")` from defaulting to the UTC midnight trap,
 * which shifts dates backwards or forwards across local user timezones.
 */
function parseDate(
  value: Date | string | number | undefined | null
): Date | null {
  if (!value) return null

  // If already a Date object, strip timestamps to ensure pure date comparisons
  if (value instanceof Date) {
    return startOfDay(value)
  }

  // Convert raw Epoch millisecond timestamps into local midnight representation
  if (typeof value === "number") {
    const parsed = new Date(value)
    return Number.isNaN(parsed.getTime()) ? null : startOfDay(parsed)
  }

  // Intercept pure date strings to force rendering in local browser timezone instead of UTC
  if (typeof value === "string") {
    const match = value.match(/^(\d{4})[-/](\d{2})[-/](\d{2})/)
    if (match) {
      const year = parseInt(match[1], 10)
      const month = parseInt(match[2], 10) - 1 // JavaScript calendar month arrays are 0-indexed (Jan = 0)
      const day = parseInt(match[3], 10)

      return new Date(year, month, day)
    }
  }

  // Standard fallback for dynamic ISO strings containing timestamps (e.g., Storybook mock structures)
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) {
    return null
  }

  return startOfDay(parsed)
}

/**
 * Evaluation utility comparing localized calendar dates while ignoring standard clock values.
 */
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
  // ---------------------------------------------------------------------------
  // STATE INITIALIZATION
  // ---------------------------------------------------------------------------

  // Internal structural fallback state when acting as an uncontrolled component
  const [internalMonth, setInternalMonth] = React.useState(
    () => (defaultMonth ? parseDate(defaultMonth) : null) ?? new Date()
  )

  // Determine initial selected target date. Fallback sequence: custom default -> first available event -> fallback month
  const [internalSelectedDate, setInternalSelectedDate] = React.useState<
    Date | undefined
  >(
    () =>
      (defaultSelectedDate ? parseDate(defaultSelectedDate) : null) ??
      parseDate(events[0]?.date ?? "") ??
      internalMonth
  )

  // ---------------------------------------------------------------------------
  // LIFECYCLE SYNC (Storybook Knobs / Dynamic Defaults Support)
  // ---------------------------------------------------------------------------

  // Keep internal systems synced if external defaults change unexpectedly after initial mount
  React.useEffect(() => {
    if (defaultMonth) {
      const parsed = parseDate(defaultMonth)
      if (parsed) setInternalMonth(parsed)
    }
  }, [defaultMonth])

  React.useEffect(() => {
    if (defaultSelectedDate) {
      const parsed = parseDate(defaultSelectedDate)
      if (parsed) setInternalSelectedDate(parsed)
    }
  }, [defaultSelectedDate])

  // ---------------------------------------------------------------------------
  // DERIVED STATE EVALUATIONS (Controlled vs Uncontrolled priority)
  // ---------------------------------------------------------------------------

  // Safely parse incoming controlled properties to ensure zero raw numbers or strings cascade into UI rendering trees
  const activeMonth = (month ? parseDate(month) : null) ?? internalMonth
  const activeDate =
    (selectedDate ? parseDate(selectedDate) : null) ??
    internalSelectedDate ??
    activeMonth

  // Map representation of categories for optimized O(1) loop lookups
  const categoryById = React.useMemo(
    () => new Map(categories.map((category) => [category.id, category])),
    [categories]
  )

  // Filter events matching the currently active calendar selection
  const selectedDayEvents = React.useMemo(() => {
    const normalizedActiveDate = startOfDay(activeDate)

    return events.filter((event) => {
      const parsed = parseDate(event.date)
      return parsed ? isSameDay(parsed, normalizedActiveDate) : false
    })
  }, [activeDate, events])

  // Transform internal source events into structure required by the display presentation panel
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

  // ---------------------------------------------------------------------------
  // RENDERING LAYOUT
  // ---------------------------------------------------------------------------

  return (
    <section className={className}>
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_20rem] 2xl:grid-cols-[minmax(0,1.55fr)_21rem]">
        {/* Left Side: Interactive Month Grid View */}
        <UBCalendarView
          events={events}
          categories={categories}
          month={activeMonth}
          selectedDate={activeDate}
          todayLabel={todayLabel}
          showEventPreviewInCells={false}
          onMonthChange={(nextMonth) => {
            if (!month) {
              setInternalMonth(nextMonth) // Only modify internal tracking if acting as an uncontrolled instance
            }
            onMonthChange?.(nextMonth)
          }}
          onDateSelect={(nextDate) => {
            if (!selectedDate) {
              setInternalSelectedDate(nextDate) // Only modify internal tracking if acting as an uncontrolled instance
            }
            onDateSelect?.(nextDate)
          }}
        />

        {/* Right Side: Event Details Inspection Panel */}
        <UBDayEventsPanel
          date={activeDate}
          events={panelEvents}
          headingLabel={headingLabel}
          emptyStateText={emptyStateText}
          className="h-full"
          onEventClick={(eventItem) => {
            const sourceEvent = selectedDayEvents.find(
              (event) => event.id === eventItem.id
            )
            if (sourceEvent) onEventClick?.(sourceEvent)
          }}
          onPrimaryAction={(eventItem) => {
            const sourceEvent = selectedDayEvents.find(
              (event) => event.id === eventItem.id
            )
            if (sourceEvent) onPrimaryAction?.(sourceEvent)
          }}
          onSecondaryAction={(eventItem) => {
            const sourceEvent = selectedDayEvents.find(
              (event) => event.id === eventItem.id
            )
            if (sourceEvent) onSecondaryAction?.(sourceEvent)
          }}
        />
      </div>
    </section>
  )
}
