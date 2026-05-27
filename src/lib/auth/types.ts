export type StoredAuthProfile = {
  name: string
  email: string
  system?: string | null
}

export type PortalMenu = Record<string, unknown> & {
  id?: number | string
  label?: string
  name?: string
  title?: string
  path?: string
  route?: string
  href?: string
  url?: string
}

export type PortalUser = {
  id: number | string
  name: string
  email: string
  email_verified_at?: string | null
  google_id?: string | null
  user_status_id?: number | string | null
  profile_picture?: string | null
  mailing_groups?: string[]
  menus?: PortalMenu[]
  forms?: unknown[]
  tables?: unknown[]
}

export type PortalSessionResponse = {
  user: PortalUser
  menus: PortalMenu[]
}

export type AuthCallbackState =
  | { status: "idle" }
  | { status: "success" }
  | { status: "error"; message: string }
