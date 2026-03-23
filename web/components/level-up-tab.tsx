"use client"

import { useState, useMemo, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Combobox, type ComboboxItem } from "@/components/ui/combobox"
import { Separator } from "@/components/ui/separator"
import { type CharacterData, type DomainCard, type Experience, getTier, formatModifier } from "@/lib/character-types"
import {
  SRD_DOMAIN_CARDS,
  SRD_CLASSES,
  SRD_SUBCLASSES,
} from "@/lib/srd-data"
import {
  ArrowUpCircle,
  ChevronRight,
  Check,
  Star,
  Shield,
  Swords,
  BookOpen,
  Heart,
  Zap,
  Sparkles,
  Scroll,
  Eye,
} from "lucide-react"

// ─── Types ──────────────────────────────────────────────────────────────────

type WizardStep = "idle" | "tier-achievement" | "advancements" | "domain-card" | "confirm"

type AdvancementChoice =
  | { type: "increase-traits"; traits: [string, string] }
  | { type: "add-hp" }
  | { type: "add-stress" }
  | { type: "boost-experiences" }
  | { type: "extra-domain-card" }
  | { type: "increase-evasion" }

const TRAIT_KEYS = ["agility", "strength", "finesse", "instinct", "presence", "knowledge"] as const
const TRAIT_LABELS: Record<string, string> = {
  agility: "AGI",
  strength: "STR",
  finesse: "FIN",
  instinct: "INS",
  presence: "PRE",
  knowledge: "KNO",
}

// Slot limits per the official character sheet
const SLOT_LIMITS = {
  traits: 3,
  hp: 2,
  stress: 2,
  experiences: 1,
  domainCard: 1,
  evasion: 1,
} as const

// ─── Helpers ────────────────────────────────────────────────────────────────

function isTierTransition(newLevel: number): boolean {
  return newLevel === 2 || newLevel === 5 || newLevel === 8
}

const EMPTY_SLOTS = { traits: 0, hp: 0, stress: 0, experiences: 0, domainCard: 0, evasion: 0 }

