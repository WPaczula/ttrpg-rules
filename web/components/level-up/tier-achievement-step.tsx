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
