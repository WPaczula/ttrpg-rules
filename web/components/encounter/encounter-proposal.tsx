"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  type Adversary,
  type AdversaryType,
  getPointCost,
  calculateBudget,
} from "@/lib/adversary-types"
import { getTypeColor } from "@/components/encounter/adversary-library"
import { cn } from "@/lib/utils"
import { Check, X, Swords, Shield, Heart, Zap } from "lucide-react"

interface EncounterProposalData {
  name: string
  adversaries: Adversary[]
}

interface EncounterProposalProps {
  data: EncounterProposalData
  pcCount: number
  onAccept: (data: EncounterProposalData) => void
  accepted?: boolean
}

export function EncounterProposal({ data, pcCount, onAccept, accepted }: EncounterProposalProps) {
  const [isAccepted, setIsAccepted] = useState(accepted ?? false)

  const budget = calculateBudget(pcCount)
  const totalPoints = data.adversaries.reduce(
    (sum, a) => sum + getPointCost(a.type as AdversaryType),
    0
  )
  const isOverBudget = totalPoints > budget

  const handleAccept = () => {
    setIsAccepted(true)
    onAccept(data)
  }

  return (
    <div className={cn(
      "dh-feat-card space-y-3",
      isAccepted
        ? "border-green-600/50 bg-green-950/20"
        : "border-gold/40"
    )}>
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <Swords className="w-4 h-4 text-gold shrink-0" />
          <span className="font-display text-base font-semibold tracking-wide text-gold truncate">{data.name}</span>
        </div>
        <span className={cn(
          "dh-chip tabular-nums",
          isOverBudget
            ? "!border-destructive !text-destructive bg-destructive/10"
            : "!border-gold/60 !text-gold bg-gold/10"
        )}>
          {totalPoints} / {budget} BP
        </span>
      </div>

      {/* Adversary list */}
      <div className="space-y-2">
        {data.adversaries.map((adv, i) => (
          <div
            key={`${adv.name}-${i}`}
            className="flex items-center justify-between gap-2 rounded-md bg-background/50 border border-border px-3 py-2"
          >
            <div className="flex items-center gap-2 min-w-0">
              <Badge
                variant="outline"
                className={cn("text-[10px] shrink-0", getTypeColor(adv.type as AdversaryType))}
              >
                {adv.type}
              </Badge>
              <span className="text-sm font-medium truncate">{adv.name}</span>
            </div>
            <div className="flex items-center gap-3 text-[10px] text-muted-foreground shrink-0">
              <span className="flex items-center gap-0.5">
                <Shield className="w-3 h-3" />
                T{adv.tier}
              </span>
              <span className="flex items-center gap-0.5">
                <Heart className="w-3 h-3" />
                {adv.hp}
              </span>
              <span className="flex items-center gap-0.5">
                <Zap className="w-3 h-3" />
                {adv.stress}
              </span>
              <span className="font-bold text-gold">
                {getPointCost(adv.type as AdversaryType)}pt
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Summary row */}
      <div className="dh-feat-group-label !mb-0 flex items-center gap-2">
        <span>{data.adversaries.length} adversar{data.adversaries.length === 1 ? "y" : "ies"}</span>
        <span>·</span>
        <span>{totalPoints} battle points used</span>
        {isOverBudget && (
          <span className="text-destructive">
            ({totalPoints - budget} over budget)
          </span>
        )}
      </div>

      {/* Actions */}
      {isAccepted ? (
        <div className="flex items-center gap-2 text-sm text-green-400">
          <Check className="w-4 h-4" />
          Encounter accepted and imported
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={handleAccept}
            className="bg-gold text-background hover:bg-gold/80 font-semibold"
          >
            <Check className="w-3.5 h-3.5 mr-1.5" />
            Accept Encounter
          </Button>
        </div>
      )}
    </div>
  )
}

export function parseProposalFromToolCall(toolResult: string): EncounterProposalData | null {
  try {
    const parsed = JSON.parse(toolResult)
    if (parsed && parsed.name && Array.isArray(parsed.adversaries)) {
      return parsed as EncounterProposalData
    }
  } catch {
    // Not valid JSON
  }
  return null
}
