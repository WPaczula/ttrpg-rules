"use client"

import type { ApiFeature } from "@/lib/srd/types"
import { SrdMarkdown } from "../srd-markdown"

export function FeatureList({ label, features }: { label: string; features: ApiFeature[] }) {
  if (features.length === 0) return null
  return (
    <div className="space-y-2 mt-3">
      <div className="dh-feat-group-label">{label}</div>
      {features.map((f) => (
        <div key={f.name} className="dh-feat-card">
          <div className="dh-feat-name">{f.name}</div>
          <SrdMarkdown className="text-sm">{f.text}</SrdMarkdown>
        </div>
      ))}
    </div>
  )
}
