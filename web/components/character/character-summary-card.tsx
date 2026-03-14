"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { CharacterData } from "@/lib/character-types"
import { DEFAULT_CHARACTER, formatModifier } from "@/lib/character-types"
import { cn } from "@/lib/utils"
import { Check, Swords, Shield, Heart, Zap, User, BookOpen } from "lucide-react"

interface CharacterSummaryCardProps {
  data: CharacterData
  onApplyToSheet: (character: CharacterData) => void
  accepted?: boolean
}

export function CharacterSummaryCard({ data, onApplyToSheet, accepted }: CharacterSummaryCardProps) {
  const [isAccepted, setIsAccepted] = useState(accepted ?? false)

  const handleApply = () => {
    setIsAccepted(true)
    onApplyToSheet(data)
  }

  const traits = [
    { label: "AGI", value: data.agility },
    { label: "STR", value: data.strength },
    { label: "FIN", value: data.finesse },
    { label: "INS", value: data.instinct },
    { label: "PRE", value: data.presence },
    { label: "KNO", value: data.knowledge },
  ]

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
          <User className="w-4 h-4 text-gold" />
          <span className="font-semibold text-gold text-sm">{data.name}</span>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-[10px] border-gold/30 text-gold">
            {data.class}
          </Badge>
          <span className="text-[10px] text-muted-foreground">{data.subclass}</span>
        </div>
      </div>

      {/* Identity row */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <span>{data.ancestry}</span>
        <span className="text-border">·</span>
        <span>{data.community}</span>
        <span className="text-border">·</span>
        <span>Level {data.level}</span>
      </div>

      {/* Traits grid */}
      <div className="grid grid-cols-6 gap-1.5 text-center">
        {traits.map(({ label, value }) => (
          <div key={label} className="rounded-md bg-background/50 border border-border py-1.5 px-1 space-y-0.5">
            <div className="text-[9px] uppercase tracking-wider text-muted-foreground">{label}</div>
            <div className={cn(
              "text-xs font-semibold",
              value > 0 ? "text-green-400" : value < 0 ? "text-red-400" : "text-foreground"
            )}>
              {formatModifier(value)}
            </div>
          </div>
        ))}
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-2 text-center">
        {[
          { label: "HP", value: data.hpTotal, Icon: Heart },
          { label: "Stress", value: data.stressTotal, Icon: Zap },
          { label: "Evasion", value: data.evasion, Icon: Shield },
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

      {/* Equipment */}
      {(data.primaryWeapon || data.secondaryWeapon || data.armorName) && (
        <div className="space-y-1">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Equipment</div>
          <div className="flex flex-wrap gap-2">
            {data.primaryWeapon && (
              <div className="flex items-center gap-1 rounded-md bg-background/50 border border-border px-2 py-1">
                <Swords className="w-3 h-3 text-muted-foreground" />
                <span className="text-xs">{data.primaryWeapon}</span>
              </div>
            )}
            {data.secondaryWeapon && (
              <div className="flex items-center gap-1 rounded-md bg-background/50 border border-border px-2 py-1">
                <Swords className="w-3 h-3 text-muted-foreground" />
                <span className="text-xs">{data.secondaryWeapon}</span>
              </div>
            )}
            {data.armorName && (
              <div className="flex items-center gap-1 rounded-md bg-background/50 border border-border px-2 py-1">
                <Shield className="w-3 h-3 text-muted-foreground" />
                <span className="text-xs">{data.armorName}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Experiences */}
      {data.experiences.length > 0 && (
        <div className="space-y-1">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Experiences</div>
          {data.experiences.map((exp, i) => (
            <div key={i} className="text-xs leading-relaxed">
              <span className="text-muted-foreground">{exp.name}</span>
              <span className="text-gold font-mono ml-1">{formatModifier(exp.modifier)}</span>
            </div>
          ))}
        </div>
      )}

      {/* Domain Cards */}
      {data.domainCards.length > 0 && (
        <div className="space-y-1">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Domain Cards</div>
          {data.domainCards.map((card, i) => (
            <div key={i} className="text-xs leading-relaxed">
              <span className="font-semibold text-foreground">{card.name}</span>
              <span className="text-muted-foreground ml-1">({card.domain}, Lv{card.level})</span>
            </div>
          ))}
        </div>
      )}

      {/* Features */}
      {data.features && (
        <div className="space-y-1">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Features</div>
          <p className="text-xs text-muted-foreground italic">{data.features}</p>
        </div>
      )}

      {/* Action */}
      {isAccepted ? (
        <div className="flex items-center gap-2 text-sm text-green-400">
          <Check className="w-4 h-4" />
          Applied to character sheet
        </div>
      ) : (
        <Button
          size="sm"
          onClick={handleApply}
          className="bg-gold text-background hover:bg-gold/90"
        >
          <Check className="w-3.5 h-3.5 mr-1" />
          Apply to Character Sheet
        </Button>
      )}
    </div>
  )
}

export function parseCharacterFromToolCall(toolResult: string): CharacterData | null {
  try {
    const parsed = JSON.parse(toolResult)
    if (
      parsed &&
      typeof parsed.name === "string" &&
      typeof parsed.class === "string"
    ) {
      // Merge with defaults so all fields are present
      return {
        ...DEFAULT_CHARACTER,
        ...parsed,
        // Ensure experiences have IDs
        experiences: (parsed.experiences ?? []).map((exp: any, i: number) => ({
          id: exp.id ?? `exp-${i}-${Date.now()}`,
          name: exp.name,
          modifier: exp.modifier ?? 2,
        })),
        // Ensure domain cards have IDs
        domainCards: (parsed.domainCards ?? []).map((card: any, i: number) => ({
          id: card.id ?? `card-${i}-${Date.now()}`,
          name: card.name,
          level: card.level ?? 1,
          domain: card.domain ?? "",
        })),
      }
    }
  } catch {
    // Not valid JSON
  }
  return null
}
