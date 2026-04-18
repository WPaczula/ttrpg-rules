"use client"

import { useMemo } from "react"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
import type { CharacterData } from "@/lib/character-types"
import { computeThresholds } from "@/lib/character-types"
import { SRD_ARMOR, SRD_WEAPONS } from "@/lib/srd-data"
import { Shield, Info } from "lucide-react"
import { Section, StatBox, TraitStepper, TraitShield, NumberStepper, SlotTracker } from "./primitives"

// ─── Modifier helpers ────────────────────────────────────────────────────────

type TraitKey = "agility" | "strength" | "finesse" | "instinct" | "presence" | "knowledge"

const TRAIT_NAMES: Record<string, TraitKey> = {
  agility: "agility",
  strength: "strength",
  finesse: "finesse",
  instinct: "instinct",
  presence: "presence",
  knowledge: "knowledge",
}

interface ModifierEntry {
  source: string
  modifier: number
  label: string
}

/** Parse feature text for trait modifiers like "-1 to Agility", "decrease Agility by 1", "+1 bonus to Strength" */
function parseTraitModifiers(featureText: string, sourceName: string): { trait: TraitKey; entry: ModifierEntry }[] {
  const results: { trait: TraitKey; entry: ModifierEntry }[] = []

  // Pattern: "+/-N to (your) Trait" or "+/-N bonus to (your) Trait"
  const toPattern = /([+\u2212-]\d+)\s+(?:bonus\s+)?to\s+(?:your\s+)?(\w+)/gi
  for (const match of featureText.matchAll(toPattern)) {
    const modStr = match[1].replace("\u2212", "-")
    const modifier = parseInt(modStr, 10)
    const traitKey = TRAIT_NAMES[match[2].toLowerCase()]
    if (traitKey && !isNaN(modifier)) {
      const sign = modifier >= 0 ? "+" : ""
      results.push({ trait: traitKey, entry: { source: sourceName, modifier, label: `${sourceName}: ${sign}${modifier} ${traitKey}` } })
    }
  }

  // Pattern: "decrease (your) Trait by N"
  const decreasePattern = /decrease\s+(?:your\s+)?(\w+)\s+by\s+(\d+)/gi
  for (const match of featureText.matchAll(decreasePattern)) {
    const traitKey = TRAIT_NAMES[match[1].toLowerCase()]
    const value = parseInt(match[2], 10)
    if (traitKey && !isNaN(value)) {
      results.push({ trait: traitKey, entry: { source: sourceName, modifier: -value, label: `${sourceName}: -${value} ${traitKey}` } })
    }
  }

  // Pattern: "increase (your) Trait by N"
  const increasePattern = /increase\s+(?:your\s+)?(\w+)\s+by\s+(\d+)/gi
  for (const match of featureText.matchAll(increasePattern)) {
    const traitKey = TRAIT_NAMES[match[1].toLowerCase()]
    const value = parseInt(match[2], 10)
    if (traitKey && !isNaN(value)) {
      results.push({ trait: traitKey, entry: { source: sourceName, modifier: value, label: `${sourceName}: +${value} ${traitKey}` } })
    }
  }

  return results
}

function useEquipmentModifiers(c: CharacterData) {
  return useMemo(() => {
    const armor = SRD_ARMOR.find((a) => a.name === c.armorName)
    const primary = SRD_WEAPONS.find((w) => w.name === c.primaryWeapon)
    const secondary = SRD_WEAPONS.find((w) => w.name === c.secondaryWeapon)

    // Evasion modifiers
    const evasionMods: ModifierEntry[] = []
    if (armor?.evasionModifier) {
      evasionMods.push({
        source: armor.name,
        modifier: armor.evasionModifier,
        label: `${armor.name}: ${armor.evasionModifier} evasion`,
      })
    }

    // Trait modifiers from feature text
    const traitMods: Record<TraitKey, ModifierEntry[]> = {
      agility: [], strength: [], finesse: [], instinct: [], presence: [], knowledge: [],
    }

    const featureSources: { name: string; feature: string }[] = []
    if (armor?.feature) featureSources.push({ name: armor.name, feature: armor.feature })
    if (primary?.feature) featureSources.push({ name: primary.name, feature: primary.feature })
    if (secondary?.feature) featureSources.push({ name: secondary.name, feature: secondary.feature })

    for (const src of featureSources) {
      const parsed = parseTraitModifiers(src.feature, src.name)
      for (const { trait, entry } of parsed) {
        traitMods[trait].push(entry)
      }
    }

    return { evasionMods, traitMods }
  }, [c.armorName, c.primaryWeapon, c.secondaryWeapon])
}

