# Supercomponent Refactor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Decompose `level-up-tab.tsx` (916 lines) and `loot-tab.tsx` (390 lines) into focused feature-folder components with shared UI patterns extracted.

**Architecture:** Feature-folder decomposition matching existing `character-sheet/` and `encounter/` conventions. Each monolithic component becomes an orchestrator that delegates to focused sub-components. Pure business logic moves to utility files. Barrel re-exports preserve existing import paths.

**Tech Stack:** React 18, Next.js (App Router), TypeScript, Tailwind CSS, shadcn/ui

---

### Task 1: Create `lib/level-up-utils.ts` — pure functions and constants

**Files:**
- Create: `web/lib/level-up-utils.ts`

- [ ] **Step 1: Create the utility file with types, constants, and pure functions**

```ts
// web/lib/level-up-utils.ts
import { type CharacterData, type DomainCard, type Experience } from "@/lib/character-types"
import { SRD_DOMAIN_CARDS } from "@/lib/srd-data"

// ─── Types ──────────────────────────────────────────────────────────────────

export type WizardStep = "idle" | "tier-achievement" | "advancements" | "domain-card" | "confirm"

export type AdvancementChoice =
  | { type: "increase-traits"; traits: [string, string] }
  | { type: "add-hp" }
  | { type: "add-stress" }
  | { type: "boost-experiences"; experienceIds: string[] }
  | { type: "extra-domain-card" }
  | { type: "increase-evasion" }

// ─── Constants ──────────────────────────────────────────────────────────────

export const TRAIT_KEYS = ["agility", "strength", "finesse", "instinct", "presence", "knowledge"] as const

export const TRAIT_LABELS: Record<string, string> = {
  agility: "AGI",
  strength: "STR",
  finesse: "FIN",
  instinct: "INS",
  presence: "PRE",
  knowledge: "KNO",
}

export const SLOT_LIMITS = {
  traits: 3,
  hp: 2,
  stress: 2,
  experiences: 1,
  domainCard: 1,
  evasion: 1,
} as const

export const EMPTY_SLOTS = { traits: 0, hp: 0, stress: 0, experiences: 0, domainCard: 0, evasion: 0 }

// ─── Helpers ────────────────────────────────────────────────────────────────

export function isTierTransition(newLevel: number): boolean {
  return newLevel === 2 || newLevel === 5 || newLevel === 8
}

export function getTierSlots(character: CharacterData, tier: number) {
  return character.advancementSlots?.[tier] ?? { ...EMPTY_SLOTS }
}

export function slotAvailable(
  slots: typeof EMPTY_SLOTS,
  advancements: AdvancementChoice[],
  key: keyof typeof SLOT_LIMITS
): boolean {
  const currentlyPicked = advancements.filter((a) => {
    switch (key) {
      case "traits": return a.type === "increase-traits"
      case "hp": return a.type === "add-hp"
      case "stress": return a.type === "add-stress"
      case "experiences": return a.type === "boost-experiences"
      case "domainCard": return a.type === "extra-domain-card"
      case "evasion": return a.type === "increase-evasion"
    }
  }).length
  return (slots[key] + currentlyPicked) < SLOT_LIMITS[key]
}

// ─── Apply Level Up ─────────────────────────────────────────────────────────

export interface ApplyLevelUpOptions {
  nextLevel: number
  nextTier: number
  tierTransition: boolean
  advancements: AdvancementChoice[]
  newDomainCard: string
  newExperienceName: string
}

export function applyLevelUp(prev: CharacterData, opts: ApplyLevelUpOptions): CharacterData {
  const { nextLevel, nextTier, tierTransition, advancements, newDomainCard, newExperienceName } = opts

  const patch: Partial<CharacterData> = {
    level: nextLevel,
  }

  // Tier achievement: +1 proficiency, new experience, clear marked traits
  if (tierTransition) {
    patch.proficiency = (prev.proficiency ?? 1) + 1
    const newExp: Experience = {
      id: crypto.randomUUID(),
      name: newExperienceName || "New experience",
      modifier: 2,
    }
    patch.experiences = [...prev.experiences, newExp]
    if (nextLevel >= 5) {
      patch.markedTraits = []
    }
  }

  // Track advancement slot usage per tier
  const allSlots = { ...(prev.advancementSlots ?? {}) }
  const newSlots = { ...(allSlots[nextTier] ?? { ...EMPTY_SLOTS }) }

  for (const adv of advancements) {
    switch (adv.type) {
      case "increase-traits": {
        const [t1, t2] = adv.traits as [keyof CharacterData, keyof CharacterData]
        ;(patch as Record<string, unknown>)[t1] =
          (((patch as Record<string, unknown>)[t1] as number | undefined) ?? (prev[t1] as number)) + 1
        ;(patch as Record<string, unknown>)[t2] =
          (((patch as Record<string, unknown>)[t2] as number | undefined) ?? (prev[t2] as number)) + 1
        patch.markedTraits = [...(patch.markedTraits ?? prev.markedTraits ?? []), t1, t2]
        newSlots.traits++
        break
      }
      case "add-hp":
        patch.hpTotal = (patch.hpTotal ?? prev.hpTotal) + 1
        newSlots.hp++
        break
      case "add-stress":
        patch.stressTotal = (patch.stressTotal ?? prev.stressTotal) + 1
        newSlots.stress++
        break
      case "boost-experiences": {
        const exps = patch.experiences ?? [...prev.experiences]
        const boostedIds = new Set(adv.experienceIds)
        patch.experiences = exps.map((e) =>
          boostedIds.has(e.id) ? { ...e, modifier: Math.min(6, e.modifier + 1) } : e
        )
        newSlots.experiences++
        break
      }
      case "extra-domain-card":
        newSlots.domainCard++
        break
      case "increase-evasion":
        patch.evasion = (patch.evasion ?? prev.evasion) + 1
        newSlots.evasion++
        break
    }
  }

  allSlots[nextTier] = newSlots
  patch.advancementSlots = allSlots

  if (newDomainCard) {
    const match = SRD_DOMAIN_CARDS.find((dc) => dc.name === newDomainCard)
    const card: DomainCard = {
      id: crypto.randomUUID(),
      name: newDomainCard,
      level: match?.level ?? nextLevel,
      domain: match?.domain ?? "",
    }
    patch.domainCards = [...(patch.domainCards ?? prev.domainCards), card]
  }

  return { ...prev, ...patch }
}
```

- [ ] **Step 2: Verify it compiles**

Run: `cd web && npx tsc --noEmit --pretty 2>&1 | head -20`
Expected: No errors related to `level-up-utils.ts`

- [ ] **Step 3: Commit**

```bash
git add web/lib/level-up-utils.ts
git commit -m "refactor: extract level-up pure functions to lib/level-up-utils"
```

---

### Task 2: Create `components/ui/button-group.tsx` — shared toggle button group

**Files:**
- Create: `web/components/ui/button-group.tsx`

- [ ] **Step 1: Create the ButtonGroup component**

```tsx
// web/components/ui/button-group.tsx
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
```

- [ ] **Step 2: Verify it compiles**

Run: `cd web && npx tsc --noEmit --pretty 2>&1 | head -20`
Expected: No errors related to `button-group.tsx`

- [ ] **Step 3: Commit**

```bash
git add web/components/ui/button-group.tsx
git commit -m "feat: add ButtonGroup shared UI component"
```

---

### Task 3: Create `components/level-up/primitives.tsx`

**Files:**
- Create: `web/components/level-up/primitives.tsx`

