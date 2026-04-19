"use client"

import { FieldLabel } from "@/components/ui/field-label"
import { StepperButton } from "@/components/ui/stepper-button"
import { formatModifier } from "@/lib/character-types"

interface TraitStepperProps {
  label: string
  value: number
  onChange: (v: number) => void
}

export function TraitStepper({ label, value, onChange }: TraitStepperProps) {
  return (
    <div className="flex items-center justify-between bg-purple-deep/50 border border-border rounded-lg px-3 py-2">
      <FieldLabel className="w-10 font-normal">{label}</FieldLabel>
      <div className="flex items-center gap-2">
        <StepperButton
          onClick={() => onChange(Math.max(-3, value - 1))}
          aria-label={`Decrease ${label}`}
        >
          −
        </StepperButton>
        <span className="w-8 text-center font-bold text-gold tabular-nums">
          {formatModifier(value)}
        </span>
        <StepperButton
          onClick={() => onChange(Math.min(5, value + 1))}
          aria-label={`Increase ${label}`}
        >
          +
        </StepperButton>
      </div>
    </div>
  )
}
