"use client"

import { cn } from "@/lib/utils"

export interface ButtonGroupOption<T extends string> {
  value: T
  label: string
  icon?: React.ReactNode
  detail?: string
}

interface ButtonGroupProps<T extends string> {
  value: T
  onChange: (value: T) => void
  options: ButtonGroupOption<T>[]
  label?: string
  size?: "sm" | "md"
  className?: string
}

export function ButtonGroup<T extends string>({
  value,
  onChange,
  options,
  label,
  size = "md",
  className,
}: ButtonGroupProps<T>) {
  return (
    <div className={cn("space-y-1.5", className)}>
      {label && (
        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          {label}
        </label>
      )}
      <div className="flex gap-2 flex-wrap" role="group" aria-label={label}>
        {options.map((opt) => (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={cn(
              "flex items-center gap-1.5 rounded-md border text-sm font-medium transition-colors",
              size === "sm" ? "px-3 py-1.5" : "px-3 py-2",
              value === opt.value
                ? "bg-gold/15 text-gold border-gold/30"
                : "bg-transparent text-muted-foreground border-border hover:text-foreground hover:bg-muted/50"
            )}
          >
            {opt.icon}
            {opt.label}
            {opt.detail && (
              <span className="text-[10px] opacity-70">{opt.detail}</span>
            )}
          </button>
        ))}
      </div>
    </div>
  )
}