- [ ] **Step 1: Create the primitives file with AdvancementOption, SummaryRow, and StepHeader**

```tsx
// web/components/level-up/primitives.tsx
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
```

- [ ] **Step 2: Verify it compiles**

Run: `cd web && npx tsc --noEmit --pretty 2>&1 | head -20`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add web/components/level-up/primitives.tsx
git commit -m "refactor: extract level-up AdvancementOption, SummaryRow, StepHeader"
```

---

### Task 4: Create `components/level-up/idle-state.tsx`

**Files:**
- Create: `web/components/level-up/idle-state.tsx`

- [ ] **Step 1: Create the IdleState component**

```tsx
// web/components/level-up/idle-state.tsx
"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { type CharacterData } from "@/lib/character-types"
import { SLOT_LIMITS, type EMPTY_SLOTS } from "@/lib/level-up-utils"
import {
  ArrowUpCircle,
  ChevronRight,
  Star,
  Shield,
  Swords,
  BookOpen,
  Zap,
  Sparkles,
} from "lucide-react"

interface IdleStateProps {
  character: CharacterData
  nextLevel: number
  currentTier: number
  nextTier: number
  tierTransition: boolean
  slots: typeof EMPTY_SLOTS
  onStart: () => void
}

export function IdleState({
  character: c,
  nextLevel,
  currentTier,
  nextTier,
  tierTransition,
  slots,
  onStart,
}: IdleStateProps) {
  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      <div className="text-center space-y-3">
        <ArrowUpCircle className="w-12 h-12 text-gold mx-auto" />
        <h2 className="text-lg font-bold text-foreground">Level Up</h2>
        <div className="flex items-center justify-center gap-3 text-sm">
          <span className="text-muted-foreground">
            Current: Level {c.level}
          </span>
          <Badge className="bg-purple-glow/20 text-gold border-purple-glow/40 text-xs">
            Tier {currentTier}
          </Badge>
        </div>
        {!c.class && (
          <p className="text-xs text-muted-foreground italic">
            Set your class on the Character Sheet first for the best experience.
          </p>
        )}
      </div>

      <div className="bg-card border border-border rounded-lg p-4 space-y-3">
        <h3 className="text-sm font-semibold text-foreground">
          Level {nextLevel} Preview
        </h3>
        {tierTransition && (
          <Badge className="bg-gold/15 text-gold border-gold/30 text-xs">
            Tier {nextTier} Unlocked
          </Badge>
        )}
        <ul className="text-xs text-muted-foreground space-y-1.5">
          {tierTransition && (
            <>
              <li className="flex items-center gap-2">
                <Zap className="w-3.5 h-3.5 text-gold shrink-0" />
                +1 Proficiency (tier achievement)
              </li>
              <li className="flex items-center gap-2">
                <Star className="w-3.5 h-3.5 text-gold shrink-0" />
                +1 new Experience at +2
              </li>
              {nextLevel >= 5 && (
                <li className="flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-gold shrink-0" />
                  Clear any marked traits
                </li>
              )}
            </>
          )}
          <li className="flex items-center gap-2">
            <Swords className="w-3.5 h-3.5 text-gold shrink-0" />
            Choose 2 advancements and mark them
          </li>
          <li className="flex items-center gap-2">
            <Shield className="w-3.5 h-3.5 text-gold shrink-0" />
            +1 to damage thresholds from level (automatic)
          </li>
          <li className="flex items-center gap-2">
            <BookOpen className="w-3.5 h-3.5 text-gold shrink-0" />
            Gain a domain card (level ≤ {nextLevel})
          </li>
        </ul>
      </div>

      {/* Advancement slots overview for next tier */}
      <div className="bg-card/50 border border-border rounded-lg p-3 space-y-2">
        <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
          Tier {nextTier} Advancement Slots
        </span>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-muted-foreground">
          <span>Traits: {slots.traits}/{SLOT_LIMITS.traits}</span>
          <span>HP: {slots.hp}/{SLOT_LIMITS.hp}</span>
          <span>Stress: {slots.stress}/{SLOT_LIMITS.stress}</span>
          <span>Experiences: {slots.experiences}/{SLOT_LIMITS.experiences}</span>
          <span>Domain Card: {slots.domainCard}/{SLOT_LIMITS.domainCard}</span>
          <span>Evasion: {slots.evasion}/{SLOT_LIMITS.evasion}</span>
        </div>
      </div>

      <Button
        onClick={onStart}
        className="w-full bg-gold/15 text-gold border border-gold/30 hover:bg-gold/25 font-semibold"
      >
        Level Up to {nextLevel}
        <ChevronRight className="w-4 h-4 ml-1" />
      </Button>
    </div>
  )
}
```

- [ ] **Step 2: Verify it compiles**

Run: `cd web && npx tsc --noEmit --pretty 2>&1 | head -20`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add web/components/level-up/idle-state.tsx
git commit -m "refactor: extract level-up IdleState component"
```

---

### Task 5: Create `components/level-up/tier-achievement-step.tsx`

**Files:**
- Create: `web/components/level-up/tier-achievement-step.tsx`

- [ ] **Step 1: Create the TierAchievementStep component**

```tsx
// web/components/level-up/tier-achievement-step.tsx
"use client"

import { type SrdClass } from "@/lib/srd-data"
import { StepHeader } from "./primitives"
import { Sparkles, Zap, Star } from "lucide-react"

interface TierAchievementStepProps {
  nextLevel: number
  nextTier: number
  selectedClass: SrdClass | undefined
  proficiency: number
  newExperienceName: string
  onExperienceNameChange: (name: string) => void
}

export function TierAchievementStep({
  nextLevel,
  nextTier,
  selectedClass,
  proficiency,
  newExperienceName,
  onExperienceNameChange,
}: TierAchievementStepProps) {
  return (
    <div className="space-y-4">
      <StepHeader
        icon={<Sparkles className="w-5 h-5" />}
        title={`Tier ${nextTier} Achievement`}
      />
      <p className="text-sm text-muted-foreground">
        Welcome to Tier {nextTier}! You automatically receive the following:
      </p>

      <div className="space-y-3">
        <div className="bg-purple-deep/30 border border-border rounded-lg p-3 space-y-1">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-gold" />
            <span className="text-sm font-medium text-foreground">
              Proficiency +1
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            Your Proficiency increases from {proficiency} to{" "}
            {proficiency + 1}.
          </p>
        </div>

        <div className="bg-purple-deep/30 border border-border rounded-lg p-3 space-y-2">
          <div className="flex items-center gap-2">
            <Star className="w-4 h-4 text-gold" />
            <span className="text-sm font-medium text-foreground">
              New Experience (+2)
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            You gain a new Experience with a +2 modifier. Name it now or fill
            it in later.
          </p>
          <input
            value={newExperienceName}
            onChange={(e) => onExperienceNameChange(e.target.value)}
            placeholder="e.g. Survived the Siege of Karhold..."
            className="w-full bg-input border border-border rounded px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-gold"
          />
        </div>

        {nextLevel >= 5 && (
          <div className="bg-purple-deep/30 border border-border rounded-lg p-3 space-y-1">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-gold" />
              <span className="text-sm font-medium text-foreground">
                Clear Marked Traits
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Any marked character traits are cleared when you reach this
              tier.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verify it compiles**

Run: `cd web && npx tsc --noEmit --pretty 2>&1 | head -20`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add web/components/level-up/tier-achievement-step.tsx
git commit -m "refactor: extract level-up TierAchievementStep component"
```

