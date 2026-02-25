"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { useCharacterSheet } from "@/hooks/use-character-sheet"
import { getTier, formatModifier, type Experience, type DomainCard } from "@/lib/character-types"
import { cn } from "@/lib/utils"
import {
  Heart,
  Brain,
  Shield,
  Dumbbell,
  Star,
  BookOpen,
  Sword,
  Coins,
  Scroll,
  NotebookPen,
  ChevronDown,
  Plus,
  Trash2,
  RotateCcw,
} from "lucide-react"

// ─── Slot Toggle ──────────────────────────────────────────────────────────────

function toggleSlot(marked: number, index: number): number {
  // Tap filled slot → reduce mark, tap empty slot → fill up to that slot
  return index < marked ? index : index + 1
}

interface SlotTrackerProps {
  total: number
  marked: number
  onToggle: (n: number) => void
  filledClass: string
  emptyClass: string
  label: string
}

function SlotTracker({ total, marked, onToggle, filledClass, emptyClass, label }: SlotTrackerProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {Array.from({ length: total }, (_, i) => (
        <button
          key={i}
          onClick={() => onToggle(toggleSlot(marked, i))}
          className={cn(
            "min-w-[44px] min-h-[44px] rounded-md border-2 transition-all active:scale-95 focus:outline-none focus:ring-2 focus:ring-gold/50",
            i < marked ? filledClass : emptyClass
          )}
          aria-label={`${label} slot ${i + 1} ${i < marked ? "(marked)" : "(empty)"}`}
        />
      ))}
    </div>
  )
}

// ─── Counter (Hope, Gold) ─────────────────────────────────────────────────────

interface CounterProps {
  value: number
  onChange: (v: number) => void
  min?: number
  max?: number
  label: string
  size?: "sm" | "md"
}

function Counter({ value, onChange, min = 0, max = 99, label, size = "md" }: CounterProps) {
  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="icon"
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        className={cn(
          "border-border bg-input text-foreground hover:bg-secondary shrink-0",
          size === "sm" ? "h-7 w-7" : "h-9 w-9"
        )}
        aria-label={`Decrease ${label}`}
      >
        −
      </Button>
      <span
        className={cn(
          "font-bold text-gold text-center tabular-nums",
          size === "sm" ? "text-lg w-6" : "text-2xl w-8"
        )}
      >
        {value}
      </span>
      <Button
        variant="outline"
        size="icon"
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        className={cn(
          "border-border bg-input text-foreground hover:bg-secondary shrink-0",
          size === "sm" ? "h-7 w-7" : "h-9 w-9"
        )}
        aria-label={`Increase ${label}`}
      >
        +
      </Button>
    </div>
  )
}

// ─── Section Wrapper ──────────────────────────────────────────────────────────

interface SectionProps {
  icon: React.ReactNode
  title: string
  defaultOpen?: boolean
  children: React.ReactNode
}

function Section({ icon, title, defaultOpen = false, children }: SectionProps) {
  return (
    <>
      <Collapsible defaultOpen={defaultOpen}>
        <CollapsibleTrigger className="flex items-center justify-between w-full py-3 group">
          <div className="flex items-center gap-2">
            <span className="text-gold">{icon}</span>
            <span className="text-xs text-muted-foreground uppercase tracking-widest font-semibold">
              {title}
            </span>
          </div>
          <ChevronDown className="w-4 h-4 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180" />
        </CollapsibleTrigger>
        <CollapsibleContent className="pb-4">
          {children}
        </CollapsibleContent>
      </Collapsible>
      <Separator className="bg-border" />
    </>
  )
}

// ─── Stat Box ─────────────────────────────────────────────────────────────────

interface StatBoxProps {
  label: string
  value: number | string
  sub?: string
}

function StatBox({ label, value, sub }: StatBoxProps) {
  return (
    <div className="flex flex-col items-center justify-center bg-purple-deep/50 border border-border rounded-lg p-3 min-w-[72px]">
      <span className="text-xs text-muted-foreground uppercase tracking-wider">{label}</span>
      <span className="text-xl font-bold text-gold">{value}</span>
      {sub && <span className="text-xs text-muted-foreground">{sub}</span>}
    </div>
  )
}

// ─── Trait Stepper ────────────────────────────────────────────────────────────

interface TraitStepperProps {
  label: string
  value: number
  onChange: (v: number) => void
}

