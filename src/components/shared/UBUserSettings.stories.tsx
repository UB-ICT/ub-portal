import type { Meta, StoryObj } from "@storybook/react-vite"
import { useState } from "react"
import {
  clickButton,
  componentParameters,
  expectButtonVisible,
  withMaxWidth,
  withPanel,
} from "@/components/shared/storybook"

import type {
  UBNotificationPreference,
  UBThemePreference,
} from "./UBUserSettings"
import { UBUserSettings } from "./UBUserSettings"

const mockApplications = [
  {
    id: "1",
    label: "Education",
    path: "/education",
    icon: "BookOpen",
    sort_order: 1,
  },
  {
    id: "2",
    label: "Requisitions",
    path: "/requisitions",
    icon: "ClipboardList",
    sort_order: 2,
  },
  {
    id: "3",
    label: "Registration",
    path: "/registration",
    icon: "LayoutGrid",
    sort_order: 3,
  },
]

const mockNotificationPreferences: UBNotificationPreference[] = [
  {
    id: "requisition-updates",
    label: "Requisition updates",
    description: "Get notified when a requisition you submitted changes status.",
    enabled: true,
  },
  {
    id: "approvals",
    label: "Approval requests",
    description: "Get notified when something is waiting on your approval.",
    enabled: true,
  },
  {
    id: "announcements",
    label: "Campus announcements",
    description: "News and events from across the university.",
    enabled: false,
  },
]

const meta = {
  title: "Components/UBUserSettings",
  component: UBUserSettings,
  tags: ["autodocs"],
  args: {
    theme: "system",
    notificationPreferences: mockNotificationPreferences,
    applications: mockApplications,
    defaultApplicationId: "1",
  },
  parameters: componentParameters(
    "Portal-local preferences: appearance (theme), notification toggles, and default landing app."
  ),
  decorators: [withPanel("p-6"), withMaxWidth("max-w-xl")],
} satisfies Meta<typeof UBUserSettings>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => {
    const [theme, setTheme] = useState<UBThemePreference>(args.theme)
    const [preferences, setPreferences] = useState(
      args.notificationPreferences ?? []
    )
    const [defaultApplicationId, setDefaultApplicationId] = useState(
      args.defaultApplicationId
    )

    return (
      <UBUserSettings
        {...args}
        theme={theme}
        onThemeChange={setTheme}
        notificationPreferences={preferences}
        onNotificationPreferenceChange={(id, enabled) =>
          setPreferences((current) =>
            current.map((preference) =>
              preference.id === id ? { ...preference, enabled } : preference
            )
          )
        }
        defaultApplicationId={defaultApplicationId}
        onDefaultApplicationChange={setDefaultApplicationId}
      />
    )
  },
  play: async ({ canvasElement }) => {
    await expectButtonVisible(canvasElement, "Dark")
    await clickButton(canvasElement, "Dark")
  },
}

export const NoNotificationPreferences: Story = {
  args: {
    notificationPreferences: [],
  },
}

export const WithoutDefaultApp: Story = {
  args: {
    applications: [],
  },
}
