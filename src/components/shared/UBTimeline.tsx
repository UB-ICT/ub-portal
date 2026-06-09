import { Check } from "lucide-react"
import type * as React from "react"

import { cn } from "@/lib/utils"

export type UBTimelineStep = {
  title: string
}

export type UBTimelineProps = React.HTMLAttributes<HTMLDivElement> & {
  timelineTitle: string
  steps: UBTimelineStep[]
  currentStep: number
}

export function UBTimeline({
  timelineTitle,
  steps,
  currentStep,
  className,
  ...props
}: UBTimelineProps) {
  const totalSteps = steps.length
  const clampedCurrentStep = Math.min(Math.max(currentStep, 1), totalSteps)

  return (
    <div
      className={cn("rounded-2xl border bg-card p-6", className)}
      {...props}
    >
      <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
        {timelineTitle}
      </p>

      <div className="mt-5 overflow-x-auto">
        <div className="min-w-max">
          <div className="flex items-start">
            {steps.map((step, index) => {
              const stepNumber = index + 1
              const isCompleted = stepNumber < clampedCurrentStep
              const isCurrent = stepNumber === clampedCurrentStep
              const isPending = stepNumber > clampedCurrentStep
              const isLast = index === totalSteps - 1

              return (
                <div
                  key={`${step.title}-${stepNumber}`}
                  className={cn(
                  className={cn(
                    "relative flex min-w-[8.75rem] flex-col items-center",
                    !isLast && "pr-8"
                  )}
                  )}
                >
                  {!isLast ? (
                    <div
                      className={cn(
                        "absolute top-5 left-1/2 h-0.5 w-full",
                        stepNumber < clampedCurrentStep
                          ? "bg-primary"
                          : "bg-border"
                      )}
                    />
                  ) : null}

                  <div
                    className={cn(
                      "relative z-10 flex size-10 items-center justify-center rounded-full border text-sm font-semibold",
                      isCompleted && "border-primary bg-primary text-primary-foreground",
                      isCurrent && "border-amber-500 bg-amber-500 text-white",
                      isPending && "border-muted-foreground/40 bg-background text-muted-foreground"
                    )}
                  >
                    {isCompleted ? <Check className="size-4" /> : stepNumber}
                  </div>

                  <p className="mt-3 text-center text-xs font-medium text-muted-foreground">
                    {step.title}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
