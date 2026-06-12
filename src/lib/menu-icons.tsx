import type { LucideIcon } from "lucide-react"
import {
  BookOpen,
  ClipboardList,
  FileText,
  GraduationCap,
  Grid3X3,
  LayoutGrid,
  Settings,
  Users,
} from "lucide-react"

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
  "layout-grid": LayoutGrid,
  LayoutGrid,
  settings: Settings,
  Settings,
  users: Users,
  Users,
}

export function resolveMenuIcon(icon?: string | null): LucideIcon {
  if (!icon) {
    return LayoutGrid
  }

  const normalized = icon.trim()

  return (
    MENU_ICON_MAP[normalized] ??
    MENU_ICON_MAP[normalized.toLowerCase()] ??
    LayoutGrid
  )
}
