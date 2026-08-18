import {
  ChevronLeft,
  ChevronRight,
  Pencil,
  Plus,
  Trash2,
  UserMinus,
  UserPlus,
} from "lucide-react"
import { useEffect, useMemo, useState, type FormEvent } from "react"

import { UBButton } from "@/components/shared/UBButton"
import { UBInput } from "@/components/shared/UBInput"
import { UBPageHeader } from "@/components/shared/UBPageHeader"
import { UBPipelineFlow } from "@/components/shared/UBPipelineFlow"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import type { Pipeline, PipelineStage } from "@/lib/api/requisitions"
import { cn } from "@/lib/utils"
import { useAdminUsersStore } from "@/store/admin-users-store"
import { usePipelinesStore } from "@/store/pipelines-store"

function stageSequence(stage: PipelineStage, index: number) {
  return stage.sequence ?? stage.pivot?.sequence ?? index + 1
}

function sortedStages(pipeline: Pipeline | null) {
  return [...(pipeline?.stages ?? [])].sort(
    (left, right) =>
      stageSequence(left, 0) - stageSequence(right, 0)
  )
}

function toStagePayloads(stages: PipelineStage[]) {
  return stages.map((stage, index) => ({
    ...(stage.id > 0 ? { id: stage.id } : {}),
    name: stage.name,
    sequence: index + 1,
    user_ids: (stage.users ?? []).map((user) => user.id),
  }))
}

