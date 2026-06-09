import type { Meta, StoryObj } from "@storybook/react-vite"

import { UBEventCard } from "./UBEventCard"

const meta = {
  title: "Components/UBEventCard",
  component: UBEventCard,
  args: {
    month: "May",
    day: 29,
    category: "Academic",
    secondaryCategory: "Faculty of Education",
    title: "Open Lecture: Indigenous Knowledge in Modern Curricula",
    time: "16:00",
    location: "Faculty of Education Hall",
    addToCalendarLabel: "Add to Google Calendar",
  },
  parameters: {
    docs: {
      description: {
        component:
          "Event summary card with dynamic date, tags, metadata, and customizable calendar button label.",
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="mx-auto w-full max-w-3xl bg-background p-6">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof UBEventCard>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const DifferentEvent: Story = {
  args: {
    month: "Jun",
    day: 4,
    category: "Campus",
    secondaryCategory: "Student Affairs",
    title: "Student Leadership Forum and Panel Discussion",
    time: "09:30",
    location: "Belmopan Auditorium",
    addToCalendarLabel: "Add to Google Calendar",
  },
}