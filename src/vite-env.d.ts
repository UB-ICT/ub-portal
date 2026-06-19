/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_ENV: "local" | "development" | "production"
  readonly VITE_APP_TITLE: string
  readonly VITE_API_HOST: string
  readonly VITE_API_BASE_URL: string
  readonly VITE_GOOGLE_SSO_SYSTEM: string
  readonly VITE_PORTAL_HOST: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
