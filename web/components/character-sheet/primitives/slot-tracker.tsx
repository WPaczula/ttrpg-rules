"use client"

import { cn } from "@/lib/utils"

function toggleSlot(marked: number, index: number): number {
  return index < marked ? index : index + 1
}

interface SlotTrackerProps {
  total: number
  marked: number
  onToggle: (n: number) => void
  filledClass: string
  emptyClass: string
  label: string
}

export function SlotTracker({ total, marked, onToggle, filledClass, emptyClass, label }: SlotTrackerProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {Array.from({ length: total }, (_, i) => (
        <button
          key={i}
          onClick={() => onToggle(toggleSlot(marked, i))}
          className={cn(
            "min-w-[44px] min-h-[44px] rounded-md border-2 transition-all active:scale-95 focus:outline-none focus:ring-2 focus:ring-gold/50",
            i < marked ? filledClass : emptyClass
          )}
          aria-label={`${label} slot ${i + 1} ${i < marked ? "(marked)" : "(empty)"}`}
        />
      ))}
    </div>
  )
}
