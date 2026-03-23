// ─── Adversary Data Types ────────────────────────────────────────────────────

export interface AdversaryFeature {
  name: string
  text: string
}

export const ADVERSARY_TYPES = [
  "Solo",
  "Bruiser",
  "Leader",
  "Standard",
  "Ranged",
  "Skulk",
  "Horde",
  "Minion",
  "Support",
  "Social",
] as const

export type AdversaryType = (typeof ADVERSARY_TYPES)[number]

export interface Adversary {
  name: string
  type: AdversaryType
  tier: number
  hp: number
  stress: number
  difficulty: number
  thresholds: string // "major/severe" e.g. "8/14"
  atk: string // e.g. "+1", "-2"
  attack: string // weapon/attack name
  range: string // "Melee", "Close", "Far", etc.
  damage: string // e.g. "1d8+1 phy"
  description?: string
  motives_and_tactics?: string
  experience?: string
  features?: AdversaryFeature[]
}

// ─── Battle Point Costs ──────────────────────────────────────────────────────

export const ADVERSARY_POINT_COSTS: Record<AdversaryType, number> = {
  Minion: 1,
  Social: 1,
  Support: 1,
  Horde: 2,
  Ranged: 2,
  Skulk: 2,
  Standard: 2,
  Leader: 3,
  Bruiser: 4,
  Solo: 5,
}

export function getPointCost(type: AdversaryType): number {
  return ADVERSARY_POINT_COSTS[type] ?? 2
}

// ─── Encounter Types ─────────────────────────────────────────────────────────

export interface EncounterAdversary {
  id: string
  adversaryName: string
  hpMarked: number
  stressMarked: number
}

export interface Encounter {
  id: string
  name: string
  pcCount: number
  adversaries: EncounterAdversary[]
}

export interface AdversaryStore {
  library: Adversary[]
  encounters: Encounter[]
  activeEncounterId: string | null
}

export const DEFAULT_STORE: AdversaryStore = {
  library: [],
  encounters: [],
  activeEncounterId: null,
}

// ─── Budget Helpers ──────────────────────────────────────────────────────────

export function calculateBudget(pcCount: number): number {
  return 3 * pcCount + 2
}

export function calculateSpent(
  encounter: Encounter,
  library: Adversary[]
): number {
  let total = 0
  for (const inst of encounter.adversaries) {
    const adv = library.find((a) => a.name === inst.adversaryName)
    if (adv) total += getPointCost(adv.type)
  }
  return total
}

// ─── Validation ──────────────────────────────────────────────────────────────

export function validateAdversary(
  obj: unknown,
  index: number
): string | null {
  if (typeof obj !== "object" || obj === null) {
    return `[${index}]: not an object`
  }
  const o = obj as Record<string, unknown>
  const required: Array<[string, string]> = [
    ["name", "string"],
    ["type", "string"],
    ["tier", "number"],
    ["hp", "number"],
    ["stress", "number"],
    ["difficulty", "number"],
    ["thresholds", "string"],
    ["atk", "string"],
    ["attack", "string"],
    ["range", "string"],
    ["damage", "string"],
  ]
  for (const [field, expectedType] of required) {
    if (!(field in o)) return `[${index}] "${(o as Record<string, unknown>).name || index}": missing "${field}"`
    if (typeof o[field] !== expectedType) {
      // Allow string numbers for tier/hp/stress/difficulty
      if (
        expectedType === "number" &&
        typeof o[field] === "string" &&
        !isNaN(Number(o[field]))
      ) {
        continue
      }
      return `[${index}] "${o.name || index}": "${field}" should be ${expectedType}, got ${typeof o[field]}`
    }
  }
  if (!ADVERSARY_TYPES.includes(o.type as AdversaryType)) {
    return `[${index}] "${o.name}": invalid type "${o.type}". Must be one of: ${ADVERSARY_TYPES.join(", ")}`
  }
  return null
}

export function parseAdversaries(json: unknown): {
  adversaries: Adversary[]
  errors: string[]
} {
  if (!Array.isArray(json)) {
    return { adversaries: [], errors: ["JSON must be an array of adversary objects"] }
  }
  const adversaries: Adversary[] = []
  const errors: string[] = []

  for (let i = 0; i < json.length; i++) {
    const err = validateAdversary(json[i], i)
    if (err) {
      errors.push(err)
      continue
    }
    const raw = json[i] as Record<string, unknown>
    adversaries.push({
      name: raw.name as string,
      type: raw.type as AdversaryType,
      tier: Number(raw.tier),
      hp: Number(raw.hp),
      stress: Number(raw.stress),
      difficulty: Number(raw.difficulty),
      thresholds: raw.thresholds as string,
      atk: raw.atk as string,
      attack: raw.attack as string,
      range: raw.range as string,
      damage: raw.damage as string,
      description: (raw.description as string) || undefined,
      motives_and_tactics: (raw.motives_and_tactics as string) || undefined,
      experience: (raw.experience as string) || undefined,
      features: Array.isArray(raw.features)
        ? (raw.features as AdversaryFeature[]).map((f) => ({
            name: String(f.name),
            text: String(f.text),
          }))
        : Array.isArray(raw.feature)
          ? (raw.feature as AdversaryFeature[]).map((f) => ({
              name: String(f.name),
              text: String(f.text),
            }))
          : undefined,
    })
  }

  return { adversaries, errors }
}

export function createEncounter(name: string): Encounter {
  return {
    id: crypto.randomUUID(),
    name,
    pcCount: 4,
    adversaries: [],
  }
}