---

### Task 6: Create `components/level-up/advancements-step.tsx`

**Files:**
- Create: `web/components/level-up/advancements-step.tsx`

- [ ] **Step 1: Create the AdvancementsStep component**

```tsx
// web/components/level-up/advancements-step.tsx
"use client"

import { Badge } from "@/components/ui/badge"
import { type CharacterData, formatModifier } from "@/lib/character-types"
import {
  type AdvancementChoice,
  type EMPTY_SLOTS,
  TRAIT_KEYS,
  TRAIT_LABELS,
  SLOT_LIMITS,
} from "@/lib/level-up-utils"
import { AdvancementOption, StepHeader } from "./primitives"
import {
  Star,
  Heart,
  Zap,
  Sparkles,
  BookOpen,
  Eye,
  Swords,
} from "lucide-react"

interface AdvancementsStepProps {
  character: CharacterData
  advancements: AdvancementChoice[]
  setAdvancements: React.Dispatch<React.SetStateAction<AdvancementChoice[]>>
  traitPicks: string[]
  setTraitPicks: React.Dispatch<React.SetStateAction<string[]>>
  canAddAdvancement: boolean
  slotAvailable: (key: keyof typeof SLOT_LIMITS) => boolean
  slots: typeof EMPTY_SLOTS
  setNewDomainCard: React.Dispatch<React.SetStateAction<string>>
}

export function AdvancementsStep({
  character: c,
  advancements,
  setAdvancements,
  traitPicks,
  setTraitPicks,
  canAddAdvancement,
  slotAvailable,
  slots,
  setNewDomainCard,
}: AdvancementsStepProps) {
  const slotsUsed = advancements.length

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <StepHeader
          icon={<Swords className="w-5 h-5" />}
          title="Choose Advancements"
        />
        <Badge className="ml-auto bg-purple-glow/20 text-gold border-purple-glow/40 text-xs">
          {slotsUsed}/2
        </Badge>
      </div>
      <p className="text-sm text-muted-foreground">
        Choose two options from the list below and mark them.
      </p>

      <div className="space-y-3">
        {/* Increase Traits (3 slots) */}
        <AdvancementOption
          title="Increase Traits"
          description={`+1 to two unmarked traits and mark them. (${slots.traits}/${SLOT_LIMITS.traits} used)`}
          icon={<Star className="w-4 h-4" />}
          disabled={!canAddAdvancement || !slotAvailable("traits")}
          selected={advancements.some((a) => a.type === "increase-traits")}
          onSelect={() => {
            if (advancements.some((a) => a.type === "increase-traits")) {
              setAdvancements((prev) =>
                prev.filter((a) => a.type !== "increase-traits")
              )
              setTraitPicks([])
            }
          }}
        >
          {(canAddAdvancement || advancements.some((a) => a.type === "increase-traits")) &&
            slotAvailable("traits") && (
            <div className="space-y-2 mt-2">
              <p className="text-xs text-muted-foreground">
                Select 2 unmarked traits to increase:
              </p>
              <div className="grid grid-cols-3 gap-2">
                {TRAIT_KEYS.map((trait) => {
                  const picked = traitPicks.includes(trait)
                  const locked = advancements.some((a) => a.type === "increase-traits")
                  const alreadyMarked = (c.markedTraits ?? []).includes(trait)
                  return (
                    <button
                      key={trait}
                      disabled={alreadyMarked || locked || (!picked && traitPicks.length >= 2)}
                      onClick={() => {
                        const next = picked
                          ? traitPicks.filter((t) => t !== trait)
                          : [...traitPicks, trait]
                        setTraitPicks(next)
                        if (next.length === 2) {
                          setAdvancements((prev) => [
                            ...prev.filter(
                              (a) => a.type !== "increase-traits"
                            ),
                            {
                              type: "increase-traits",
                              traits: [next[0], next[1]],
                            },
                          ])
                        } else {
                          setAdvancements((prev) =>
                            prev.filter((a) => a.type !== "increase-traits")
                          )
                        }
                      }}
                      className={`px-3 py-2 rounded-md border text-xs font-medium transition-all active:scale-95 ${
                        alreadyMarked
                          ? "bg-muted/30 border-border text-muted-foreground/40 cursor-not-allowed line-through"
                          : picked
                            ? "bg-gold/15 border-gold/40 text-gold"
                            : "bg-input border-border text-muted-foreground hover:border-gold/30 hover:text-foreground"
                      } ${locked && !alreadyMarked ? "opacity-60" : ""}`}
                    >
                      {TRAIT_LABELS[trait]}
                      <span className="ml-1 text-[10px]">
                        ({formatModifier(c[trait as keyof CharacterData] as number)})
                      </span>
                      {alreadyMarked && <span className="ml-0.5 text-[9px]"> marked</span>}
                    </button>
                  )
                })}
              </div>
            </div>
          )}
        </AdvancementOption>

        {/* Add HP Slot (2 slots) */}
        <AdvancementOption
          title="Add HP Slot"
          description={`Permanently gain one Hit Point slot. (${slots.hp}/${SLOT_LIMITS.hp} used)`}
          icon={<Heart className="w-4 h-4" />}
          disabled={!canAddAdvancement || !slotAvailable("hp")}
          selected={advancements.some((a) => a.type === "add-hp")}
          onSelect={() => {
            if (advancements.some((a) => a.type === "add-hp")) {
              setAdvancements((prev) => prev.filter((a) => a.type !== "add-hp"))
            } else if (canAddAdvancement && slotAvailable("hp")) {
              setAdvancements((prev) => [...prev, { type: "add-hp" }])
            }
          }}
        />

        {/* Add Stress Slot (2 slots) */}
        <AdvancementOption
          title="Add Stress Slot"
          description={`Permanently gain one Stress slot. (${slots.stress}/${SLOT_LIMITS.stress} used)`}
          icon={<Zap className="w-4 h-4" />}
          disabled={!canAddAdvancement || !slotAvailable("stress")}
          selected={advancements.some((a) => a.type === "add-stress")}
          onSelect={() => {
            if (advancements.some((a) => a.type === "add-stress")) {
              setAdvancements((prev) => prev.filter((a) => a.type !== "add-stress"))
            } else if (canAddAdvancement && slotAvailable("stress")) {
              setAdvancements((prev) => [...prev, { type: "add-stress" }])
            }
          }}
        />

        {/* Boost Experiences (1 slot) */}
        <AdvancementOption
          title="Boost Experiences"
          description={`+1 bonus to two Experiences. Pick two below. (${slots.experiences}/${SLOT_LIMITS.experiences} used)`}
          icon={<Sparkles className="w-4 h-4" />}
          disabled={!canAddAdvancement || !slotAvailable("experiences")}
          selected={advancements.some((a) => a.type === "boost-experiences")}
          onSelect={() => {
            if (advancements.some((a) => a.type === "boost-experiences")) {
              setAdvancements((prev) => prev.filter((a) => a.type !== "boost-experiences"))
            } else if (canAddAdvancement && slotAvailable("experiences")) {
              setAdvancements((prev) => [...prev, { type: "boost-experiences", experienceIds: [] }])
            }
          }}
        >
          {advancements.some((a) => a.type === "boost-experiences") && (
            <div className="mt-2 space-y-1">
              <p className="text-[11px] text-muted-foreground mb-1.5">
                Choose 2 experiences to boost:
              </p>
              <div className="flex flex-wrap gap-1.5">
                {c.experiences.map((exp) => {
                  const boostAdv = advancements.find((a) => a.type === "boost-experiences") as
                    | { type: "boost-experiences"; experienceIds: string[] }
                    | undefined
                  const picked = boostAdv?.experienceIds.includes(exp.id) ?? false
                  const locked = (boostAdv?.experienceIds.length ?? 0) >= 2

                  return (
                    <button
                      key={exp.id}
                      type="button"
                      disabled={locked && !picked}
                      onClick={() => {
                        setAdvancements((prev) => {
                          const idx = prev.findIndex((a) => a.type === "boost-experiences")
                          if (idx === -1) return prev
                          const cur = prev[idx] as { type: "boost-experiences"; experienceIds: string[] }
                          let next: string[]
                          if (picked) {
                            next = cur.experienceIds.filter((id) => id !== exp.id)
                          } else if (cur.experienceIds.length < 2) {
                            next = [...cur.experienceIds, exp.id]
                          } else {
                            return prev
                          }
                          const updated = [...prev]
                          updated[idx] = { type: "boost-experiences", experienceIds: next }
                          return updated
                        })
                      }}
                      className={`px-3 py-2 rounded-md border text-xs font-medium transition-all active:scale-95 ${
                        picked
                          ? "bg-gold/15 border-gold/40 text-gold"
                          : "bg-input border-border text-muted-foreground hover:border-gold/30 hover:text-foreground"
                      } ${locked && !picked ? "opacity-60" : ""}`}
                    >
                      {exp.name}
                      <span className="ml-1 text-[10px]">
                        ({formatModifier(exp.modifier)})
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>
          )}
        </AdvancementOption>

        {/* Extra Domain Card (1 slot) */}
        <AdvancementOption
          title="Extra Domain Card"
          description={`Choose an additional domain card of your level or lower. (${slots.domainCard}/${SLOT_LIMITS.domainCard} used)`}
          icon={<BookOpen className="w-4 h-4" />}
          disabled={!canAddAdvancement || !slotAvailable("domainCard")}
          selected={advancements.some((a) => a.type === "extra-domain-card")}
          onSelect={() => {
            if (advancements.some((a) => a.type === "extra-domain-card")) {
              setAdvancements((prev) => prev.filter((a) => a.type !== "extra-domain-card"))
              setNewDomainCard("")
            } else if (canAddAdvancement && slotAvailable("domainCard")) {
              setAdvancements((prev) => [...prev, { type: "extra-domain-card" }])
            }
          }}
        />

        {/* Increase Evasion (1 slot) */}
        <AdvancementOption
          title="Increase Evasion"
          description={`Permanently gain +1 to your Evasion. (${slots.evasion}/${SLOT_LIMITS.evasion} used)`}
          icon={<Eye className="w-4 h-4" />}
          disabled={!canAddAdvancement || !slotAvailable("evasion")}
          selected={advancements.some((a) => a.type === "increase-evasion")}
          onSelect={() => {
            if (advancements.some((a) => a.type === "increase-evasion")) {
              setAdvancements((prev) => prev.filter((a) => a.type !== "increase-evasion"))
            } else if (canAddAdvancement && slotAvailable("evasion")) {
              setAdvancements((prev) => [...prev, { type: "increase-evasion" }])
            }
          }}
        />
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verify it compiles**

Run: `cd web && npx tsc --noEmit --pretty 2>&1 | head -20`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add web/components/level-up/advancements-step.tsx
git commit -m "refactor: extract level-up AdvancementsStep component"
```

