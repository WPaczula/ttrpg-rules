"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  type Adversary,
  type AdversaryType,
  ADVERSARY_TYPES,
  getPointCost,
} from "@/lib/adversary-types"
import { getTypeColor } from "@/components/encounter/adversary-library"
import { cn } from "@/lib/utils"
import { Check, Swords, Shield, Heart, Zap, Target } from "lucide-react"

interface AdversarySummaryCardProps {
  data: Adversary
  onAddToEncounter: (adversary: Adversary) => void
  accepted?: boolean
}

export function AdversarySummaryCard({ data, onAddToEncounter, accepted }: AdversarySummaryCardProps) {
  const [isAccepted, setIsAccepted] = useState(accepted ?? false)

  const handleAdd = () => {
    setIsAccepted(true)
    onAddToEncounter(data)
  }

  return (
    <div className={cn(
      "rounded-lg border-2 p-4 space-y-3",
      isAccepted
        ? "border-green-600/50 bg-green-950/20"
        : "border-gold/40 bg-card"
    )}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Swords className="w-4 h-4 text-gold" />
          <span className="font-semibold text-gold text-sm">{data.name}</span>
        </div>
        <div className="flex items-center gap-2">
          <Badge
            variant="outline"
            className={cn("text-[10px]", getTypeColor(data.type as AdversaryType))}
          >
            {data.type}
          </Badge>
          <span className="text-[10px] text-muted-foreground">T{data.tier}</span>
          <span className="text-[10px] font-bold text-gold bg-gold/20 px-1.5 py-0.5 rounded">
            {getPointCost(data.type as AdversaryType)}pt
          </span>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-4 gap-2 text-center">
        {[
          { label: "HP", value: data.hp, Icon: Heart },
          { label: "Stress", value: data.stress, Icon: Zap },
          { label: "Diff", value: data.difficulty, Icon: Target },
          { label: "Thresholds", value: data.thresholds, Icon: Shield },
        ].map(({ label, value, Icon }) => (
          <div key={label} className="rounded-md bg-background/50 border border-border py-1.5 px-1 space-y-0.5">
            <div className="flex items-center justify-center gap-0.5 text-muted-foreground">
              <Icon className="w-3 h-3" />
              <span className="text-[9px] uppercase tracking-wider">{label}</span>
            </div>
            <div className="text-xs font-semibold text-foreground">{value}</div>
          </div>
        ))}
      </div>

      {/* Attack row */}
      <div className="flex items-center gap-2 rounded-md bg-background/50 border border-border px-3 py-2">
        <Swords className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
        <span className="text-sm font-medium">{data.attack}</span>
        <span className="text-xs text-muted-foreground">({data.range})</span>
        <span className="text-xs text-gold ml-auto font-mono shrink-0">{data.atk} · {data.damage}</span>
      </div>

      {/* Description */}
      {data.description && (
        <p className="text-xs text-muted-foreground italic">{data.description}</p>
      )}

      {/* Features */}
      {data.features && data.features.length > 0 && (
        <div className="space-y-1">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Features</div>
          {data.features.map((f, i) => (
            <div key={i} className="text-xs leading-relaxed">
              <span className="font-semibold text-foreground">{f.name}. </span>
              <span className="text-muted-foreground">{f.text}</span>
            </div>
          ))}
        </div>
      )}

      {/* Action */}
      {isAccepted ? (
        <div className="flex items-center gap-2 text-sm text-green-400">
          <Check className="w-4 h-4" />
          Added to encounter
        </div>
      ) : (
        <Button
          size="sm"
          onClick={handleAdd}
          className="bg-gold text-background hover:bg-gold/90"
        >
          <Check className="w-3.5 h-3.5 mr-1" />
          Add to Encounter
        </Button>
      )}
    </div>
  )
}

export function parseAdversaryFromToolCall(toolResult: string): Adversary | null {
  try {
    const parsed = JSON.parse(toolResult)
    if (
      parsed &&
      typeof parsed.name === "string" &&
      typeof parsed.hp === "number" &&
      ADVERSARY_TYPES.includes(parsed.type as AdversaryType)
    ) {
      return parsed as Adversary
    }
  } catch {
    // Not valid JSON
  }
  return null
}
