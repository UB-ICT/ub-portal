import { Mail, ShieldCheck, Users } from "lucide-react"

import type { PortalApplication } from "@/lib/api/menu"
import { MenuIcon } from "@/lib/menu-icons"
import { cn, getUserInitials } from "@/lib/utils"
import { UBTag } from "./UBTag"

export type UBUserProfileProps = {
  userName: string
  userEmail: string
  userImageSrc?: string
  role?: string
  statusLabel?: string
  mailingGroups?: string[]
  applications?: PortalApplication[]
  className?: string
}

export function UBUserProfile({
  userName,
  userEmail,
  userImageSrc,
  role = "Portal user",
  statusLabel = "Active",
  mailingGroups = [],
  applications = [],
  className,
}: UBUserProfileProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border bg-card p-6 shadow-sm",
        className
      )}
    >
      <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
        <div className="inline-flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-full border border-border bg-primary/10 text-2xl font-semibold text-primary">
          {userImageSrc ? (
            <img
              src={userImageSrc}
              alt={`${userName} profile`}
              className="size-full object-cover"
            />
          ) : (
            <span>{getUserInitials(userName)}</span>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <h2 className="truncate text-2xl font-semibold tracking-tight text-foreground">
            {userName}
          </h2>
          <p className="mt-1 inline-flex items-center gap-1.5 text-sm text-muted-foreground">
            <Mail className="size-4" />
            <span className="truncate">{userEmail}</span>
          </p>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <UBTag text={role} variant="primary" />
            <UBTag
              text={statusLabel}
              variant="neutral"
              icon={<ShieldCheck className="size-3.5" />}
            />
          </div>
        </div>
      </div>

      <div className="mt-6 border-t pt-6">
        <p className="mb-3 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          Mailing groups
        </p>

        {mailingGroups.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {mailingGroups.map((group) => (
              <UBTag
                key={group}
                text={group}
                variant="secondary"
                icon={<Users className="size-3.5" />}
              />
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            No mailing groups assigned.
          </p>
        )}
      </div>

      <div className="mt-6 border-t pt-6">
        <p className="mb-3 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          Applications
        </p>

        {applications.length > 0 ? (
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {applications.map((application) => (
              <div
                key={application.id}
                className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
              >
                <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg border bg-muted text-primary [&_svg]:size-4">
                  <MenuIcon
                    icon={application.icon}
                    label={application.label}
                    className="size-4"
                  />
                </span>
                <span className="truncate">{application.label}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            No applications available.
          </p>
        )}
      </div>
    </div>
  )
}
