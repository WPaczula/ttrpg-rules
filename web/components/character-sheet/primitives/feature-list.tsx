"use client"

import type { ApiFeature } from "@/lib/srd/types"
import { SrdMarkdown } from "../srd-markdown"

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
