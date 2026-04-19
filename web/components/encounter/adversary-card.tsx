"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { type Adversary, type EncounterAdversary, getPointCost } from "@/lib/adversary-types"
import { SlotTracker, StatBox } from "@/components/character-sheet/primitives"
import { getTypeColor } from "@/components/encounter/adversary-library"
import { cn } from "@/lib/utils"
import { ChevronDown, X, Skull } from "lucide-react"

interface AdversaryCardProps {
  instance: EncounterAdversary
  adversary: Adversary
  onUpdateHp: (hp: number) => void
  onUpdateStress: (stress: number) => void
  onRemove: () => void
}

export function AdversaryCard({
  instance,
  adversary: adv,
  onUpdateHp,
  onUpdateStress,
  onRemove,
}: AdversaryCardProps) {
  const [major, severe] = adv.thresholds.split("/").map(Number)
  const isDefeated = instance.hpMarked >= adv.hp

  return (
    <Collapsible defaultOpen>
      <div
        className={cn(
          "dh-domain-card !p-0 transition-colors",
          isDefeated ? "!border-destructive/30 opacity-60" : ""
        )}
      >
        {/* Header */}
        <CollapsibleTrigger className="flex items-center w-full px-3 py-2 gap-2 group">
          <div className="flex-1 min-w-0 flex items-center gap-2">
            {isDefeated && <Skull className="w-4 h-4 text-destructive shrink-0" />}
            <span
              className={cn(
                "font-display text-base font-semibold tracking-wide truncate",
                isDefeated ? "text-muted-foreground line-through" : "text-foreground"
              )}
            >
              {adv.name}
            </span>
            <Badge
              className={cn(
                "text-[9px] px-1.5 py-0 h-4 border shrink-0",
                getTypeColor(adv.type)
              )}
            >
              {adv.type}
            </Badge>
            <span className="text-[10px] text-muted-foreground shrink-0">
              {getPointCost(adv.type)}pt
            </span>
          </div>
          <span className="text-xs text-muted-foreground shrink-0 tabular-nums">
            HP {instance.hpMarked}/{adv.hp}
          </span>
          <ChevronDown className="w-4 h-4 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180 shrink-0" />
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="px-3 pb-3 space-y-3">
            {/* Stats row */}
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
              <StatBox label="Diff" value={adv.difficulty} />
              <StatBox label="Major" value={major} />
              <StatBox label="Severe" value={severe} />
              <StatBox label="ATK" value={adv.atk} />
              <StatBox label="Range" value={adv.range} />
              <StatBox label="Damage" value={adv.damage} />
            </div>

            {/* Weapon */}
            <div className="text-xs text-muted-foreground">
              <span className="text-gold font-medium">{adv.attack}</span>
              {" · "}{adv.range}{" · "}{adv.damage}
            </div>

            {/* HP Tracking */}
            <div className="space-y-1.5">
              <span className="dh-feat-group-label">Hit Points</span>
              <SlotTracker
                total={adv.hp}
                marked={instance.hpMarked}
                onToggle={onUpdateHp}
                filledClass="border-destructive bg-destructive/30 text-destructive"
                emptyClass="border-border bg-input hover:border-destructive/50"
                label="HP"
              />
            </div>

            {/* Stress Tracking */}
            <div className="space-y-1.5">
              <span className="dh-feat-group-label">Stress</span>
              <SlotTracker
                total={adv.stress}
                marked={instance.stressMarked}
                onToggle={onUpdateStress}
                filledClass="border-amber-500 bg-amber-500/30 text-amber-500"
                emptyClass="border-border bg-input hover:border-amber-500/50"
                label="Stress"
              />
            </div>

            {/* Features */}
            {adv.features && adv.features.length > 0 && (
              <div className="space-y-1.5">
                <span className="dh-feat-group-label">Features</span>
                {adv.features.map((f) => (
                  <div key={f.name} className="bg-purple-deep/30 border border-border rounded-md px-3 py-2">
                    <span className="text-xs font-medium text-gold">{f.name}</span>
                    <p className="text-xs text-muted-foreground leading-relaxed mt-0.5">{f.text}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Extra info */}
            {(adv.description || adv.motives_and_tactics || adv.experience) && (
              <div className="space-y-1 text-xs text-muted-foreground">
                {adv.description && <p className="italic">{adv.description}</p>}
                {adv.motives_and_tactics && (
                  <p>
                    <span className="text-gold">Motives:</span> {adv.motives_and_tactics}
                  </p>
                )}
                {adv.experience && (
                  <p>
                    <span className="text-gold">Experience:</span> {adv.experience}
                  </p>
                )}
              </div>
            )}

            {/* Remove button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                onRemove()
              }}
              className="text-xs text-muted-foreground hover:text-destructive"
            >
              <X className="w-3 h-3 mr-1" />
              Remove from encounter
            </Button>
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  )
}
