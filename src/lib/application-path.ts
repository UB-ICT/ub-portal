import type { PortalApplication, PortalMenuItem } from "@/lib/api/menu"

function normalizePath(path: string) {
  if (!path) {
    return "/"
  }

  const withLeadingSlash = path.startsWith("/") ? path : `/${path}`

  if (withLeadingSlash.length > 1 && withLeadingSlash.endsWith("/")) {
    return withLeadingSlash.slice(0, -1)
  }

  return withLeadingSlash
}

export function normalizeRoutePath(path: string) {
  return normalizePath(path)
}

export function resolveMenuItemRoute(
  menuItemPath: string,
  applicationPath?: string
) {
  if (/^https?:\/\//i.test(menuItemPath)) {
    return menuItemPath
  }

  const normalizedItem = normalizePath(menuItemPath)

  if (!applicationPath) {
    return normalizedItem
  }

  const normalizedApp = normalizePath(applicationPath)

  if (normalizedApp === "/") {
    return normalizedItem
  }

  if (
    normalizedItem === normalizedApp ||
    normalizedItem.startsWith(`${normalizedApp}/`)
  ) {
    return normalizedItem
  }

  const relativeSegment = menuItemPath.replace(/^\/+/, "")
  return normalizePath(`${normalizedApp}/${relativeSegment}`)
}

export function resolveActiveDrawerItemId(
  items: Array<{
    id: string
    to?: string
    href?: string
    active?: boolean
  }>,
  pathname: string
) {
  const explicitActiveItem = items.find((item) => item.active === true)

  if (explicitActiveItem) {
    return explicitActiveItem.id
  }

  const normalizedPathname = normalizePath(pathname)
  let bestMatch: { id: string; score: number } | null = null

  for (const item of items) {
    if (item.active === false || !item.to) {
      continue
    }

    const itemPath = normalizePath(item.to)
    let score: number | null = null

    if (itemPath === "/") {
      if (normalizedPathname === "/") {
        score = 1
      }
    } else if (normalizedPathname === itemPath) {
      score = 10_000 + itemPath.length
    } else if (normalizedPathname.startsWith(`${itemPath}/`)) {
      score = itemPath.length
    }

    if (score !== null && (!bestMatch || score > bestMatch.score)) {
      bestMatch = { id: item.id, score }
    }
  }

  return bestMatch?.id ?? null
}

function matchesApplicationPath(pathname: string, applicationPath: string) {
  if (applicationPath === "/") {
    return pathname === "/"
  }

  return (
    pathname === applicationPath || pathname.startsWith(`${applicationPath}/`)
  )
}

export function resolveApplicationForPath(
  pathname: string,
  applications: PortalApplication[]
) {
  if (applications.length === 0) {
    return undefined
  }

  const normalizedPath = normalizePath(pathname)
  const sortedApplications = [...applications].sort(
    (left, right) =>
      normalizePath(right.path).length - normalizePath(left.path).length
  )

  const matchedApplication = sortedApplications.find((application) =>
    matchesApplicationPath(
      normalizedPath,
      normalizePath(application.path)
    )
  )

  if (matchedApplication) {
    return matchedApplication
  }

  return undefined
}

export function matchesMenuItemPath(pathname: string, menuItemPath: string) {
  const normalizedPath = normalizePath(pathname)
  const normalizedMenuPath = normalizePath(menuItemPath)

  if (normalizedMenuPath === "/") {
    return normalizedPath === "/"
  }

  return (
    normalizedPath === normalizedMenuPath ||
    normalizedPath.startsWith(`${normalizedMenuPath}/`)
  )
}

export function resolveApplicationForMenuPath(
  pathname: string,
  applications: PortalApplication[],
  menusByApplicationId: Record<string, PortalMenuItem[]>
) {
  const sortedApplications = [...applications].sort(
    (left, right) => left.sort_order - right.sort_order
  )

  return sortedApplications.find((application) => {
    const menuItems = menusByApplicationId[application.id] ?? []

    return menuItems.some((menuItem) =>
      matchesMenuItemPath(pathname, menuItem.path)
    )
  })
}