// ─── Info Popover ────────────────────────────────────────────────────────────

function ModifierInfo({ modifiers }: { modifiers: ModifierEntry[] }) {
  if (modifiers.length === 0) return null
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          className="inline-flex items-center justify-center w-4 h-4 text-muted-foreground hover:text-gold transition-colors"
          aria-label="Show modifier breakdown"
        >
          <Info className="w-3.5 h-3.5" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-auto max-w-xs p-3">
        <p className="text-xs font-medium text-foreground mb-1.5">Modifiers from equipment</p>
        <ul className="space-y-0.5">
          {modifiers.map((m, i) => (
            <li key={i} className="text-xs text-muted-foreground">{m.label}</li>
          ))}
        </ul>
      </PopoverContent>
    </Popover>
  )
}

// ─── Stat Box with optional info icon ────────────────────────────────────────

function StatBoxWithInfo({ label, value, modifiers }: { label: string; value: string | number; modifiers: ModifierEntry[] }) {
  return (
    <div className="relative">
      <StatBox label={label} value={value} />
      {modifiers.length > 0 && (
        <div className="absolute top-1 right-1">
          <ModifierInfo modifiers={modifiers} />
        </div>
      )}
    </div>
  )
}

// ─── Main Component ──────────────────────────────────────────────────────────

const TRAIT_SHORT_TO_KEY: Record<string, TraitKey> = {
  AGI: "agility", STR: "strength", FIN: "finesse", INS: "instinct", PRE: "presence", KNO: "knowledge",
}

const TRAIT_ACTIONS: Record<string, string> = {
  AGI: "Sprint · Leap · Maneuver",
  STR: "Lift · Smash · Grapple",
  FIN: "Control · Hide · Tinker",
  INS: "Perceive · Sense · Navigate",
  PRE: "Charm · Perform · Deceive",
  KNO: "Recall · Analyze · Comprehend",
}

interface TraitsDefenseSectionProps {
  character: CharacterData
  tier: number
  update: (patch: Partial<CharacterData>) => void
  editing?: boolean
}

