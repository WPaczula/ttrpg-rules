"use client"

import { formatModifier } from "@/lib/character-types"

interface TraitStepperProps {
  label: string
  value: number
  onChange: (v: number) => void
}

export function TraitStepper({ label, value, onChange }: TraitStepperProps) {
  return (
    <div className="flex items-center justify-between bg-purple-deep/50 border border-border rounded-lg px-3 py-2">
      <span className="text-xs text-muted-foreground uppercase tracking-wider w-10">{label}</span>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onChange(Math.max(-3, value - 1))}
          className="w-7 h-7 flex items-center justify-center rounded border border-border bg-input text-foreground hover:bg-secondary active:scale-95 text-sm"
          aria-label={`Decrease ${label}`}
        >
          −
        </button>
        <span className="w-8 text-center font-bold text-gold tabular-nums">
          {formatModifier(value)}
        </span>
        <button
          onClick={() => onChange(Math.min(5, value + 1))}
          className="w-7 h-7 flex items-center justify-center rounded border border-border bg-input text-foreground hover:bg-secondary active:scale-95 text-sm"
          aria-label={`Increase ${label}`}
        >
          +
        </button>
      </div>
    </div>
  )
}
