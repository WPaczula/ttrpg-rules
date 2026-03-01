"use client"

import type { CharacterData } from "@/lib/character-types"
import { Coins } from "lucide-react"
import { Section, Counter } from "./primitives"

interface GoldSectionProps {
  character: CharacterData
  update: (patch: Partial<CharacterData>) => void
}

export function GoldSection({ character: c, update }: GoldSectionProps) {
  return (
    <Section icon={<Coins className="w-4 h-4" />} title="Gold">
      <div className="space-y-3">
        {[
          { label: "Handfuls", key: "goldHandfuls" as const, max: 9 },
          { label: "Bags", key: "goldBags" as const, max: 9 },
          { label: "Chests", key: "goldChests" as const, max: 99 },
        ].map(({ label, key, max }) => (
          <div key={key} className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground flex-1">{label}</span>
            <Counter
              value={c[key]}
              onChange={(v) => update({ [key]: v })}
              min={0}
              max={max}
              label={label}
              size="sm"
            />
          </div>
        ))}
        <p className="text-xs text-muted-foreground">
          10 handfuls = 1 bag · 10 bags = 1 chest
        </p>
      </div>
    </Section>
  )
}
