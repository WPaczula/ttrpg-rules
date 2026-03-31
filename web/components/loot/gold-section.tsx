"use client"

import { Button } from "@/components/ui/button"
import { type GoldDenomination, GOLD_LABELS } from "@/lib/loot-types"
import { Coins } from "lucide-react"

interface GoldSectionProps {
  goldHandfuls: number
  goldBags: number
  goldChests: number
  onAddGold: (denomination: GoldDenomination) => void
}

export function GoldSection({ goldHandfuls, goldBags, goldChests, onAddGold }: GoldSectionProps) {
  return (
    <section className="space-y-3">
      <div className="flex items-center gap-2">
        <Coins className="w-4 h-4 text-gold" />
        <span className="text-sm font-semibold">Gold</span>
        <div className="ml-auto flex items-center gap-3 text-xs text-muted-foreground">
          <span>{goldHandfuls} handful{goldHandfuls !== 1 ? "s" : ""}</span>
          <span>{goldBags} bag{goldBags !== 1 ? "s" : ""}</span>
          <span>{goldChests} chest{goldChests !== 1 ? "s" : ""}</span>
        </div>
      </div>
      <div className="flex gap-2">
        {(["handful", "bag", "chest"] as GoldDenomination[]).map((d) => (
          <Button
            key={d}
            variant="outline"
            size="sm"
            onClick={() => onAddGold(d)}
            className="text-xs"
          >
            +{GOLD_LABELS[d]}
          </Button>
        ))}
      </div>
      <p className="text-[11px] text-muted-foreground">10 Handfuls = 1 Bag · 10 Bags = 1 Chest · Max 1 Chest</p>
    </section>
  )
}