function TraitStepper({ label, value, onChange }: TraitStepperProps) {
  return (
    <div className="flex items-center justify-between bg-purple-deep/50 border border-border rounded-lg px-3 py-2">
      <span className="text-xs text-muted-foreground uppercase tracking-wider w-10">{label}</span>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onChange(Math.max(-3, value - 1))}
          className="w-7 h-7 flex items-center justify-center rounded border border-border bg-input text-foreground hover:bg-secondary active:scale-95 text-sm"
          aria-label={`Decrease ${label}`}
        >
          −
        </button>
        <span className="w-8 text-center font-bold text-gold tabular-nums">
          {formatModifier(value)}
        </span>
        <button
          onClick={() => onChange(Math.min(5, value + 1))}
          className="w-7 h-7 flex items-center justify-center rounded border border-border bg-input text-foreground hover:bg-secondary active:scale-95 text-sm"
          aria-label={`Increase ${label}`}
        >
          +
        </button>
      </div>
    </div>
  )
}

// ─── Number Stepper Input ──────────────────────────────────────────────────────

interface NumberStepperProps {
  label: string
  value: number
  onChange: (v: number) => void
  min?: number
  max?: number
}

function NumberStepper({ label, value, onChange, min = 0, max = 20 }: NumberStepperProps) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-muted-foreground flex-1">{label}</span>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onChange(Math.max(min, value - 1))}
          className="w-7 h-7 flex items-center justify-center rounded border border-border bg-input text-foreground hover:bg-secondary active:scale-95 text-sm"
          aria-label={`Decrease ${label}`}
        >
          −
        </button>
        <span className="w-8 text-center font-bold text-gold tabular-nums">{value}</span>
        <button
          onClick={() => onChange(Math.min(max, value + 1))}
          className="w-7 h-7 flex items-center justify-center rounded border border-border bg-input text-foreground hover:bg-secondary active:scale-95 text-sm"
          aria-label={`Increase ${label}`}
        >
          +
        </button>
      </div>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function CharacterSheetTab() {
  const { character: c, setCharacter, resetCharacter, isLoaded } = useCharacterSheet()
  const [confirmReset, setConfirmReset] = useState(false)

  const update = (patch: Partial<typeof c>) => setCharacter((prev) => ({ ...prev, ...patch }))

  if (!isLoaded) {
    return (
      <div className="p-4 space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-16 rounded-lg bg-card animate-pulse" />
        ))}
      </div>
    )
  }

  const tier = getTier(c.level)

  const handleReset = () => {
    if (confirmReset) {
      resetCharacter()
      setConfirmReset(false)
    } else {
      setConfirmReset(true)
      setTimeout(() => setConfirmReset(false), 3000)
    }
  }

  const addExperience = () => {
    const newExp: Experience = { id: crypto.randomUUID(), name: "", modifier: 2 }
    update({ experiences: [...c.experiences, newExp] })
  }

  const updateExperience = (id: string, patch: Partial<Experience>) => {
    update({
      experiences: c.experiences.map((e) => (e.id === id ? { ...e, ...patch } : e)),
    })
  }

  const removeExperience = (id: string) => {
    update({ experiences: c.experiences.filter((e) => e.id !== id) })
  }

  const addDomainCard = () => {
    if (c.domainCards.length >= 5) return
    const newCard: DomainCard = { id: crypto.randomUUID(), name: "", level: 1, domain: "" }
    update({ domainCards: [...c.domainCards, newCard] })
  }

  const updateDomainCard = (id: string, patch: Partial<DomainCard>) => {
    update({
      domainCards: c.domainCards.map((d) => (d.id === id ? { ...d, ...patch } : d)),
    })
  }

  const removeDomainCard = (id: string) => {
    update({ domainCards: c.domainCards.filter((d) => d.id !== id) })
  }

  const addItem = () => {
    update({ items: [...c.items, ""] })
  }

  const updateItem = (index: number, value: string) => {
    const items = [...c.items]
    items[index] = value
    update({ items })
  }

  const removeItem = (index: number) => {
    update({ items: c.items.filter((_, i) => i !== index) })
  }

  return (
    <div className="max-w-2xl mx-auto px-4 pb-8">

      {/* ── Identity Header ──────────────────────────────────────── */}
      <div className="py-4 space-y-3">
        <Input
          value={c.name}
          onChange={(e) => update({ name: e.target.value })}
          placeholder="Character name…"
          className="text-lg font-semibold text-gold bg-transparent border-0 border-b border-border rounded-none px-0 focus-visible:ring-0 placeholder:text-muted-foreground/50"
        />
        <div className="flex flex-wrap gap-2 items-center">
          {/* Level selector */}
          <div className="flex items-center gap-1">
            <span className="text-xs text-muted-foreground">Lvl</span>
            <select
              value={c.level}
              onChange={(e) => update({ level: Number(e.target.value) })}
              className="bg-input border border-border rounded px-2 py-1 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-gold"
              aria-label="Level"
            >
              {Array.from({ length: 10 }, (_, i) => i + 1).map((l) => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>
          </div>
          <Badge className="bg-purple-glow/20 text-gold border-purple-glow/40 text-xs">
            Tier {tier}
          </Badge>
          <Input
            value={c.class}
            onChange={(e) => update({ class: e.target.value })}
            placeholder="Class"
            className="flex-1 min-w-[100px] h-8 text-sm bg-input border-border"
          />
          <Input
            value={c.subclass}
            onChange={(e) => update({ subclass: e.target.value })}
            placeholder="Subclass"
            className="flex-1 min-w-[100px] h-8 text-sm bg-input border-border"
          />
        </div>
        <div className="flex gap-2">
          <Input
            value={c.ancestry}
            onChange={(e) => update({ ancestry: e.target.value })}
            placeholder="Ancestry"
            className="flex-1 h-8 text-sm bg-input border-border"
          />
          <Input
            value={c.community}
            onChange={(e) => update({ community: e.target.value })}
            placeholder="Community"
            className="flex-1 h-8 text-sm bg-input border-border"
          />
        </div>
      </div>

      <Separator className="bg-border mb-1" />

      {/* ── Vitals ───────────────────────────────────────────────── */}
      <Section icon={<Heart className="w-4 h-4" />} title="Vitals" defaultOpen>
        <div className="space-y-5">
          {/* HP */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-foreground">
                Hit Points
                <span className="text-xs text-muted-foreground ml-2">
                  {c.hpMarked}/{c.hpTotal} marked
                </span>
              </span>
              <NumberStepper
                label="Total"
                value={c.hpTotal}
                onChange={(v) => update({ hpTotal: v, hpMarked: Math.min(c.hpMarked, v) })}
                min={1}
                max={12}
              />
            </div>
            <SlotTracker
              total={c.hpTotal}
              marked={c.hpMarked}
              onToggle={(n) => update({ hpMarked: n })}
              filledClass="bg-destructive/60 border-destructive"
              emptyClass="bg-transparent border-border hover:border-destructive/50"
              label="HP"
            />
          </div>

          {/* Stress */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-foreground">
                Stress
                <span className="text-xs text-muted-foreground ml-2">
                  {c.stressMarked}/{c.stressTotal} marked
                </span>
              </span>
              <NumberStepper
                label="Total"
                value={c.stressTotal}
                onChange={(v) => update({ stressTotal: v, stressMarked: Math.min(c.stressMarked, v) })}
                min={1}
                max={12}
              />
            </div>
            <SlotTracker
              total={c.stressTotal}
              marked={c.stressMarked}
              onToggle={(n) => update({ stressMarked: n })}
              filledClass="bg-purple-glow/40 border-purple-glow"
              emptyClass="bg-transparent border-border hover:border-purple-glow/50"
              label="Stress"
            />
          </div>

          {/* Armor */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-foreground">
                Armor
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

          {/* Hope + Evasion + Damage Thresholds */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col items-center gap-1 bg-purple-deep/50 border border-border rounded-lg p-3">
              <span className="text-xs text-muted-foreground uppercase tracking-wider">Hope</span>
              <Counter
                value={c.hope}
                onChange={(v) => update({ hope: v })}
                min={0}
                max={12}
                label="Hope"
              />
            </div>
            <StatBox label="Evasion" value={c.evasion} />
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

          {/* Evasion stepper */}
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground flex-1">Evasion</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => update({ evasion: Math.max(0, c.evasion - 1) })}
                className="w-7 h-7 flex items-center justify-center rounded border border-border bg-input text-foreground hover:bg-secondary active:scale-95 text-sm"
              >
                −
              </button>
              <span className="w-8 text-center font-bold text-gold">{c.evasion}</span>
              <button
                onClick={() => update({ evasion: c.evasion + 1 })}
                className="w-7 h-7 flex items-center justify-center rounded border border-border bg-input text-foreground hover:bg-secondary active:scale-95 text-sm"
              >
                +
              </button>
            </div>
          </div>
        </div>
      </Section>

      {/* ── Traits ───────────────────────────────────────────────── */}
      <Section icon={<Dumbbell className="w-4 h-4" />} title="Traits">
        <div className="grid grid-cols-2 gap-2">
          <TraitStepper label="AGI" value={c.agility} onChange={(v) => update({ agility: v })} />
          <TraitStepper label="STR" value={c.strength} onChange={(v) => update({ strength: v })} />
          <TraitStepper label="FIN" value={c.finesse} onChange={(v) => update({ finesse: v })} />
          <TraitStepper label="INS" value={c.instinct} onChange={(v) => update({ instinct: v })} />
          <TraitStepper label="PRE" value={c.presence} onChange={(v) => update({ presence: v })} />
          <TraitStepper label="KNO" value={c.knowledge} onChange={(v) => update({ knowledge: v })} />
        </div>
        <p className="text-xs text-muted-foreground mt-3">
          Distribute: +2, +1, +1, +0, +0, −1
        </p>
      </Section>

      {/* ── Experiences ──────────────────────────────────────────── */}
      <Section icon={<Star className="w-4 h-4" />} title="Experiences">
        <div className="space-y-2">
          {c.experiences.length === 0 && (
            <p className="text-xs text-muted-foreground italic">
              No experiences yet. Add them below.
            </p>
          )}
          {c.experiences.map((exp) => (
            <div key={exp.id} className="flex items-center gap-2">
              <Input
                value={exp.name}
                onChange={(e) => updateExperience(exp.id, { name: e.target.value })}
                placeholder="Experience name…"
                className="flex-1 h-9 bg-input border-border text-sm"
              />
              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => updateExperience(exp.id, { modifier: Math.max(1, exp.modifier - 1) })}
                  className="w-7 h-7 flex items-center justify-center rounded border border-border bg-input text-foreground hover:bg-secondary active:scale-95 text-sm"
                >
                  −
                </button>
                <span className="w-8 text-center text-sm font-bold text-gold">
                  {formatModifier(exp.modifier)}
                </span>
                <button
                  onClick={() => updateExperience(exp.id, { modifier: Math.min(6, exp.modifier + 1) })}
                  className="w-7 h-7 flex items-center justify-center rounded border border-border bg-input text-foreground hover:bg-secondary active:scale-95 text-sm"
                >
                  +
                </button>
              </div>
              <button
                onClick={() => removeExperience(exp.id)}
                className="w-7 h-7 flex items-center justify-center rounded text-muted-foreground hover:text-destructive active:scale-95"
                aria-label="Remove experience"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
          <Button
            variant="outline"
            size="sm"
            onClick={addExperience}
            className="w-full border-dashed border-border text-muted-foreground hover:text-foreground hover:border-gold mt-1"
          >
            <Plus className="w-3.5 h-3.5 mr-1" /> Add Experience
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Spend Hope to add an experience modifier to a relevant roll.
        </p>
      </Section>

      {/* ── Domain Cards ──────────────────────────────────────────── */}
      <Section icon={<BookOpen className="w-4 h-4" />} title="Domain Cards">
        <div className="space-y-3">
          {c.domainCards.length === 0 && (
            <p className="text-xs text-muted-foreground italic">No domain cards yet.</p>
          )}
          {c.domainCards.map((card) => (
            <div key={card.id} className="space-y-1.5 bg-purple-deep/30 border border-border rounded-lg p-3">
              <div className="flex items-center gap-2">
                <Input
                  value={card.name}
                  onChange={(e) => updateDomainCard(card.id, { name: e.target.value })}
                  placeholder="Card name…"
                  className="flex-1 h-8 bg-input border-border text-sm font-medium"
                />
                <button
                  onClick={() => removeDomainCard(card.id)}
                  className="w-7 h-7 flex items-center justify-center rounded text-muted-foreground hover:text-destructive active:scale-95 shrink-0"
                  aria-label="Remove card"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="flex gap-2">
                <Input
                  value={card.domain}
                  onChange={(e) => updateDomainCard(card.id, { domain: e.target.value })}
                  placeholder="Domain"
                  className="flex-1 h-7 bg-input border-border text-xs"
                />
                <div className="flex items-center gap-1">
                  <span className="text-xs text-muted-foreground">Lvl</span>
                  <select
                    value={card.level}
                    onChange={(e) => updateDomainCard(card.id, { level: Number(e.target.value) })}
                    className="bg-input border border-border rounded px-1.5 py-0.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-gold h-7"
                    aria-label="Card level"
                  >
                    {Array.from({ length: 10 }, (_, i) => i + 1).map((l) => (
                      <option key={l} value={l}>{l}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          ))}
          {c.domainCards.length < 5 ? (
            <Button
              variant="outline"
              size="sm"
              onClick={addDomainCard}
              className="w-full border-dashed border-border text-muted-foreground hover:text-foreground hover:border-gold"
            >
              <Plus className="w-3.5 h-3.5 mr-1" /> Add Card
              <span className="ml-auto text-xs text-muted-foreground">
                {c.domainCards.length}/5
              </span>
            </Button>
          ) : (
            <p className="text-xs text-muted-foreground text-center italic">
              Maximum 5 active domain cards.
            </p>
          )}
        </div>
      </Section>

      {/* ── Equipment ────────────────────────────────────────────── */}
      <Section icon={<Sword className="w-4 h-4" />} title="Equipment">
        <div className="space-y-3">
          <div className="space-y-1.5">
            <label className="text-xs text-muted-foreground uppercase tracking-wider">Primary Weapon</label>
            <Input
              value={c.primaryWeapon}
              onChange={(e) => update({ primaryWeapon: e.target.value })}
              placeholder="e.g. Longsword (d8+STR)"
              className="bg-input border-border text-sm"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs text-muted-foreground uppercase tracking-wider">Secondary Weapon</label>
            <Input
              value={c.secondaryWeapon}
              onChange={(e) => update({ secondaryWeapon: e.target.value })}
              placeholder="e.g. Dagger (d6+FIN)"
              className="bg-input border-border text-sm"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs text-muted-foreground uppercase tracking-wider">Armor</label>
            <Input
              value={c.armorName}
              onChange={(e) => update({ armorName: e.target.value })}
              placeholder="e.g. Chain Mail"
              className="bg-input border-border text-sm"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs text-muted-foreground uppercase tracking-wider">Other Items</label>
            {c.items.map((item, i) => (
              <div key={i} className="flex gap-2">
                <Input
                  value={item}
                  onChange={(e) => updateItem(i, e.target.value)}
                  placeholder="Item…"
                  className="flex-1 h-8 bg-input border-border text-sm"
                />
                <button
                  onClick={() => removeItem(i)}
                  className="w-7 h-7 flex items-center justify-center rounded text-muted-foreground hover:text-destructive active:scale-95"
                  aria-label="Remove item"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
            <Button
              variant="outline"
              size="sm"
              onClick={addItem}
              className="w-full border-dashed border-border text-muted-foreground hover:text-foreground hover:border-gold"
            >
              <Plus className="w-3.5 h-3.5 mr-1" /> Add Item
            </Button>
          </div>
        </div>
      </Section>

      {/* ── Gold ─────────────────────────────────────────────────── */}
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

      {/* ── Features & Abilities ─────────────────────────────────── */}
      <Section icon={<Scroll className="w-4 h-4" />} title="Features & Abilities">
        <Textarea
          value={c.features}
          onChange={(e) => update({ features: e.target.value })}
          placeholder="Class features, ancestry features, community feature, subclass features…"
          className="min-h-[120px] bg-input border-border text-sm resize-none"
        />
      </Section>

      {/* ── Notes ────────────────────────────────────────────────── */}
      <Section icon={<NotebookPen className="w-4 h-4" />} title="Notes">
        <Textarea
          value={c.notes}
          onChange={(e) => update({ notes: e.target.value })}
          placeholder="Backstory, session notes, reminders…"
          className="min-h-[120px] bg-input border-border text-sm resize-none"
        />
      </Section>

      {/* ── Reset ────────────────────────────────────────────────── */}
      <div className="pt-4">
        <Button
          variant="outline"
          size="sm"
          onClick={handleReset}
          className={cn(
            "w-full border-border text-muted-foreground transition-colors",
            confirmReset
              ? "border-destructive text-destructive hover:bg-destructive/10"
              : "hover:border-destructive/50 hover:text-destructive/80"
          )}
        >
          <RotateCcw className="w-3.5 h-3.5 mr-2" />
          {confirmReset ? "Tap again to confirm reset" : "Reset Character Sheet"}
        </Button>
      </div>
    </div>
  )
}
