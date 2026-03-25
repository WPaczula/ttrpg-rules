export interface Experience {
  id: string
  name: string
  modifier: number
}

export interface DomainCard {
  id: string
  name: string
  level: number
  domain: string
}

export interface CharacterData {
  // Identity
  name: string
  level: number
  class: string
  subclass: string
  ancestry: string
  secondaryAncestry: string
  ancestryFeature: string
  secondaryAncestryFeature: string
  community: string

  // Six traits
  agility: number
  strength: number
  finesse: number
  instinct: number
  presence: number
  knowledge: number

  // HP
  hpTotal: number
  hpMarked: number

  // Stress
  stressTotal: number
  stressMarked: number

  // Armor
  armorScore: number
  armorMarked: number
  evasion: number

  // Threshold bonuses from domain cards and class features (toggled on/off)
  thresholdBonuses?: { [sourceId: string]: { major: number; severe: number } }

  // Resources
  hope: number
  goldHandfuls: number
  goldBags: number
  goldChests: number

  // Progression
  proficiency: number
  markedTraits: string[]
  // Tracks how many times each advancement option has been used per tier
  // Each tier has its own set of slots that reset when you enter a new tier
  advancementSlots: Record<number, {
    traits: number       // max 3
    hp: number           // max 1
    stress: number       // max 1
    experiences: number  // max 1
    domainCard: number   // max 1
    evasion: number      // max 1
    subclassCard: number // max 1 (Tier 3+)
    proficiency: number  // max 1, costs 2 slots (Tier 3+)
  }>
  experiences: Experience[]
  domainCards: DomainCard[]

  // Equipment
  primaryWeapon: string
  secondaryWeapon: string
  armorName: string
  items: string[]

  // Free text
  features: string
  notes: string
}

export const DEFAULT_CHARACTER: CharacterData = {
  name: "",
  level: 1,
  class: "",
  subclass: "",
  ancestry: "",
  secondaryAncestry: "",
  ancestryFeature: "",
  secondaryAncestryFeature: "",
  community: "",
  agility: 0,
  strength: 0,
  finesse: 0,
  instinct: 0,
  presence: 0,
  knowledge: 0,
  hpTotal: 6,
  hpMarked: 0,
  stressTotal: 6,
  stressMarked: 0,
  armorScore: 2,
  armorMarked: 0,
  evasion: 10,
  thresholdBonuses: {},
  hope: 2,
  goldHandfuls: 0,
  goldBags: 0,
  goldChests: 0,
  proficiency: 1,
  markedTraits: [],
  advancementSlots: {},
  experiences: [],
  domainCards: [],
  primaryWeapon: "",
  secondaryWeapon: "",
  armorName: "",
  items: [],
  features: "",
  notes: "",
}

export function getTier(level: number): number {
  if (level >= 8) return 4
  if (level >= 5) return 3
  if (level >= 2) return 2
  return 1
}

export function formatModifier(value: number): string {
  return value >= 0 ? `+${value}` : `${value}`
}

// ── Threshold bonus definitions ─────────────────────────────────────────────

/** Domain cards that can provide threshold bonuses (keyed by card name). */
export const DOMAIN_CARD_THRESHOLD_BONUSES: Record<string, { major: number | "proficiency"; severe: number | "proficiency" }> = {
  "Fortified Armor": { major: 2, severe: 2 },
  "Vitality": { major: 2, severe: 2 },
  "Rise Up": { major: 0, severe: "proficiency" },
  "Blade-Touched": { major: 0, severe: 4 },
  "Splendor-Touched": { major: 0, severe: 3 },
  "Frenzy": { major: 0, severe: 8 },
}

/**
 * Subclass features that can provide threshold bonuses.
 * Key format: "SubclassName:FeatureName"
 */
export const CLASS_FEATURE_THRESHOLD_BONUSES: Record<string, { major: number | "proficiency"; severe: number | "proficiency" }> = {
  "Stalwart:Unwavering": { major: 1, severe: 1 },
  "Stalwart:Unrelenting": { major: 2, severe: 2 },
  "Stalwart:Undaunted": { major: 3, severe: 3 },
  "Winged Sentinel:Ascendant": { major: 0, severe: 4 },
  "Elemental Origin:Transcendence": { major: 0, severe: 4 },
}

/** Class-level features that provide threshold bonuses. Key: "ClassName:FeatureName" */
export const CLASS_LEVEL_FEATURE_THRESHOLD_BONUSES: Record<string, { major: number | "proficiency"; severe: number | "proficiency" }> = {
  "Druid:Shell": { major: "proficiency", severe: "proficiency" },
}

export interface ThresholdBreakdown {
  armorBaseMajor: number
  armorBaseSevere: number
  levelBonus: number
  bonuses: { label: string; major: number; severe: number }[]
  totalMajor: number
  totalSevere: number
}

/**
 * Compute damage thresholds from armor base, level, and active bonuses.
 * @param armorBaseThresholds - "Major / Severe" string from SRD armor (e.g. "6 / 13")
 * @param level - character level
 * @param proficiency - character proficiency
 * @param thresholdBonuses - active bonus toggles from CharacterData
 */
export function computeThresholds(
  armorBaseThresholds: string | undefined,
  level: number,
  proficiency: number,
  thresholdBonuses: { [sourceId: string]: { major: number; severe: number } } | undefined,
): ThresholdBreakdown {
  let armorBaseMajor = 0
  let armorBaseSevere = 0

  if (armorBaseThresholds) {
    const parts = armorBaseThresholds.split("/").map((s) => parseInt(s.trim(), 10))
    if (parts.length >= 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
      armorBaseMajor = parts[0]
      armorBaseSevere = parts[1]
    }
  }

  const levelBonus = level - 1

  const bonuses: { label: string; major: number; severe: number }[] = []
  if (thresholdBonuses) {
    for (const [sourceId, bonus] of Object.entries(thresholdBonuses)) {
      if (bonus.major !== 0 || bonus.severe !== 0) {
        bonuses.push({ label: sourceId, major: bonus.major, severe: bonus.severe })
      }
    }
  }

  const totalMajor = armorBaseMajor + levelBonus + bonuses.reduce((sum, b) => sum + b.major, 0)
  const totalSevere = armorBaseSevere + levelBonus + bonuses.reduce((sum, b) => sum + b.severe, 0)

  return {
    armorBaseMajor,
    armorBaseSevere,
    levelBonus,
    bonuses,
    totalMajor,
    totalSevere,
  }
}
