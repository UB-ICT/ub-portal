import React from "react"
import type { Meta, StoryObj } from "@storybook/react-vite"
import { CalendarDays, LayoutList, Rows4 } from "lucide-react"
import {
  actionArgTypes,
  clickButton,
  componentParameters,
  expectButtonVisible,
  withPanel,
} from "@/components/shared/storybook"

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
  tags: ["autodocs"],
  args: {
    options: [
      { value: "list", label: "List", icon: LayoutList },
      { value: "calendar", label: "Calendar", icon: CalendarDays },
    ],
    defaultValue: "list",
  },
  argTypes: {
    ...actionArgTypes,
    defaultValue: { control: "text" },
  },
  parameters: componentParameters(
    "Segmented view switcher for list/calendar-style navigation. Edit labels in options and add more entries as needed."
  ),
  decorators: [withPanel("mx-auto w-full max-w-4xl bg-background pt-8")],
} satisfies Meta<StoryArgs>

export default meta

type Story = StoryObj<StoryArgs>

export const Default: Story = {
  render: InteractiveStory,
  play: async ({ canvasElement }) => {
    await expectButtonVisible(canvasElement, "List")
    await clickButton(canvasElement, "Calendar")
  },
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
