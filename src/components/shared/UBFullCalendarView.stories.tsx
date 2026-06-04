import type { Meta, StoryObj } from "@storybook/react-vite"

import {
  UBFullCalendarView,
  type UBFullCalendarViewProps,
} from "./UBFullCalendarView"
import {
  sharedCalendarCategories,
  sharedCalendarEvents,
  sharedCalendarMonth,
  sharedCalendarSelectedDate,
} from "./calendarStoryData"

const meta = {
  title: "Components/UBFullCalendarView",
  component: UBFullCalendarView,
  args: {
    defaultMonth: sharedCalendarMonth,
    defaultSelectedDate: sharedCalendarSelectedDate,
    categories: sharedCalendarCategories,
    events: sharedCalendarEvents,
    todayLabel: "Today",
    headingLabel: "EVENTS ON",
    emptyStateText: "No events scheduled.",
  },
  parameters: {
    docs: {
      description: {
        component:
          "Full calendar layout with a month grid on the left and a selected-day events panel on the right. Clicking a date updates the day panel.",
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="mx-auto w-full max-w-[112rem] bg-background p-4 sm:p-6 xl:px-8">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<UBFullCalendarViewProps>

export default meta

type Story = StoryObj<UBFullCalendarViewProps>

export const Default: Story = {}