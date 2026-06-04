import type { Meta, StoryObj } from "@storybook/react-vite"

import { UBDayEventsPanel } from "./UBDayEventsPanel"

const meta = {
  title: "Components/UBDayEventsPanel",
  component: UBDayEventsPanel,
  args: {
    date: "2026-05-01",
    events: [],
    headingLabel: "EVENTS ON",
    emptyStateText: "No events scheduled.",
  },
  parameters: {
    docs: {
      description: {
        component:
          "Day events side panel with dynamic date and event list. Shows an empty state when no events exist for the selected day.",
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="mx-auto w-full max-w-sm bg-background p-2">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof UBDayEventsPanel>

export default meta

type Story = StoryObj<typeof meta>

export const EmptyState: Story = {}

export const WithEvents: Story = {
  args: {
    date: "2026-05-29",
    events: [
      {
        id: "event-1",
        title: "Open Lecture: Indigenous Knowledge in Modern Curricula",
        time: "16:00",
        location: "Faculty of Education Hall",
        category: "Academic",
        categoryColor: "#5b2db8",
      },
      {
        id: "event-2",
        title: "Student Volunteer Orientation",
        time: "18:00",
        location: "Student Centre",
        category: "Career",
        categoryColor: "#3b82f6",
      },
    ],
  },
}