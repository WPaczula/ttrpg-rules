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

  // Damage thresholds (armor base + level)
  minorThreshold: number
  majorThreshold: number
  severeThreshold: number

  // Resources
  hope: number
  goldHandfuls: number
  goldBags: number
  goldChests: number

  // Progression
  proficiency: number
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
  minorThreshold: 5,
  majorThreshold: 11,
  severeThreshold: 16,
  hope: 2,
  goldHandfuls: 0,
  goldBags: 0,
  goldChests: 0,
  proficiency: 1,
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
