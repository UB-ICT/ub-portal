type Layout = "centered" | "fullscreen" | "padded"

export function componentParameters(
  description: string,
  layout: Layout = "centered"
) {
  return {
    layout: layout === "padded" ? "centered" : layout,
    docs: {
      description: {
        component: description,
      },
    },
    a11y: {
      disable: false,
      element: "#storybook-root",
    },
    controls: {
      expanded: true,
      sort: "requiredFirst",
    },
  }
}

export const actionArgTypes = {
  onClick: { action: "clicked" },
  onChange: { action: "changed" },
  onSubmit: { action: "submitted" },
  onValueChange: { action: "valueChanged" },
  onOpenChange: { action: "openChanged" },
  onMiniChange: { action: "miniChanged" },
  onAction: { action: "action" },
  onBack: { action: "back" },
  onThemeToggle: { action: "themeToggled" },
  onNotificationsClick: { action: "notificationsClicked" },
  onAppsClick: { action: "appsClicked" },
  onProfileClick: { action: "profileClicked" },
  onAdminToolsClick: { action: "adminToolsClicked" },
  onSignOutClick: { action: "signOutClicked" },
  onRowClick: { action: "rowClicked" },
} as const
