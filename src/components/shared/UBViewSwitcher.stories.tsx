import React from "react"
import type { Meta, StoryObj } from "@storybook/react-vite"
import { CalendarDays, LayoutList, Rows4 } from "lucide-react"

import { UBViewSwitcher, type UBViewSwitcherProps } from "./UBViewSwitcher"

type StoryArgs = UBViewSwitcherProps

function InteractiveStory(args: StoryArgs) {
  const [activeValue, setActiveValue] = React.useState(
    args.defaultValue ?? args.options[0]?.value ?? ""
  )

  React.useEffect(() => {
    setActiveValue(args.defaultValue ?? args.options[0]?.value ?? "")
  }, [args.defaultValue, args.options])

  return (
    <UBViewSwitcher
      {...args}
      value={activeValue}
      onValueChange={(nextValue) => {
        setActiveValue(nextValue)
        args.onValueChange?.(nextValue)
      }}
    />
  )
}

const meta = {
  title: "Components/UBViewSwitcher",
  component: UBViewSwitcher,
  args: {
    options: [
      { value: "list", label: "List", icon: LayoutList },
      { value: "calendar", label: "Calendar", icon: CalendarDays },
    ],
    defaultValue: "list",
  },
  parameters: {
    docs: {
      description: {
        component:
          "Segmented view switcher for list/calendar-style navigation. Edit labels in options and add more entries as needed.",
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="mx-auto w-full max-w-4xl bg-background pt-8">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<StoryArgs>

export default meta

type Story = StoryObj<StoryArgs>

export const Default: Story = {
  render: InteractiveStory,
}

export const WithMoreViews: Story = {
  args: {
    options: [
      {
        value: "list",
        label: "List",
        icon: LayoutList,
      },
      {
        value: "calendar",
        label: "Calendar",
        icon: CalendarDays,
      },
      {
        value: "agenda",
        label: "Agenda",
        icon: Rows4,
      },
      {
        value: "timeline",
        label: "Timeline",
        icon: Rows4,
      },
    ],

    defaultValue: "calendar",
  },
  render: InteractiveStory,
}
