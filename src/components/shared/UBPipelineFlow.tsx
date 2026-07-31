import type * as React from "react"

import { cn } from "@/lib/utils"
import { UBArrowStage } from "./UBArrowStage"

export type UBPipelineFlowStage = {
  id: string | number
  label: string
  sequence?: number
  userCount?: number
}

export type UBPipelineFlowProps = React.HTMLAttributes<HTMLDivElement> & {
  stages: UBPipelineFlowStage[]
  selectedStageId?: string | number | null
  onStageSelect?: (stageId: string | number) => void
  emptyLabel?: string
}

export function UBPipelineFlow({
  stages,
  selectedStageId,
  onStageSelect,
  emptyLabel = "No stages yet",
  className,
  ...props
}: UBPipelineFlowProps) {
  if (stages.length === 0) {
    return (
      <div
        className={cn(
          "rounded-2xl border border-dashed bg-muted/20 px-6 py-10 text-center text-sm text-muted-foreground",
          className
        )}
        {...props}
      >
        {emptyLabel}
      </div>
    )
  }

  return (
    <div
      className={cn(
        "flex flex-wrap items-stretch gap-0 overflow-x-auto rounded-2xl border bg-card p-4 shadow-sm",
        className
      )}
      {...props}
    >
      {stages.map((stage, index) => (
        <UBArrowStage
          key={stage.id}
          label={stage.label}
          sequence={stage.sequence ?? index + 1}
          userCount={stage.userCount}
          selected={selectedStageId === stage.id}
          isFirst={index === 0}
          isLast={index === stages.length - 1}
          className={index > 0 ? "-ml-3" : undefined}
          onClick={() => onStageSelect?.(stage.id)}
        />
      ))}
    </div>
  )
}
