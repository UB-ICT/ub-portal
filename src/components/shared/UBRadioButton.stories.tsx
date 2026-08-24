import type { Meta, StoryObj } from "@storybook/react-vite"
import { useState } from "react"
import { expect, userEvent, within } from "storybook/test"

import {
  actionArgTypes,
  componentParameters,
  withPanel,
} from "@/components/shared/storybook"

import { UBRadioButton, type UBRadioOption } from "./UBRadioButton"

const meta = {
  title: "Components/UBRadioButton",
  component: UBRadioButton,
  tags: ["autodocs"],
  argTypes: {
    ...actionArgTypes,
    label: { control: "text" },
    error: { control: "text" },
    disabled: { control: "boolean" },
    orientation: { control: "select", options: ["vertical", "horizontal"] },
  },
  parameters: componentParameters(
    "Radix-based radio group with UB Portal label styling, optional per-option descriptions, and error text."
  ),
  decorators: [withPanel("max-w-md space-y-6 p-6")],
} satisfies Meta<typeof UBRadioButton>

export default meta

type Story = StoryObj<typeof meta>

const deliveryOptions: UBRadioOption[] = [
  { value: "pickup", label: "Campus pickup" },
  { value: "courier", label: "Courier delivery" },
  { value: "mail", label: "Postal mail" },
]

export const Default: Story = {
  render: (args) => {
    const [value, setValue] = useState("pickup")

    return <UBRadioButton {...args} value={value} onValueChange={setValue} />
  },
  args: {
    label: "Delivery method",
    options: deliveryOptions,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const courier = canvas.getByRole("radio", { name: "Courier delivery" })

    await userEvent.click(courier)
    await expect(courier).toBeChecked()
  },
}

export const WithDescriptions: Story = {
  render: (args) => {
    const [value, setValue] = useState("standard")

    return <UBRadioButton {...args} value={value} onValueChange={setValue} />
  },
  args: {
    label: "Requisition priority",
    options: [
      {
        value: "standard",
        label: "Standard",
        description: "Reviewed in the order it was received.",
      },
      {
        value: "urgent",
        label: "Urgent",
        description: "Flagged for same-day review by procurement.",
      },
      {
        value: "blanket",
        label: "Blanket order",
        description: "Recurring purchase against an approved budget line.",
      },
    ],
  },
}

export const Horizontal: Story = {
  render: (args) => {
    const [value, setValue] = useState("yes")

    return <UBRadioButton {...args} value={value} onValueChange={setValue} />
  },
  args: {
    label: "Requires approval",
    orientation: "horizontal",
    options: [
      { value: "yes", label: "Yes" },
      { value: "no", label: "No" },
    ],
  },
}

export const WithError: Story = {
  render: (args) => {
    const [value, setValue] = useState("")

    return <UBRadioButton {...args} value={value} onValueChange={setValue} />
  },
  args: {
    label: "Delivery method",
    options: deliveryOptions,
    error: "Please select a delivery method",
  },
}

export const WithDisabledOption: Story = {
  render: (args) => {
    const [value, setValue] = useState("pickup")

    return <UBRadioButton {...args} value={value} onValueChange={setValue} />
  },
  args: {
    label: "Delivery method",
    options: [
      { value: "pickup", label: "Campus pickup" },
      { value: "courier", label: "Courier delivery" },
      {
        value: "mail",
        label: "Postal mail",
        description: "Temporarily unavailable",
        disabled: true,
      },
    ],
  },
}

export const Disabled: Story = {
  render: (args) => {
    const [value, setValue] = useState("pickup")

    return <UBRadioButton {...args} value={value} onValueChange={setValue} />
  },
  args: {
    label: "Delivery method",
    options: deliveryOptions,
    disabled: true,
  },
}
