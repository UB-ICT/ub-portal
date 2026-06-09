import type { Meta, StoryObj } from "@storybook/react-vite"
import React from "react"

import { UBCalendarView, type UBCalendarViewProps } from "./UBCalendarView"
import {
  sharedCalendarCategories,
  sharedCalendarEvents,
  sharedCalendarMonth,
  sharedCalendarSelectedDate,
} from "./calendarStoryData"

function InteractiveCalendar(args: UBCalendarViewProps) {
  const [month, setMonth] = React.useState(
    args.defaultMonth ?? new Date(2026, 4, 1)
  )
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(
    args.defaultSelectedDate
  )

  React.useEffect(() => {
    setMonth(args.defaultMonth ?? new Date(2026, 4, 1))
  }, [args.defaultMonth])

  React.useEffect(() => {
    setSelectedDate(args.defaultSelectedDate)
  }, [args.defaultSelectedDate])

  return (
    <UBCalendarView
      {...args}
      month={month}
      selectedDate={selectedDate}
      onMonthChange={(nextMonth) => {
        setMonth(nextMonth)
        args.onMonthChange?.(nextMonth)
      }}
      onDateSelect={(nextDate) => {
        setSelectedDate(nextDate)
        args.onDateSelect?.(nextDate)
      }}
    />
  )
}

const meta = {
  title: "Components/UBCalendarView",
  component: UBCalendarView,
  args: {
    defaultMonth: sharedCalendarMonth,
    defaultSelectedDate: sharedCalendarSelectedDate,
    categories: sharedCalendarCategories,
    events: sharedCalendarEvents,
    todayLabel: "Today",
    showEventPreviewInCells: false,
  },
  parameters: {
    docs: {
      description: {
        component:
          "Dynamic month calendar with selectable dates, event dots, and month navigation. Uses the same data and dots-only presentation as the full calendar view.",
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="mx-auto w-full max-w-[108rem] bg-background p-4 sm:p-6 xl:px-8">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<UBCalendarViewProps>

export default meta

type Story = StoryObj<UBCalendarViewProps>

export const Default: Story = {
  render: InteractiveCalendar,
}

export const EmptyMonth: Story = {
  args: {
    events: [],
  },
  render: InteractiveCalendar,
}
