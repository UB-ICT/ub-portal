import { create } from "zustand"

import {
  createApplication,
  fetchApplicationCatalog,
  updateApplication,
  type AdminApplicationRecord,
  type ApplicationPayload,
} from "@/lib/api/admin-applications"
import { readStoredAccessToken } from "@/lib/auth/storage"

type AdminApplicationsState = {
  applications: AdminApplicationRecord[]
  total: number
  isLoading: boolean
  isSaving: boolean
  error: string | null
  fetchCatalog: (force?: boolean) => Promise<AdminApplicationRecord[]>
  createApplication: (
    payload: ApplicationPayload
  ) => Promise<AdminApplicationRecord | null>
  updateApplication: (
    id: string,
    payload: Partial<ApplicationPayload>
  ) => Promise<AdminApplicationRecord | null>
  reset: () => void
}

const initialState = {
  applications: [] as AdminApplicationRecord[],
  total: 0,
  isLoading: false,
  isSaving: false,
  error: null as string | null,
}

let catalogFetchPromise: Promise<AdminApplicationRecord[]> | null = null

function sortApplications(applications: AdminApplicationRecord[]) {
  return [...applications].sort((left, right) => left.sort_order - right.sort_order)
}

function upsertApplication(
  applications: AdminApplicationRecord[],
  application: AdminApplicationRecord
) {
  const exists = applications.some((item) => item.id === application.id)

  if (!exists) {
    return sortApplications([...applications, application])
  }

  return sortApplications(
    applications.map((item) =>
      item.id === application.id ? application : item
    )
  )
}

export const useAdminApplicationsStore = create<AdminApplicationsState>(
  (set, get) => ({
    ...initialState,
    fetchCatalog: async (force = false) => {
      if (!force && get().applications.length > 0 && !get().isLoading) {
        return get().applications
      }

      if (catalogFetchPromise) {
        return catalogFetchPromise
      }

      const token = readStoredAccessToken()

      if (!token) {
        set({ applications: [], total: 0, isLoading: false, error: null })
        return []
      }

      catalogFetchPromise = (async () => {
        set({ isLoading: true, error: null })

        try {
          const { applications, total } = await fetchApplicationCatalog()
          set({
            applications: sortApplications(applications),
            total,
            isLoading: false,
            error: null,
          })
          return applications
        } catch (error) {
          set({
            applications: [],
            total: 0,
            isLoading: false,
            error:
              error instanceof Error
                ? error.message
                : "Failed to load applications.",
          })
          return []
        } finally {
          catalogFetchPromise = null
        }
      })()

      return catalogFetchPromise
    },
    createApplication: async (payload) => {
      set({ isSaving: true, error: null })

      try {
        const application = await createApplication(payload)
        set((state) => ({
          applications: upsertApplication(state.applications, application),
          total: state.total + 1,
          isSaving: false,
          error: null,
        }))
        return application
      } catch (error) {
        set({
          isSaving: false,
          error:
            error instanceof Error
              ? error.message
              : "Failed to create application.",
        })
        return null
      }
    },
    updateApplication: async (id, payload) => {
      set({ isSaving: true, error: null })

      try {
        const application = await updateApplication(id, payload)
        set((state) => ({
          applications: upsertApplication(state.applications, application),
          isSaving: false,
          error: null,
        }))
        return application
      } catch (error) {
        console.error("Failed to update application:", error)
        set({
          isSaving: false,
          error:
            error instanceof Error
              ? error.message
              : "Failed to update application.",
        })
        return null
      }
    },
    reset: () => {
      catalogFetchPromise = null
      set(initialState)
    },
  })
)