export function TraitsDefenseSection({ character: c, tier, update, editing = false }: TraitsDefenseSectionProps) {
  const { evasionMods, traitMods } = useEquipmentModifiers(c)
  const armor = SRD_ARMOR.find((a) => a.name === c.armorName)
  const thresholds = computeThresholds(armor?.baseThresholds, c.level, c.proficiency, c.thresholdBonuses)

  return (
    <Section icon={<Shield className="w-4 h-4" />} title="Traits & Defense" defaultOpen>
      <div className="space-y-5">
        {editing ? (
          <div className="grid grid-cols-2 gap-2">
            <TraitStepper label="AGI" value={c.agility} onChange={(v) => update({ agility: v })} />
            <TraitStepper label="STR" value={c.strength} onChange={(v) => update({ strength: v })} />
            <TraitStepper label="FIN" value={c.finesse} onChange={(v) => update({ finesse: v })} />
            <TraitStepper label="INS" value={c.instinct} onChange={(v) => update({ instinct: v })} />
            <TraitStepper label="PRE" value={c.presence} onChange={(v) => update({ presence: v })} />
            <TraitStepper label="KNO" value={c.knowledge} onChange={(v) => update({ knowledge: v })} />
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2.5 max-[520px]:grid-cols-2">
            {(["AGI", "STR", "FIN", "INS", "PRE", "KNO"] as const).map((short) => {
              const key = TRAIT_SHORT_TO_KEY[short]
              return (
                <TraitShield
                  key={short}
                  label={short}
                  value={c[key]}
                  actions={TRAIT_ACTIONS[short]}
                  info={traitMods[key].length > 0 ? <ModifierInfo modifiers={traitMods[key]} /> : undefined}
                />
              )
            })}
          </div>
        )}
        {editing && (
          <p className="text-xs text-muted-foreground">
            Distribute: +2, +1, +1, +0, +0, −1
          </p>
        )}

        <div className="grid grid-cols-3 gap-3">
          <StatBoxWithInfo label="Evasion" value={c.evasion} modifiers={evasionMods} />
          <StatBox label="Prof." value={c.proficiency} />
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
            {editing && (
              <NumberStepper
                label="Slots"
                value={c.armorScore}
                onChange={(v) => update({ armorScore: v, armorMarked: Math.min(c.armorMarked, v) })}
                min={0}
                max={5}
              />
            )}
          </div>
          {c.armorScore > 0 ? (
            <SlotTracker
              total={c.armorScore}
              marked={c.armorMarked}
              onToggle={(n) => update({ armorMarked: n })}
              variant="armor"
              label="Armor"
            />
          ) : (
            <p className="text-xs text-muted-foreground italic">No armor slots</p>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-muted-foreground uppercase tracking-wider">
              Damage Thresholds
            </span>
            <Popover>
              <PopoverTrigger asChild>
                <button
                  className="inline-flex items-center justify-center w-4 h-4 text-muted-foreground hover:text-gold transition-colors"
                  aria-label="Show threshold breakdown"
                >
                  <Info className="w-3.5 h-3.5" />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-auto max-w-xs p-3">
                <p className="text-xs font-medium text-foreground mb-1.5">Threshold Breakdown</p>
                <ul className="space-y-0.5">
                  <li className="text-xs text-muted-foreground">
                    Armor base: {thresholds.armorBaseMajor} / {thresholds.armorBaseSevere}
                  </li>
                  {thresholds.levelBonus > 0 && (
                    <li className="text-xs text-muted-foreground">
                      Level bonus: +{thresholds.levelBonus}
                    </li>
                  )}
                  {thresholds.bonuses.map((b) => {
                    // Strip prefix like "card:", "classFeature:", "subclassFeature:"
                    const displayLabel = b.label.replace(/^(?:card|classFeature|subclassFeature):/, "")
                    return (
                    <li key={b.label} className="text-xs text-muted-foreground">
                      {displayLabel}:{" "}
                      {b.major > 0 ? `+${b.major} Major` : ""}
                      {b.major > 0 && b.severe > 0 ? ", " : ""}
                      {b.severe > 0 ? `+${b.severe} Severe` : ""}
                    </li>
                    )
                  })}
                  {!armor && (
                    <li className="text-xs text-muted-foreground italic">
                      No armor equipped — select armor to see base thresholds.
                    </li>
                  )}
                </ul>
              </PopoverContent>
            </Popover>
          </div>
          <div className="dh-thresholds">
            <div className="dh-thr">
              <span className="dh-thr-label">Minor</span>
              <span className="dh-thr-val">—</span>
            </div>
            <div className="dh-thr">
              <span className="dh-thr-label">Major</span>
              <span className="dh-thr-val">{thresholds.totalMajor}</span>
            </div>
            <div className="dh-thr">
              <span className="dh-thr-label">Severe</span>
              <span className="dh-thr-val">{thresholds.totalSevere}</span>
            </div>
          </div>
          <p className="text-xs text-muted-foreground text-center">
            Damage below Major ({thresholds.totalMajor}) = minor (1 HP).
          </p>
        </div>
      </div>
    </Section>
  )
}
