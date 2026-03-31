"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  type LootRarity,
  type LootItemType,
  type DiceOption,
  RARITIES,
  RARITY_BADGE_COLORS,
} from "@/lib/loot-types"
import { Package, FlaskConical, Dices } from "lucide-react"
import { cn } from "@/lib/utils"

function rarityLabel(r: LootRarity) {
  return r.charAt(0).toUpperCase() + r.slice(1)
}

function diceLabel(opt: DiceOption) {
  return `${opt.count}d12`
}

export type LastResult = {
  roll: number
  name: string
  description: string
  tableIndex: number
  rarity: LootRarity
  itemType: LootItemType
}

interface RollerSectionProps {
  itemType: LootItemType | "mixed"
  setItemType: (value: LootItemType | "mixed") => void
  rarity: LootRarity
  onRarityChange: (value: LootRarity) => void
  diceIndex: 0 | 1
  setDiceIndex: (value: 0 | 1) => void
  quantity: 1 | 2 | 3 | 5
  setQuantity: (value: 1 | 2 | 3 | 5) => void
  rollInput: string
  setRollInput: (value: string) => void
  lastResult: LastResult | null
  diceOptions: [DiceOption, DiceOption]
  selectedDice: DiceOption
  onLookUp: () => void
}

export function RollerSection({
  itemType,
  setItemType,
  rarity,
  onRarityChange,
  diceIndex,
  setDiceIndex,
  quantity,
  setQuantity,
  rollInput,
  setRollInput,
  lastResult,
  diceOptions,
  selectedDice,
  onLookUp,
}: RollerSectionProps) {
  const rollValid = !isNaN(parseInt(rollInput, 10))

  return (
    <section className="space-y-4">
      {/* Item type */}
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Type
        </label>
        <div className="flex gap-2 flex-wrap">
          {(["item", "consumable", "mixed"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setItemType(t)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm border transition-colors",
                itemType === t
                  ? "bg-gold/15 text-gold border-gold/30"
                  : "bg-transparent text-muted-foreground border-border hover:text-foreground hover:bg-muted/50"
              )}
            >
              {t === "item" && <Package className="w-3.5 h-3.5" />}
              {t === "consumable" && <FlaskConical className="w-3.5 h-3.5" />}
              {t === "mixed" && <Dices className="w-3.5 h-3.5" />}
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Rarity */}
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Rarity
        </label>
        <div className="flex gap-2 flex-wrap">
          {RARITIES.map((r) => (
            <button
              key={r}
              onClick={() => onRarityChange(r)}
              className={cn(
                "px-3 py-1.5 rounded-md text-sm border transition-colors",
                rarity === r
                  ? "bg-gold/15 text-gold border-gold/30"
                  : "bg-transparent text-muted-foreground border-border hover:text-foreground hover:bg-muted/50"
              )}
            >
              {rarityLabel(r)}
            </button>
          ))}
        </div>
      </div>

      {/* Dice guidance */}
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Dice to Roll
        </label>
        <div className="flex gap-2">
          {diceOptions.map((opt, idx) => (
            <button
              key={idx}
              onClick={() => setDiceIndex(idx as 0 | 1)}
              className={cn(
                "flex flex-col items-center px-4 py-2 rounded-md border text-sm font-medium transition-colors min-w-[80px]",
                diceIndex === idx
                  ? "bg-gold/15 text-gold border-gold/30"
                  : "bg-transparent text-muted-foreground border-border hover:text-foreground hover:bg-muted/50"
              )}
            >
              <span className="text-base font-bold">{diceLabel(opt)}</span>
              <span className="text-[10px] opacity-70">range {opt.min}–{opt.max}</span>
            </button>
          ))}
        </div>
        <p className="text-[11px] text-muted-foreground pl-0.5">
          Higher dice count skews results toward the middle of the range.
        </p>
      </div>

      {/* Quantity */}
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Quantity
        </label>
        <div className="flex gap-2">
          {([1, 2, 3, 5] as const).map((q) => (
            <button
              key={q}
              onClick={() => setQuantity(q)}
              className={cn(
                "w-10 h-10 rounded-md border text-sm font-medium transition-colors",
                quantity === q
                  ? "bg-gold/15 text-gold border-gold/30"
                  : "bg-transparent text-muted-foreground border-border hover:text-foreground hover:bg-muted/50"
              )}
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Roll input */}
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Your Roll Total
        </label>
        <div className="flex gap-2">
          <input
            type="number"
            inputMode="numeric"
            min={selectedDice.min}
            max={selectedDice.max}
            value={rollInput}
            onChange={(e) => setRollInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && rollValid && onLookUp()}
            placeholder={`${selectedDice.min}–${selectedDice.max}`}
            className="w-28 h-10 rounded-md border border-border bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/50"
          />
          <Button
            onClick={onLookUp}
            disabled={!rollValid}
            className="bg-gold/90 hover:bg-gold text-black font-semibold"
          >
            Look Up
          </Button>
        </div>
      </div>

      {/* Result card */}
      {lastResult && (
        <div className="rounded-lg border border-gold/30 bg-gold/5 p-4 space-y-1.5 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-foreground">{lastResult.name}</span>
            <Badge
              variant="outline"
              className={cn("text-[10px] border", RARITY_BADGE_COLORS[lastResult.rarity])}
            >
              {rarityLabel(lastResult.rarity)}
            </Badge>
            <Badge variant="outline" className="text-[10px] border border-border text-muted-foreground">
              {lastResult.itemType === "item" ? "Item" : "Consumable"}
            </Badge>
            <span className="text-[10px] text-muted-foreground ml-auto">#{lastResult.tableIndex}</span>
          </div>
          <p className="text-sm text-muted-foreground">{lastResult.description}</p>
        </div>
      )}
    </section>
  )
}
