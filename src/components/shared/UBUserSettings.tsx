import { Laptop, Moon, Sun } from "lucide-react"

import type { PortalApplication } from "@/lib/api/menu"
import { cn } from "@/lib/utils"
import { UBNativeSelect } from "./UBInput"

export type UBThemePreference = "light" | "dark" | "system"

export type UBNotificationPreference = {
  id: string
  label: string
  description?: string
  enabled: boolean
}

export type UBUserSettingsProps = {
  theme: UBThemePreference
  onThemeChange?: (theme: UBThemePreference) => void
  notificationPreferences?: UBNotificationPreference[]
  onNotificationPreferenceChange?: (id: string, enabled: boolean) => void
  applications?: PortalApplication[]
  defaultApplicationId?: string
  onDefaultApplicationChange?: (applicationId: string) => void
  className?: string
}

const THEME_OPTIONS: {
  value: UBThemePreference
  label: string
  icon: typeof Sun
}[] = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Laptop },
]

export function UBUserSettings({
  theme,
  onThemeChange,
  notificationPreferences = [],
  onNotificationPreferenceChange,
  applications = [],
  defaultApplicationId,
  onDefaultApplicationChange,
  className,
}: UBUserSettingsProps) {
  return (
    <div
      className={cn("rounded-2xl border bg-card p-6 shadow-sm", className)}
    >
      <div>
        <h2 className="text-lg font-semibold tracking-tight text-foreground">
          Settings
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage how the portal looks and notifies you.
        </p>
      </div>

      <div className="mt-6 border-t pt-6">
        <p className="mb-3 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          Appearance
        </p>
        <div className="inline-flex rounded-lg border border-border bg-muted/40 p-1">
          {THEME_OPTIONS.map(({ value, label, icon: Icon }) => {
            const isActive = theme === value

            return (
              <button
                key={value}
                type="button"
                aria-pressed={isActive}
                onClick={() => onThemeChange?.(value)}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className="size-4" />
                {label}
              </button>
            )
          })}
        </div>
      </div>

      <div className="mt-6 border-t pt-6">
        <p className="mb-3 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          Notifications
        </p>

        {notificationPreferences.length > 0 ? (
          <div className="space-y-1">
            {notificationPreferences.map((preference) => (
              <div
                key={preference.id}
                className="flex items-center justify-between gap-4 rounded-lg border border-transparent px-3 py-2.5 hover:border-border hover:bg-muted"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground">
                    {preference.label}
                  </p>
                  {preference.description ? (
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {preference.description}
                    </p>
                  ) : null}
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={preference.enabled}
                  aria-label={preference.label}
                  onClick={() =>
                    onNotificationPreferenceChange?.(
                      preference.id,
                      !preference.enabled
                    )
                  }
                  className={cn(
                    "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
                    preference.enabled ? "bg-primary" : "bg-muted-foreground/30"
                  )}
                >
                  <span
                    className={cn(
                      "inline-block size-4 transform rounded-full bg-background transition-transform",
                      preference.enabled ? "translate-x-6" : "translate-x-1"
                    )}
                  />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            No notification preferences to manage.
          </p>
        )}
      </div>

      {applications.length > 0 ? (
        <div className="mt-6 border-t pt-6">
          <UBNativeSelect
            label="Default app"
            value={defaultApplicationId ?? ""}
            onChange={(event) =>
              onDefaultApplicationChange?.(event.target.value)
            }
            options={applications.map((application) => ({
              value: application.id,
              label: application.label,
            }))}
          />
          <p className="mt-2 text-xs text-muted-foreground">
            The app you land on after signing in.
          </p>
        </div>
      ) : null}
    </div>
  )
}
