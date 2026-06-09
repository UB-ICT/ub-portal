import { UBEventCard, type UBEventCardProps } from "./UBEventCard"

export type UBListEvent = UBEventCardProps & {
  id: string
}

export type UBListEventViewProps = {
  events: readonly UBListEvent[]
  emptyStateText?: string
  className?: string
  onAddToCalendar?: (event: UBListEvent) => void
}

export function UBListEventView({
  events,
  emptyStateText = "No events available.",
  className,
  onAddToCalendar,
}: UBListEventViewProps) {
  if (events.length === 0) {
    return (
      <section
        aria-live="polite"
        className={
          className ??
          "rounded-2xl border border-dashed border-border p-8 text-center"
        }
      >
        <p className="text-sm text-muted-foreground">{emptyStateText}</p>
      </section>
    )
  }

  return (
    <section className={className} aria-label="Events list">
      <ul className="space-y-4">
        {events.map((event) => (
          <li key={event.id}>
            <UBEventCard
              {...event}
              onAddToCalendar={() => onAddToCalendar?.(event)}
            />
          </li>
        ))}
      </ul>
    </section>
  )
}
