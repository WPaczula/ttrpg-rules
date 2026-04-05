"use client"

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
        <button
          onClick={() => onChange(Math.max(min, value - 1))}
          className="w-7 h-7 flex items-center justify-center rounded border border-border bg-input text-foreground hover:bg-secondary active:scale-95 text-sm"
          aria-label={`Decrease ${label}`}
        >
          −
        </button>
        <span className="w-8 text-center font-bold text-gold tabular-nums">{value}</span>
        <button
          onClick={() => onChange(Math.min(max, value + 1))}
          className="w-7 h-7 flex items-center justify-center rounded border border-border bg-input text-foreground hover:bg-secondary active:scale-95 text-sm"
          aria-label={`Increase ${label}`}
        >
          +
        </button>
      </div>
    </div>
  )
}
