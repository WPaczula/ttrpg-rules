"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { FieldLabel } from "@/components/ui/field-label"
import { InfoBox } from "@/components/ui/info-box"
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
          <Badge variant="tier" className="text-xs">
            Tier {currentTier}
          </Badge>
        </div>
        {!c.class && (
          <p className="text-xs text-muted-foreground italic">
            Set your class on the Character Sheet first for the best experience.
          </p>
        )}
      </div>

      <InfoBox variant="card" className="p-4 space-y-3">
        <h3 className="text-sm font-semibold text-foreground">
          Level {nextLevel} Preview
        </h3>
        {tierTransition && (
          <Badge variant="gold" className="text-xs">
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
      </InfoBox>

      {/* Advancement slots overview for next tier */}
      <InfoBox variant="subtle" className="space-y-2">
        <FieldLabel className="font-semibold">
          Tier {nextTier} Advancement Slots
        </FieldLabel>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-muted-foreground">
          <span>Traits: {slots.traits}/{SLOT_LIMITS.traits}</span>
          <span>HP: {slots.hp}/{SLOT_LIMITS.hp}</span>
          <span>Stress: {slots.stress}/{SLOT_LIMITS.stress}</span>
          <span>Experiences: {slots.experiences}/{SLOT_LIMITS.experiences}</span>
          <span>Domain Card: {slots.domainCard}/{SLOT_LIMITS.domainCard}</span>
          <span>Evasion: {slots.evasion}/{SLOT_LIMITS.evasion}</span>
        </div>
      </InfoBox>

      <Button
        onClick={onStart}
        variant="goldOutline"
        className="w-full"
      >
        Level Up to {nextLevel}
        <ChevronRight className="w-4 h-4 ml-1" />
      </Button>
    </div>
  )
}
