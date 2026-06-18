import type { Meta, StoryObj } from "@storybook/react-vite"
import { useState, type FormEvent } from "react"

import { UBButton } from "@/components/shared/UBButton"
import { UBInput } from "@/components/shared/UBInput"
import {
  actionArgTypes,
  componentParameters,
  withPanel,
} from "@/components/shared/storybook"

import { UBSelect, type UBSelectOption } from "./UBSelect"

const meta = {
  title: "Components/UBSelect",
  component: UBSelect,
  tags: ["autodocs"],
  argTypes: {
    ...actionArgTypes,
    label: { control: "text" },
    placeholder: { control: "text" },
    error: { control: "text" },
    disabled: { control: "boolean" },
  },
  parameters: componentParameters(
    "Radix-based select with an optional first action to add a new option through a dialog."
  ),
  decorators: [withPanel("max-w-md space-y-6 p-6")],
} satisfies Meta<typeof UBSelect>

export default meta

type Story = StoryObj<typeof meta>

const departmentOptions: UBSelectOption[] = [
  { value: "engineering", label: "Engineering" },
  { value: "business", label: "Business" },
  { value: "science", label: "Science" },
  { value: "arts", label: "Arts" },
]

export const Default: Story = {
  render: (args) => {
    const [value, setValue] = useState("")

    return (
      <UBSelect
        {...args}
        value={value}
        onValueChange={setValue}
        options={departmentOptions}
      />
    )
  },
  args: {
    label: "Department",
    placeholder: "Select a department",
  },
}

export const WithError: Story = {
  render: (args) => {
    const [value, setValue] = useState("")

    return (
      <UBSelect
        {...args}
        value={value}
        onValueChange={setValue}
        options={departmentOptions}
      />
    )
  },
  args: {
    label: "Program",
    placeholder: "Select a program",
    error: "Please select a program",
  },
}

export const WithAddOptionDialog: Story = {
  render: (args) => {
    const [value, setValue] = useState("")
    const [options, setOptions] = useState<UBSelectOption[]>([
      { value: "acme", label: "Acme Office Supplies" },
      { value: "belize-tech", label: "Belize Tech Solutions" },
    ])

    return (
      <UBSelect
        {...args}
        value={value}
        onValueChange={setValue}
        options={options}
        addOption={{
          label: "Add new supplier",
          dialogTitle: "Add supplier",
          dialogDescription: "Create a supplier and select it immediately.",
          renderDialogContent: ({ onCreated, onCancel }) => (
            <AddSupplierStoryForm
              onCreated={(option) => {
                setOptions((current) => [...current, option])
                onCreated(option)
              }}
              onCancel={onCancel}
            />
          ),
        }}
      />
    )
  },
  args: {
    label: "Supplier",
    placeholder: "Select a supplier",
  },
}

function AddSupplierStoryForm({
  onCreated,
  onCancel,
}: {
  onCreated: (option: UBSelectOption) => void
  onCancel: () => void
}) {
  const [name, setName] = useState("")

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()

    if (!name.trim()) {
      return
    }

    onCreated({
      value: name.trim().toLowerCase().replace(/\s+/g, "-"),
      label: name.trim(),
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <UBInput
        label="Supplier name"
        value={name}
        onChange={(event) => setName(event.target.value)}
        placeholder="New supplier"
        required
      />
      <div className="flex justify-end gap-2">
        <UBButton type="button" variant="outline" onClick={onCancel}>
          Cancel
        </UBButton>
        <UBButton type="submit">Add supplier</UBButton>
      </div>
    </form>
  )
}
