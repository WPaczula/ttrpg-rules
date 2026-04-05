"use client"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface CounterProps {
  value: number
  onChange: (v: number) => void
  min?: number
  max?: number
  label: string
  size?: "sm" | "md"
}

export function Counter({ value, onChange, min = 0, max = 99, label, size = "md" }: CounterProps) {
  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="icon"
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        className={cn(
          "border-border bg-input text-foreground hover:bg-secondary shrink-0",
          size === "sm" ? "h-7 w-7" : "h-9 w-9"
        )}
        aria-label={`Decrease ${label}`}
      >
        −
      </Button>
      <span
        className={cn(
          "font-bold text-gold text-center tabular-nums",
          size === "sm" ? "text-lg w-6" : "text-2xl w-8"
        )}
      >
        {value}
      </span>
      <Button
        variant="outline"
        size="icon"
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        className={cn(
          "border-border bg-input text-foreground hover:bg-secondary shrink-0",
          size === "sm" ? "h-7 w-7" : "h-9 w-9"
        )}
        aria-label={`Increase ${label}`}
      >
        +
      </Button>
    </div>
  )
}
