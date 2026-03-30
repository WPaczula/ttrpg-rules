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
