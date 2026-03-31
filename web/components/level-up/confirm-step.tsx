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
