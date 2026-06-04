import { CalendarPlus2, Clock3, MapPin } from "lucide-react"

import { cn } from "@/lib/utils"
import { UBButton } from "./UBButton"

export type UBEventCardProps = {
  month: string
  day: number | string
  category: string
  secondaryCategory?: string
  title: string
  time: string
  location: string
  addToCalendarLabel?: string
  className?: string
  onAddToCalendar?: () => void
}

export function UBEventCard({
  month,
  day,
  category,
  secondaryCategory,
  title,
  time,
  location,
  addToCalendarLabel = "Add to Google Calendar",
  className,
  onAddToCalendar,
}: UBEventCardProps) {
  return (
    <article
      className={cn(
        "flex w-full items-stretch gap-4 rounded-3xl border border-border bg-muted/35 p-4",
        className
      )}
    >
      <div className="flex min-h-[9.25rem] w-[4.1rem] shrink-0 flex-col items-center justify-center rounded-2xl border border-border bg-muted/50 px-2 text-center">
        <span className="text-xs font-semibold tracking-[0.14em] text-primary uppercase">
          {month}
        </span>
        <span className="mt-1 text-4xl leading-none font-semibold tracking-tight text-foreground">
          {day}
        </span>
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
            {category}
          </span>
          {secondaryCategory ? (
            <span className="text-sm text-muted-foreground">{secondaryCategory}</span>
          ) : null}
        </div>

        <h3 className="mt-2 text-2xl leading-tight font-semibold tracking-tight text-foreground">
          {title}
        </h3>

        <div className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
          <p className="inline-flex items-center gap-1.5">
            <Clock3 className="size-4" />
            <span>{time}</span>
          </p>
          <p className="inline-flex items-center gap-1.5">
            <MapPin className="size-4" />
            <span>{location}</span>
          </p>
        </div>

        <div className="mt-4">
          <UBButton
            type="button"
            variant="outline"
            size="default"
            className="h-10 rounded-xl px-4"
            onClick={onAddToCalendar}
          >
            <CalendarPlus2 className="size-4" />
            {addToCalendarLabel}
          </UBButton>
        </div>
      </div>
    </article>
  )
}