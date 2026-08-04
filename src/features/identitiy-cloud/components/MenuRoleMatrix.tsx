import { Pencil, Trash2 } from "lucide-react"

import { UBButton } from "@/components/shared/UBButton"
import type { AdminMenuRecord } from "@/lib/api/admin-menus"
import type { AdminRoleRecord } from "@/lib/api/admin-roles"
import { cn } from "@/lib/utils"

type MenuRoleMatrixProps = {
  menus: AdminMenuRecord[]
  roles: AdminRoleRecord[]
  isLoading?: boolean
  isSaving?: boolean
  onToggle: (menu: AdminMenuRecord, roleId: string, checked: boolean) => void
  onEdit: (menu: AdminMenuRecord) => void
  onDelete: (menu: AdminMenuRecord) => void
}

export function MenuRoleMatrix({
  menus,
  roles,
  isLoading = false,
  isSaving = false,
  onToggle,
  onEdit,
  onDelete,
}: MenuRoleMatrixProps) {
  if (isLoading && menus.length === 0) {
    return (
      <p className="px-1 text-sm text-muted-foreground">Loading menu matrix...</p>
    )
  }

  if (!isLoading && menus.length === 0) {
    return (
      <p className="px-1 text-sm text-muted-foreground">
        No menu items for this application yet.
      </p>
    )
  }

  return (
    <div className="overflow-auto rounded-xl border">
      <table className="min-w-full border-collapse text-sm">
        <thead>
          <tr className="border-b bg-muted/40">
            <th className="sticky left-0 z-20 min-w-[220px] bg-muted/40 px-3 py-3 text-left font-medium">
              Menu item
            </th>
            {roles.map((role) => (
              <th
                key={role.id}
                className="min-w-[96px] px-2 py-3 text-center font-medium"
                title={role.description ?? role.role_name}
              >
                <span className="inline-block max-w-[88px] truncate align-bottom text-xs">
                  {role.role_name}
                </span>
              </th>
            ))}
            <th className="sticky right-0 z-20 min-w-[96px] bg-muted/40 px-3 py-3 text-right font-medium">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {menus.map((menu, index) => {
            const assigned = new Set((menu.roles ?? []).map((role) => role.id))
            const isPublic = assigned.size === 0

            return (
              <tr
                key={menu.id}
                className={cn(
                  "border-b",
                  index % 2 === 0 ? "bg-background" : "bg-muted/20"
                )}
              >
                <td className="sticky left-0 z-10 bg-inherit px-3 py-2.5">
                  <div className="min-w-0">
                    <p className="truncate font-medium text-foreground">
                      {menu.label}
                    </p>
                    <p className="truncate font-mono text-xs text-muted-foreground">
                      {menu.path}
                    </p>
                    {isPublic ? (
                      <p className="mt-1 text-[11px] text-muted-foreground">
                        No roles checked = visible to all users
                      </p>
                    ) : null}
                  </div>
                </td>
                {roles.map((role) => {
                  const checked = assigned.has(role.id)

                  return (
                    <td key={role.id} className="px-2 py-2 text-center">
                      <input
                        type="checkbox"
                        className="size-4 rounded border-border"
                        checked={checked}
                        disabled={isSaving}
                        aria-label={`${menu.label} for ${role.role_name}`}
                        onChange={(event) =>
                          onToggle(menu, role.id, event.target.checked)
                        }
                      />
                    </td>
                  )
                })}
                <td className="sticky right-0 z-10 bg-inherit px-2 py-2 text-right">
                  <div className="inline-flex items-center gap-1">
                    <UBButton
                      type="button"
                      size="icon"
                      variant="ghost"
                      aria-label={`Edit ${menu.label}`}
                      onClick={() => onEdit(menu)}
                    >
                      <Pencil className="size-4" />
                    </UBButton>
                    <UBButton
                      type="button"
                      size="icon"
                      variant="ghost"
                      aria-label={`Delete ${menu.label}`}
                      onClick={() => onDelete(menu)}
                    >
                      <Trash2 className="size-4 text-destructive" />
                    </UBButton>
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