---

### Task 7: Create `components/level-up/domain-card-step.tsx`

**Files:**
- Create: `web/components/level-up/domain-card-step.tsx`

- [ ] **Step 1: Create the DomainCardStep component**

```tsx
// web/components/level-up/domain-card-step.tsx
"use client"

import { Badge } from "@/components/ui/badge"
import { Combobox, type ComboboxItem } from "@/components/ui/combobox"
import { type SrdDomainCard } from "@/lib/srd-data"
import { StepHeader } from "./primitives"
import { BookOpen } from "lucide-react"

interface DomainCardStepProps {
  domainCardItems: ComboboxItem[]
  newDomainCard: string
  onSelect: (value: string) => void
  srdNewCard: SrdDomainCard | undefined
  existingCardCount: number
}

export function DomainCardStep({
  domainCardItems,
  newDomainCard,
  onSelect,
  srdNewCard,
  existingCardCount,
}: DomainCardStepProps) {
  return (
    <div className="space-y-4">
      <StepHeader
        icon={<BookOpen className="w-5 h-5" />}
        title="Domain Card"
      />
      <p className="text-sm text-muted-foreground">
        Take an additional domain card of your level or lower from a domain
        you have access to. You can also skip this step.
      </p>

      <Combobox
        items={domainCardItems}
        value={newDomainCard}
        onSelect={onSelect}
        placeholder="Search domain cards..."
        searchPlaceholder="Type to search cards..."
        className="h-9 text-sm"
      />

      {srdNewCard && (
        <div className="bg-purple-deep/30 border border-border rounded-lg p-3 space-y-1">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Badge className="bg-purple-glow/20 text-gold border-purple-glow/40 text-[10px] px-1.5 py-0">
              {srdNewCard.domain}
            </Badge>
            <span>Lvl {srdNewCard.level}</span>
            <span>· Recall {srdNewCard.recallCost}</span>
          </div>
          <p className="text-xs text-muted-foreground/80 leading-relaxed">
            {srdNewCard.description}
          </p>
        </div>
      )}

      {existingCardCount >= 5 && newDomainCard && (
        <p className="text-xs text-amber-400/80">
          Your loadout is full (5/5). The new card will be added — you may need
          to move a card to your vault on the Character Sheet.
        </p>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Verify it compiles**

Run: `cd web && npx tsc --noEmit --pretty 2>&1 | head -20`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add web/components/level-up/domain-card-step.tsx
git commit -m "refactor: extract level-up DomainCardStep component"
```

---

### Task 8: Create `components/level-up/confirm-step.tsx`

**Files:**
- Create: `web/components/level-up/confirm-step.tsx`

- [ ] **Step 1: Create the ConfirmStep component**

