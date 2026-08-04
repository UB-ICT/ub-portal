export const DEFAULT_PORTAL_APP_PATH = "/requisitions"

export function resolveDefaultAppPath(
  defaultApplication?: { path?: string | null } | null
) {
  const path = defaultApplication?.path?.trim()

  if (path) {
    return path.startsWith("/") ? path : `/${path}`
  }

  return DEFAULT_PORTAL_APP_PATH
}
