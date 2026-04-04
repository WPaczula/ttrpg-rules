"use client"

import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { formatModifier } from "@/lib/character-types"
import type { ApiFeature } from "@/lib/srd/types"
import { cn } from "@/lib/utils"
import { ChevronDown } from "lucide-react"
import { SrdMarkdown } from "./srd-markdown"

// ─── Slot Toggle ──────────────────────────────────────────────────────────────

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

// ─── Counter (Hope, Gold) ─────────────────────────────────────────────────────

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

// ─── Section Wrapper ──────────────────────────────────────────────────────────

interface SectionProps {
  icon: React.ReactNode
  title: string
  defaultOpen?: boolean
  children: React.ReactNode
}

export function Section({ icon, title, defaultOpen = false, children }: SectionProps) {
  return (
    <>
      <Collapsible defaultOpen={defaultOpen}>
        <CollapsibleTrigger className="flex items-center justify-between w-full py-3 group">
          <div className="flex items-center gap-2">
            <span className="text-gold">{icon}</span>
            <span className="text-xs text-muted-foreground uppercase tracking-widest font-semibold">
              {title}
            </span>
          </div>
          <ChevronDown className="w-4 h-4 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180" />
        </CollapsibleTrigger>
        <CollapsibleContent className="pb-4">
          {children}
        </CollapsibleContent>
      </Collapsible>
      <Separator className="bg-border" />
    </>
  )
}

// ─── Stat Box ─────────────────────────────────────────────────────────────────

interface StatBoxProps {
  label: string
  value: number | string
  sub?: string
}

export function StatBox({ label, value, sub }: StatBoxProps) {
  return (
    <div className="flex flex-col items-center justify-center bg-purple-deep/50 border border-border rounded-lg p-3 min-w-[72px]">
      <span className="text-xs text-muted-foreground uppercase tracking-wider">{label}</span>
      <span className="text-xl font-bold text-gold">{value}</span>
      {sub && <span className="text-xs text-muted-foreground">{sub}</span>}
    </div>
  )
}

// ─── Trait Stepper ────────────────────────────────────────────────────────────

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

// ─── Number Stepper Input ──────────────────────────────────────────────────────

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

// ─── Feature Display ──────────────────────────────────────────────────────

export function FeatureList({ label, features }: { label: string; features: ApiFeature[] }) {
  if (features.length === 0) return null
  return (
    <div className="space-y-1.5">
      <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
        {label}
      </span>
      {features.map((f) => (
        <div key={f.name} className="bg-purple-deep/30 border border-border rounded-md px-3 py-2">
          <span className="text-xs font-medium text-gold">{f.name}</span>
          <SrdMarkdown className="mt-0.5">{f.text}</SrdMarkdown>
        </div>
      ))}
    </div>
  )
}
