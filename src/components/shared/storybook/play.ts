import { expect, userEvent, within } from "storybook/test"

export async function clickButton(
  canvasElement: HTMLElement,
  name: string | RegExp
) {
  const canvas = within(canvasElement)
  const button = canvas.getByRole("button", { name })

  await userEvent.click(button)

  return button
}

export async function clickLink(
  canvasElement: HTMLElement,
  name: string | RegExp
) {
  const canvas = within(canvasElement)
  const link = canvas.getByRole("link", { name })

  await userEvent.click(link)

  return link
}

export async function fillInput(
  canvasElement: HTMLElement,
  label: string | RegExp,
  value: string
) {
  const canvas = within(canvasElement)
  const input = canvas.getByLabelText(label)

  await userEvent.clear(input)
  await userEvent.type(input, value)

  return input
}

export async function expectButtonVisible(
  canvasElement: HTMLElement,
  name: string | RegExp
) {
  const canvas = within(canvasElement)

  await expect(canvas.getByRole("button", { name })).toBeVisible()
}

export async function expectTextVisible(
  canvasElement: HTMLElement,
  text: string | RegExp
) {
  const canvas = within(canvasElement)

  await expect(canvas.getByText(text)).toBeVisible()
}
