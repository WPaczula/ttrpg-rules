"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { FieldLabel } from "@/components/ui/field-label"
import { OptionButton } from "@/components/ui/option-button"
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
        <FieldLabel>Type</FieldLabel>
        <div className="flex gap-2 flex-wrap">
          {(["item", "consumable", "mixed"] as const).map((t) => (
            <OptionButton
              key={t}
              onClick={() => setItemType(t)}
              active={itemType === t}
              className="flex items-center gap-1.5"
            >
              {t === "item" && <Package className="w-3.5 h-3.5" />}
              {t === "consumable" && <FlaskConical className="w-3.5 h-3.5" />}
              {t === "mixed" && <Dices className="w-3.5 h-3.5" />}
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </OptionButton>
          ))}
        </div>
      </div>

      {/* Rarity */}
      <div className="space-y-1.5">
        <FieldLabel>Rarity</FieldLabel>
        <div className="flex gap-2 flex-wrap">
          {RARITIES.map((r) => (
            <OptionButton
              key={r}
              onClick={() => onRarityChange(r)}
              active={rarity === r}
            >
              {rarityLabel(r)}
            </OptionButton>
          ))}
        </div>
      </div>

      {/* Dice guidance */}
      <div className="space-y-1.5">
        <FieldLabel>Dice to Roll</FieldLabel>
        <div className="flex gap-2">
          {diceOptions.map((opt, idx) => (
            <OptionButton
              key={idx}
              onClick={() => setDiceIndex(idx as 0 | 1)}
              active={diceIndex === idx}
              className="flex flex-col items-center px-4 py-2 min-w-[80px]"
            >
              <span className="text-base font-bold">{diceLabel(opt)}</span>
              <span className="text-[10px] opacity-70">range {opt.min}–{opt.max}</span>
            </OptionButton>
          ))}
        </div>
        <p className="text-[11px] text-muted-foreground pl-0.5">
          Higher dice count skews results toward the middle of the range.
        </p>
      </div>

      {/* Quantity */}
      <div className="space-y-1.5">
        <FieldLabel>Quantity</FieldLabel>
        <div className="flex gap-2">
          {([1, 2, 3, 5] as const).map((q) => (
            <OptionButton
              key={q}
              onClick={() => setQuantity(q)}
              active={quantity === q}
              size="square"
            >
              {q}
            </OptionButton>
          ))}
        </div>
      </div>

      {/* Roll input */}
      <div className="space-y-1.5">
        <FieldLabel>Your Roll Total</FieldLabel>
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
            variant="gold"
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
