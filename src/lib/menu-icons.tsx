import type { LucideIcon } from "lucide-react"
import {
  BookOpen,
  ClipboardList,
  FileText,
  GraduationCap,
  Grid3X3,
  KeyRound,
  LayoutDashboard,
  LayoutGrid,
  ScrollText,
  Settings,
  ShieldCheck,
  Users,
} from "lucide-react"

import { cn } from "@/lib/utils"

const MENU_ICON_MAP: Record<string, LucideIcon> = {
  "book-open": BookOpen,
  BookOpen,
  "clipboard-list": ClipboardList,
  ClipboardList,
  "file-text": FileText,
  FileText,
  "graduation-cap": GraduationCap,
  GraduationCap,
  "grid-3x3": Grid3X3,
  Grid3X3,
  "key-round": KeyRound,
  KeyRound,
  "layout-dashboard": LayoutDashboard,
  LayoutDashboard,
  "layout-grid": LayoutGrid,
  LayoutGrid,
  "scroll-text": ScrollText,
  ScrollText,
  settings: Settings,
  Settings,
  "shield-check": ShieldCheck,
  ShieldCheck,
  users: Users,
  Users,
}

// Keyword -> icon, used to infer an icon from a menu item's label when no
// explicit (or unrecognized) icon key is provided.
const NAME_ICON_KEYWORDS: Array<{ keywords: string[]; icon: LucideIcon }> = [
  { keywords: ["requisition", "purchase order", "purchase-order"], icon: ClipboardList },
  { keywords: ["supplier", "vendor"], icon: Users },
  { keywords: ["overview"], icon: LayoutDashboard },
  { keywords: ["role", "permission"], icon: ShieldCheck },
  { keywords: ["access request", "access-request"], icon: KeyRound },
  { keywords: ["audit", "log"], icon: ScrollText },
  { keywords: ["form", "report", "document", "invoice"], icon: FileText },
  { keywords: ["student", "academic", "course", "enrollment"], icon: GraduationCap },
  { keywords: ["setting", "config", "admin"], icon: Settings },
  { keywords: ["user", "people", "staff", "team"], icon: Users },
  { keywords: ["library", "reading", "resource"], icon: BookOpen },
  { keywords: ["dashboard", "app", "menu"], icon: Grid3X3 },
]

function resolveIconFromName(name: string): LucideIcon | undefined {
  const normalized = name.trim().toLowerCase()

  if (!normalized) {
    return undefined
  }

  return NAME_ICON_KEYWORDS.find(({ keywords }) =>
    keywords.some((keyword) => normalized.includes(keyword))
  )?.icon
}

export function resolveMenuIcon(
  icon?: string | null,
  name?: string | null
): LucideIcon {
  if (icon) {
    const normalized = icon.trim()
    const mapped = MENU_ICON_MAP[normalized] ?? MENU_ICON_MAP[normalized.toLowerCase()]

    if (mapped) {
      return mapped
    }
  }

  if (name) {
    const fromName = resolveIconFromName(name)

    if (fromName) {
      return fromName
    }
  }

  return LayoutGrid
}

// Uploaded application icons are stored as a URL (or data URI) rather than a
// keyword key into MENU_ICON_MAP, so this needs to be checked before falling
// back to the Lucide keyword/label lookup above.
export function isImageIconUrl(icon?: string | null): icon is string {
  if (!icon) {
    return false
  }

  return /^(https?:\/\/|\/storage\/|data:image\/)/i.test(icon.trim())
}

export type MenuIconProps = {
  icon?: string | null
  label?: string | null
  className?: string
}

export function MenuIcon({ icon, label, className }: MenuIconProps) {
  if (isImageIconUrl(icon)) {
    return (
      <img
        src={icon}
        alt={label ?? "Application icon"}
        className={cn("object-contain", className)}
      />
    )
  }

  const Icon = resolveMenuIcon(icon, label)

  return <Icon className={className} />
}
