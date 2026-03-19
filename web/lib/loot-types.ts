import { ITEMS, CONSUMABLES } from "./loot-data"

// ─── Rarity ──────────────────────────────────────────────────────────────────

export type LootRarity = "common" | "uncommon" | "rare" | "legendary"

export const RARITIES: LootRarity[] = ["common", "uncommon", "rare", "legendary"]

export interface DiceOption {
  count: number   // number of d12s to roll
  min: number     // minimum possible total
  max: number     // maximum possible total
}

export const RARITY_DICE: Record<LootRarity, [DiceOption, DiceOption]> = {
  common:    [{ count: 1, min: 1,  max: 12 }, { count: 2, min: 2,  max: 24 }],
  uncommon:  [{ count: 2, min: 2,  max: 24 }, { count: 3, min: 3,  max: 36 }],
  rare:      [{ count: 3, min: 3,  max: 36 }, { count: 4, min: 4,  max: 48 }],
  legendary: [{ count: 4, min: 4,  max: 48 }, { count: 5, min: 5,  max: 60 }],
}

export const RARITY_COLORS: Record<LootRarity, string> = {
  common:    "text-muted-foreground",
  uncommon:  "text-emerald-400",
  rare:      "text-blue-400",
  legendary: "text-amber-400",
}

export const RARITY_BADGE_COLORS: Record<LootRarity, string> = {
  common:    "bg-muted/50 text-muted-foreground border-border",
  uncommon:  "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
  rare:      "bg-blue-500/10 text-blue-400 border-blue-500/30",
  legendary: "bg-amber-500/10 text-amber-400 border-amber-500/30",
}

// ─── Item type ────────────────────────────────────────────────────────────────

export type LootItemType = "item" | "consumable"

// ─── Lookup logic ─────────────────────────────────────────────────────────────

/**
 * Maps a raw dice total to a 1–60 table index using linear normalization.
 * Clamps to [1, 60].
 */
export function normalizeRoll(total: number, option: DiceOption): number {
  const { min, max } = option
  const clamped = Math.max(min, Math.min(max, total))
  // Linear interpolation from [min, max] → [1, 60]
  const normalized = Math.round(1 + ((clamped - min) / (max - min)) * 59)
  return Math.max(1, Math.min(60, normalized))
}

export function lookupItem(tableIndex: number, type: LootItemType) {
  const table = type === "item" ? ITEMS : CONSUMABLES
  return table.find((e) => e.roll === tableIndex) ?? table[tableIndex - 1] ?? table[0]
}

// ─── Session log ──────────────────────────────────────────────────────────────

export type GoldDenomination = "handful" | "bag" | "chest"

export interface LootLogEntry {
  id: string
  timestamp: number
  type: "item" | "gold"
  // for item entries
  itemType?: LootItemType
  rarity?: LootRarity
  diceOption?: DiceOption
  rollTotal?: number
  tableIndex?: number
  name?: string
  description?: string
  // for gold entries
  goldDenomination?: GoldDenomination
  goldAmount?: number
}

export interface LootStore {
  log: LootLogEntry[]
  goldHandfuls: number
  goldBags: number
  goldChests: number
}

export const DEFAULT_LOOT_STORE: LootStore = {
  log: [],
  goldHandfuls: 0,
  goldBags: 0,
  goldChests: 0,
}

export const GOLD_LABELS: Record<GoldDenomination, string> = {
  handful: "Handful",
  bag: "Bag",
  chest: "Chest",
}
