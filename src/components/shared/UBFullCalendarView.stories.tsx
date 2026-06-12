import type { Meta, StoryObj } from "@storybook/react-vite"
import {
  actionArgTypes,
  componentParameters,
  expectButtonVisible,
  withPanel,
} from "@/components/shared/storybook"

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
  tags: ["autodocs"],
  args: {
    defaultMonth: sharedCalendarMonth,
    defaultSelectedDate: sharedCalendarSelectedDate,
    categories: sharedCalendarCategories,
    events: sharedCalendarEvents,
    todayLabel: "Today",
    headingLabel: "EVENTS ON",
    emptyStateText: "No events scheduled.",
  },
  argTypes: {
    ...actionArgTypes,
    todayLabel: { control: "text" },
    headingLabel: { control: "text" },
    emptyStateText: { control: "text" },
  },
  parameters: componentParameters(
    "Full calendar layout with a month grid on the left and a selected-day events panel on the right. Clicking a date updates the day panel."
  ),
  decorators: [withPanel("mx-auto w-full max-w-[112rem] bg-background p-4 sm:p-6 xl:px-8")],
} satisfies Meta<UBFullCalendarViewProps>

export default meta

type Story = StoryObj<UBFullCalendarViewProps>

export const Default: Story = {
  args: {
    // Pass it as an instantiated Date object or an ISO string format
    defaultSelectedDate: new Date(1779948000000),
  },
  play: async ({ canvasElement }) => {
    await expectButtonVisible(canvasElement, "Today")
  },
}
