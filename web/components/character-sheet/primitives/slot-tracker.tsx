"use client"

import { cn } from "@/lib/utils"

function toggleSlot(marked: number, index: number): number {
  return index < marked ? index : index + 1
}

interface SlotTrackerProps {
  total: number
  marked: number
  onToggle: (n: number) => void
  /** optional override: extra classes applied when a box is checked */
  filledClass?: string
  /** optional override: extra classes applied when a box is empty */
  emptyClass?: string
  /** variant affects checked color: 'hp' | 'stress' | 'armor' */
  variant?: "hp" | "stress" | "armor"
  /** boxes from this index onward render with dashed (severe) style (HP only) */
  severeFromIndex?: number
  label: string
}

export function SlotTracker({
  total,
  marked,
  onToggle,
  filledClass,
  emptyClass,
  variant = "armor",
  severeFromIndex,
  label,
}: SlotTrackerProps) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {Array.from({ length: total }, (_, i) => {
        const isChecked = i < marked
        const isSevere = severeFromIndex !== undefined && i >= severeFromIndex
        return (
          <button
            key={i}
            onClick={() => onToggle(toggleSlot(marked, i))}
            className={cn(
              "dh-check-box",
              isChecked && "is-checked",
              isSevere && "is-severe",
              variant === "stress" && "is-stress",
              variant === "armor" && "is-armor",
              isChecked && filledClass,
              !isChecked && emptyClass
            )}
            aria-label={`${label} slot ${i + 1} ${isChecked ? "(marked)" : "(empty)"}`}
            aria-checked={isChecked}
            role="checkbox"
          />
        )
      })}
    </div>
  )
}
