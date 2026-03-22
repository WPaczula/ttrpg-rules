"use client"

import { useState, useMemo, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Combobox, type ComboboxItem } from "@/components/ui/combobox"
import { Separator } from "@/components/ui/separator"
import { type CharacterData, type DomainCard, type Experience, getTier } from "@/lib/character-types"
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
} from "lucide-react"

// ─── Types ──────────────────────────────────────────────────────────────────

type WizardStep = "idle" | "tier-achievement" | "advancements" | "thresholds" | "domain-card" | "confirm"

type AdvancementChoice =
  | { type: "increase-traits"; traits: [string, string] }
  | { type: "subclass-upgrade" }
  | { type: "add-hp" }
  | { type: "add-stress" }
  | { type: "increase-proficiency" }

const TRAIT_KEYS = ["agility", "strength", "finesse", "instinct", "presence", "knowledge"] as const
const TRAIT_LABELS: Record<string, string> = {
  agility: "AGI",
  strength: "STR",
  finesse: "FIN",
  instinct: "INS",
  presence: "PRE",
  knowledge: "KNO",
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function isTierTransition(newLevel: number): boolean {
  return newLevel === 2 || newLevel === 5 || newLevel === 8
}

function getSubclassStage(character: CharacterData): "foundation" | "specialization" | "mastery" | null {
  const sub = SRD_SUBCLASSES.find((s) => s.name === character.subclass)
  if (!sub) return null
  // Determine what they currently have based on their features text
  // Simple heuristic: check if mastery/specialization feature names appear in features
  const hasText = (features: { name: string }[]) =>
    features.some((f) => character.features.includes(f.name))
  if (sub.mastery.length > 0 && hasText(sub.mastery)) return null // already at max
  if (sub.specialization.length > 0 && hasText(sub.specialization)) return "mastery"
  return "specialization"
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

  const selectedClass = useMemo(
    () => SRD_CLASSES.find((cls) => cls.name === c.class),
    [c.class]
  )

  const selectedSubclass = useMemo(
    () => SRD_SUBCLASSES.find((sc) => sc.name === c.subclass),
    [c.subclass]
  )

  const subclassStage = useMemo(() => getSubclassStage(c), [c])

  // Domain card combobox items filtered by class domains and level ≤ nextLevel
  const domainCardItems = useMemo<ComboboxItem[]>(() => {
    let cards = SRD_DOMAIN_CARDS.filter((dc) => dc.level <= nextLevel)
    if (selectedClass) {
      const classDomains = selectedClass.domains
      cards = cards.filter((dc) => classDomains.includes(dc.domain))
    }
    // Exclude cards already in loadout
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

  // How many advancement slots are used
  const slotsUsed = advancements.reduce((n, a) => {
    if (a.type === "increase-proficiency") return n + 2
    return n + 1
  }, 0)

  const canAddAdvancement = slotsUsed < 2

  const reset = useCallback(() => {
    setStep("idle")
    setAdvancements([])
    setTraitPicks([])
    setNewDomainCard("")
    setNewExperienceName("")
  }, [])

  // ── Apply the level-up ─────────────────────────────────────────
  const applyLevelUp = useCallback(() => {
    setCharacter((prev) => {
      const patch: Partial<CharacterData> = {
        level: nextLevel,
        minorThreshold: prev.minorThreshold + 1,
        majorThreshold: prev.majorThreshold + 1,
        severeThreshold: prev.severeThreshold + 1,
      }

      // Tier achievement: +1 proficiency, new experience
      if (tierTransition) {
        patch.proficiency = (prev.proficiency ?? 1) + 1
        const newExp: Experience = {
          id: crypto.randomUUID(),
          name: newExperienceName || "New experience",
          modifier: 2,
        }
        patch.experiences = [...prev.experiences, newExp]
      }

      // Advancements
      for (const adv of advancements) {
        switch (adv.type) {
          case "increase-traits": {
            const [t1, t2] = adv.traits as [keyof CharacterData, keyof CharacterData]
            ;(patch as Record<string, unknown>)[t1] =
              (((patch as Record<string, unknown>)[t1] as number | undefined) ?? (prev[t1] as number)) + 1
            ;(patch as Record<string, unknown>)[t2] =
              (((patch as Record<string, unknown>)[t2] as number | undefined) ?? (prev[t2] as number)) + 1
            // Mark traits so they can't be picked again in future level-ups
            patch.markedTraits = [...(patch.markedTraits ?? prev.markedTraits ?? []), t1, t2]
            break
          }
          case "add-hp":
            patch.hpTotal = (patch.hpTotal ?? prev.hpTotal) + 1
            break
          case "add-stress":
            patch.stressTotal = (patch.stressTotal ?? prev.stressTotal) + 1
            break
          case "increase-proficiency":
            patch.proficiency = (patch.proficiency ?? prev.proficiency ?? 1) + 1
            break
          case "subclass-upgrade":
            // Note in features text
            if (selectedSubclass && subclassStage) {
              const features =
                subclassStage === "specialization"
                  ? selectedSubclass.specialization
                  : selectedSubclass.mastery
              const featureNames = features.map((f) => f.name).join(", ")
              const label = subclassStage.charAt(0).toUpperCase() + subclassStage.slice(1)
              const addition = `\n[${label}] ${featureNames}`
              patch.features = (patch.features ?? prev.features) + addition
            }
            break
        }
      }

      // Domain card
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
    tierTransition,
    advancements,
    newDomainCard,
    newExperienceName,
    selectedSubclass,
    subclassStage,
    setCharacter,
    reset,
  ])

  // ── Navigation ─────────────────────────────────────────────────
  const goNext = useCallback(() => {
    const steps: WizardStep[] = tierTransition
      ? ["tier-achievement", "advancements", "thresholds", "domain-card", "confirm"]
      : ["advancements", "thresholds", "domain-card", "confirm"]
    const idx = steps.indexOf(step)
    if (idx < steps.length - 1) setStep(steps[idx + 1])
  }, [step, tierTransition])

  const goBack = useCallback(() => {
    const steps: WizardStep[] = tierTransition
      ? ["tier-achievement", "advancements", "thresholds", "domain-card", "confirm"]
      : ["advancements", "thresholds", "domain-card", "confirm"]
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
              Choose 2 advancements
            </li>
            <li className="flex items-center gap-2">
              <Shield className="w-3.5 h-3.5 text-gold shrink-0" />
              +1 to all damage thresholds
            </li>
            <li className="flex items-center gap-2">
              <BookOpen className="w-3.5 h-3.5 text-gold shrink-0" />
              Gain a new domain card (level ≤ {nextLevel})
            </li>
          </ul>
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
          {step === "thresholds" && "Damage Thresholds"}
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
              {slotsUsed}/2 slots
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Choose any two advancements from Tier {nextTier} or below.
          </p>

          <div className="space-y-3">
            {/* Increase Traits */}
            <AdvancementOption
              title="Increase Traits"
              description="Choose 2 character traits. Each gains a permanent +1 bonus."
              icon={<Star className="w-4 h-4" />}
              disabled={!canAddAdvancement}
              selected={advancements.some((a) => a.type === "increase-traits")}
              onSelect={() => {
                if (advancements.some((a) => a.type === "increase-traits")) {
                  setAdvancements((prev) =>
                    prev.filter((a) => a.type !== "increase-traits")
                  )
                  setTraitPicks([])
                } else if (canAddAdvancement) {
                  // Don't add until traits are picked
                  setTraitPicks([])
                }
              }}
            >
              {(canAddAdvancement || advancements.some((a) => a.type === "increase-traits")) && (
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
                            ({c[trait as keyof CharacterData] as number >= 0 ? "+" : ""}
                            {c[trait as keyof CharacterData] as number})
                          </span>
                          {alreadyMarked && <span className="ml-0.5 text-[9px]"> marked</span>}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}
            </AdvancementOption>

            {/* Upgraded Subclass Card */}
            {subclassStage && selectedSubclass && (
              <AdvancementOption
                title={`Subclass: ${subclassStage.charAt(0).toUpperCase() + subclassStage.slice(1)}`}
                description={`Take the ${subclassStage} card for ${selectedSubclass.name}.`}
                icon={<Scroll className="w-4 h-4" />}
                disabled={!canAddAdvancement && !advancements.some((a) => a.type === "subclass-upgrade")}
                selected={advancements.some((a) => a.type === "subclass-upgrade")}
                onSelect={() => {
                  if (advancements.some((a) => a.type === "subclass-upgrade")) {
                    setAdvancements((prev) =>
                      prev.filter((a) => a.type !== "subclass-upgrade")
                    )
                  } else if (canAddAdvancement) {
                    setAdvancements((prev) => [
                      ...prev,
                      { type: "subclass-upgrade" },
                    ])
                  }
                }}
              >
                {advancements.some((a) => a.type === "subclass-upgrade") && (
                  <div className="mt-2 space-y-1.5">
                    {(subclassStage === "specialization"
                      ? selectedSubclass.specialization
                      : selectedSubclass.mastery
                    ).map((f) => (
                      <div
                        key={f.name}
                        className="bg-purple-deep/50 border border-border rounded-md px-3 py-2"
                      >
                        <span className="text-xs font-medium text-gold">
                          {f.name}
                        </span>
                        <p className="text-xs text-muted-foreground leading-relaxed mt-0.5">
                          {f.text}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </AdvancementOption>
            )}

            {/* Add HP Slot */}
            <AdvancementOption
              title="Add HP Slot"
              description={`Increase your Hit Points from ${c.hpTotal} to ${c.hpTotal + 1}.`}
              icon={<Heart className="w-4 h-4" />}
              disabled={!canAddAdvancement && !advancements.some((a) => a.type === "add-hp")}
              selected={advancements.some((a) => a.type === "add-hp")}
              onSelect={() => {
                if (advancements.some((a) => a.type === "add-hp")) {
                  setAdvancements((prev) =>
                    prev.filter((a) => a.type !== "add-hp")
                  )
                } else if (canAddAdvancement) {
                  setAdvancements((prev) => [...prev, { type: "add-hp" }])
                }
              }}
            />

            {/* Add Stress Slot */}
            <AdvancementOption
              title="Add Stress Slot"
              description={`Increase your Stress from ${c.stressTotal} to ${c.stressTotal + 1}.`}
              icon={<Zap className="w-4 h-4" />}
              disabled={!canAddAdvancement && !advancements.some((a) => a.type === "add-stress")}
              selected={advancements.some((a) => a.type === "add-stress")}
              onSelect={() => {
                if (advancements.some((a) => a.type === "add-stress")) {
                  setAdvancements((prev) =>
                    prev.filter((a) => a.type !== "add-stress")
                  )
                } else if (canAddAdvancement) {
                  setAdvancements((prev) => [...prev, { type: "add-stress" }])
                }
              }}
            />

            {/* Increase Proficiency (Tier 3+) */}
            {nextTier >= 3 && (
              <AdvancementOption
                title="Increase Proficiency"
                description={`Costs both advancement slots. Proficiency ${c.proficiency ?? 1} → ${(c.proficiency ?? 1) + 1}. Max 6.`}
                icon={<Sparkles className="w-4 h-4" />}
                disabled={
                  (c.proficiency ?? 1) >= 6 ||
                  (!advancements.some((a) => a.type === "increase-proficiency") &&
                    slotsUsed > 0)
                }
                selected={advancements.some(
                  (a) => a.type === "increase-proficiency"
                )}
                onSelect={() => {
                  if (
                    advancements.some((a) => a.type === "increase-proficiency")
                  ) {
                    setAdvancements((prev) =>
                      prev.filter((a) => a.type !== "increase-proficiency")
                    )
                  } else if (slotsUsed === 0 && (c.proficiency ?? 1) < 6) {
                    setAdvancements([{ type: "increase-proficiency" }])
                  }
                }}
              >
                {advancements.some((a) => a.type === "increase-proficiency") && (
                  <p className="text-xs text-amber-400/80 mt-1">
                    This uses both advancement slots. No other advancements can be
                    chosen.
                  </p>
                )}
              </AdvancementOption>
            )}
          </div>
        </div>
      )}

      {/* ── Step: Thresholds ──────────────────────────────────── */}
      {step === "thresholds" && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-gold" />
            <h3 className="text-base font-bold text-foreground">
              Damage Thresholds
            </h3>
          </div>
          <p className="text-sm text-muted-foreground">
            All damage thresholds increase by 1.
          </p>

          <div className="grid grid-cols-3 gap-3">
            {(
              [
                ["Minor", c.minorThreshold],
                ["Major", c.majorThreshold],
                ["Severe", c.severeThreshold],
              ] as const
            ).map(([label, val]) => (
              <div
                key={label}
                className="flex flex-col items-center bg-purple-deep/50 border border-border rounded-lg p-3"
              >
                <span className="text-xs text-muted-foreground">{label}</span>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-lg text-muted-foreground line-through">
                    {val}
                  </span>
                  <ChevronRight className="w-3 h-3 text-muted-foreground" />
                  <span className="text-lg font-bold text-gold">{val + 1}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Step: Domain Card ─────────────────────────────────── */}
      {step === "domain-card" && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-gold" />
            <h3 className="text-base font-bold text-foreground">
              New Domain Card
            </h3>
          </div>
          <p className="text-sm text-muted-foreground">
            Acquire a domain card at level {nextLevel} or below from your
            class&apos;s domains. You can also skip this step.
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
                case "subclass-upgrade":
                  desc = `${subclassStage ? subclassStage.charAt(0).toUpperCase() + subclassStage.slice(1) : "Subclass"} card`
                  break
                case "add-hp":
                  desc = `HP ${c.hpTotal} → ${c.hpTotal + 1}`
                  break
                case "add-stress":
                  desc = `Stress ${c.stressTotal} → ${c.stressTotal + 1}`
                  break
                case "increase-proficiency":
                  desc = `Proficiency → ${(c.proficiency ?? 1) + (tierTransition ? 2 : 1)}`
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
    <button
      onClick={onSelect}
      disabled={disabled && !selected}
      className={`w-full text-left rounded-lg border p-3 transition-all ${
        selected
          ? "bg-gold/10 border-gold/40"
          : disabled
            ? "bg-card/30 border-border opacity-50 cursor-not-allowed"
            : "bg-card/50 border-border hover:border-gold/30"
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
      {children && <div className="ml-6">{children}</div>}
    </button>
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

