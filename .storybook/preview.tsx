import type { Preview } from "@storybook/react-vite"

import "@/index.css"
import { ThemeProvider } from "@/components/theme-provider"

const preview: Preview = {
  decorators: [
    (Story) => (
      <ThemeProvider defaultTheme="light">
        <div
          id="storybook-root"
          className="min-h-svh bg-background text-foreground"
        >
          <Story />
        </div>
      </ThemeProvider>
    ),
  ],
  parameters: {
    layout: "centered",
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
      expanded: true,
    },
    a11y: {
      disable: false,
      context: "#storybook-root",
    },
    docs: {
      toc: true,
    },
  },
  tags: ["autodocs"],
}

export default preview
