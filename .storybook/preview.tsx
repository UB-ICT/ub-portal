import type { Preview } from "@storybook/react-vite"

import "@/index.css"
import { ThemeProvider } from "@/components/theme-provider"

const preview: Preview = {
  decorators: [
    (Story) => (
      <ThemeProvider defaultTheme="light">
        <div className="min-h-svh bg-background p-6 text-foreground">
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
    },
  },
}

export default preview
