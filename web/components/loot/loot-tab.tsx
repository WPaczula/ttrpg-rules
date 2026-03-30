"use client"

import { useState, useCallback } from "react"
import { Separator } from "@/components/ui/separator"
import { useLootStore } from "@/hooks/use-loot-store"
import {
  type LootRarity,
  type LootItemType,
  type GoldDenomination,
  RARITY_DICE,
} from "@/lib/loot-types"
import { Dices } from "lucide-react"
import { RollerSection, type LastResult } from "./roller-section"
import { GoldSection } from "./gold-section"
import { SessionLog } from "./session-log"

export function LootTab() {
  const { store, isLoaded, logItem, addGold, clearLog } = useLootStore()

  const [itemType, setItemType] = useState<LootItemType | "mixed">("item")
  const [rarity, setRarity] = useState<LootRarity>("common")
  const [diceIndex, setDiceIndex] = useState<0 | 1>(0)
  const [quantity, setQuantity] = useState<1 | 2 | 3 | 5>(1)
  const [rollInput, setRollInput] = useState("")
  const [lastResult, setLastResult] = useState<LastResult | null>(null)
  const [confirmClear, setConfirmClear] = useState(false)

  const diceOptions = RARITY_DICE[rarity]
  const selectedDice = diceOptions[diceIndex]

  const handleLookUp = useCallback(() => {
    const total = parseInt(rollInput, 10)
    if (isNaN(total)) return

    for (let i = 0; i < quantity; i++) {
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

        <RollerSection
          itemType={itemType}
          setItemType={setItemType}
          rarity={rarity}
          onRarityChange={handleRarityChange}
          diceIndex={diceIndex}
          setDiceIndex={setDiceIndex}
          quantity={quantity}
          setQuantity={setQuantity}
          rollInput={rollInput}
          setRollInput={setRollInput}
          lastResult={lastResult}
          diceOptions={diceOptions}
          selectedDice={selectedDice}
          onLookUp={handleLookUp}
        />

        <GoldSection
          goldHandfuls={store.goldHandfuls}
          goldBags={store.goldBags}
          goldChests={store.goldChests}
          onAddGold={handleGold}
        />

        <SessionLog
          log={store.log}
          onClear={handleClearLog}
          confirmClear={confirmClear}
        />
      </div>
    </div>
  )
}
