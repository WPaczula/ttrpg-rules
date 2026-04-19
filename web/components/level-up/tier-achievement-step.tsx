"use client"

import { InfoBox, InfoBoxHeader, InfoBoxDescription } from "@/components/ui/info-box"
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
        <InfoBox>
          <InfoBoxHeader>
            <Zap className="w-4 h-4 text-gold" />
            Proficiency +1
          </InfoBoxHeader>
          <InfoBoxDescription>
            Your Proficiency increases from {proficiency} to {proficiency + 1}.
          </InfoBoxDescription>
        </InfoBox>

        <InfoBox className="space-y-2">
          <InfoBoxHeader>
            <Star className="w-4 h-4 text-gold" />
            New Experience (+2)
          </InfoBoxHeader>
          <InfoBoxDescription>
            You gain a new Experience with a +2 modifier. Name it now or fill
            it in later.
          </InfoBoxDescription>
          <input
            value={newExperienceName}
            onChange={(e) => onExperienceNameChange(e.target.value)}
            placeholder="e.g. Survived the Siege of Karhold..."
            className="w-full bg-input border border-border rounded px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-gold"
          />
        </InfoBox>

        {nextLevel >= 5 && (
          <InfoBox>
            <InfoBoxHeader>
              <Sparkles className="w-4 h-4 text-gold" />
              Clear Marked Traits
            </InfoBoxHeader>
            <InfoBoxDescription>
              Any marked character traits are cleared when you reach this tier.
            </InfoBoxDescription>
          </InfoBox>
        )}
      </div>
    </div>
  )
}
