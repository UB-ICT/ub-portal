import React from "react"
import type { Meta, StoryObj } from "@storybook/react-vite"
import { CalendarDays, LayoutList } from "lucide-react"
import {
  actionArgTypes,
  componentParameters,
  expectTextVisible,
  withPanel,
} from "@/components/shared/storybook"

import { UBFullCalendarView } from "./UBFullCalendarView"
import {
  sharedCalendarCategories,
  sharedCalendarEvents,
  sharedCalendarMonth,
  sharedCalendarSelectedDate,
  sharedListEvents,
} from "./calendarStoryData"
import { UBViewSwitcher } from "./UBViewSwitcher"
import { UBListEventView, type UBListEventViewProps } from "./UBListEventView"

const defaultEvents: UBListEventViewProps["events"] = sharedListEvents

function SwitcherStory(args: UBListEventViewProps) {
  const [view, setView] = React.useState("list")

  return (
    <div className="space-y-5">
      <UBViewSwitcher
        value={view}
        onValueChange={setView}
        options={[
          { value: "list", label: "List", icon: LayoutList },
          { value: "calendar", label: "Calendar", icon: CalendarDays },
        ]}
      />

      {view === "list" ? (
        <UBListEventView {...args} />
      ) : (
        <UBFullCalendarView
          categories={sharedCalendarCategories}
          events={sharedCalendarEvents}
          defaultMonth={sharedCalendarMonth}
          defaultSelectedDate={sharedCalendarSelectedDate}
          todayLabel="Today"
          headingLabel="EVENTS ON"
          emptyStateText="No events scheduled."
        />
      )}
    </div>
  )
}

const meta = {
  title: "Components/UBListEventView",
  component: UBListEventView,
  tags: ["autodocs"],
  args: {
    events: defaultEvents,
    emptyStateText: "You have no upcoming events.",
  },
  argTypes: {
    ...actionArgTypes,
    emptyStateText: { control: "text" },
  },
  parameters: componentParameters(
    "Dynamic event list view. Use with UBViewSwitcher to show your events when List is selected."
  ),
  decorators: [withPanel("mx-auto w-full max-w-6xl bg-background p-6")],
} satisfies Meta<typeof UBListEventView>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => <SwitcherStory {...args} />,
  play: async ({ canvasElement }) => {
    await expectTextVisible(canvasElement, /List/i)
  },
}

export const SwitchToListShowsEvents: Story = {
  render: (args) => <SwitcherStory {...args} />,
}

export const Empty: Story = {
  args: {
    events: [],
    emptyStateText: "No events found for this range.",
  },
}
