import type * as React from "react"
import { useEffect, useMemo, useState } from "react"
import { Link, useLocation } from "react-router-dom"
import { Drawer as DrawerPrimitive } from "vaul"
import { PanelLeftClose, PanelLeftOpen } from "lucide-react"

import {
  Drawer,
  DrawerDescription,
  DrawerOverlay,
  DrawerPortal,
  DrawerTitle,
} from "@/components/ui/drawer"
import { resolveActiveDrawerItemId } from "@/lib/application-path"
import { MenuIcon } from "@/lib/menu-icons"
import { cn } from "@/lib/utils"
import { useApplicationMenuStore } from "@/store/application-menu-store"

export const UB_DRAWER_WIDTH_MINI = "4rem"
export const UB_DRAWER_WIDTH_FULL = "18rem"

const drawerTransitionClass =
  "transition-[width,margin-left,transform,opacity] duration-300 ease-in-out motion-reduce:transition-none"

export type UBDrawerItem = {
  id: string
  label: string
  icon: React.ReactNode
  to?: string
  href?: string
  onClick?: () => void
  active?: boolean
}

export type UBDrawerProps = {
  items?: UBDrawerItem[]
  appLabel?: string
  header?: React.ReactNode
  children?: React.ReactNode
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  mini?: boolean
  defaultMini?: boolean
  onMiniChange?: (mini: boolean) => void
  overlay?: boolean
  persistent?: boolean
  className?: string
}

