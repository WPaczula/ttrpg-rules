"use client"

import { Input } from "@/components/ui/input"
import type { CharacterData } from "@/lib/character-types"
import { Shield } from "lucide-react"
import { Section, StatBox, TraitStepper, NumberStepper, SlotTracker } from "./primitives"

interface TraitsDefenseSectionProps {
  character: CharacterData
  tier: number
  update: (patch: Partial<CharacterData>) => void
}

export function TraitsDefenseSection({ character: c, tier, update }: TraitsDefenseSectionProps) {
  return (
    <Section icon={<Shield className="w-4 h-4" />} title="Traits & Defense" defaultOpen>
      <div className="space-y-5">
        <div className="grid grid-cols-2 gap-2">
          <TraitStepper label="AGI" value={c.agility} onChange={(v) => update({ agility: v })} />
          <TraitStepper label="STR" value={c.strength} onChange={(v) => update({ strength: v })} />
          <TraitStepper label="FIN" value={c.finesse} onChange={(v) => update({ finesse: v })} />
          <TraitStepper label="INS" value={c.instinct} onChange={(v) => update({ instinct: v })} />
          <TraitStepper label="PRE" value={c.presence} onChange={(v) => update({ presence: v })} />
          <TraitStepper label="KNO" value={c.knowledge} onChange={(v) => update({ knowledge: v })} />
        </div>
        <p className="text-xs text-muted-foreground">
          Distribute: +2, +1, +1, +0, +0, −1
        </p>

        <div className="grid grid-cols-3 gap-3">
          <StatBox label="Evasion" value={c.evasion} />
          <StatBox label="Armor" value={`${c.armorMarked}/${c.armorScore}`} />
          <StatBox label="Tier" value={tier} />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-foreground">
              Armor Slots
              <span className="text-xs text-muted-foreground ml-2">
                {c.armorMarked}/{c.armorScore} marked
              </span>
            </span>
            <NumberStepper
              label="Slots"
              value={c.armorScore}
              onChange={(v) => update({ armorScore: v, armorMarked: Math.min(c.armorMarked, v) })}
              min={0}
              max={5}
            />
          </div>
          {c.armorScore > 0 ? (
            <SlotTracker
              total={c.armorScore}
              marked={c.armorMarked}
              onToggle={(n) => update({ armorMarked: n })}
              filledClass="bg-gold/30 border-gold"
              emptyClass="bg-transparent border-border hover:border-gold/50"
              label="Armor"
            />
          ) : (
            <p className="text-xs text-muted-foreground italic">No armor slots</p>
          )}
        </div>

        <div className="space-y-2">
          <span className="text-xs text-muted-foreground uppercase tracking-wider">
            Damage Thresholds
          </span>
          <div className="grid grid-cols-3 gap-2">
            <div className="space-y-1">
              <span className="text-xs text-muted-foreground block text-center">Minor</span>
              <Input
                type="number"
                value={c.minorThreshold}
                onChange={(e) => update({ minorThreshold: Number(e.target.value) })}
                className="text-center text-gold font-bold bg-input border-border h-9"
                min={0}
                aria-label="Minor threshold"
              />
            </div>
            <div className="space-y-1">
              <span className="text-xs text-muted-foreground block text-center">Major</span>
              <Input
                type="number"
                value={c.majorThreshold}
                onChange={(e) => update({ majorThreshold: Number(e.target.value) })}
                className="text-center text-gold font-bold bg-input border-border h-9"
                min={0}
                aria-label="Major threshold"
              />
            </div>
            <div className="space-y-1">
              <span className="text-xs text-muted-foreground block text-center">Severe</span>
              <Input
                type="number"
                value={c.severeThreshold}
                onChange={(e) => update({ severeThreshold: Number(e.target.value) })}
                className="text-center text-gold font-bold bg-input border-border h-9"
                min={0}
                aria-label="Severe threshold"
              />
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Base (from armor) + level {c.level}. Adjust after leveling up.
          </p>
        </div>
      </div>
    </Section>
  )
}
