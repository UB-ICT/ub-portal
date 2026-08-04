import { Plus } from "lucide-react"
import { useEffect, useMemo, useState } from "react"

import { UBButton } from "@/components/shared/UBButton"
import { UBInput, UBNativeSelect } from "@/components/shared/UBInput"
import { MenuFormDialog } from "@/features/identitiy-cloud/components/MenuFormDialog"
import { MenuRoleMatrix } from "@/features/identitiy-cloud/components/MenuRoleMatrix"
import type { AdminMenuRecord } from "@/lib/api/admin-menus"
import { useAdminMenusStore } from "@/store/admin-menus-store"
import { useAdminRolesStore } from "@/store/admin-roles-store"

export function AdminMenusPage() {
  const roots = useAdminMenusStore((state) => state.roots)
  const menus = useAdminMenusStore((state) => state.menus)
  const selectedRootId = useAdminMenusStore((state) => state.selectedRootId)
  const isLoading = useAdminMenusStore((state) => state.isLoading)
  const isSaving = useAdminMenusStore((state) => state.isSaving)
  const error = useAdminMenusStore((state) => state.error)
  const fetchRoots = useAdminMenusStore((state) => state.fetchRoots)
  const selectRoot = useAdminMenusStore((state) => state.selectRoot)
  const syncMenuRoles = useAdminMenusStore((state) => state.syncMenuRoles)
  const deleteMenu = useAdminMenusStore((state) => state.deleteMenu)

  const roles = useAdminRolesStore((state) => state.roles)
  const fetchRoles = useAdminRolesStore((state) => state.fetchRoles)

  const [searchQuery, setSearchQuery] = useState("")
  const [formOpen, setFormOpen] = useState(false)
  const [editingMenu, setEditingMenu] = useState<AdminMenuRecord | null>(null)
  const [formKey, setFormKey] = useState(0)

  useEffect(() => {
    void fetchRoles()
    void (async () => {
      const loadedRoots = await fetchRoots()
      const preferred =
        loadedRoots.find((root) => root.path === "/requisitions") ??
        loadedRoots[0] ??
        null

      if (preferred) {
        await selectRoot(preferred.id)
      }
    })()
  }, [fetchRoots, fetchRoles, selectRoot])

  const filteredMenus = useMemo(() => {
    const needle = searchQuery.trim().toLowerCase()

    if (!needle) {
      return menus
    }

    return menus.filter((menu) => {
      const haystack = [menu.label, menu.path, menu.type].join(" ").toLowerCase()
      return haystack.includes(needle)
    })
  }, [menus, searchQuery])

  const sortedRoles = useMemo(
    () =>
      [...roles].sort((left, right) =>
        left.role_name.localeCompare(right.role_name)
      ),
    [roles]
  )

  const handleAdd = () => {
    setEditingMenu(null)
    setFormKey((key) => key + 1)
    setFormOpen(true)
  }

  const handleEdit = (menu: AdminMenuRecord) => {
    setEditingMenu(menu)
    setFormKey((key) => key + 1)
    setFormOpen(true)
  }

  const handleDelete = async (menu: AdminMenuRecord) => {
    const confirmed = window.confirm(
      `Delete menu item "${menu.label}"? This cannot be undone.`
    )

    if (!confirmed) {
      return
    }

    await deleteMenu(menu.id)
  }

  const handleToggle = async (
    menu: AdminMenuRecord,
    roleId: string,
    checked: boolean
  ) => {
    const currentIds = (menu.roles ?? []).map((role) => role.id)
    const nextIds = checked
      ? [...new Set([...currentIds, roleId])]
      : currentIds.filter((id) => id !== roleId)

    await syncMenuRoles(menu.id, nextIds)
  }

  return (
    <div className="flex h-full min-h-0 flex-col gap-4 overflow-hidden">
      <div className="shrink-0 border-b border-border pb-5">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Menus
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Pick an application, then check which roles can see each menu item.
          Unchecked across all roles means the item is public.
        </p>
      </div>

      {error ? <p className="shrink-0 text-sm text-destructive">{error}</p> : null}

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-lg border border-border bg-card">
        <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3">
          <p className="text-sm text-muted-foreground">
            {filteredMenus.length} menu item
            {filteredMenus.length === 1 ? "" : "s"} · {sortedRoles.length} role
            {sortedRoles.length === 1 ? "" : "s"}
          </p>
          <UBButton size="sm" onClick={handleAdd}>
            <Plus className="size-4" data-icon="inline-start" />
            Add menu item
          </UBButton>
        </div>

        <div className="shrink-0 border-b border-border px-4 py-3">
          <div className="grid gap-3 md:grid-cols-2">
            <UBNativeSelect
              label="Application"
              options={roots.map((root) => ({
                value: root.id,
                label: `${root.label} · ${root.type}`,
              }))}
              value={selectedRootId ?? ""}
              onChange={(event) => {
                const nextId = event.target.value || null
                void selectRoot(nextId)
              }}
            />
            <UBInput
              label="Search menus"
              placeholder="Label or path..."
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
            />
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain p-4">
          <MenuRoleMatrix
            menus={filteredMenus}
            roles={sortedRoles}
            isLoading={isLoading}
            isSaving={isSaving}
            onToggle={(menu, roleId, checked) =>
              void handleToggle(menu, roleId, checked)
            }
            onEdit={handleEdit}
            onDelete={(menu) => void handleDelete(menu)}
          />
        </div>
      </div>

      <MenuFormDialog
        key={formKey}
        open={formOpen}
        menu={editingMenu}
        defaultParentId={selectedRootId}
        onOpenChange={setFormOpen}
      />
    </div>
  )
}

export default AdminMenusPage
