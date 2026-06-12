import type { Decorator } from "@storybook/react-vite"
import { MemoryRouter } from "react-router-dom"

export function withPanel(className = "p-6"): Decorator {
  return (Story) => (
    <div className={className}>
      <Story />
    </div>
  )
}

export function withMaxWidth(maxWidthClass = "max-w-md"): Decorator {
  return (Story) => (
    <div className={`w-full ${maxWidthClass}`}>
      <Story />
    </div>
  )
}

export function withSidebarWidth(sidebarWidthClass = "w-80"): Decorator {
  return (Story) => (
    <div className={sidebarWidthClass}>
      <Story />
    </div>
  )
}

export function withFullscreenCanvas(className = "-m-6 min-h-svh bg-muted/30"): Decorator {
  return (Story) => (
    <div className={className}>
      <Story />
    </div>
  )
}

export function withRouter(initialEntries: string[] = ["/"]): Decorator {
  return (Story) => (
    <MemoryRouter initialEntries={initialEntries}>
      <Story />
    </MemoryRouter>
  )
}
