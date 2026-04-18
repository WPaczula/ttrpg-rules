"use client"

import { formatModifier } from "@/lib/character-types"

interface TraitShieldProps {
  label: string
  value: number
  actions?: string
  info?: React.ReactNode
}

export function TraitShield({ label, value, actions, info }: TraitShieldProps) {
  return (
    <div className="dh-trait">
      <div className="dh-trait-ribbon">{label}</div>
      <div className="dh-trait-body relative">
        {info && <div className="absolute top-1.5 right-1.5">{info}</div>}
        <div className="dh-trait-value">{formatModifier(value)}</div>
        {actions && <div className="dh-trait-actions hidden sm:block">{actions}</div>}
      </div>
    </div>
  )
}
