"use client"

import { Check } from "lucide-react"

// ─── StepHeader ─────────────────────────────────────────────────────────────

interface StepHeaderProps {
  icon: React.ReactNode
  title: string
}

export function StepHeader({ icon, title }: StepHeaderProps) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-gold">{icon}</span>
      <h3 className="text-base font-bold text-foreground">{title}</h3>
    </div>
  )
}

// ─── AdvancementOption ──────────────────────────────────────────────────────

interface AdvancementOptionProps {
  title: string
  description: string
  icon: React.ReactNode
  selected: boolean
  disabled: boolean
  onSelect: () => void
  children?: React.ReactNode
}

export function AdvancementOption({
  title,
  description,
  icon,
  selected,
  disabled,
  onSelect,
  children,
}: AdvancementOptionProps) {
  return (
    <div
      onClick={() => {
        if (!(disabled && !selected)) onSelect()
      }}
      role="button"
      tabIndex={disabled && !selected ? -1 : 0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault()
          if (!(disabled && !selected)) onSelect()
        }
      }}
      className={`w-full text-left rounded-lg border p-3 transition-all ${
        selected
          ? "bg-gold/10 border-gold/40"
          : disabled
            ? "bg-card/30 border-border opacity-50 cursor-not-allowed"
            : "bg-card/50 border-border hover:border-gold/30 cursor-pointer"
      }`}
    >
      <div className="flex items-center gap-2">
        <span className={selected ? "text-gold" : "text-muted-foreground"}>
          {icon}
        </span>
        <span
          className={`text-sm font-medium ${selected ? "text-gold" : "text-foreground"}`}
        >
          {title}
        </span>
        {selected && (
          <Check className="w-4 h-4 text-gold ml-auto shrink-0" />
        )}
      </div>
      <p className="text-xs text-muted-foreground mt-1 ml-6">{description}</p>
      {children && <div className="ml-6" onClick={(e) => e.stopPropagation()}>{children}</div>}
    </div>
  )
}

// ─── SummaryRow ─────────────────────────────────────────────────────────────

interface SummaryRowProps {
  label: string
  value: string
}

export function SummaryRow({ label, value }: SummaryRowProps) {
  return (
    <div className="flex items-center justify-between bg-purple-deep/30 border border-border rounded-md px-3 py-2">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-xs font-medium text-gold">{value}</span>
    </div>
  )
}
