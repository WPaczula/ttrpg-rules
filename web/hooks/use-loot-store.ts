"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import {
  type LootStore,
  type LootLogEntry,
  type LootItemType,
  type LootRarity,
  type DiceOption,
  type GoldDenomination,
  DEFAULT_LOOT_STORE,
  normalizeRoll,
  lookupItem,
} from "@/lib/loot-types"

const STORAGE_KEY = "daggerheart-loot-session"

export function useLootStore() {
  const [store, setStoreState] = useState<LootStore>(DEFAULT_LOOT_STORE)
  const [isLoaded, setIsLoaded] = useState(false)
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw)
        setStoreState({ ...DEFAULT_LOOT_STORE, ...parsed })
      }
    } catch {
      // Invalid data, use defaults
    }
    setIsLoaded(true)
  }, [])

  const setStore = useCallback(
    (updater: LootStore | ((prev: LootStore) => LootStore)) => {
      setStoreState((prev) => {
        const next = typeof updater === "function" ? updater(prev) : updater
        if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
        saveTimerRef.current = setTimeout(() => {
          try {
            sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next))
          } catch {
            // Storage full or unavailable
          }
        }, 300)
        return next
      })
    },
    []
  )

  const logItem = useCallback(
    (
      itemType: LootItemType,
      rarity: LootRarity,
      diceOption: DiceOption,
      rollTotal: number
    ) => {
      const tableIndex = normalizeRoll(rollTotal, diceOption)
      const found = lookupItem(tableIndex, itemType)
      const entry: LootLogEntry = {
        id: crypto.randomUUID(),
        timestamp: Date.now(),
        type: "item",
        itemType,
        rarity,
        diceOption,
        rollTotal,
        tableIndex,
        name: found.name,
        description: found.description,
      }
      setStore((prev) => ({ ...prev, log: [entry, ...prev.log] }))
      return entry
    },
    [setStore]
  )

  const addGold = useCallback(
    (denomination: GoldDenomination) => {
      setStore((prev) => {
        let { goldHandfuls, goldBags, goldChests } = prev

        if (denomination === "handful") {
          goldHandfuls += 1
          if (goldHandfuls >= 10) { goldBags += 1; goldHandfuls -= 10 }
        } else if (denomination === "bag") {
          goldBags += 1
          if (goldBags >= 10) { goldChests += 1; goldBags -= 10 }
        } else {
          goldChests = Math.min(goldChests + 1, 1) // max 1 chest
        }

        const entry: LootLogEntry = {
          id: crypto.randomUUID(),
          timestamp: Date.now(),
          type: "gold",
          goldDenomination: denomination,
          goldAmount: 1,
        }

        return { ...prev, goldHandfuls, goldBags, goldChests, log: [entry, ...prev.log] }
      })
    },
    [setStore]
  )

  const clearLog = useCallback(() => {
    setStore(() => DEFAULT_LOOT_STORE)
  }, [setStore])

  return {
    store,
    isLoaded,
    logItem,
    addGold,
    clearLog,
  }
}
