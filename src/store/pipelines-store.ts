import { create } from "zustand"

import {
  createPipeline,
  deletePipeline,
  fetchPipeline,
  fetchPipelines,
  syncPipelineStages,
  syncStageUsers as syncStageUsersRequest,
  updatePipeline,
  type PipelinePayload,
  type PipelineStagePayload,
} from "@/lib/api/pipelines"
import type { Pipeline } from "@/lib/api/requisitions"
import { readStoredAccessToken } from "@/lib/auth/storage"

type PipelinesState = {
  pipelines: Pipeline[]
  selectedPipeline: Pipeline | null
  isLoading: boolean
  isSaving: boolean
  error: string | null
  fetchPipelines: (force?: boolean) => Promise<Pipeline[]>
  fetchPipelineById: (id: number) => Promise<Pipeline | null>
  createPipeline: (payload: PipelinePayload) => Promise<Pipeline | null>
  updatePipeline: (
    id: number,
    payload: PipelinePayload
  ) => Promise<Pipeline | null>
  deletePipeline: (id: number) => Promise<boolean>
  syncStages: (
    pipelineId: number,
    stages: PipelineStagePayload[]
  ) => Promise<Pipeline | null>
  syncStageUsers: (
    stageId: number,
    userIds: string[]
  ) => Promise<Pipeline | null>
  selectPipeline: (pipeline: Pipeline | null) => void
  reset: () => void
}

const initialState = {
  pipelines: [] as Pipeline[],
  selectedPipeline: null as Pipeline | null,
  isLoading: false,
  isSaving: false,
  error: null as string | null,
}

let pipelinesFetchPromise: Promise<Pipeline[]> | null = null

function sortPipelines(pipelines: Pipeline[]) {
  return [...pipelines].sort((left, right) =>
    left.name.localeCompare(right.name)
  )
}

function upsertPipeline(pipelines: Pipeline[], pipeline: Pipeline) {
  const exists = pipelines.some((item) => item.id === pipeline.id)

  if (!exists) {
    return sortPipelines([...pipelines, pipeline])
  }

  return sortPipelines(
    pipelines.map((item) => (item.id === pipeline.id ? pipeline : item))
  )
}

export const usePipelinesStore = create<PipelinesState>((set, get) => ({
  ...initialState,
  fetchPipelines: async (force = false) => {
    if (!force && get().pipelines.length > 0 && !get().isLoading) {
      return get().pipelines
    }

    if (pipelinesFetchPromise) {
      return pipelinesFetchPromise
    }

    const token = readStoredAccessToken()

    if (!token) {
      set({ pipelines: [], isLoading: false, error: null })
      return []
    }

    pipelinesFetchPromise = (async () => {
      set({ isLoading: true, error: null })

      try {
        const pipelines = sortPipelines(await fetchPipelines())
        const selectedId = get().selectedPipeline?.id
        const selectedPipeline = selectedId
          ? (pipelines.find((item) => item.id === selectedId) ?? null)
          : get().selectedPipeline

        set({
          pipelines,
          selectedPipeline,
          isLoading: false,
          error: null,
        })
        return pipelines
      } catch (error) {
        set({
          pipelines: [],
          isLoading: false,
          error:
            error instanceof Error
              ? error.message
              : "Failed to load pipelines.",
        })
        return []
      } finally {
        pipelinesFetchPromise = null
      }
    })()

    return pipelinesFetchPromise
  },
  fetchPipelineById: async (id) => {
    set({ isSaving: true, error: null })

    try {
      const pipeline = await fetchPipeline(id)
      set((state) => ({
        pipelines: upsertPipeline(state.pipelines, pipeline),
        selectedPipeline: pipeline,
        isSaving: false,
        error: null,
      }))
      return pipeline
    } catch (error) {
      set({
        isSaving: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to load pipeline.",
      })
      return null
    }
  },
  createPipeline: async (payload) => {
    set({ isSaving: true, error: null })

    try {
      const pipeline = await createPipeline(payload)
      set((state) => ({
        pipelines: upsertPipeline(state.pipelines, pipeline),
        selectedPipeline: pipeline,
        isSaving: false,
        error: null,
      }))
      return pipeline
    } catch (error) {
      set({
        isSaving: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to create pipeline.",
      })
      return null
    }
  },
  updatePipeline: async (id, payload) => {
    set({ isSaving: true, error: null })

    try {
      const pipeline = await updatePipeline(id, payload)
      set((state) => ({
        pipelines: upsertPipeline(state.pipelines, pipeline),
        selectedPipeline:
          state.selectedPipeline?.id === id
            ? pipeline
            : state.selectedPipeline,
        isSaving: false,
        error: null,
      }))
      return pipeline
    } catch (error) {
      set({
        isSaving: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to update pipeline.",
      })
      return null
    }
  },
  deletePipeline: async (id) => {
    set({ isSaving: true, error: null })

    try {
      await deletePipeline(id)
      set((state) => ({
        pipelines: state.pipelines.filter((item) => item.id !== id),
        selectedPipeline:
          state.selectedPipeline?.id === id ? null : state.selectedPipeline,
        isSaving: false,
        error: null,
      }))
      return true
    } catch (error) {
      set({
        isSaving: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to delete pipeline.",
      })
      return false
    }
  },
  syncStages: async (pipelineId, stages) => {
    set({ isSaving: true, error: null })

    try {
      const pipeline = await syncPipelineStages(pipelineId, stages)
      set((state) => ({
        pipelines: upsertPipeline(state.pipelines, pipeline),
        selectedPipeline:
          state.selectedPipeline?.id === pipelineId
            ? pipeline
            : state.selectedPipeline,
        isSaving: false,
        error: null,
      }))
      return pipeline
    } catch (error) {
      set({
        isSaving: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to update stages.",
      })
      return null
    }
  },
  syncStageUsers: async (stageId, userIds) => {
    set({ isSaving: true, error: null })

    try {
      const result = await syncStageUsersRequest(stageId, userIds)
      const selected = get().selectedPipeline

      if (!selected) {
        set({ isSaving: false })
        return null
      }

      const pipeline: Pipeline = {
        ...selected,
        stages: (selected.stages ?? []).map((stage) =>
          stage.id === stageId
            ? { ...stage, users: result.users }
            : stage
        ),
      }

      set((state) => ({
        pipelines: upsertPipeline(state.pipelines, pipeline),
        selectedPipeline: pipeline,
        isSaving: false,
        error: null,
      }))
      return pipeline
    } catch (error) {
      set({
        isSaving: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to update stage users.",
      })
      return null
    }
  },
  selectPipeline: (pipeline) => set({ selectedPipeline: pipeline }),
  reset: () => set(initialState),
}))