```tsx
// web/components/level-up/confirm-step.tsx
"use client"

import { Button } from "@/components/ui/button"
import { type CharacterData } from "@/lib/character-types"
import { type AdvancementChoice, TRAIT_LABELS } from "@/lib/level-up-utils"
import { StepHeader, SummaryRow } from "./primitives"
import { Check } from "lucide-react"

interface ConfirmStepProps {
  character: CharacterData
  advancements: AdvancementChoice[]
  newDomainCard: string
  tierTransition: boolean
  nextLevel: number
  currentTier: number
  nextTier: number
  newExperienceName: string
  onApply: () => void
}

export function ConfirmStep({
  character: c,
  advancements,
  newDomainCard,
  tierTransition,
  nextLevel,
  currentTier,
  nextTier,
  newExperienceName,
  onApply,
}: ConfirmStepProps) {
  return (
    <div className="space-y-4">
      <StepHeader
        icon={<Check className="w-5 h-5" />}
        title="Confirm Level Up"
      />
      <p className="text-sm text-muted-foreground">
        Review your changes before applying:
      </p>

      <div className="space-y-2">
        <SummaryRow label="Level" value={`${c.level} → ${nextLevel}`} />
        {tierTransition && (
          <>
            <SummaryRow label="Tier" value={`${currentTier} → ${nextTier}`} />
            <SummaryRow
              label="Proficiency"
              value={`${c.proficiency ?? 1} → ${(c.proficiency ?? 1) + 1}`}
            />
            <SummaryRow
              label="New Experience"
              value={newExperienceName || "New experience (+2)"}
            />
          </>
        )}
        <SummaryRow
          label="Thresholds"
          value="Level bonus increases by +1 (computed automatically)"
        />
        {advancements.map((adv, i) => {
          let desc = ""
          switch (adv.type) {
            case "increase-traits":
              desc = `+1 ${TRAIT_LABELS[adv.traits[0]]}, +1 ${TRAIT_LABELS[adv.traits[1]]}`
              break
            case "add-hp":
              desc = `HP ${c.hpTotal} → ${c.hpTotal + 1}`
              break
            case "add-stress":
              desc = `Stress ${c.stressTotal} → ${c.stressTotal + 1}`
              break
            case "boost-experiences": {
              const names = adv.experienceIds
                .map((id) => c.experiences.find((e) => e.id === id)?.name)
                .filter(Boolean)
                .join(", ")
              desc = `+1 to ${names || "two Experiences"}`
              break
            }
            case "extra-domain-card":
              desc = "Extra domain card"
              break
            case "increase-evasion":
              desc = `Evasion ${c.evasion} → ${c.evasion + 1}`
              break
          }
          return (
            <SummaryRow key={i} label={`Advancement ${i + 1}`} value={desc} />
          )
        })}
        {newDomainCard && (
          <SummaryRow label="Domain Card" value={newDomainCard} />
        )}
      </div>

      <Button
        onClick={onApply}
        className="w-full bg-gold/20 text-gold border border-gold/40 hover:bg-gold/30 font-semibold"
      >
        <Check className="w-4 h-4 mr-2" />
        Apply Level Up
      </Button>
    </div>
  )
}
```

- [ ] **Step 2: Verify it compiles**

Run: `cd web && npx tsc --noEmit --pretty 2>&1 | head -20`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add web/components/level-up/confirm-step.tsx
git commit -m "refactor: extract level-up ConfirmStep component"
```

---

### Task 9: Create `components/level-up/wizard-shell.tsx`

**Files:**
- Create: `web/components/level-up/wizard-shell.tsx`

- [ ] **Step 1: Create the WizardShell component**

```tsx
// web/components/level-up/wizard-shell.tsx
"use client"

import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { type WizardStep } from "@/lib/level-up-utils"
import { ChevronRight } from "lucide-react"

const STEP_LABELS: Record<Exclude<WizardStep, "idle">, string> = {
  "tier-achievement": "Tier Achievement",
  "advancements": "Advancements",
  "domain-card": "Domain Card",
  "confirm": "Confirm",
}

interface WizardShellProps {
  step: Exclude<WizardStep, "idle">
  currentLevel: number
  nextLevel: number
  onNext: () => void
  onBack: () => void
  canProceed: boolean
  children: React.ReactNode
}

