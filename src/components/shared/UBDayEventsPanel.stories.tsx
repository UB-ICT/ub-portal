import type { Meta, StoryObj } from "@storybook/react-vite"
import {
  actionArgTypes,
  componentParameters,
  expectTextVisible,
  withMaxWidth,
  withPanel,
} from "@/components/shared/storybook"

import { UBDayEventsPanel } from "./UBDayEventsPanel"

const meta = {
  title: "Components/UBDayEventsPanel",
  component: UBDayEventsPanel,
  tags: ["autodocs"],
  args: {
    date: "2026-05-01",
    events: [],
    headingLabel: "EVENTS ON",
    emptyStateText: "No events scheduled.",
  },
  argTypes: {
    ...actionArgTypes,
    date: { control: "text" },
    headingLabel: { control: "text" },
    emptyStateText: { control: "text" },
  },
  parameters: componentParameters(
    "Day events side panel with dynamic date and event list. Shows an empty state when no events exist for the selected day."
  ),
  decorators: [withPanel("mx-auto w-full bg-background p-2"), withMaxWidth("max-w-sm")],
} satisfies Meta<typeof UBDayEventsPanel>

export default meta

type Story = StoryObj<typeof meta>

export const EmptyState: Story = {
  play: async ({ canvasElement }) => {
    await expectTextVisible(canvasElement, "No events scheduled.")
  },
}

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
