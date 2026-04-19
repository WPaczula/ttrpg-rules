"use client"

import { StepperButton } from "@/components/ui/stepper-button"

interface NumberStepperProps {
  label: string
  value: number
  onChange: (v: number) => void
  min?: number
  max?: number
}

export function NumberStepper({ label, value, onChange, min = 0, max = 20 }: NumberStepperProps) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-muted-foreground flex-1">{label}</span>
      <div className="flex items-center gap-1">
        <StepperButton
          onClick={() => onChange(Math.max(min, value - 1))}
          aria-label={`Decrease ${label}`}
        >
          −
        </StepperButton>
        <span className="w-8 text-center font-bold text-gold tabular-nums">{value}</span>
        <StepperButton
          onClick={() => onChange(Math.min(max, value + 1))}
          aria-label={`Increase ${label}`}
        >
          +
        </StepperButton>
      </div>
    </div>
  )
}
