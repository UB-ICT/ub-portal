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
      className={cn("rounded-2xl border bg-card p-6 shadow-sm", className)}
      {...props}
    >
      {/* Title block */}
      <p className="text-xs font-semibold tracking-wider text-muted-foreground/80 uppercase">
        {timelineTitle}
      </p>

      <div className="relative mt-8 px-4">
        {/* Connecting track line — Uses border token for perfectly adaptive grey */}
        <div className="absolute top-5 right-10 left-10 z-0 h-[1px] bg-border" />

        <div className="relative z-10 flex items-start justify-between gap-2">
          {steps.map((step, index) => {
            const stepNumber = index + 1
            const isCompleted = stepNumber < clampedCurrentStep
            const isCurrent = stepNumber === clampedCurrentStep
            const isPending = stepNumber > clampedCurrentStep

            return (
              <div
                key={`${step.title}-${stepNumber}`}
                className="relative flex flex-1 flex-col items-center"
              >
                {/* Colored Active Line segment */}
                {index > 0 && stepNumber <= clampedCurrentStep && (
                  <div
                    className="absolute z-0 h-[2px] bg-primary"
                    style={{
                      top: "20px",
                      left: "-50%",
                      right: "50%",
                    }}
                  />
                )}

                {/* Step Circle Badge */}
                <div
                  className={cn(
                    "relative z-10 flex size-10 items-center justify-center rounded-full border text-sm font-medium shadow-sm transition-all duration-200",
                    isCompleted &&
                    "border-primary bg-primary text-primary-foreground",
                    isCurrent &&
                    "scale-105 border-amber-500 bg-amber-500 font-semibold text-white",
                    // Pending state now defaults to text-muted-foreground for crisp light-mode contrast
                    isPending &&
                    "border-muted-foreground/30 bg-card text-muted-foreground"
                  )}
                >
                  {isCompleted ? (
                    <Check className="size-4 stroke-[3]" />
                  ) : (
                    stepNumber
                  )}
                </div>

                {/* Status-Driven Labels */}
                <p
                  className={cn(
                    "mt-3 max-w-[120px] text-center text-xs break-words transition-colors duration-200",
                    isCompleted && "font-semibold text-primary",
                    isCurrent && "font-bold text-amber-600 dark:text-amber-400",
                    // Changed from text-slate-400 to text-muted-foreground so it's readable in light and dark mode
                    isPending && "font-medium text-muted-foreground/80"
                  )}
                >
                  {step.title}
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}