export function UBDrawer({
  items: itemsOverride,
  appLabel,
  header,
  children,
  open,
  defaultOpen = true,
  onOpenChange,
  mini,
  defaultMini = false,
  onMiniChange,
  overlay = false,
  persistent = false,
  className,
}: UBDrawerProps) {
  const location = useLocation()
  const [internalOpen, setInternalOpen] = useState(defaultOpen)
  const [internalMini, setInternalMini] = useState(defaultMini)
  const isOpen = open ?? internalOpen
  const isMini = mini ?? internalMini
  const drawerWidth = isMini ? UB_DRAWER_WIDTH_MINI : UB_DRAWER_WIDTH_FULL
  const useStaticSidebar = persistent && !overlay

  const storeDrawerItems = useApplicationMenuStore((state) => state.drawerItems)
  const applicationMenu = useApplicationMenuStore((state) => state.applicationMenu)
  const isLoadingMenu = useApplicationMenuStore((state) => state.isLoading)
  const menuError = useApplicationMenuStore((state) => state.error)
  const items = itemsOverride ?? storeDrawerItems
  const activeItemId = useMemo(
    () => resolveActiveDrawerItemId(items, location.pathname),
    [items, location.pathname]
  )
  const applicationLabel = applicationMenu?.label ?? appLabel ?? "UB Portal"

  useEffect(() => {
    if (open === undefined) {
      setInternalOpen(defaultOpen)
    }
  }, [defaultOpen, open])

  useEffect(() => {
    if (mini === undefined) {
      setInternalMini(defaultMini)
    }
  }, [defaultMini, mini])

  const handleOpenChange = (nextOpen: boolean) => {
    if (persistent && !nextOpen) {
      return
    }

    if (open === undefined) {
      setInternalOpen(nextOpen)
    }

    onOpenChange?.(nextOpen)
  }

  const handleMiniToggle = () => {
    const nextMini = !isMini

    if (mini === undefined) {
      setInternalMini(nextMini)
    }

    onMiniChange?.(nextMini)
  }

  const renderItem = (item: UBDrawerItem) => {
    const active = item.id === activeItemId
    const itemClassName = cn(
      "inline-flex w-full items-center overflow-hidden rounded-xl border text-sm font-medium",
      drawerTransitionClass,
      isMini ? "justify-center px-2 py-2.5" : "gap-3 px-3 py-2.5 text-left",
      active
        ? "border-primary/30 bg-primary/10 text-primary"
        : "border-transparent text-foreground hover:border-border hover:bg-muted"
    )
    const icon = (
      <span className="inline-flex size-4 shrink-0 items-center justify-center">
        {item.icon}
      </span>
    )
    const label = (
      <span
        className={cn(
          "block truncate whitespace-nowrap",
          drawerTransitionClass,
          isMini ? "max-w-0 opacity-0" : "max-w-48 opacity-100"
        )}
      >
        {item.label}
      </span>
    )

    if (item.to) {
      return (
        <Link
          key={item.id}
          to={item.to}
          className={itemClassName}
          title={isMini ? item.label : undefined}
          aria-label={item.label}
        >
          {icon}
          {label}
        </Link>
      )
    }

    if (item.href) {
      return (
        <a
          key={item.id}
          href={item.href}
          className={itemClassName}
          title={isMini ? item.label : undefined}
          aria-label={item.label}
        >
          {icon}
          {label}
        </a>
      )
    }

    return (
      <button
        key={item.id}
        type="button"
        onClick={item.onClick}
        className={itemClassName}
        title={isMini ? item.label : undefined}
        aria-label={item.label}
      >
        {icon}
        {label}
      </button>
    )
  }

  const brandingHeader = (
    <div className="border-b px-3 py-4">
      <div
        className={cn(
          "flex items-center gap-3",
          isMini ? "justify-center" : "pr-1"
        )}
      >
        <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
          <MenuIcon
            icon={applicationMenu?.icon}
            label={applicationMenu?.label}
            className="size-5"
          />
        </div>

        {!isMini ? (
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-muted-foreground">
              University of Belize
            </p>
            {useStaticSidebar ? (
              <h2 className="truncate text-lg font-semibold tracking-tight">
                {applicationLabel}
              </h2>
            ) : (
              <DrawerTitle className="truncate text-lg font-semibold tracking-tight">
                {applicationLabel}
              </DrawerTitle>
            )}
          </div>
        ) : useStaticSidebar ? (
          <h2 className="sr-only">{applicationLabel}</h2>
        ) : (
          <DrawerTitle className="sr-only">{applicationLabel}</DrawerTitle>
        )}

        {!isMini ? (
          <button
            type="button"
            onClick={handleMiniToggle}
            className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg border border-border text-foreground hover:bg-muted"
            aria-label="Collapse navigation drawer"
          >
            <PanelLeftClose className="size-4" />
          </button>
        ) : null}
      </div>

      {isMini ? (
        <button
          type="button"
          onClick={handleMiniToggle}
          className="mx-auto mt-3 inline-flex size-8 items-center justify-center rounded-lg border border-border text-foreground hover:bg-muted"
          aria-label="Expand navigation drawer"
        >
          <PanelLeftOpen className="size-4" />
        </button>
      ) : null}
    </div>
  )

  const navigationItems = (
    <nav
      aria-label="Application navigation"
      className="flex-1 space-y-1 overflow-x-hidden overflow-y-auto p-3"
    >
      {isLoadingMenu && items.length === 0 ? (
        <p className="px-2 py-3 text-sm text-muted-foreground">Loading menu...</p>
      ) : menuError && items.length === 0 ? (
        <p className="px-2 py-3 text-sm text-destructive">{menuError}</p>
      ) : items.length === 0 ? (
        <p className="px-2 py-3 text-sm text-muted-foreground">
          No menu items available.
        </p>
      ) : (
        items.map(renderItem)
      )}
    </nav>
  )

  const sidebarPanelClassName = cn(
    "flex h-svh shrink-0 flex-col border-r bg-background shadow-sm",
    drawerTransitionClass,
    isMini ? "w-16" : "w-72",
    className
  )

  const staticSidebar = (
    <aside className={sidebarPanelClassName}>
      <p className="sr-only">Application navigation menu</p>
      {brandingHeader}
      {navigationItems}
    </aside>
  )

  const drawerPanel = (
    <Drawer
      open={isOpen}
      onOpenChange={handleOpenChange}
      direction="left"
      modal={overlay}
      dismissible={!persistent}
      handleOnly={persistent}
    >
      <DrawerPortal>
        {overlay ? <DrawerOverlay className={drawerTransitionClass} /> : null}
        <DrawerPrimitive.Content
          data-slot="drawer-content"
          className={cn(
            "group/drawer-content fixed inset-y-0 left-0 z-40 flex h-svh flex-col border-r bg-background shadow-sm outline-none will-change-[width,transform]",
            drawerTransitionClass,
            "data-[vaul-drawer-direction=left]:animate-in data-[vaul-drawer-direction=left]:slide-in-from-left data-[vaul-drawer-direction=left]:data-[state=closed]:animate-out data-[vaul-drawer-direction=left]:data-[state=closed]:slide-out-to-left",
            isMini ? "w-16" : "w-72",
            className
          )}
        >
          <DrawerDescription className="sr-only">
            Application navigation menu
          </DrawerDescription>
          {brandingHeader}
          {navigationItems}
        </DrawerPrimitive.Content>
      </DrawerPortal>
    </Drawer>
  )

  const sidebar = useStaticSidebar ? staticSidebar : drawerPanel

  if (!children && !header) {
    return sidebar
  }

  if (useStaticSidebar) {
    return (
      <div className="flex h-svh overflow-hidden bg-muted/30">
        {staticSidebar}
        <div
          className={cn(
            "flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden",
            drawerTransitionClass
          )}
        >
          <div className="shrink-0">{header}</div>
          <div className="min-h-0 flex-1 overflow-hidden">{children}</div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-svh overflow-hidden bg-muted/30">
      {drawerPanel}
      <div
        className={cn(
          "flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden",
          drawerTransitionClass
        )}
        style={{ marginLeft: drawerWidth }}
      >
        <div className="shrink-0">{header}</div>
        <div className="min-h-0 flex-1 overflow-hidden">{children}</div>
      </div>
    </div>
  )
}