export function WizardShell({
  step,
  currentLevel,
  nextLevel,
  onNext,
  onBack,
  canProceed,
  children,
}: WizardShellProps) {
  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
      {/* Progress indicator */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <span className="text-gold font-semibold">
          Level {currentLevel} → {nextLevel}
        </span>
        <span className="ml-auto">
          {STEP_LABELS[step]}
        </span>
      </div>
      <Separator className="bg-border" />

      {children}

      {/* Navigation */}
      <Separator className="bg-border" />
      <div className="flex gap-3">
        <Button
          variant="outline"
          size="sm"
          onClick={onBack}
          className="border-border text-muted-foreground hover:text-foreground"
        >
          Back
        </Button>
        {step !== "confirm" && (
          <Button
            size="sm"
            onClick={onNext}
            disabled={!canProceed}
            className="ml-auto bg-gold/15 text-gold border border-gold/30 hover:bg-gold/25"
          >
            Next
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verify it compiles**

Run: `cd web && npx tsc --noEmit --pretty 2>&1 | head -20`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add web/components/level-up/wizard-shell.tsx
git commit -m "refactor: extract level-up WizardShell component"
```

---

### Task 10: Rewrite `components/level-up/level-up-tab.tsx` as orchestrator + create barrel re-export

**Files:**
- Create: `web/components/level-up/level-up-tab.tsx`
- Modify: `web/components/level-up-tab.tsx` (replace with barrel re-export)

- [ ] **Step 1: Create the new orchestrator component**

```tsx
// web/components/level-up/level-up-tab.tsx
"use client"

import { useState, useMemo, useCallback } from "react"
import { type ComboboxItem } from "@/components/ui/combobox"
import { type CharacterData, getTier } from "@/lib/character-types"
import { SRD_DOMAIN_CARDS, SRD_CLASSES } from "@/lib/srd-data"
import { Sparkles } from "lucide-react"
import {
  type WizardStep,
  type AdvancementChoice,
  isTierTransition,
  getTierSlots,
  slotAvailable as checkSlotAvailable,
  applyLevelUp,
  SLOT_LIMITS,
} from "@/lib/level-up-utils"
import { IdleState } from "./idle-state"
import { WizardShell } from "./wizard-shell"
import { TierAchievementStep } from "./tier-achievement-step"
import { AdvancementsStep } from "./advancements-step"
import { DomainCardStep } from "./domain-card-step"
import { ConfirmStep } from "./confirm-step"

// ─── Main Component ─────────────────────────────────────────────────────────

interface LevelUpTabProps {
  character: CharacterData
  setCharacter: (
    updater: CharacterData | ((prev: CharacterData) => CharacterData)
  ) => void
  isLoaded: boolean
}

export function LevelUpTab({ character: c, setCharacter, isLoaded }: LevelUpTabProps) {
  const [step, setStep] = useState<WizardStep>("idle")
  const [advancements, setAdvancements] = useState<AdvancementChoice[]>([])
  const [traitPicks, setTraitPicks] = useState<string[]>([])
  const [newDomainCard, setNewDomainCard] = useState<string>("")
  const [newExperienceName, setNewExperienceName] = useState("")

  const nextLevel = c.level + 1
  const currentTier = getTier(c.level)
  const nextTier = getTier(nextLevel)
  const tierTransition = isTierTransition(nextLevel)

  const slots = getTierSlots(c, nextTier)

  const selectedClass = useMemo(
    () => SRD_CLASSES.find((cls) => cls.name === c.class),
    [c.class]
  )

  const domainCardItems = useMemo<ComboboxItem[]>(() => {
    let cards = SRD_DOMAIN_CARDS.filter((dc) => dc.level <= nextLevel)
    if (selectedClass) {
      const classDomains = selectedClass.domains
      cards = cards.filter((dc) => classDomains.includes(dc.domain))
    }
    const existing = new Set(c.domainCards.map((d) => d.name))
    cards = cards.filter((dc) => !existing.has(dc.name))
    return cards.map((dc) => ({
      value: dc.name,
      label: dc.name,
      detail: `Lvl ${dc.level} · Recall ${dc.recallCost}`,
      group: dc.domain,
    }))
  }, [selectedClass, nextLevel, c.domainCards])

  const srdNewCard = useMemo(
    () => SRD_DOMAIN_CARDS.find((dc) => dc.name === newDomainCard),
    [newDomainCard]
  )

  const canAddAdvancement = advancements.length < 2

  const reset = useCallback(() => {
    setStep("idle")
    setAdvancements([])
    setTraitPicks([])
    setNewDomainCard("")
    setNewExperienceName("")
  }, [])

  const slotAvailableFn = useCallback(
    (key: keyof typeof SLOT_LIMITS) => checkSlotAvailable(slots, advancements, key),
    [slots, advancements]
  )

  const handleApplyLevelUp = useCallback(() => {
    setCharacter((prev) =>
      applyLevelUp(prev, {
        nextLevel,
        nextTier,
        tierTransition,
        advancements,
        newDomainCard,
        newExperienceName,
      })
    )
    reset()
  }, [nextLevel, nextTier, tierTransition, advancements, newDomainCard, newExperienceName, setCharacter, reset])

  // ── Navigation ─────────────────────────────────────────────────
  const needsDomainCard = advancements.some((a) => a.type === "extra-domain-card")

  const goNext = useCallback(() => {
    const steps: WizardStep[] = [
      ...(tierTransition ? ["tier-achievement" as const] : []),
      "advancements",
      ...(needsDomainCard ? ["domain-card" as const] : []),
      "confirm",
    ]
    const idx = steps.indexOf(step)
    if (idx < steps.length - 1) setStep(steps[idx + 1])
  }, [step, tierTransition, needsDomainCard])

  const goBack = useCallback(() => {
    const steps: WizardStep[] = [
      ...(tierTransition ? ["tier-achievement" as const] : []),
      "advancements",
      ...(needsDomainCard ? ["domain-card" as const] : []),
      "confirm",
    ]
    const idx = steps.indexOf(step)
    if (idx > 0) setStep(steps[idx - 1])
    else reset()
  }, [step, tierTransition, needsDomainCard, reset])

  // ── Render ─────────────────────────────────────────────────────

  if (!isLoaded) {
    return (
      <div className="p-4 space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-16 rounded-lg bg-card animate-pulse" />
        ))}
      </div>
    )
  }

  if (c.level >= 10) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8 text-center space-y-4">
        <Sparkles className="w-12 h-12 text-gold mx-auto" />
        <h2 className="text-xl font-bold text-gold">Maximum Level Reached</h2>
        <p className="text-sm text-muted-foreground">
          Your character is at Level 10 — the pinnacle of power in Daggerheart.
        </p>
      </div>
    )
  }

  if (step === "idle") {
    return (
      <IdleState
        character={c}
        nextLevel={nextLevel}
        currentTier={currentTier}
        nextTier={nextTier}
        tierTransition={tierTransition}
        slots={slots}
        onStart={() => setStep(tierTransition ? "tier-achievement" : "advancements")}
      />
    )
  }

  const canProceed = step !== "advancements" || (
    advancements.length >= 2 &&
    !advancements.some((a) => a.type === "boost-experiences" && a.experienceIds.length < 2)
  )

  return (
    <WizardShell
      step={step}
      currentLevel={c.level}
      nextLevel={nextLevel}
      onNext={goNext}
      onBack={goBack}
      canProceed={canProceed}
    >
      {step === "tier-achievement" && (
        <TierAchievementStep
          nextLevel={nextLevel}
          nextTier={nextTier}
          selectedClass={selectedClass}
          proficiency={c.proficiency ?? 1}
          newExperienceName={newExperienceName}
          onExperienceNameChange={setNewExperienceName}
        />
      )}

      {step === "advancements" && (
        <AdvancementsStep
          character={c}
          advancements={advancements}
          setAdvancements={setAdvancements}
          traitPicks={traitPicks}
          setTraitPicks={setTraitPicks}
          canAddAdvancement={canAddAdvancement}
          slotAvailable={slotAvailableFn}
          slots={slots}
          setNewDomainCard={setNewDomainCard}
        />
      )}

      {step === "domain-card" && (
        <DomainCardStep
          domainCardItems={domainCardItems}
          newDomainCard={newDomainCard}
          onSelect={setNewDomainCard}
          srdNewCard={srdNewCard}
          existingCardCount={c.domainCards.length}
        />
      )}

      {step === "confirm" && (
        <ConfirmStep
          character={c}
          advancements={advancements}
          newDomainCard={newDomainCard}
          tierTransition={tierTransition}
          nextLevel={nextLevel}
          currentTier={currentTier}
          nextTier={nextTier}
          newExperienceName={newExperienceName}
          onApply={handleApplyLevelUp}
        />
      )}
    </WizardShell>
  )
}
```

- [ ] **Step 2: Replace the original file with a barrel re-export**

Replace the entire contents of `web/components/level-up-tab.tsx` with:

```tsx
export { LevelUpTab } from "./level-up/level-up-tab"
```

- [ ] **Step 3: Verify it compiles**

Run: `cd web && npx tsc --noEmit --pretty 2>&1 | head -20`
Expected: No errors

- [ ] **Step 4: Commit**

```bash
git add web/components/level-up/level-up-tab.tsx web/components/level-up-tab.tsx
git commit -m "refactor: rewrite level-up-tab as orchestrator with barrel re-export"
```

---

### Task 11: Create `components/loot/roller-section.tsx`

**Files:**
- Create: `web/components/loot/roller-section.tsx`

- [ ] **Step 1: Create the RollerSection component**

```tsx
// web/components/loot/roller-section.tsx
"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  type LootRarity,
  type LootItemType,
  type DiceOption,
  RARITIES,
  RARITY_DICE,
  RARITY_BADGE_COLORS,
} from "@/lib/loot-types"
import { lookupItem } from "@/lib/loot-types"
import { Package, FlaskConical, Dices } from "lucide-react"
import { cn } from "@/lib/utils"

function rarityLabel(r: LootRarity) {
  return r.charAt(0).toUpperCase() + r.slice(1)
}

function diceLabel(opt: DiceOption) {
  return `${opt.count}d12`
}

export type LastResult = ReturnType<typeof lookupItem> & {
  tableIndex: number
  rarity: LootRarity
  itemType: LootItemType
}

interface RollerSectionProps {
  itemType: LootItemType | "mixed"
  setItemType: (value: LootItemType | "mixed") => void
  rarity: LootRarity
  onRarityChange: (value: LootRarity) => void
  diceIndex: 0 | 1
  setDiceIndex: (value: 0 | 1) => void
  quantity: 1 | 2 | 3 | 5
  setQuantity: (value: 1 | 2 | 3 | 5) => void
  rollInput: string
  setRollInput: (value: string) => void
  lastResult: LastResult | null
  diceOptions: [DiceOption, DiceOption]
  selectedDice: DiceOption
  onLookUp: () => void
}

