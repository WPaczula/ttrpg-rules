"use client"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useLootStore } from "@/hooks/use-loot-store"
import {
  type LootRarity,
  type LootItemType,
  type GoldDenomination,
  type DiceOption,
  RARITIES,
  RARITY_DICE,
  RARITY_BADGE_COLORS,
  GOLD_LABELS,
  normalizeRoll,
  lookupItem,
} from "@/lib/loot-types"
import { Dices, Coins, ScrollText, Trash2, Package, FlaskConical } from "lucide-react"
import { cn } from "@/lib/utils"

// ─── Helpers ──────────────────────────────────────────────────────────────────

function rarityLabel(r: LootRarity) {
  return r.charAt(0).toUpperCase() + r.slice(1)
}

function diceLabel(opt: DiceOption) {
  return `${opt.count}d12`
}

function formatTime(ts: number) {
  return new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
}

// ─── Component ────────────────────────────────────────────────────────────────

export function LootTab() {
  const { store, isLoaded, logItem, addGold, clearLog } = useLootStore()

  // Roller state
  const [itemType, setItemType] = useState<LootItemType | "mixed">("item")
  const [rarity, setRarity] = useState<LootRarity>("common")
  const [diceIndex, setDiceIndex] = useState<0 | 1>(0)
  const [quantity, setQuantity] = useState<1 | 2 | 3 | 5>(1)
  const [rollInput, setRollInput] = useState("")
  const [lastResult, setLastResult] = useState<ReturnType<typeof lookupItem> & { tableIndex: number; rarity: LootRarity; itemType: LootItemType } | null>(null)
  const [confirmClear, setConfirmClear] = useState(false)

  const diceOptions = RARITY_DICE[rarity]
  const selectedDice = diceOptions[diceIndex]

  const handleLookUp = useCallback(() => {
    const total = parseInt(rollInput, 10)
    if (isNaN(total)) return

    for (let i = 0; i < quantity; i++) {
      // For mixed, alternate or randomly pick item/consumable
      let resolvedType: LootItemType
      if (itemType === "mixed") {
        resolvedType = Math.random() < 0.5 ? "item" : "consumable"
      } else {
        resolvedType = itemType
      }

      const entry = logItem(resolvedType, rarity, selectedDice, total)
      if (i === 0) {
        setLastResult({
          roll: entry.tableIndex!,
          name: entry.name!,
          description: entry.description!,
          tableIndex: entry.tableIndex!,
          rarity,
          itemType: resolvedType,
        })
      }
    }
    setRollInput("")
  }, [rollInput, quantity, itemType, rarity, selectedDice, logItem])

  const handleGold = useCallback(
    (denomination: GoldDenomination) => {
      addGold(denomination)
    },
    [addGold]
  )

  const handleClearLog = useCallback(() => {
    if (confirmClear) {
      clearLog()
      setLastResult(null)
      setConfirmClear(false)
    } else {
      setConfirmClear(true)
      setTimeout(() => setConfirmClear(false), 3000)
    }
  }, [confirmClear, clearLog])

  // Clamp dice index when rarity changes (both rarities share overlapping dice)
  const handleRarityChange = useCallback((r: LootRarity) => {
    setRarity(r)
    setDiceIndex(0)
  }, [])

  if (!isLoaded) {
    return (
      <div className="p-4 space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-16 rounded-lg bg-card animate-pulse" />
        ))}
      </div>
    )
  }

  const rollValid = !isNaN(parseInt(rollInput, 10))

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <div className="max-w-2xl mx-auto w-full px-4 pb-8 space-y-6">

        {/* Header */}
        <div className="py-4 space-y-1">
          <h1 className="text-lg font-semibold text-gold flex items-center gap-2">
            <Dices className="w-5 h-5" />
            Loot Generator
          </h1>
          <p className="text-xs text-muted-foreground">
            Roll physical dice, enter the total, get the item.
          </p>
        </div>
        <Separator className="bg-border -mt-4" />

        {/* ── Roller ──────────────────────────────────────────────────── */}
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
                  onClick={() => handleRarityChange(r)}
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
                onKeyDown={(e) => e.key === "Enter" && rollValid && handleLookUp()}
                placeholder={`${selectedDice.min}–${selectedDice.max}`}
                className="w-28 h-10 rounded-md border border-border bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/50"
              />
              <Button
                onClick={handleLookUp}
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

        {/* ── Gold ────────────────────────────────────────────────────── */}
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <Coins className="w-4 h-4 text-gold" />
            <span className="text-sm font-semibold">Gold</span>
            <div className="ml-auto flex items-center gap-3 text-xs text-muted-foreground">
              <span>{store.goldHandfuls} handful{store.goldHandfuls !== 1 ? "s" : ""}</span>
              <span>{store.goldBags} bag{store.goldBags !== 1 ? "s" : ""}</span>
              <span>{store.goldChests} chest{store.goldChests !== 1 ? "s" : ""}</span>
            </div>
          </div>
          <div className="flex gap-2">
            {(["handful", "bag", "chest"] as GoldDenomination[]).map((d) => (
              <Button
                key={d}
                variant="outline"
                size="sm"
                onClick={() => handleGold(d)}
                className="text-xs"
              >
                +{GOLD_LABELS[d]}
              </Button>
            ))}
          </div>
          <p className="text-[11px] text-muted-foreground">10 Handfuls = 1 Bag · 10 Bags = 1 Chest · Max 1 Chest</p>
        </section>

        {/* ── Session Log ─────────────────────────────────────────────── */}
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <ScrollText className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-semibold">Session Log</span>
            <span className="text-[10px] text-muted-foreground ml-1">
              {store.log.length} entr{store.log.length === 1 ? "y" : "ies"}
            </span>
            {store.log.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearLog}
                className={cn(
                  "ml-auto text-xs",
                  confirmClear
                    ? "text-destructive hover:text-destructive"
                    : "text-muted-foreground hover:text-destructive"
                )}
              >
                <Trash2 className="w-3 h-3 mr-1" />
                {confirmClear ? "Confirm clear?" : "End Session"}
              </Button>
            )}
          </div>

          {store.log.length === 0 && (
            <p className="text-xs text-muted-foreground py-4 text-center">
              Nothing logged yet. Roll some loot!
            </p>
          )}

          <div className="space-y-1.5">
            {store.log.map((entry) => (
              <div
                key={entry.id}
                className="flex items-start gap-3 rounded-md border border-border bg-card/40 px-3 py-2"
              >
                {entry.type === "item" ? (
                  <>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-sm font-medium text-foreground truncate">{entry.name}</span>
                        <Badge
                          variant="outline"
                          className={cn("text-[9px] border shrink-0", RARITY_BADGE_COLORS[entry.rarity!])}
                        >
                          {rarityLabel(entry.rarity!)}
                        </Badge>
                        <Badge variant="outline" className="text-[9px] border border-border text-muted-foreground shrink-0">
                          {entry.itemType === "item" ? "Item" : "Consumable"}
                        </Badge>
                        <span className="text-[9px] text-muted-foreground shrink-0">#{entry.tableIndex}</span>
                      </div>
                    </div>
                    <span className="text-[10px] text-muted-foreground shrink-0 mt-0.5">
                      {formatTime(entry.timestamp)}
                    </span>
                  </>
                ) : (
                  <>
                    <div className="flex-1">
                      <span className="text-sm text-gold/80">
                        +{GOLD_LABELS[entry.goldDenomination!]} of gold
                      </span>
                    </div>
                    <span className="text-[10px] text-muted-foreground shrink-0 mt-0.5">
                      {formatTime(entry.timestamp)}
                    </span>
                  </>
                )}
              </div>
            ))}
          </div>
        </section>

      </div>
    </div>
  )
}
