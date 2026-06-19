import type { Pipeline, PipelineStage } from "@/lib/api/requisitions"
import type { UBTimelineStep } from "@/components/shared/UBTimeline"

export function sortPipelineStagesBySequence(
  stages: PipelineStage[]
): PipelineStage[] {
  return [...stages].sort(
    (a, b) => (a.pivot?.sequence ?? 0) - (b.pivot?.sequence ?? 0)
  )
}

export function mapPipelineToTimelineSteps(
  pipeline?: Pipeline | null
): UBTimelineStep[] {
  if (!pipeline?.stages?.length) {
    return []
  }

  return sortPipelineStagesBySequence(pipeline.stages).map((stage) => ({
    title: stage.name,
  }))
}