export function RollerSection({
  itemType,
  setItemType,
  rarity,
  onRarityChange,
  diceIndex,
  setDiceIndex,
  quantity,
  setQuantity,
  rollInput,
  setRollInput,
  lastResult,
  diceOptions,
  selectedDice,
  onLookUp,
}: RollerSectionProps) {
  const rollValid = !isNaN(parseInt(rollInput, 10))

  return (
    <section className="space-y-4">
      {/* Item type */}
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Type
        </label>
        <div className="flex gap-2 flex-wrap">
          {(["item", "consumable", "mixed"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setItemType(t)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm border transition-colors",
                itemType === t
                  ? "bg-gold/15 text-gold border-gold/30"
                  : "bg-transparent text-muted-foreground border-border hover:text-foreground hover:bg-muted/50"
              )}
            >
              {t === "item" && <Package className="w-3.5 h-3.5" />}
              {t === "consumable" && <FlaskConical className="w-3.5 h-3.5" />}
              {t === "mixed" && <Dices className="w-3.5 h-3.5" />}
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Rarity */}
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Rarity
        </label>
        <div className="flex gap-2 flex-wrap">
          {RARITIES.map((r) => (
            <button
              key={r}
              onClick={() => onRarityChange(r)}
              className={cn(
                "px-3 py-1.5 rounded-md text-sm border transition-colors",
                rarity === r
                  ? "bg-gold/15 text-gold border-gold/30"
                  : "bg-transparent text-muted-foreground border-border hover:text-foreground hover:bg-muted/50"
              )}
            >
              {rarityLabel(r)}
            </button>
          ))}
        </div>
      </div>

      {/* Dice guidance */}
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Dice to Roll
        </label>
        <div className="flex gap-2">
          {diceOptions.map((opt, idx) => (
            <button
              key={idx}
              onClick={() => setDiceIndex(idx as 0 | 1)}
              className={cn(
                "flex flex-col items-center px-4 py-2 rounded-md border text-sm font-medium transition-colors min-w-[80px]",
                diceIndex === idx
                  ? "bg-gold/15 text-gold border-gold/30"
                  : "bg-transparent text-muted-foreground border-border hover:text-foreground hover:bg-muted/50"
              )}
            >
              <span className="text-base font-bold">{diceLabel(opt)}</span>
              <span className="text-[10px] opacity-70">range {opt.min}–{opt.max}</span>
            </button>
          ))}
        </div>
        <p className="text-[11px] text-muted-foreground pl-0.5">
          Higher dice count skews results toward the middle of the range.
        </p>
      </div>

      {/* Quantity */}
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Quantity
        </label>
        <div className="flex gap-2">
          {([1, 2, 3, 5] as const).map((q) => (
            <button
              key={q}
              onClick={() => setQuantity(q)}
              className={cn(
                "w-10 h-10 rounded-md border text-sm font-medium transition-colors",
                quantity === q
                  ? "bg-gold/15 text-gold border-gold/30"
                  : "bg-transparent text-muted-foreground border-border hover:text-foreground hover:bg-muted/50"
              )}
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Roll input */}
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Your Roll Total
        </label>
        <div className="flex gap-2">
          <input
            type="number"
            inputMode="numeric"
            min={selectedDice.min}
            max={selectedDice.max}
            value={rollInput}
            onChange={(e) => setRollInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && rollValid && onLookUp()}
            placeholder={`${selectedDice.min}–${selectedDice.max}`}
            className="w-28 h-10 rounded-md border border-border bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/50"
          />
          <Button
            onClick={onLookUp}
            disabled={!rollValid}
            className="bg-gold/90 hover:bg-gold text-black font-semibold"
          >
            Look Up
          </Button>
        </div>
      </div>

      {/* Result card */}
      {lastResult && (
        <div className="rounded-lg border border-gold/30 bg-gold/5 p-4 space-y-1.5 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-foreground">{lastResult.name}</span>
            <Badge
              variant="outline"
              className={cn("text-[10px] border", RARITY_BADGE_COLORS[lastResult.rarity])}
            >
              {rarityLabel(lastResult.rarity)}
            </Badge>
            <Badge variant="outline" className="text-[10px] border border-border text-muted-foreground">
              {lastResult.itemType === "item" ? "Item" : "Consumable"}
            </Badge>
            <span className="text-[10px] text-muted-foreground ml-auto">#{lastResult.tableIndex}</span>
          </div>
          <p className="text-sm text-muted-foreground">{lastResult.description}</p>
        </div>
      )}
    </section>
  )
}
```

- [ ] **Step 2: Verify it compiles**

Run: `cd web && npx tsc --noEmit --pretty 2>&1 | head -20`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add web/components/loot/roller-section.tsx
git commit -m "refactor: extract loot RollerSection component"
```

---

### Task 12: Create `components/loot/gold-section.tsx`

**Files:**
- Create: `web/components/loot/gold-section.tsx`

- [ ] **Step 1: Create the GoldSection component**

```tsx
// web/components/loot/gold-section.tsx
"use client"

import { Button } from "@/components/ui/button"
import { type GoldDenomination, GOLD_LABELS } from "@/lib/loot-types"
import { Coins } from "lucide-react"

interface GoldSectionProps {
  goldHandfuls: number
  goldBags: number
  goldChests: number
  onAddGold: (denomination: GoldDenomination) => void
}

export function GoldSection({ goldHandfuls, goldBags, goldChests, onAddGold }: GoldSectionProps) {
  return (
    <section className="space-y-3">
      <div className="flex items-center gap-2">
        <Coins className="w-4 h-4 text-gold" />
        <span className="text-sm font-semibold">Gold</span>
        <div className="ml-auto flex items-center gap-3 text-xs text-muted-foreground">
          <span>{goldHandfuls} handful{goldHandfuls !== 1 ? "s" : ""}</span>
          <span>{goldBags} bag{goldBags !== 1 ? "s" : ""}</span>
          <span>{goldChests} chest{goldChests !== 1 ? "s" : ""}</span>
        </div>
      </div>
      <div className="flex gap-2">
        {(["handful", "bag", "chest"] as GoldDenomination[]).map((d) => (
          <Button
            key={d}
            variant="outline"
            size="sm"
            onClick={() => onAddGold(d)}
            className="text-xs"
          >
            +{GOLD_LABELS[d]}
          </Button>
        ))}
      </div>
      <p className="text-[11px] text-muted-foreground">10 Handfuls = 1 Bag · 10 Bags = 1 Chest · Max 1 Chest</p>
    </section>
  )
}
```

- [ ] **Step 2: Verify it compiles**

Run: `cd web && npx tsc --noEmit --pretty 2>&1 | head -20`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add web/components/loot/gold-section.tsx
git commit -m "refactor: extract loot GoldSection component"
```

---

### Task 13: Create `components/loot/session-log.tsx`

**Files:**
- Create: `web/components/loot/session-log.tsx`

- [ ] **Step 1: Create the SessionLog component**

```tsx
// web/components/loot/session-log.tsx
"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { RARITY_BADGE_COLORS, GOLD_LABELS } from "@/lib/loot-types"
import { ScrollText, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"

function rarityLabel(r: string) {
  return r.charAt(0).toUpperCase() + r.slice(1)
}

function formatTime(ts: number) {
  return new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
}

interface LogEntry {
  id: string
  type: "item" | "gold"
  timestamp: number
  name?: string
  rarity?: string
  itemType?: string
  tableIndex?: number
  goldDenomination?: string
}

interface SessionLogProps {
  log: LogEntry[]
  onClear: () => void
  confirmClear: boolean
}

export function SessionLog({ log, onClear, confirmClear }: SessionLogProps) {
  return (
    <section className="space-y-3">
      <div className="flex items-center gap-2">
        <ScrollText className="w-4 h-4 text-muted-foreground" />
        <span className="text-sm font-semibold">Session Log</span>
        <span className="text-[10px] text-muted-foreground ml-1">
          {log.length} entr{log.length === 1 ? "y" : "ies"}
        </span>
        {log.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClear}
            className={cn(
              "ml-auto text-xs",
              confirmClear
                ? "text-destructive hover:text-destructive"
                : "text-muted-foreground hover:text-destructive"
            )}
          >
            <Trash2 className="w-3 h-3 mr-1" />
            {confirmClear ? "Confirm clear?" : "End Session"}
          </Button>
        )}
      </div>

      {log.length === 0 && (
        <p className="text-xs text-muted-foreground py-4 text-center">
          Nothing logged yet. Roll some loot!
        </p>
      )}

      <div className="space-y-1.5">
        {log.map((entry) => (
          <div
            key={entry.id}
            className="flex items-start gap-3 rounded-md border border-border bg-card/40 px-3 py-2"
          >
            {entry.type === "item" ? (
              <>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-sm font-medium text-foreground truncate">{entry.name}</span>
                    <Badge
                      variant="outline"
                      className={cn("text-[9px] border shrink-0", RARITY_BADGE_COLORS[entry.rarity as keyof typeof RARITY_BADGE_COLORS])}
                    >
                      {rarityLabel(entry.rarity!)}
                    </Badge>
                    <Badge variant="outline" className="text-[9px] border border-border text-muted-foreground shrink-0">
                      {entry.itemType === "item" ? "Item" : "Consumable"}
                    </Badge>
                    <span className="text-[9px] text-muted-foreground shrink-0">#{entry.tableIndex}</span>
                  </div>
                </div>
                <span className="text-[10px] text-muted-foreground shrink-0 mt-0.5">
                  {formatTime(entry.timestamp)}
                </span>
              </>
            ) : (
              <>
                <div className="flex-1">
                  <span className="text-sm text-gold/80">
                    +{GOLD_LABELS[entry.goldDenomination as keyof typeof GOLD_LABELS]} of gold
                  </span>
                </div>
                <span className="text-[10px] text-muted-foreground shrink-0 mt-0.5">
                  {formatTime(entry.timestamp)}
                </span>
              </>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Verify it compiles**

Run: `cd web && npx tsc --noEmit --pretty 2>&1 | head -20`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add web/components/loot/session-log.tsx
git commit -m "refactor: extract loot SessionLog component"
```

---

### Task 14: Rewrite `components/loot/loot-tab.tsx` as orchestrator + create barrel re-export

**Files:**
- Create: `web/components/loot/loot-tab.tsx`
- Modify: `web/components/loot-tab.tsx` (replace with barrel re-export)

- [ ] **Step 1: Create the new orchestrator component**

```tsx
// web/components/loot/loot-tab.tsx
"use client"

import { useState, useCallback } from "react"
import { Separator } from "@/components/ui/separator"
import { useLootStore } from "@/hooks/use-loot-store"
import {
  type LootRarity,
  type LootItemType,
  type GoldDenomination,
  RARITY_DICE,
} from "@/lib/loot-types"
import { Dices } from "lucide-react"
import { RollerSection, type LastResult } from "./roller-section"
import { GoldSection } from "./gold-section"
import { SessionLog } from "./session-log"

export function LootTab() {
  const { store, isLoaded, logItem, addGold, clearLog } = useLootStore()

  const [itemType, setItemType] = useState<LootItemType | "mixed">("item")
  const [rarity, setRarity] = useState<LootRarity>("common")
  const [diceIndex, setDiceIndex] = useState<0 | 1>(0)
  const [quantity, setQuantity] = useState<1 | 2 | 3 | 5>(1)
  const [rollInput, setRollInput] = useState("")
  const [lastResult, setLastResult] = useState<LastResult | null>(null)
  const [confirmClear, setConfirmClear] = useState(false)

  const diceOptions = RARITY_DICE[rarity]
  const selectedDice = diceOptions[diceIndex]

  const handleLookUp = useCallback(() => {
    const total = parseInt(rollInput, 10)
    if (isNaN(total)) return

    for (let i = 0; i < quantity; i++) {
      let resolvedType: LootItemType
      if (itemType === "mixed") {
        resolvedType = Math.random() < 0.5 ? "item" : "consumable"
      } else {
        resolvedType = itemType
      }

      const entry = logItem(resolvedType, rarity, selectedDice, total)
      if (i === 0) {
        setLastResult({
          roll: entry.tableIndex!,
          name: entry.name!,
          description: entry.description!,
          tableIndex: entry.tableIndex!,
          rarity,
          itemType: resolvedType,
        })
      }
    }
    setRollInput("")
  }, [rollInput, quantity, itemType, rarity, selectedDice, logItem])

  const handleGold = useCallback(
    (denomination: GoldDenomination) => {
      addGold(denomination)
    },
    [addGold]
  )

  const handleClearLog = useCallback(() => {
    if (confirmClear) {
      clearLog()
      setLastResult(null)
      setConfirmClear(false)
    } else {
      setConfirmClear(true)
      setTimeout(() => setConfirmClear(false), 3000)
    }
  }, [confirmClear, clearLog])

  const handleRarityChange = useCallback((r: LootRarity) => {
    setRarity(r)
    setDiceIndex(0)
  }, [])

  if (!isLoaded) {
    return (
      <div className="p-4 space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-16 rounded-lg bg-card animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <div className="max-w-2xl mx-auto w-full px-4 pb-8 space-y-6">
        {/* Header */}
        <div className="py-4 space-y-1">
          <h1 className="text-lg font-semibold text-gold flex items-center gap-2">
            <Dices className="w-5 h-5" />
            Loot Generator
          </h1>
          <p className="text-xs text-muted-foreground">
            Roll physical dice, enter the total, get the item.
          </p>
        </div>
        <Separator className="bg-border -mt-4" />

        <RollerSection
          itemType={itemType}
          setItemType={setItemType}
          rarity={rarity}
          onRarityChange={handleRarityChange}
          diceIndex={diceIndex}
          setDiceIndex={setDiceIndex}
          quantity={quantity}
          setQuantity={setQuantity}
          rollInput={rollInput}
          setRollInput={setRollInput}
          lastResult={lastResult}
          diceOptions={diceOptions}
          selectedDice={selectedDice}
          onLookUp={handleLookUp}
        />

        <GoldSection
          goldHandfuls={store.goldHandfuls}
          goldBags={store.goldBags}
          goldChests={store.goldChests}
          onAddGold={handleGold}
        />

        <SessionLog
          log={store.log}
          onClear={handleClearLog}
          confirmClear={confirmClear}
        />
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Replace the original file with a barrel re-export**

Replace the entire contents of `web/components/loot-tab.tsx` with:

```tsx
export { LootTab } from "./loot/loot-tab"
```

- [ ] **Step 3: Verify it compiles**

Run: `cd web && npx tsc --noEmit --pretty 2>&1 | head -20`
Expected: No errors

- [ ] **Step 4: Commit**

```bash
git add web/components/loot/loot-tab.tsx web/components/loot-tab.tsx
git commit -m "refactor: rewrite loot-tab as orchestrator with barrel re-export"
```

---

### Task 15: Final verification

**Files:** None (verification only)

- [ ] **Step 1: Run TypeScript compilation check**

Run: `cd web && npx tsc --noEmit --pretty`
Expected: No errors

- [ ] **Step 2: Run the dev server and verify visually**

Run: `cd web && npx next dev`
Expected: App starts without errors. Verify:
1. Level-up idle state renders correctly with preview and slots
2. Full wizard flow: tier achievement → advancements → domain card → confirm → apply
3. Loot roller: type/rarity/dice/quantity selection, roll input, result display
4. Gold denomination tracking
5. Session log: entries appear, clear with confirmation works

- [ ] **Step 3: Check file sizes to confirm improvement**

Run: `find web/components/level-up web/components/loot web/lib/level-up-utils.ts web/components/ui/button-group.tsx -name "*.tsx" -o -name "*.ts" | while read f; do lines=$(wc -l < "$f"); echo "$lines $f"; done | sort -rn`

Expected: No file exceeds ~250 lines. Total line count should be similar to original (916 + 390 = 1306) plus overhead from imports/props.
