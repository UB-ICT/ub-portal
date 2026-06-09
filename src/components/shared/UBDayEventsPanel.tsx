import { CalendarPlus2, Clock3, MapPin } from "lucide-react"

import { cn } from "@/lib/utils"
import { UBButton } from "./UBButton"

export type UBDayEventItem = {
  id: string
  title: string
  time?: string
  location?: string
  category?: string
  categoryColor?: string
  primaryActionLabel?: string
  secondaryActionLabel?: string
}

export type UBDayEventsPanelProps = {
  date: Date | string
  events?: readonly UBDayEventItem[]
  headingLabel?: string
  emptyStateText?: string
  className?: string
  onEventClick?: (event: UBDayEventItem) => void
  onPrimaryAction?: (event: UBDayEventItem) => void
  onSecondaryAction?: (event: UBDayEventItem) => void
}

function parseDate(value: Date | string) {
  if (value instanceof Date) {
    return value
  }

  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
  const parsed = match
    ? new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]))
    : new Date(value)

  if (Number.isNaN(parsed.getTime())) {
    return new Date(NaN)
  }

  return parsed
}

function formatDateLabel(value: Date | string) {
  return parseDate(value).toLocaleDateString("en-US", {
    weekday: "long",
    day: "2-digit",
    month: "short",
  })
}

export function UBDayEventsPanel({
  date,
  events = [],
  headingLabel = "EVENTS ON",
  emptyStateText = "No events scheduled.",
  className,
  onEventClick,
  onPrimaryAction,
  onSecondaryAction,
}: UBDayEventsPanelProps) {
  return (
    <aside className={cn("w-full rounded-4xl border border-border bg-muted/20 p-5", className)}>
      <p className="text-xs font-semibold tracking-[0.12em] text-muted-foreground uppercase">
        {headingLabel}
      </p>
      <h3 className="mt-1 text-3xl font-semibold tracking-tight text-foreground">
        {formatDateLabel(date)}
      </h3>

      {events.length === 0 ? (
        <div className="mt-4 rounded-2xl border border-dashed border-border px-4 py-6 text-center">
          <p className="text-sm text-muted-foreground">{emptyStateText}</p>
        </div>
      ) : (
        <ul className="mt-4 space-y-3">
          {events.map((event) => (
            <li key={event.id}>
              <button
                type="button"
                className="w-full rounded-2xl border border-border bg-background/95 px-3 py-3 text-left hover:bg-background"
                onClick={() => onEventClick?.(event)}
              >
                <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase">
                  {event.category ? (
                    <span className="inline-flex items-center gap-1" style={{ color: event.categoryColor ?? "#7d2d90" }}>
                      <span
                        className="inline-block size-1.5 rounded-full"
                        style={{ backgroundColor: event.categoryColor ?? "#7d2d90" }}
                      />
                      {event.category}
                    </span>
                  ) : null}
                  {event.time ? <span className="text-muted-foreground">{event.time}</span> : null}
                </div>

                <p className="mt-2 text-sm font-semibold text-foreground">{event.title}</p>

                <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                  {event.location ? (
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="size-3.5" />
                      {event.location}
                    </span>
                  ) : null}
                </div>

                {event.primaryActionLabel || event.secondaryActionLabel ? (
                  <div className="mt-3 flex items-center gap-2">
                    {event.primaryActionLabel ? (
                      <UBButton
                        type="button"
                        size="sm"
                        onClick={(buttonEvent) => {
                          buttonEvent.stopPropagation()
                          onPrimaryAction?.(event)
                        }}
                      >
                        {event.primaryActionLabel}
                      </UBButton>
                    ) : null}
                    {event.secondaryActionLabel ? (
                      <UBButton
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={(buttonEvent) => {
                          buttonEvent.stopPropagation()
                          onSecondaryAction?.(event)
                        }}
                      >
                        <CalendarPlus2 className="size-3.5" />
                        {event.secondaryActionLabel}
                      </UBButton>
                    ) : null}
                  </div>
                ) : null}
              </button>
            </li>
          ))}
        </ul>
      )}
    </aside>
  )
}