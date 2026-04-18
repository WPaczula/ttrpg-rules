"use client"

import type { CharacterData } from "@/lib/character-types"
import { Coins } from "lucide-react"
import { Section, Counter } from "./primitives"

interface GoldSectionProps {
  character: CharacterData
  update: (patch: Partial<CharacterData>) => void
}

function convertGold(handfuls: number, bags: number, chests: number) {
  bags += Math.floor(handfuls / 10)
  handfuls = handfuls % 10
  chests += Math.floor(bags / 10)
  bags = bags % 10
  chests = Math.min(chests, 99)
  return { goldHandfuls: handfuls, goldBags: bags, goldChests: chests }
}

function GoldTier({
  label,
  value,
  total,
  onChange,
  kind,
  max,
}: {
  label: string
  value: number
  total: number
  onChange: (v: number) => void
  kind: "handful" | "bag" | "chest"
  max: number
}) {
  const setPip = (i: number) => {
    if (kind === "chest") {
      onChange(value === 1 ? 0 : 1)
      return
    }
    onChange(i + 1 === value ? i : i + 1)
  }
  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-dashed border-border last:border-b-0 max-[520px]:flex-wrap">
      <div className="font-mono text-[10px] tracking-[0.14em] text-gold-dim uppercase w-20 shrink-0">
        {label}
      </div>
      <div className="flex gap-1.5 flex-wrap items-center flex-1">
        {Array.from({ length: total }).map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setPip(i)}
            className={`dh-gold-pip dh-gold-pip-${kind} ${i < value ? "is-filled" : ""}`}
            aria-label={`${label} ${i + 1}`}
          />
        ))}
      </div>
      <Counter
        value={value}
        onChange={onChange}
        min={0}
        max={max}
        label={label}
        size="sm"
      />
    </div>
  )
}

export function GoldSection({ character: c, update }: GoldSectionProps) {
  return (
    <Section icon={<Coins className="w-4 h-4" />} title="Gold">
      <div className="px-0.5">
        <GoldTier
          label="Handfuls"
          kind="handful"
          total={10}
          max={10}
          value={c.goldHandfuls}
          onChange={(v) => update(convertGold(v, c.goldBags, c.goldChests))}
        />
        <GoldTier
          label="Bags"
          kind="bag"
          total={10}
          max={10}
          value={c.goldBags}
          onChange={(v) => update(convertGold(c.goldHandfuls, v, c.goldChests))}
        />
        <GoldTier
          label="Chest"
          kind="chest"
          total={1}
          max={1}
          value={c.goldChests}
          onChange={(v) => update({ goldChests: v })}
        />
        <p className="text-[11.5px] italic text-muted-foreground mt-3">
          Tap a pip or use ± · 10 handfuls = 1 bag · 10 bags = 1 chest
        </p>
      </div>
    </Section>
  )
}