export function PORPipelinesPage() {
  const pipelines = usePipelinesStore((state) => state.pipelines)
  const selectedPipeline = usePipelinesStore((state) => state.selectedPipeline)
  const isLoading = usePipelinesStore((state) => state.isLoading)
  const isSaving = usePipelinesStore((state) => state.isSaving)
  const error = usePipelinesStore((state) => state.error)
  const fetchPipelines = usePipelinesStore((state) => state.fetchPipelines)
  const fetchPipelineById = usePipelinesStore((state) => state.fetchPipelineById)
  const createPipeline = usePipelinesStore((state) => state.createPipeline)
  const updatePipeline = usePipelinesStore((state) => state.updatePipeline)
  const deletePipeline = usePipelinesStore((state) => state.deletePipeline)
  const syncStages = usePipelinesStore((state) => state.syncStages)
  const syncStageUsers = usePipelinesStore((state) => state.syncStageUsers)

  const users = useAdminUsersStore((state) => state.users)
  const fetchUsers = useAdminUsersStore((state) => state.fetchUsers)

  const [pipelineDialogOpen, setPipelineDialogOpen] = useState(false)
  const [editingPipeline, setEditingPipeline] = useState<Pipeline | null>(null)
  const [pipelineName, setPipelineName] = useState("")
  const [formError, setFormError] = useState<string | null>(null)

  const [selectedStageId, setSelectedStageId] = useState<number | null>(null)
  const [stageNameDraft, setStageNameDraft] = useState("")
  const [newStageName, setNewStageName] = useState("")
  const [userSearch, setUserSearch] = useState("")

  useEffect(() => {
    void fetchPipelines()
    void fetchUsers()
  }, [fetchPipelines, fetchUsers])

  useEffect(() => {
    if (!selectedPipeline && pipelines.length > 0) {
      void fetchPipelineById(pipelines[0].id)
    }
  }, [pipelines, selectedPipeline, fetchPipelineById])

  const stages = useMemo(
    () => sortedStages(selectedPipeline),
    [selectedPipeline]
  )

  const selectedStage = useMemo(
    () => stages.find((stage) => stage.id === selectedStageId) ?? null,
    [stages, selectedStageId]
  )

  useEffect(() => {
    if (!selectedStage) {
      setStageNameDraft("")
      return
    }

    setStageNameDraft(selectedStage.name)
  }, [selectedStage])

  useEffect(() => {
    if (
      selectedStageId != null &&
      !stages.some((stage) => stage.id === selectedStageId)
    ) {
      setSelectedStageId(null)
    }
  }, [stages, selectedStageId])

  const filteredUsers = useMemo(() => {
    const query = userSearch.trim().toLowerCase()
    if (!query) {
      return users
    }

    return users.filter(
      (user) =>
        user.name.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query)
    )
  }, [users, userSearch])

  const openCreatePipeline = () => {
    setEditingPipeline(null)
    setPipelineName("")
    setFormError(null)
    setPipelineDialogOpen(true)
  }

  const openRenamePipeline = (pipeline: Pipeline) => {
    setEditingPipeline(pipeline)
    setPipelineName(pipeline.name)
    setFormError(null)
    setPipelineDialogOpen(true)
  }

  const handleSelectPipeline = async (pipeline: Pipeline) => {
    setSelectedStageId(null)
    await fetchPipelineById(pipeline.id)
  }

  const handleSavePipeline = async (event: FormEvent) => {
    event.preventDefault()
    setFormError(null)

    const name = pipelineName.trim()
    if (!name) {
      setFormError("Pipeline name is required.")
      return
    }

    const saved = editingPipeline
      ? await updatePipeline(editingPipeline.id, { name })
      : await createPipeline({ name, stages: [] })

    if (!saved) {
      return
    }

    setPipelineDialogOpen(false)
  }

  const handleDeletePipeline = async (pipeline: Pipeline) => {
    const confirmed = window.confirm(
      `Delete pipeline "${pipeline.name}"? Stages stay available for other pipelines.`
    )

    if (!confirmed) {
      return
    }

    await deletePipeline(pipeline.id)
    setSelectedStageId(null)
  }

  const persistStages = async (nextStages: PipelineStage[]) => {
    if (!selectedPipeline) {
      return null
    }

    return syncStages(selectedPipeline.id, toStagePayloads(nextStages))
  }

  const handleAddStage = async () => {
    const name = newStageName.trim()
    if (!selectedPipeline || !name) {
      return
    }

    const nextStages: PipelineStage[] = [
      ...stages,
      {
        id: 0,
        name,
        sequence: stages.length + 1,
        users: [],
      },
    ]

    const saved = await persistStages(nextStages)
    if (saved) {
      setNewStageName("")
      const last = sortedStages(saved).at(-1)
      if (last) {
        setSelectedStageId(last.id)
      }
    }
  }

  const handleRenameStage = async () => {
    if (!selectedStage) {
      return
    }

    const name = stageNameDraft.trim()
    if (!name) {
      return
    }

    const nextStages = stages.map((stage) =>
      stage.id === selectedStage.id ? { ...stage, name } : stage
    )

    await persistStages(nextStages)
  }

  const handleRemoveStage = async () => {
    if (!selectedStage) {
      return
    }

    const confirmed = window.confirm(
      `Remove stage "${selectedStage.name}" from this pipeline?`
    )

    if (!confirmed) {
      return
    }

    const nextStages = stages.filter((stage) => stage.id !== selectedStage.id)
    const saved = await persistStages(nextStages)
    if (saved) {
      setSelectedStageId(null)
    }
  }

  const handleMoveStage = async (direction: -1 | 1) => {
    if (!selectedStage) {
      return
    }

    const index = stages.findIndex((stage) => stage.id === selectedStage.id)
    const target = index + direction

    if (index < 0 || target < 0 || target >= stages.length) {
      return
    }

    const nextStages = [...stages]
    const [moved] = nextStages.splice(index, 1)
    nextStages.splice(target, 0, moved)

    await persistStages(nextStages)
  }

  const handleToggleUser = async (userId: string) => {
    if (!selectedStage || selectedStage.id <= 0) {
      return
    }

    const currentIds = (selectedStage.users ?? []).map((user) => user.id)
    const nextIds = currentIds.includes(userId)
      ? currentIds.filter((id) => id !== userId)
      : [...currentIds, userId]

    await syncStageUsers(selectedStage.id, nextIds)
  }

  return (
    <div className="flex h-full min-h-0 flex-col gap-4 overflow-hidden">
      <UBPageHeader
        title="Pipelines"
        description="Configure approval pipelines, stage order, and stage assignees."
        actions={
          <UBButton size="sm" onClick={openCreatePipeline}>
            <Plus className="size-4" data-icon="inline-start" />
            Add pipeline
          </UBButton>
        }
      />

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <div className="grid min-h-0 flex-1 gap-4 overflow-hidden lg:grid-cols-[16rem_minmax(0,1fr)]">
        <aside className="flex min-h-0 flex-col gap-2 overflow-y-auto overscroll-y-contain rounded-2xl border bg-card p-3">
          <p className="px-1 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
            Pipelines
          </p>
          {isLoading && pipelines.length === 0 ? (
            <p className="px-2 py-6 text-sm text-muted-foreground">Loading…</p>
          ) : null}
          {!isLoading && pipelines.length === 0 ? (
            <p className="px-2 py-6 text-sm text-muted-foreground">
              No pipelines yet.
            </p>
          ) : null}
          {pipelines.map((pipeline) => {
            const active = selectedPipeline?.id === pipeline.id

            return (
              <div
                key={pipeline.id}
                className={cn(
                  "cursor-pointer rounded-xl border px-3 py-2 transition-colors",
                  active
                    ? "border-primary bg-primary/5"
                    : "border-transparent hover:border-border hover:bg-muted/40"
                )}
              >
                <button
                  type="button"
                  className="w-full cursor-pointer text-left"
                  onClick={() => void handleSelectPipeline(pipeline)}
                >
                  <span className="block text-sm font-medium">
                    {pipeline.name}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {(pipeline.stages ?? []).length} stages
                  </span>
                </button>
                <div className="mt-2 flex gap-1">
                  <UBButton
                    type="button"
                    size="sm"
                    variant="ghost"
                    className="h-7 px-2"
                    onClick={() => openRenamePipeline(pipeline)}
                  >
                    <Pencil className="size-3.5" />
                  </UBButton>
                  <UBButton
                    type="button"
                    size="sm"
                    variant="ghost"
                    className="h-7 px-2 text-destructive"
                    onClick={() => void handleDeletePipeline(pipeline)}
                  >
                    <Trash2 className="size-3.5" />
                  </UBButton>
                </div>
              </div>
            )
          })}
        </aside>

        <section className="flex min-h-0 flex-col gap-4 overflow-y-auto overscroll-y-contain">
          {!selectedPipeline ? (
            <div className="rounded-2xl border border-dashed px-6 py-16 text-center text-sm text-muted-foreground">
              Select or create a pipeline to manage its stages.
            </div>
          ) : (
            <>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-base font-semibold">
                    {selectedPipeline.name}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Click a stage arrow to edit name, order, or users.
                  </p>
                </div>
                <div className="flex flex-wrap items-end gap-2">
                  <UBInput
                    label="New stage"
                    value={newStageName}
                    onChange={(event) => setNewStageName(event.target.value)}
                    placeholder="Stage name"
                    className="min-w-[12rem]"
                  />
                  <UBButton
                    size="sm"
                    disabled={isSaving || !newStageName.trim()}
                    onClick={() => void handleAddStage()}
                  >
                    <Plus className="size-4" data-icon="inline-start" />
                    Add stage
                  </UBButton>
                </div>
              </div>

              <UBPipelineFlow
                stages={stages.map((stage, index) => ({
                  id: stage.id,
                  label: stage.name,
                  sequence: stageSequence(stage, index),
                  userCount: (stage.users ?? []).length,
                }))}
                selectedStageId={selectedStageId}
                onStageSelect={(id) => setSelectedStageId(Number(id))}
              />

              {selectedStage ? (
                <div className="grid gap-4 rounded-2xl border bg-card p-4 shadow-sm lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
                  <div className="space-y-3">
                    <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                      Stage settings
                    </p>
                    <UBInput
                      label="Stage name"
                      value={stageNameDraft}
                      onChange={(event) =>
                        setStageNameDraft(event.target.value)
                      }
                    />
                    <div className="flex flex-wrap gap-2">
                      <UBButton
                        size="sm"
                        variant="outline"
                        disabled={isSaving}
                        onClick={() => void handleRenameStage()}
                      >
                        Save name
                      </UBButton>
                      <UBButton
                        size="sm"
                        variant="outline"
                        disabled={
                          isSaving ||
                          stages[0]?.id === selectedStage.id
                        }
                        onClick={() => void handleMoveStage(-1)}
                      >
                        <ChevronLeft className="size-4" data-icon="inline-start" />
                        Move left
                      </UBButton>
                      <UBButton
                        size="sm"
                        variant="outline"
                        disabled={
                          isSaving ||
                          stages.at(-1)?.id === selectedStage.id
                        }
                        onClick={() => void handleMoveStage(1)}
                      >
                        Move right
                        <ChevronRight className="size-4" data-icon="inline-end" />
                      </UBButton>
                      <UBButton
                        size="sm"
                        variant="destructive"
                        disabled={isSaving}
                        onClick={() => void handleRemoveStage()}
                      >
                        <Trash2 className="size-4" data-icon="inline-start" />
                        Remove
                      </UBButton>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                      Stage users
                    </p>
                    <UBInput
                      label="Search users"
                      value={userSearch}
                      onChange={(event) => setUserSearch(event.target.value)}
                      placeholder="Name or email"
                    />
                    <div className="max-h-64 space-y-1 overflow-y-auto rounded-xl border p-2">
                      {filteredUsers.length === 0 ? (
                        <p className="px-2 py-4 text-sm text-muted-foreground">
                          No users found.
                        </p>
                      ) : (
                        filteredUsers.map((user) => {
                          const assigned = (selectedStage.users ?? []).some(
                            (item) => item.id === user.id
                          )

                          return (
                            <div
                              key={user.id}
                              className={cn(
                                "flex items-center justify-between gap-2 rounded-lg px-2 py-2",
                                assigned ? "bg-primary/5" : "hover:bg-muted/50"
                              )}
                            >
                              <div className="min-w-0">
                                <p className="truncate text-sm font-medium">
                                  {user.name}
                                </p>
                                <p className="truncate text-xs text-muted-foreground">
                                  {user.email}
                                </p>
                              </div>
                              <UBButton
                                size="sm"
                                variant={assigned ? "secondary" : "outline"}
                                className="shrink-0"
                                disabled={isSaving}
                                onClick={() => void handleToggleUser(user.id)}
                              >
                                {assigned ? (
                                  <>
                                    <UserMinus
                                      className="size-3.5"
                                      data-icon="inline-start"
                                    />
                                    Remove
                                  </>
                                ) : (
                                  <>
                                    <UserPlus
                                      className="size-3.5"
                                      data-icon="inline-start"
                                    />
                                    Add
                                  </>
                                )}
                              </UBButton>
                            </div>
                          )
                        })
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Select a stage arrow to manage its details and users.
                </p>
              )}
            </>
          )}
        </section>
      </div>

      <Dialog open={pipelineDialogOpen} onOpenChange={setPipelineDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingPipeline ? "Rename pipeline" : "Add pipeline"}
            </DialogTitle>
            <DialogDescription>
              {editingPipeline
                ? "Update the pipeline display name."
                : "Create a pipeline, then add and order its stages."}
            </DialogDescription>
          </DialogHeader>
          <form className="space-y-4" onSubmit={(event) => void handleSavePipeline(event)}>
            <UBInput
              label="Name"
              value={pipelineName}
              onChange={(event) => setPipelineName(event.target.value)}
              placeholder="e.g. Purchase requisition"
              autoFocus
            />
            {formError ? (
              <p className="text-sm text-destructive">{formError}</p>
            ) : null}
            <div className="flex justify-end gap-2">
              <UBButton
                type="button"
                variant="outline"
                onClick={() => setPipelineDialogOpen(false)}
              >
                Cancel
              </UBButton>
              <UBButton type="submit" disabled={isSaving}>
                {editingPipeline ? "Save" : "Create"}
              </UBButton>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