function getTierSlots(character: CharacterData, tier: number) {
  return character.advancementSlots?.[tier] ?? { ...EMPTY_SLOTS }
}

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

  // Domain card combobox items filtered by class domains and level ≤ nextLevel
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

  // How many advancement slots are used this level-up
  const slotsUsed = advancements.length

  const canAddAdvancement = slotsUsed < 2

  const reset = useCallback(() => {
    setStep("idle")
    setAdvancements([])
    setTraitPicks([])
    setNewDomainCard("")
    setNewExperienceName("")
  }, [])

  // Check if a slot type is maxed out (already used + currently picked)
  const slotAvailable = (key: keyof typeof SLOT_LIMITS) => {
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

  // ── Apply the level-up ─────────────────────────────────────────
  const applyLevelUp = useCallback(() => {
    setCharacter((prev) => {
      const patch: Partial<CharacterData> = {
        level: nextLevel,
        minorThreshold: prev.minorThreshold + 1,
        majorThreshold: prev.majorThreshold + 1,
        severeThreshold: prev.severeThreshold + 1,
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
        // Clear marked traits at tier 3+ (levels 5, 8)
        if (nextLevel >= 5) {
          patch.markedTraits = []
        }
      }

      // Track advancement slot usage per tier
      const allSlots = { ...(prev.advancementSlots ?? {}) }
      const newSlots = { ...(allSlots[nextTier] ?? { ...EMPTY_SLOTS }) }

      // Advancements
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
            patch.experiences = exps.map((e) => ({ ...e, modifier: Math.min(6, e.modifier + 1) }))
            newSlots.experiences++
            break
          }
          case "extra-domain-card":
            // Handled below together with the standard domain card
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

      // Standard domain card (always gained on level-up)
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
    })
    reset()
  }, [
    nextLevel,
    nextTier,
    tierTransition,
    advancements,
    newDomainCard,
    newExperienceName,
    setCharacter,
    reset,
  ])

  // ── Navigation ─────────────────────────────────────────────────
  const goNext = useCallback(() => {
    const steps: WizardStep[] = tierTransition
      ? ["tier-achievement", "advancements", "domain-card", "confirm"]
      : ["advancements", "domain-card", "confirm"]
    const idx = steps.indexOf(step)
    if (idx < steps.length - 1) setStep(steps[idx + 1])
  }, [step, tierTransition])

  const goBack = useCallback(() => {
    const steps: WizardStep[] = tierTransition
      ? ["tier-achievement", "advancements", "domain-card", "confirm"]
      : ["advancements", "domain-card", "confirm"]
    const idx = steps.indexOf(step)
    if (idx > 0) setStep(steps[idx - 1])
    else reset()
  }, [step, tierTransition, reset])

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

  // ── Idle State ─────────────────────────────────────────────────
  if (step === "idle") {
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
              +1 to all damage thresholds (automatic)
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
          onClick={() =>
            setStep(tierTransition ? "tier-achievement" : "advancements")
          }
          className="w-full bg-gold/15 text-gold border border-gold/30 hover:bg-gold/25 font-semibold"
        >
          Level Up to {nextLevel}
          <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
    )
  }

  // ── Wizard Steps ───────────────────────────────────────────────
  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
      {/* Progress indicator */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <span className="text-gold font-semibold">
          Level {c.level} → {nextLevel}
        </span>
        <span className="ml-auto">
          {step === "tier-achievement" && "Tier Achievement"}
          {step === "advancements" && "Advancements"}
          {step === "domain-card" && "Domain Card"}
          {step === "confirm" && "Confirm"}
        </span>
      </div>
      <Separator className="bg-border" />

      {/* ── Step: Tier Achievement ────────────────────────────── */}
      {step === "tier-achievement" && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-gold" />
            <h3 className="text-base font-bold text-foreground">
              Tier {nextTier} Achievement
            </h3>
          </div>
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
                Your Proficiency increases from {c.proficiency ?? 1} to{" "}
                {(c.proficiency ?? 1) + 1}.
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
                onChange={(e) => setNewExperienceName(e.target.value)}
                placeholder="e.g. Survived the Siege of Karhold…"
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
      )}

      {/* ── Step: Advancements ────────────────────────────────── */}
      {step === "advancements" && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Swords className="w-5 h-5 text-gold" />
            <h3 className="text-base font-bold text-foreground">
              Choose Advancements
            </h3>
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
              description={`+1 bonus to all your Experiences. (${slots.experiences}/${SLOT_LIMITS.experiences} used)`}
              icon={<Sparkles className="w-4 h-4" />}
              disabled={!canAddAdvancement || !slotAvailable("experiences")}
              selected={advancements.some((a) => a.type === "boost-experiences")}
              onSelect={() => {
                if (advancements.some((a) => a.type === "boost-experiences")) {
                  setAdvancements((prev) => prev.filter((a) => a.type !== "boost-experiences"))
                } else if (canAddAdvancement && slotAvailable("experiences")) {
                  setAdvancements((prev) => [...prev, { type: "boost-experiences" }])
                }
              }}
            />

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
      )}

      {/* ── Step: Domain Card ─────────────────────────────────── */}
      {step === "domain-card" && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-gold" />
            <h3 className="text-base font-bold text-foreground">
              Domain Card
            </h3>
          </div>
          <p className="text-sm text-muted-foreground">
            Take an additional domain card of your level or lower from a domain
            you have access to. You can also skip this step.
          </p>

          <Combobox
            items={domainCardItems}
            value={newDomainCard}
            onSelect={setNewDomainCard}
            placeholder="Search domain cards…"
            searchPlaceholder="Type to search cards…"
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

          {c.domainCards.length >= 5 && newDomainCard && (
            <p className="text-xs text-amber-400/80">
              Your loadout is full (5/5). The new card will be added — you may need
              to move a card to your vault on the Character Sheet.
            </p>
          )}
        </div>
      )}

      {/* ── Step: Confirm ─────────────────────────────────────── */}
      {step === "confirm" && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Check className="w-5 h-5 text-gold" />
            <h3 className="text-base font-bold text-foreground">
              Confirm Level Up
            </h3>
          </div>
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
              value={`Minor ${c.minorThreshold + 1} / Major ${c.majorThreshold + 1} / Severe ${c.severeThreshold + 1}`}
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
                case "boost-experiences":
                  desc = "+1 to two Experiences"
                  break
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
            onClick={applyLevelUp}
            className="w-full bg-gold/20 text-gold border border-gold/40 hover:bg-gold/30 font-semibold"
          >
            <Check className="w-4 h-4 mr-2" />
            Apply Level Up
          </Button>
        </div>
      )}

      {/* ── Navigation ────────────────────────────────────────── */}
      <Separator className="bg-border" />
      <div className="flex gap-3">
        <Button
          variant="outline"
          size="sm"
          onClick={goBack}
          className="border-border text-muted-foreground hover:text-foreground"
        >
          Back
        </Button>
        {step !== "confirm" && (
          <Button
            size="sm"
            onClick={goNext}
            disabled={step === "advancements" && slotsUsed < 2}
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

// ─── Sub-components ─────────────────────────────────────────────────────────

function AdvancementOption({
  title,
  description,
  icon,
  selected,
  disabled,
  onSelect,
  children,
}: {
  title: string
  description: string
  icon: React.ReactNode
  selected: boolean
  disabled: boolean
  onSelect: () => void
  children?: React.ReactNode
}) {
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

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between bg-purple-deep/30 border border-border rounded-md px-3 py-2">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-xs font-medium text-gold">{value}</span>
    </div>
  )
}
