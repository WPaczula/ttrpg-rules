// Auto-generated from Daggerheart SRD. Do not edit by hand.
// Run: node api/scripts/generate-srd-data.mjs

export interface SrdFeature {
  name: string
  text: string
}

export interface SrdWeapon {
  name: string
  tier: number
  type: "Primary" | "Secondary"
  damageType: "Physical" | "Magical"
  trait: string
  range: string
  damage: string
  burden: string
  feature?: string
}

export interface SrdArmor {
  name: string
  tier: number
  baseThresholds: string
  baseScore: number
  feature?: string
}

export interface SrdDomainCard {
  name: string
  level: number
  domain: string
  recallCost: number
  description: string
}

export interface SrdDomain {
  name: string
  description: string
  classes: string[]
  cardsByLevel: Record<number, string[]>
}

export interface SrdClass {
  name: string
  description: string
  domains: [string, string]
  subclasses: [string, string]
  evasion: number
  hp: number
  items: string
  suggestedTraits: string
  suggestedPrimary: string
  suggestedSecondary: string
  suggestedArmor: string
  hopeFeature: SrdFeature
  features: SrdFeature[]
}

export interface SrdAncestry {
  name: string
  description: string
  features: SrdFeature[]
}

export interface SrdCommunity {
  name: string
  description: string
  note: string
  features: SrdFeature[]
}

export interface SrdSubclass {
  name: string
  description: string
  spellcastTrait: string
  foundation: SrdFeature[]
  specialization: SrdFeature[]
  mastery: SrdFeature[]
}

export const SRD_WEAPONS: SrdWeapon[] = [
  {
    "name": "Arcane Gauntlets",
    "tier": 1,
    "type": "Primary",
    "damageType": "Magical",
    "trait": "Strength",
    "range": "Melee",
    "damage": "d10+3 mag",
    "burden": "Two-Handed"
  },
  {
    "name": "Battleaxe",
    "tier": 1,
    "type": "Primary",
    "damageType": "Physical",
    "trait": "Strength",
    "range": "Melee",
    "damage": "d10+3 phy",
    "burden": "Two-Handed"
  },
  {
    "name": "Broadsword",
    "tier": 1,
    "type": "Primary",
    "damageType": "Physical",
    "trait": "Agility",
    "range": "Melee",
    "damage": "d8 phy",
    "burden": "One-Handed"
  },
  {
    "name": "Crossbow",
    "tier": 1,
    "type": "Primary",
    "damageType": "Physical",
    "trait": "Finesse",
    "range": "Far",
    "damage": "d6+1 phy",
    "burden": "One-Handed"
  },
  {
    "name": "Cutlass",
    "tier": 1,
    "type": "Primary",
    "damageType": "Physical",
    "trait": "Presence",
    "range": "Melee",
    "damage": "d8+1 phy",
    "burden": "One-Handed"
  },
  {
    "name": "Dagger",
    "tier": 1,
    "type": "Primary",
    "damageType": "Physical",
    "trait": "Finesse",
    "range": "Melee",
    "damage": "d8+1 phy",
    "burden": "One-Handed"
  },
  {
    "name": "Dualstaff",
    "tier": 1,
    "type": "Primary",
    "damageType": "Magical",
    "trait": "Instinct",
    "range": "Far",
    "damage": "d6+3 mag",
    "burden": "Two-Handed"
  },
  {
    "name": "Glowing Rings",
    "tier": 1,
    "type": "Primary",
    "damageType": "Magical",
    "trait": "Agility",
    "range": "Very Close",
    "damage": "d10+2 mag",
    "burden": "Two-Handed"
  },
  {
    "name": "Grappler",
    "tier": 1,
    "type": "Secondary",
    "damageType": "Physical",
    "trait": "Finesse",
    "range": "Close",
    "damage": "d6 phy",
    "burden": "One-Handed"
  },
  {
    "name": "Greatstaff",
    "tier": 1,
    "type": "Primary",
    "damageType": "Magical",
    "trait": "Knowledge",
    "range": "Very Far",
    "damage": "d6 mag",
    "burden": "Two-Handed"
  },
  {
    "name": "Greatsword",
    "tier": 1,
    "type": "Primary",
    "damageType": "Physical",
    "trait": "Strength",
    "range": "Melee",
    "damage": "d10+3 phy",
    "burden": "Two-Handed"
  },
  {
    "name": "Halberd",
    "tier": 1,
    "type": "Primary",
    "damageType": "Physical",
    "trait": "Strength",
    "range": "Very Close",
    "damage": "d10+2 phy",
    "burden": "Two-Handed"
  },
  {
    "name": "Hallowed Axe",
    "tier": 1,
    "type": "Primary",
    "damageType": "Magical",
    "trait": "Strength",
    "range": "Melee",
    "damage": "d8+1 mag",
    "burden": "One-Handed"
  },
  {
    "name": "Hand Crossbow",
    "tier": 1,
    "type": "Secondary",
    "damageType": "Physical",
    "trait": "Finesse",
    "range": "Far",
    "damage": "d6+1 phy",
    "burden": "One-Handed"
  },
  {
    "name": "Hand Runes",
    "tier": 1,
    "type": "Primary",
    "damageType": "Magical",
    "trait": "Instinct",
    "range": "Very Close",
    "damage": "d10 mag",
    "burden": "One-Handed"
  },
  {
    "name": "Longbow",
    "tier": 1,
    "type": "Primary",
    "damageType": "Physical",
    "trait": "Agility",
    "range": "Very Far",
    "damage": "d8+3 phy",
    "burden": "Two-Handed"
  },
  {
    "name": "Longsword",
    "tier": 1,
    "type": "Primary",
    "damageType": "Physical",
    "trait": "Agility",
    "range": "Melee",
    "damage": "d10+3 phy",
    "burden": "Two-Handed"
  },
  {
    "name": "Mace",
    "tier": 1,
    "type": "Primary",
    "damageType": "Physical",
    "trait": "Strength",
    "range": "Melee",
    "damage": "d8+1 phy",
    "burden": "One-Handed"
  },
  {
    "name": "Quarterstaff",
    "tier": 1,
    "type": "Primary",
    "damageType": "Physical",
    "trait": "Instinct",
    "range": "Melee",
    "damage": "d10+3 phy",
    "burden": "Two-Handed"
  },
  {
    "name": "Rapier",
    "tier": 1,
    "type": "Primary",
    "damageType": "Physical",
    "trait": "Presence",
    "range": "Melee",
    "damage": "d8 phy",
    "burden": "One-Handed"
  },
  {
    "name": "Returning Blade",
    "tier": 1,
    "type": "Primary",
    "damageType": "Magical",
    "trait": "Finesse",
    "range": "Close",
    "damage": "d8 mag",
    "burden": "One-Handed"
  },
  {
    "name": "Round Shield",
    "tier": 1,
    "type": "Secondary",
    "damageType": "Physical",
    "trait": "Strength",
    "range": "Melee",
    "damage": "d4 phy",
    "burden": "One-Handed"
  },
  {
    "name": "Scepter",
    "tier": 1,
    "type": "Primary",
    "damageType": "Magical",
    "trait": "Presence",
    "range": "Far",
    "damage": "d6 mag",
    "burden": "Two-Handed"
  },
  {
    "name": "Shortbow",
    "tier": 1,
    "type": "Primary",
    "damageType": "Physical",
    "trait": "Agility",
    "range": "Far",
    "damage": "d6+3 phy",
    "burden": "Two-Handed"
  },
  {
    "name": "Shortstaff",
    "tier": 1,
    "type": "Primary",
    "damageType": "Magical",
    "trait": "Instinct",
    "range": "Close",
    "damage": "d8+1 mag",
    "burden": "One-Handed"
  },
  {
    "name": "Shortsword",
    "tier": 1,
    "type": "Secondary",
    "damageType": "Physical",
    "trait": "Agility",
    "range": "Melee",
    "damage": "d8 phy",
    "burden": "One-Handed"
  },
  {
    "name": "Small Dagger",
    "tier": 1,
    "type": "Secondary",
    "damageType": "Physical",
    "trait": "Finesse",
    "range": "Melee",
    "damage": "d8 phy",
    "burden": "One-Handed"
  },
  {
    "name": "Spear",
    "tier": 1,
    "type": "Primary",
    "damageType": "Physical",
    "trait": "Finesse",
    "range": "Very Close",
    "damage": "d8+3 phy",
    "burden": "Two-Handed"
  },
  {
    "name": "Tower Shield",
    "tier": 1,
    "type": "Secondary",
    "damageType": "Physical",
    "trait": "Strength",
    "range": "Melee",
    "damage": "d6 phy",
    "burden": "One-Handed"
  },
  {
    "name": "Wand",
    "tier": 1,
    "type": "Primary",
    "damageType": "Magical",
    "trait": "Knowledge",
    "range": "Far",
    "damage": "d6+1 mag",
    "burden": "One-Handed"
  },
  {
    "name": "Warhammer",
    "tier": 1,
    "type": "Primary",
    "damageType": "Physical",
    "trait": "Strength",
    "range": "Melee",
    "damage": "d12+3 phy",
    "burden": "Two-Handed"
  },
  {
    "name": "Whip",
    "tier": 1,
    "type": "Secondary",
    "damageType": "Physical",
    "trait": "Presence",
    "range": "Very Close",
    "damage": "d6 phy",
    "burden": "One-Handed"
  },
  {
    "name": "Bladed Whip",
    "tier": 2,
    "type": "Primary",
    "damageType": "Physical",
    "trait": "Agility",
    "range": "Very Close",
    "damage": "d8+3 phy",
    "burden": "One-Handed"
  },
  {
    "name": "Blunderbuss",
    "tier": 2,
    "type": "Primary",
    "damageType": "Physical",
    "trait": "Finesse",
    "range": "Close",
    "damage": "d8+6 phy",
    "burden": "Two-Handed"
  },
  {
    "name": "Casting Sword",
    "tier": 2,
    "type": "Primary",
    "damageType": "Magical",
    "trait": "Strength",
    "range": "Melee",
    "damage": "d10+4 mag",
    "burden": "Two-Handed"
  },
  {
    "name": "Devouring Dagger",
    "tier": 2,
    "type": "Primary",
    "damageType": "Magical",
    "trait": "Finesse",
    "range": "Melee",
    "damage": "d8+4 mag",
    "burden": "One-Handed"
  },
  {
    "name": "Ego Blade",
    "tier": 2,
    "type": "Primary",
    "damageType": "Magical",
    "trait": "Agility",
    "range": "Melee",
    "damage": "d12+4 mag",
    "burden": "One-Handed"
  },
  {
    "name": "Elder Bow",
    "tier": 2,
    "type": "Primary",
    "damageType": "Magical",
    "trait": "Instinct",
    "range": "Far",
    "damage": "d6+4 mag",
    "burden": "Two-Handed"
  },
  {
    "name": "Finehair Bow",
    "tier": 2,
    "type": "Primary",
    "damageType": "Physical",
    "trait": "Agility",
    "range": "Very Far",
    "damage": "d6+5 phy",
    "burden": "Two-Handed"
  },
  {
    "name": "Gilded Falchion",
    "tier": 2,
    "type": "Primary",
    "damageType": "Physical",
    "trait": "Strength",
    "range": "Melee",
    "damage": "d10+4 phy",
    "burden": "One-Handed"
  },
  {
    "name": "Greatbow",
    "tier": 2,
    "type": "Primary",
    "damageType": "Physical",
    "trait": "Strength",
    "range": "Far",
    "damage": "d6+6 phy",
    "burden": "Two-Handed"
  },
  {
    "name": "Hammer of Exota",
    "tier": 2,
    "type": "Primary",
    "damageType": "Magical",
    "trait": "Instinct",
    "range": "Melee",
    "damage": "d8+6 mag",
    "burden": "Two-Handed"
  },
  {
    "name": "Improved Arcane Gauntlets",
    "tier": 2,
    "type": "Primary",
    "damageType": "Magical",
    "trait": "Strength",
    "range": "Melee",
    "damage": "d10+6 mag",
    "burden": "Two-Handed"
  },
  {
    "name": "Improved Battleaxe",
    "tier": 2,
    "type": "Primary",
    "damageType": "Physical",
    "trait": "Strength",
    "range": "Melee",
    "damage": "d10+6 phy",
    "burden": "Two-Handed"
  },
  {
    "name": "Improved Broadsword",
    "tier": 2,
    "type": "Primary",
    "damageType": "Physical",
    "trait": "Agility",
    "range": "Melee",
    "damage": "d8+3 phy",
    "burden": "One-Handed"
  },
  {
    "name": "Improved Crossbow",
    "tier": 2,
    "type": "Primary",
    "damageType": "Physical",
    "trait": "Finesse",
    "range": "Far",
    "damage": "d6+4 phy",
    "burden": "One-Handed"
  },
  {
    "name": "Improved Cutlass",
    "tier": 2,
    "type": "Primary",
    "damageType": "Physical",
    "trait": "Presence",
    "range": "Melee",
    "damage": "d8+4 phy",
    "burden": "One-Handed"
  },
  {
    "name": "Improved Dagger",
    "tier": 2,
    "type": "Primary",
    "damageType": "Physical",
    "trait": "Finesse",
    "range": "Melee",
    "damage": "d8+4 phy",
    "burden": "One-Handed"
  },
  {
    "name": "Improved Dualstaff",
    "tier": 2,
    "type": "Primary",
    "damageType": "Magical",
    "trait": "Instinct",
    "range": "Far",
    "damage": "d6+6 mag",
    "burden": "Two-Handed"
  },
  {
    "name": "Improved Glowing Rings",
    "tier": 2,
    "type": "Primary",
    "damageType": "Magical",
    "trait": "Agility",
    "range": "Very Close",
    "damage": "d10+5 mag",
    "burden": "Two-Handed"
  },
  {
    "name": "Improved Grappler",
    "tier": 2,
    "type": "Secondary",
    "damageType": "Physical",
    "trait": "Finesse",
    "range": "Close",
    "damage": "d6+2 phy",
    "burden": "One-Handed"
  },
  {
    "name": "Improved Greatstaff",
    "tier": 2,
    "type": "Primary",
    "damageType": "Magical",
    "trait": "Knowledge",
    "range": "Very Far",
    "damage": "d6+3 mag",
    "burden": "Two-Handed"
  },
  {
    "name": "Improved Greatsword",
    "tier": 2,
    "type": "Primary",
    "damageType": "Physical",
    "trait": "Strength",
    "range": "Melee",
    "damage": "d10+6 phy",
    "burden": "Two-Handed"
  },
  {
    "name": "Improved Halberd",
    "tier": 2,
    "type": "Primary",
    "damageType": "Physical",
    "trait": "Strength",
    "range": "Very Close",
    "damage": "d10+5 phy",
    "burden": "Two-Handed"
  },
  {
    "name": "Improved Hallowed Axe",
    "tier": 2,
    "type": "Primary",
    "damageType": "Magical",
    "trait": "Strength",
    "range": "Melee",
    "damage": "d8+4 mag",
    "burden": "One-Handed"
  },
  {
    "name": "Improved Hand Crossbow",
    "tier": 2,
    "type": "Secondary",
    "damageType": "Physical",
    "trait": "Finesse",
    "range": "Far",
    "damage": "d6+3 phy",
    "burden": "One-Handed"
  },
  {
    "name": "Improved Hand Runes",
    "tier": 2,
    "type": "Primary",
    "damageType": "Magical",
    "trait": "Instinct",
    "range": "Very Close",
    "damage": "d10+3 mag",
    "burden": "One-Handed"
  },
  {
    "name": "Improved Longbow",
    "tier": 2,
    "type": "Primary",
    "damageType": "Physical",
    "trait": "Agility",
    "range": "Very Far",
    "damage": "d8+6 phy",
    "burden": "Two-Handed"
  },
  {
    "name": "Improved Longsword",
    "tier": 2,
    "type": "Primary",
    "damageType": "Physical",
    "trait": "Agility",
    "range": "Melee",
    "damage": "d10+6 phy",
    "burden": "Two-Handed"
  },
  {
    "name": "Improved Mace",
    "tier": 2,
    "type": "Primary",
    "damageType": "Physical",
    "trait": "Strength",
    "range": "Melee",
    "damage": "d8+4 phy",
    "burden": "One-Handed"
  },
  {
    "name": "Improved Quarterstaff",
    "tier": 2,
    "type": "Primary",
    "damageType": "Physical",
    "trait": "Instinct",
    "range": "Melee",
    "damage": "d10+6 phy",
    "burden": "Two-Handed"
  },
  {
    "name": "Improved Rapier",
    "tier": 2,
    "type": "Primary",
    "damageType": "Physical",
    "trait": "Presence",
    "range": "Melee",
    "damage": "d8+3 phy",
    "burden": "One-Handed"
  },
  {
    "name": "Improved Returning Blade",
    "tier": 2,
    "type": "Primary",
    "damageType": "Magical",
    "trait": "Finesse",
    "range": "Close",
    "damage": "d8+3 mag",
    "burden": "One-Handed"
  },
  {
    "name": "Improved Round Shield",
    "tier": 2,
    "type": "Secondary",
    "damageType": "Physical",
    "trait": "Strength",
    "range": "Melee",
    "damage": "d4+2 phy",
    "burden": "One-Handed"
  },
  {
    "name": "Improved Scepter",
    "tier": 2,
    "type": "Primary",
    "damageType": "Magical",
    "trait": "Presence",
    "range": "Far",
    "damage": "d6+3 mag",
    "burden": "Two-Handed"
  },
  {
    "name": "Improved Shortbow",
    "tier": 2,
    "type": "Primary",
    "damageType": "Physical",
    "trait": "Agility",
    "range": "Far",
    "damage": "d6+6 phy",
    "burden": "Two-Handed"
  },
  {
    "name": "Improved Shortstaff",
    "tier": 2,
    "type": "Primary",
    "damageType": "Magical",
    "trait": "Instinct",
    "range": "Close",
    "damage": "d8+4 mag",
    "burden": "One-Handed"
  },
  {
    "name": "Improved Shortsword",
    "tier": 2,
    "type": "Secondary",
    "damageType": "Physical",
    "trait": "Agility",
    "range": "Melee",
    "damage": "d8+2 phy",
    "burden": "One-Handed"
  },
  {
    "name": "Improved Small Dagger",
    "tier": 2,
    "type": "Secondary",
    "damageType": "Physical",
    "trait": "Finesse",
    "range": "Melee",
    "damage": "d8+2 phy",
    "burden": "One-Handed"
  },
  {
    "name": "Improved Spear",
    "tier": 2,
    "type": "Primary",
    "damageType": "Physical",
    "trait": "Finesse",
    "range": "Very Close",
    "damage": "d8+6 phy",
    "burden": "Two-Handed"
  },
  {
    "name": "Improved Tower Shield",
    "tier": 2,
    "type": "Secondary",
    "damageType": "Physical",
    "trait": "Strength",
    "range": "Melee",
    "damage": "d6+2 phy",
    "burden": "One-Handed"
  },
  {
    "name": "Improved Wand",
    "tier": 2,
    "type": "Primary",
    "damageType": "Magical",
    "trait": "Knowledge",
    "range": "Far",
    "damage": "d6+4 mag",
    "burden": "One-Handed"
  },
  {
    "name": "Improved Warhammer",
    "tier": 2,
    "type": "Primary",
    "damageType": "Physical",
    "trait": "Strength",
    "range": "Melee",
    "damage": "d12+6 phy",
    "burden": "Two-Handed"
  },
  {
    "name": "Improved Whip",
    "tier": 2,
    "type": "Secondary",
    "damageType": "Physical",
    "trait": "Presence",
    "range": "Very Close",
    "damage": "d6+2 phy",
    "burden": "One-Handed"
  },
  {
    "name": "Keepers Staff",
    "tier": 2,
    "type": "Primary",
    "damageType": "Magical",
    "trait": "Knowledge",
    "range": "Far",
    "damage": "d6+4 mag",
    "burden": "Two-Handed"
  },
  {
    "name": "Knuckle Blades",
    "tier": 2,
    "type": "Primary",
    "damageType": "Physical",
    "trait": "Strength",
    "range": "Melee",
    "damage": "d10+6 phy",
    "burden": "Two-Handed"
  },
  {
    "name": "Parrying Dagger",
    "tier": 2,
    "type": "Secondary",
    "damageType": "Physical",
    "trait": "Finesse",
    "range": "Melee",
    "damage": "d6+2 phy",
    "burden": "One-Handed"
  },
  {
    "name": "Returning Axe",
    "tier": 2,
    "type": "Secondary",
    "damageType": "Physical",
    "trait": "Agility",
    "range": "Close",
    "damage": "d6+4 phy",
    "burden": "One-Handed"
  },
  {
    "name": "Scepter of Elias",
    "tier": 2,
    "type": "Primary",
    "damageType": "Magical",
    "trait": "Presence",
    "range": "Far",
    "damage": "d6+3 mag",
    "burden": "One-Handed"
  },
  {
    "name": "Spiked Shield",
    "tier": 2,
    "type": "Secondary",
    "damageType": "Physical",
    "trait": "Strength",
    "range": "Melee",
    "damage": "d6+2 phy",
    "burden": "One-Handed"
  },
  {
    "name": "Steelforged Halberd",
    "tier": 2,
    "type": "Primary",
    "damageType": "Physical",
    "trait": "Strength",
    "range": "Very Close",
    "damage": "d8+4 phy",
    "burden": "Two-Handed"
  },
  {
    "name": "Urok Broadsword",
    "tier": 2,
    "type": "Primary",
    "damageType": "Physical",
    "trait": "Finesse",
    "range": "Melee",
    "damage": "d8+3 phy",
    "burden": "One-Handed"
  },
  {
    "name": "Wand of Enthrallment",
    "tier": 2,
    "type": "Primary",
    "damageType": "Magical",
    "trait": "Presence",
    "range": "Far",
    "damage": "d6+4 mag",
    "burden": "One-Handed"
  },
  {
    "name": "War Scythe",
    "tier": 2,
    "type": "Primary",
    "damageType": "Physical",
    "trait": "Finesse",
    "range": "Very Close",
    "damage": "d8+5 phy",
    "burden": "Two-Handed"
  },
  {
    "name": "Yutari Bloodbow",
    "tier": 2,
    "type": "Primary",
    "damageType": "Magical",
    "trait": "Finesse",
    "range": "Far",
    "damage": "d6+4 mag",
    "burden": "Two-Handed"
  },
  {
    "name": "Advanced Arcane Gauntlets",
    "tier": 3,
    "type": "Primary",
    "damageType": "Magical",
    "trait": "Strength",
    "range": "Melee",
    "damage": "d10+9 mag",
    "burden": "Two-Handed"
  },
  {
    "name": "Advanced Battleaxe",
    "tier": 3,
    "type": "Primary",
    "damageType": "Physical",
    "trait": "Strength",
    "range": "Melee",
    "damage": "d10+9 phy",
    "burden": "Two-Handed"
  },
  {
    "name": "Advanced Broadsword",
    "tier": 3,
    "type": "Primary",
    "damageType": "Physical",
    "trait": "Agility",
    "range": "Melee",
    "damage": "d8+6 phy",
    "burden": "One-Handed"
  },
  {
    "name": "Advanced Crossbow",
    "tier": 3,
    "type": "Primary",
    "damageType": "Physical",
    "trait": "Finesse",
    "range": "Far",
    "damage": "d6+7 phy",
    "burden": "One-Handed"
  },
  {
    "name": "Advanced Cutlass",
    "tier": 3,
    "type": "Primary",
    "damageType": "Physical",
    "trait": "Presence",
    "range": "Melee",
    "damage": "d8+7 phy",
    "burden": "One-Handed"
  },
  {
    "name": "Advanced Dagger",
    "tier": 3,
    "type": "Primary",
    "damageType": "Physical",
    "trait": "Finesse",
    "range": "Melee",
    "damage": "d8+7 phy",
    "burden": "One-Handed"
  },
  {
    "name": "Advanced Dualstaff",
    "tier": 3,
    "type": "Primary",
    "damageType": "Magical",
    "trait": "Instinct",
    "range": "Far",
    "damage": "d6+9 mag",
    "burden": "Two-Handed"
  },
  {
    "name": "Advanced Glowing Rings",
    "tier": 3,
    "type": "Primary",
    "damageType": "Magical",
    "trait": "Agility",
    "range": "Very Close",
    "damage": "d10+8 mag",
    "burden": "Two-Handed"
  },
  {
    "name": "Advanced Grappler",
    "tier": 3,
    "type": "Secondary",
    "damageType": "Physical",
    "trait": "Finesse",
    "range": "Close",
    "damage": "d6+4 phy",
    "burden": "One-Handed"
  },
  {
    "name": "Advanced Greatstaff",
    "tier": 3,
    "type": "Primary",
    "damageType": "Magical",
    "trait": "Knowledge",
    "range": "Very Far",
    "damage": "d6+6 mag",
    "burden": "Two-Handed"
  },
  {
    "name": "Advanced Greatsword",
    "tier": 3,
    "type": "Primary",
    "damageType": "Physical",
    "trait": "Strength",
    "range": "Melee",
    "damage": "d10+9 phy",
    "burden": "Two-Handed"
  },
  {
    "name": "Advanced Halberd",
    "tier": 3,
    "type": "Primary",
    "damageType": "Physical",
    "trait": "Strength",
    "range": "Very Close",
    "damage": "d10+8 phy",
    "burden": "Two-Handed"
  },
  {
    "name": "Advanced Hallowed Axe",
    "tier": 3,
    "type": "Primary",
    "damageType": "Magical",
    "trait": "Strength",
    "range": "Melee",
    "damage": "d8+7 mag",
    "burden": "One-Handed"
  },
  {
    "name": "Advanced Hand Crossbow",
    "tier": 3,
    "type": "Secondary",
    "damageType": "Physical",
    "trait": "Finesse",
    "range": "Far",
    "damage": "d6+5 phy",
    "burden": "One-Handed"
  },
  {
    "name": "Advanced Hand Runes",
    "tier": 3,
    "type": "Primary",
    "damageType": "Magical",
    "trait": "Instinct",
    "range": "Very Close",
    "damage": "d10+6 mag",
    "burden": "One-Handed"
  },
  {
    "name": "Advanced Longbow",
    "tier": 3,
    "type": "Primary",
    "damageType": "Physical",
    "trait": "Agility",
    "range": "Very Far",
    "damage": "d8+9 phy",
    "burden": "Two-Handed"
  },
  {
    "name": "Advanced Longsword",
    "tier": 3,
    "type": "Primary",
    "damageType": "Physical",
    "trait": "Agility",
    "range": "Melee",
    "damage": "d10+9 phy",
    "burden": "Two-Handed"
  },
  {
    "name": "Advanced Mace",
    "tier": 3,
    "type": "Primary",
    "damageType": "Physical",
    "trait": "Strength",
    "range": "Melee",
    "damage": "d8+7 phy",
    "burden": "One-Handed"
  },
  {
    "name": "Advanced Quarterstaff",
    "tier": 3,
    "type": "Primary",
    "damageType": "Physical",
    "trait": "Instinct",
    "range": "Melee",
    "damage": "d10+9 phy",
    "burden": "Two-Handed"
  },
  {
    "name": "Advanced Rapier",
    "tier": 3,
    "type": "Primary",
    "damageType": "Physical",
    "trait": "Presence",
    "range": "Melee",
    "damage": "d8+6 phy",
    "burden": "One-Handed"
  },
  {
    "name": "Advanced Returning Blade",
    "tier": 3,
    "type": "Primary",
    "damageType": "Magical",
    "trait": "Finesse",
    "range": "Close",
    "damage": "d8+6 mag",
    "burden": "One-Handed"
  },
  {
    "name": "Advanced Round Shield",
    "tier": 3,
    "type": "Secondary",
    "damageType": "Physical",
    "trait": "Strength",
    "range": "Melee",
    "damage": "d4+4 phy",
    "burden": "One-Handed"
  },
  {
    "name": "Advanced Scepter",
    "tier": 3,
    "type": "Primary",
    "damageType": "Magical",
    "trait": "Presence",
    "range": "Far",
    "damage": "d6+6 mag",
    "burden": "Two-Handed"
  },
  {
    "name": "Advanced Shortbow",
    "tier": 3,
    "type": "Primary",
    "damageType": "Physical",
    "trait": "Agility",
    "range": "Far",
    "damage": "d6+9 phy",
    "burden": "Two-Handed"
  },
  {
    "name": "Advanced Shortstaff",
    "tier": 3,
    "type": "Primary",
    "damageType": "Magical",
    "trait": "Instinct",
    "range": "Close",
    "damage": "d8+7 mag",
    "burden": "One-Handed"
  },
  {
    "name": "Advanced Shortsword",
    "tier": 3,
    "type": "Secondary",
    "damageType": "Physical",
    "trait": "Agility",
    "range": "Melee",
    "damage": "d8+4 phy",
    "burden": "One-Handed"
  },
  {
    "name": "Advanced Small Dagger",
    "tier": 3,
    "type": "Secondary",
    "damageType": "Physical",
    "trait": "Finesse",
    "range": "Melee",
    "damage": "d8+4 phy",
    "burden": "One-Handed"
  },
  {
    "name": "Advanced Spear",
    "tier": 3,
    "type": "Primary",
    "damageType": "Physical",
    "trait": "Finesse",
    "range": "Very Close",
    "damage": "d8+9 phy",
    "burden": "Two-Handed"
  },
  {
    "name": "Advanced Tower Shield",
    "tier": 3,
    "type": "Secondary",
    "damageType": "Physical",
    "trait": "Strength",
    "range": "Melee",
    "damage": "d6+4 phy",
    "burden": "One-Handed"
  },
  {
    "name": "Advanced Wand",
    "tier": 3,
    "type": "Primary",
    "damageType": "Magical",
    "trait": "Knowledge",
    "range": "Far",
    "damage": "d6+7 mag",
    "burden": "One-Handed"
  },
  {
    "name": "Advanced Warhammer",
    "tier": 3,
    "type": "Primary",
    "damageType": "Physical",
    "trait": "Strength",
    "range": "Melee",
    "damage": "d12+9 phy",
    "burden": "Two-Handed"
  },
  {
    "name": "Advanced Whip",
    "tier": 3,
    "type": "Secondary",
    "damageType": "Physical",
    "trait": "Presence",
    "range": "Very Close",
    "damage": "d6+4 phy",
    "burden": "One-Handed"
  },
  {
    "name": "Axe of Fortunis",
    "tier": 3,
    "type": "Primary",
    "damageType": "Magical",
    "trait": "Strength",
    "range": "Melee",
    "damage": "d10+8 mag",
    "burden": "Two-Handed"
  },
  {
    "name": "Black Powder Revolver",
    "tier": 3,
    "type": "Primary",
    "damageType": "Physical",
    "trait": "Finesse",
    "range": "Far",
    "damage": "d6+8 phy",
    "burden": "One-Handed"
  },
  {
    "name": "Blessed Anlace",
    "tier": 3,
    "type": "Primary",
    "damageType": "Magical",
    "trait": "Instinct",
    "range": "Melee",
    "damage": "d10+6 mag",
    "burden": "One-Handed"
  },
  {
    "name": "Bravesword",
    "tier": 3,
    "type": "Primary",
    "damageType": "Physical",
    "trait": "Strength",
    "range": "Melee",
    "damage": "d12+7 phy",
    "burden": "Two-Handed"
  },
  {
    "name": "Buckler",
    "tier": 3,
    "type": "Secondary",
    "damageType": "Physical",
    "trait": "Agility",
    "range": "Melee",
    "damage": "d4+4 phy",
    "burden": "One-Handed"
  },
  {
    "name": "Double Flail",
    "tier": 3,
    "type": "Primary",
    "damageType": "Physical",
    "trait": "Agility",
    "range": "Very Close",
    "damage": "d10+8 phy",
    "burden": "Two-Handed"
  },
  {
    "name": "Firestaff",
    "tier": 3,
    "type": "Primary",
    "damageType": "Magical",
    "trait": "Instinct",
    "range": "Far",
    "damage": "d6+7 mag",
    "burden": "Two-Handed"
  },
  {
    "name": "Flickerfly Blade",
    "tier": 3,
    "type": "Primary",
    "damageType": "Physical",
    "trait": "Agility",
    "range": "Melee",
    "damage": "d8+5 phy",
    "burden": "One-Handed"
  },
  {
    "name": "Ghostblade",
    "tier": 3,
    "type": "Primary",
    "damageType": "Magical",
    "trait": "Presence",
    "range": "Melee",
    "damage": "d10+7 phy or mag",
    "burden": "One-Handed"
  },
  {
    "name": "Gilded Bow",
    "tier": 3,
    "type": "Primary",
    "damageType": "Magical",
    "trait": "Finesse",
    "range": "Far",
    "damage": "d6+7 mag",
    "burden": "Two-Handed"
  },
  {
    "name": "Hammer of Wrath",
    "tier": 3,
    "type": "Primary",
    "damageType": "Physical",
    "trait": "Strength",
    "range": "Melee",
    "damage": "d10+7 phy",
    "burden": "Two-Handed"
  },
  {
    "name": "Hand Sling",
    "tier": 3,
    "type": "Secondary",
    "damageType": "Physical",
    "trait": "Finesse",
    "range": "Very Far",
    "damage": "d6+4 phy",
    "burden": "One-Handed"
  },
  {
    "name": "Ilmaris Rifle",
    "tier": 3,
    "type": "Primary",
    "damageType": "Magical",
    "trait": "Finesse",
    "range": "Very Far",
    "damage": "d6+6 mag",
    "burden": "One-Handed"
  },
  {
    "name": "Labrys Axe",
    "tier": 3,
    "type": "Primary",
    "damageType": "Physical",
    "trait": "Strength",
    "range": "Melee",
    "damage": "d10+7 phy",
    "burden": "Two-Handed"
  },
  {
    "name": "Mage Orb",
    "tier": 3,
    "type": "Primary",
    "damageType": "Magical",
    "trait": "Knowledge",
    "range": "Far",
    "damage": "d6+7 mag",
    "burden": "One-Handed"
  },
  {
    "name": "Meridian Cutlass",
    "tier": 3,
    "type": "Primary",
    "damageType": "Physical",
    "trait": "Presence",
    "range": "Melee",
    "damage": "d10+5 phy",
    "burden": "One-Handed"
  },
  {
    "name": "Powered Gauntlet",
    "tier": 3,
    "type": "Secondary",
    "damageType": "Physical",
    "trait": "Knowledge",
    "range": "Close",
    "damage": "d6+4 phy",
    "burden": "One-Handed"
  },
  {
    "name": "Retractable Saber",
    "tier": 3,
    "type": "Primary",
    "damageType": "Physical",
    "trait": "Presence",
    "range": "Melee",
    "damage": "d10+7 phy",
    "burden": "One-Handed"
  },
  {
    "name": "Runes of Ruination",
    "tier": 3,
    "type": "Primary",
    "damageType": "Magical",
    "trait": "Knowledge",
    "range": "Very Close",
    "damage": "d20+4 mag",
    "burden": "One-Handed"
  },
  {
    "name": "Spiked Bow",
    "tier": 3,
    "type": "Primary",
    "damageType": "Physical",
    "trait": "Agility",
    "range": "Very Far",
    "damage": "d6+7 phy",
    "burden": "Two-Handed"
  },
  {
    "name": "Talon Blades",
    "tier": 3,
    "type": "Primary",
    "damageType": "Physical",
    "trait": "Finesse",
    "range": "Close",
    "damage": "d10+7 phy",
    "burden": "Two-Handed"
  },
  {
    "name": "Widogast Pendant",
    "tier": 3,
    "type": "Primary",
    "damageType": "Magical",
    "trait": "Knowledge",
    "range": "Close",
    "damage": "d10+5 mag",
    "burden": "One-Handed"
  },
  {
    "name": "Aantari Bow",
    "tier": 4,
    "type": "Primary",
    "damageType": "Physical",
    "trait": "Finesse",
    "range": "Far",
    "damage": "d6+11 phy",
    "burden": "Two-Handed"
  },
  {
    "name": "Bloodstaff",
    "tier": 4,
    "type": "Primary",
    "damageType": "Magical",
    "trait": "Instinct",
    "range": "Far",
    "damage": "d20+7 mag",
    "burden": "Two-Handed"
  },
  {
    "name": "Braveshield",
    "tier": 4,
    "type": "Secondary",
    "damageType": "Physical",
    "trait": "Agility",
    "range": "Melee",
    "damage": "d4+6 phy",
    "burden": "One-Handed"
  },
  {
    "name": "Curved Dagger",
    "tier": 4,
    "type": "Primary",
    "damageType": "Physical",
    "trait": "Finesse",
    "range": "Melee",
    "damage": "d8+9 phy",
    "burden": "One-Handed"
  },
  {
    "name": "Dual-Ended Sword",
    "tier": 4,
    "type": "Primary",
    "damageType": "Physical",
    "trait": "Agility",
    "range": "Melee",
    "damage": "d10+9 phy",
    "burden": "Two-Handed"
  },
  {
    "name": "Extended Polearm",
    "tier": 4,
    "type": "Primary",
    "damageType": "Physical",
    "trait": "Finesse",
    "range": "Very Close",
    "damage": "d8+10 phy",
    "burden": "Two-Handed"
  },
  {
    "name": "Floating Bladeshards",
    "tier": 4,
    "type": "Primary",
    "damageType": "Magical",
    "trait": "Instinct",
    "range": "Close",
    "damage": "d8+9 mag",
    "burden": "One-Handed"
  },
  {
    "name": "Fusion Gloves",
    "tier": 4,
    "type": "Primary",
    "damageType": "Magical",
    "trait": "Knowledge",
    "range": "Very Far",
    "damage": "d6+9 mag",
    "burden": "Two-Handed"
  },
  {
    "name": "Hand Cannon",
    "tier": 4,
    "type": "Primary",
    "damageType": "Physical",
    "trait": "Finesse",
    "range": "Very Far",
    "damage": "d6+12 phy",
    "burden": "One-Handed"
  },
  {
    "name": "Impact Gauntlet",
    "tier": 4,
    "type": "Primary",
    "damageType": "Physical",
    "trait": "Strength",
    "range": "Melee",
    "damage": "d10+11 phy",
    "burden": "One-Handed"
  },
  {
    "name": "Knuckle Claws",
    "tier": 4,
    "type": "Secondary",
    "damageType": "Physical",
    "trait": "Strength",
    "range": "Melee",
    "damage": "d6+8 phy",
    "burden": "One-Handed"
  },
  {
    "name": "Legendary Arcane Gauntlets",
    "tier": 4,
    "type": "Primary",
    "damageType": "Magical",
    "trait": "Strength",
    "range": "Melee",
    "damage": "d10+12 mag",
    "burden": "Two-Handed"
  },
  {
    "name": "Legendary Battleaxe",
    "tier": 4,
    "type": "Primary",
    "damageType": "Physical",
    "trait": "Strength",
    "range": "Melee",
    "damage": "d10+12 phy",
    "burden": "Two-Handed"
  },
  {
    "name": "Legendary Broadsword",
    "tier": 4,
    "type": "Primary",
    "damageType": "Physical",
    "trait": "Agility",
    "range": "Melee",
    "damage": "d8+9 phy",
    "burden": "One-Handed"
  },
  {
    "name": "Legendary Crossbow",
    "tier": 4,
    "type": "Primary",
    "damageType": "Physical",
    "trait": "Finesse",
    "range": "Far",
    "damage": "d6+10 phy",
    "burden": "One-Handed"
  },
  {
    "name": "Legendary Cutlass",
    "tier": 4,
    "type": "Primary",
    "damageType": "Physical",
    "trait": "Presence",
    "range": "Melee",
    "damage": "d8+10 phy",
    "burden": "One-Handed"
  },
  {
    "name": "Legendary Dagger",
    "tier": 4,
    "type": "Primary",
    "damageType": "Physical",
    "trait": "Finesse",
    "range": "Melee",
    "damage": "d8+9 phy",
    "burden": "One-Handed"
  },
  {
    "name": "Legendary Dualstaff",
    "tier": 4,
    "type": "Primary",
    "damageType": "Magical",
    "trait": "Instinct",
    "range": "Far",
    "damage": "d8+12 mag",
    "burden": "Two-Handed"
  },
  {
    "name": "Legendary Glowing Rings",
    "tier": 4,
    "type": "Primary",
    "damageType": "Magical",
    "trait": "Agility",
    "range": "Very Close",
    "damage": "d10+11 mag",
    "burden": "Two-Handed"
  },
  {
    "name": "Legendary Grappler",
    "tier": 4,
    "type": "Secondary",
    "damageType": "Physical",
    "trait": "Finesse",
    "range": "Close",
    "damage": "d6+6 phy",
    "burden": "One-Handed"
  },
  {
    "name": "Legendary Greatstaff",
    "tier": 4,
    "type": "Primary",
    "damageType": "Magical",
    "trait": "Knowledge",
    "range": "Very Far",
    "damage": "d6+9 mag",
    "burden": "Two-Handed"
  },
  {
    "name": "Legendary Greatsword",
    "tier": 4,
    "type": "Primary",
    "damageType": "Physical",
    "trait": "Strength",
    "range": "Melee",
    "damage": "d10+12 phy",
    "burden": "Two-Handed"
  },
  {
    "name": "Legendary Halberd",
    "tier": 4,
    "type": "Primary",
    "damageType": "Physical",
    "trait": "Strength",
    "range": "Very Close",
    "damage": "d10+11 phy",
    "burden": "Two-Handed"
  },
  {
    "name": "Legendary Hallowed Axe",
    "tier": 4,
    "type": "Primary",
    "damageType": "Magical",
    "trait": "Strength",
    "range": "Melee",
    "damage": "d8+10 mag",
    "burden": "One-Handed"
  },
  {
    "name": "Legendary Hand Crossbow",
    "tier": 4,
    "type": "Secondary",
    "damageType": "Physical",
    "trait": "Finesse",
    "range": "Far",
    "damage": "d6+7 phy",
    "burden": "One-Handed"
  },
  {
    "name": "Legendary Hand Runes",
    "tier": 4,
    "type": "Primary",
    "damageType": "Magical",
    "trait": "Instinct",
    "range": "Very Close",
    "damage": "d10+9 mag",
    "burden": "One-Handed"
  },
  {
    "name": "Legendary Longbow",
    "tier": 4,
    "type": "Primary",
    "damageType": "Physical",
    "trait": "Agility",
    "range": "Very Far",
    "damage": "d8+12 phy",
    "burden": "Two-Handed"
  },
  {
    "name": "Legendary Longsword",
    "tier": 4,
    "type": "Primary",
    "damageType": "Physical",
    "trait": "Agility",
    "range": "Melee",
    "damage": "d10+12 phy",
    "burden": "Two-Handed"
  },
  {
    "name": "Legendary Mace",
    "tier": 4,
    "type": "Primary",
    "damageType": "Physical",
    "trait": "Strength",
    "range": "Melee",
    "damage": "d8+10 phy",
    "burden": "One-Handed"
  },
  {
    "name": "Legendary Quarterstaff",
    "tier": 4,
    "type": "Primary",
    "damageType": "Physical",
    "trait": "Instinct",
    "range": "Melee",
    "damage": "d10+12 phy",
    "burden": "Two-Handed"
  },
  {
    "name": "Legendary Rapier",
    "tier": 4,
    "type": "Primary",
    "damageType": "Physical",
    "trait": "Presence",
    "range": "Melee",
    "damage": "d8+9 phy",
    "burden": "One-Handed"
  },
  {
    "name": "Legendary Returning Blade",
    "tier": 4,
    "type": "Primary",
    "damageType": "Magical",
    "trait": "Finesse",
    "range": "Close",
    "damage": "d8+9 mag",
    "burden": "One-Handed"
  },
  {
    "name": "Legendary Round Shield",
    "tier": 4,
    "type": "Secondary",
    "damageType": "Physical",
    "trait": "Strength",
    "range": "Melee",
    "damage": "d4+6 phy",
    "burden": "One-Handed"
  },
  {
    "name": "Legendary Scepter",
    "tier": 4,
    "type": "Primary",
    "damageType": "Magical",
    "trait": "Presence",
    "range": "Far",
    "damage": "d6+9 mag",
    "burden": "Two-Handed"
  },
  {
    "name": "Legendary Shortbow",
    "tier": 4,
    "type": "Primary",
    "damageType": "Physical",
    "trait": "Agility",
    "range": "Far",
    "damage": "d6+12 phy",
    "burden": "Two-Handed"
  },
  {
    "name": "Legendary Shortstaff",
    "tier": 4,
    "type": "Primary",
    "damageType": "Magical",
    "trait": "Instinct",
    "range": "Close",
    "damage": "d8+10 mag",
    "burden": "One-Handed"
  },
  {
    "name": "Legendary Shortsword",
    "tier": 4,
    "type": "Secondary",
    "damageType": "Physical",
    "trait": "Agility",
    "range": "Melee",
    "damage": "d8+6 phy",
    "burden": "One-Handed"
  },
  {
    "name": "Legendary Small Dagger",
    "tier": 4,
    "type": "Secondary",
    "damageType": "Physical",
    "trait": "Finesse",
    "range": "Melee",
    "damage": "d8+6 phy",
    "burden": "One-Handed"
  },
  {
    "name": "Legendary Spear",
    "tier": 4,
    "type": "Primary",
    "damageType": "Physical",
    "trait": "Finesse",
    "range": "Very Close",
    "damage": "d8+12 phy",
    "burden": "Two-Handed"
  },
  {
    "name": "Legendary Tower Shield",
    "tier": 4,
    "type": "Secondary",
    "damageType": "Physical",
    "trait": "Strength",
    "range": "Melee",
    "damage": "d6+6 phy",
    "burden": "One-Handed"
  },
  {
    "name": "Legendary Wand",
    "tier": 4,
    "type": "Primary",
    "damageType": "Magical",
    "trait": "Knowledge",
    "range": "Far",
    "damage": "d6+10 mag",
    "burden": "One-Handed"
  },
  {
    "name": "Legendary Warhammer",
    "tier": 4,
    "type": "Primary",
    "damageType": "Physical",
    "trait": "Strength",
    "range": "Melee",
    "damage": "d12+12 phy",
    "burden": "Two-Handed"
  },
  {
    "name": "Legendary Whip",
    "tier": 4,
    "type": "Secondary",
    "damageType": "Physical",
    "trait": "Presence",
    "range": "Very Close",
    "damage": "d6+6 phy",
    "burden": "One-Handed"
  },
  {
    "name": "Magus Revolver",
    "tier": 4,
    "type": "Primary",
    "damageType": "Magical",
    "trait": "Finesse",
    "range": "Very Far",
    "damage": "d6+13 mag",
    "burden": "One-Handed"
  },
  {
    "name": "Midas Scythe",
    "tier": 4,
    "type": "Primary",
    "damageType": "Magical",
    "trait": "Knowledge",
    "range": "Melee",
    "damage": "d10+9 mag",
    "burden": "Two-Handed"
  },
  {
    "name": "Primer Shard",
    "tier": 4,
    "type": "Secondary",
    "damageType": "Physical",
    "trait": "Instinct",
    "range": "Very Close",
    "damage": "d4 phy",
    "burden": "One-Handed"
  },
  {
    "name": "Ricochet Axes",
    "tier": 4,
    "type": "Primary",
    "damageType": "Physical",
    "trait": "Agility",
    "range": "Far",
    "damage": "d6+11 phy",
    "burden": "Two-Handed"
  },
  {
    "name": "Siphoning Gauntlets",
    "tier": 4,
    "type": "Primary",
    "damageType": "Magical",
    "trait": "Presence",
    "range": "Melee",
    "damage": "d10+9 mag",
    "burden": "Two-Handed"
  },
  {
    "name": "Sledge Axe",
    "tier": 4,
    "type": "Primary",
    "damageType": "Physical",
    "trait": "Strength",
    "range": "Melee",
    "damage": "d12+13 phy",
    "burden": "Two-Handed"
  },
  {
    "name": "Swinging Ropeblade",
    "tier": 4,
    "type": "Primary",
    "damageType": "Physical",
    "trait": "Presence",
    "range": "Close",
    "damage": "d8+9 phy",
    "burden": "Two-Handed"
  },
  {
    "name": "Sword of Light and Flame",
    "tier": 4,
    "type": "Primary",
    "damageType": "Magical",
    "trait": "Strength",
    "range": "Melee",
    "damage": "d10+11 mag",
    "burden": "Two-Handed"
  },
  {
    "name": "Thistlebow",
    "tier": 4,
    "type": "Primary",
    "damageType": "Magical",
    "trait": "Instinct",
    "range": "Far",
    "damage": "d6+13 mag",
    "burden": "Two-Handed"
  },
  {
    "name": "Wand of Essek",
    "tier": 4,
    "type": "Primary",
    "damageType": "Magical",
    "trait": "Knowledge",
    "range": "Far",
    "damage": "d8+13 mag",
    "burden": "One-Handed"
  }
] as const

export const SRD_ARMOR: SrdArmor[] = [
  {
    "name": "Chainmail Armor",
    "tier": 1,
    "baseThresholds": "7 / 15",
    "baseScore": 4
  },
  {
    "name": "Full Plate Armor",
    "tier": 1,
    "baseThresholds": "8 / 17",
    "baseScore": 4
  },
  {
    "name": "Gambeson Armor",
    "tier": 1,
    "baseThresholds": "5 / 11",
    "baseScore": 3
  },
  {
    "name": "Leather Armor",
    "tier": 1,
    "baseThresholds": "6 / 13",
    "baseScore": 3
  },
  {
    "name": "Elundrian Chain Armor",
    "tier": 2,
    "baseThresholds": "9 / 21",
    "baseScore": 4
  },
  {
    "name": "Harrowbone Armor",
    "tier": 2,
    "baseThresholds": "9 / 21",
    "baseScore": 4
  },
  {
    "name": "Improved Chainmail Armor",
    "tier": 2,
    "baseThresholds": "11 / 24",
    "baseScore": 5
  },
  {
    "name": "Improved Full Plate Armor",
    "tier": 2,
    "baseThresholds": "13 / 28",
    "baseScore": 5
  },
  {
    "name": "Improved Gambeson Armor",
    "tier": 2,
    "baseThresholds": "7 / 16",
    "baseScore": 4
  },
  {
    "name": "Improved Leather Armor",
    "tier": 2,
    "baseThresholds": "9 / 20",
    "baseScore": 4
  },
  {
    "name": "Irontree Breastplate Armor",
    "tier": 2,
    "baseThresholds": "9 / 20",
    "baseScore": 4
  },
  {
    "name": "Rosewild Armor",
    "tier": 2,
    "baseThresholds": "11 / 23",
    "baseScore": 5
  },
  {
    "name": "Runetan Floating Armor",
    "tier": 2,
    "baseThresholds": "9 / 20",
    "baseScore": 4
  },
  {
    "name": "Tyris Soft Armor",
    "tier": 2,
    "baseThresholds": "8 / 18",
    "baseScore": 5
  },
  {
    "name": "Advanced Chainmail Armor",
    "tier": 3,
    "baseThresholds": "13 / 31",
    "baseScore": 6
  },
  {
    "name": "Advanced Full Plate Armor",
    "tier": 3,
    "baseThresholds": "15 / 35",
    "baseScore": 6
  },
  {
    "name": "Advanced Gambeson Armor",
    "tier": 3,
    "baseThresholds": "9 / 23",
    "baseScore": 5
  },
  {
    "name": "Advanced Leather Armor",
    "tier": 3,
    "baseThresholds": "11 / 27",
    "baseScore": 5
  },
  {
    "name": "Bellamoi Fine Armor",
    "tier": 3,
    "baseThresholds": "11 / 27",
    "baseScore": 5
  },
  {
    "name": "Bladefare Armor",
    "tier": 3,
    "baseThresholds": "16 / 39",
    "baseScore": 6
  },
  {
    "name": "Dragonscale Armor",
    "tier": 3,
    "baseThresholds": "11 / 27",
    "baseScore": 5
  },
  {
    "name": "Monetts Cloak",
    "tier": 3,
    "baseThresholds": "16 / 39",
    "baseScore": 6
  },
  {
    "name": "Runes of Fortification",
    "tier": 3,
    "baseThresholds": "17 / 43",
    "baseScore": 6
  },
  {
    "name": "Spiked Plate Armor",
    "tier": 3,
    "baseThresholds": "10 / 25",
    "baseScore": 5
  },
  {
    "name": "Channeling Armor",
    "tier": 4,
    "baseThresholds": "13 / 36",
    "baseScore": 5
  },
  {
    "name": "Dunamis Silkchain",
    "tier": 4,
    "baseThresholds": "13 / 36",
    "baseScore": 7
  },
  {
    "name": "Emberwoven Armor",
    "tier": 4,
    "baseThresholds": "13 / 36",
    "baseScore": 6
  },
  {
    "name": "Full Fortified Armor",
    "tier": 4,
    "baseThresholds": "15 / 40",
    "baseScore": 4
  },
  {
    "name": "Legendary Chainmail Armor",
    "tier": 4,
    "baseThresholds": "15 / 40",
    "baseScore": 7
  },
  {
    "name": "Legendary Full Plate Armor",
    "tier": 4,
    "baseThresholds": "17 / 44",
    "baseScore": 7
  },
  {
    "name": "Legendary Gambeson Armor",
    "tier": 4,
    "baseThresholds": "11 / 32",
    "baseScore": 6
  },
  {
    "name": "Legendary Leather Armor",
    "tier": 4,
    "baseThresholds": "13 / 36",
    "baseScore": 6
  },
  {
    "name": "Savior Chainmail",
    "tier": 4,
    "baseThresholds": "18 / 48",
    "baseScore": 8
  },
  {
    "name": "Veritas Opal Armor",
    "tier": 4,
    "baseThresholds": "13 / 36",
    "baseScore": 6
  }
] as const

export const SRD_DOMAIN_CARDS: SrdDomainCard[] = [
  {
    "name": "Bare Bones",
    "level": 1,
    "domain": "Valor",
    "recallCost": 0,
    "description": "When you choose not to equip armor, you have a base Armor Score of 3 + your Strength and use the following as your base damage thresholds:\r\n\r\n- _Tier 1_: 9/19\r\n- _Tier 2_: 11/24\r\n- _Tier 3_: 13/31\r\n- _Tier 4_: 15/38"
  },
  {
    "name": "Bolt Beacon",
    "level": 1,
    "domain": "Splendor",
    "recallCost": 1,
    "description": "Make a Spellcast Roll against a target within Far range. On a success, spend a Hope to send a bolt of shimmering light toward them, dealing d8+2 magic damage using your Proficiency. The target becomes temporarily _Vulnerable_ and glows brightly until this condition is cleared."
  },
  {
    "name": "Book of Ava",
    "level": 1,
    "domain": "Codex",
    "recallCost": 2,
    "description": "_Power Push:_ Make a Spellcast Roll against a target within Melee range. On a success, they're knocked back to Far range and take d10+2 magic damage using your Proficiency.\r\n\r\n_Tava's Armor:_ Spend a Hope to give a target you can touch a +1 bonus to their Armor Score until their next rest or you cast Tava's Armor again.\r\n\r\n_Ice Spike:_ Make a Spellcast Roll (12) to summon a large ice spike within Far range. If you use it as a weapon, make the Spellcast Roll against the target's Difficulty instead. On a success, deal d6 physical damage using your Proficiency."
  },
  {
    "name": "Book of Illiat",
    "level": 1,
    "domain": "Codex",
    "recallCost": 2,
    "description": "_Slumber:_ Make a Spellcast Roll against a target within Very Close range. On a success, they're _Asleep_ until they take damage or the GM spends a Fear on their turn to clear this condition.\r\n\r\n_Arcane Barrage:_ Once per rest, spend any number of Hope and shoot magical projectiles that strike a target of your choice within Close range. Roll a number of d6s equal to the Hope spent and deal that much magic damage to the target.\r\n\r\n_Telepathy:_ Spend a Hope to open a line of mental communication with one target you can see. This connection lasts until your next rest or you cast Telepathy again."
  },
  {
    "name": "Book of Tyfar",
    "level": 1,
    "domain": "Codex",
    "recallCost": 2,
    "description": "_Wild Flame:_ Make a Spellcast Roll against up to three adversaries within Melee range. Targets you succeed against take 2d6 magic damage and must mark a Stress as flames erupt from your hand.\r\n\r\n_Magic Hand:_ You conjure a magical hand with the same size and strength as your own within Far range.\r\n\r\n_Mysterious Mist:_ Make a Spellcast Roll (13) to cast a temporary thick fog that gathers in a stationary area within Very Close range. The fog heavily obscures this area and everything in it."
  },
  {
    "name": "Deft Deceiver",
    "level": 1,
    "domain": "Grace",
    "recallCost": 0,
    "description": "Spend a Hope to gain advantage on a roll to deceive or trick someone into believing a lie you tell them."
  },
  {
    "name": "Deft Maneuvers",
    "level": 1,
    "domain": "Bone",
    "recallCost": 0,
    "description": "Once per rest, mark a Stress to sprint anywhere within Far range without making an Agility Roll to get there.\r\n\r\nIf you end this movement within Melee range of an adversary and immediately make an attack against them, gain a +1 bonus to the attack roll."
  },
  {
    "name": "Enrapture",
    "level": 1,
    "domain": "Grace",
    "recallCost": 0,
    "description": "Make a Spellcast Roll against a target within Close range. On a success, they become temporarily _Enraptured_. While _Enraptured_, a target's attention is fixed on you, narrowing their field of view and drowning out any sound but your voice. Once per rest on a success, you can mark a Stress to force the _Enraptured_ target to mark a Stress as well."
  },
  {
    "name": "Forceful Push",
    "level": 1,
    "domain": "Valor",
    "recallCost": 0,
    "description": "Make an attack with your primary weapon against a target within Melee range. On a success, you deal damage and knock them back to Close range. On a success with Hope, add a d6 to your damage roll.\r\n\r\nAdditionally, you can spend a Hope to make them temporarily _Vulnerable_."
  },
  {
    "name": "Get Back Up",
    "level": 1,
    "domain": "Blade",
    "recallCost": 1,
    "description": "When you take Severe damage, you can mark a Stress to reduce the severity by one threshold."
  },
  {
    "name": "Gifted Tracker",
    "level": 1,
    "domain": "Sage",
    "recallCost": 0,
    "description": "When you're tracking a specific creature or group of creatures based on signs of their passage, you can spend any number of Hope and ask the GM that many questions from the following list.\r\n\r\n- What direction did they go?\r\n- How long ago did they pass through?\r\n- What were they doing in this location?\r\n- How many of them were here?\r\n\r\nWhen you encounter creatures you've tracked in this way, gain a +1 bonus to your Evasion against them."
  },
  {
    "name": "I Am Your Shield",
    "level": 1,
    "domain": "Valor",
    "recallCost": 1,
    "description": "When an ally within Very Close range would take damage, you can mark a Stress to stand in the way and make yourself the target of the attack instead. When you take damage from this attack, you can mark any number of Armor Slots."
  },
  {
    "name": "I See It Coming",
    "level": 1,
    "domain": "Bone",
    "recallCost": 1,
    "description": "When you're targeted by an attack made from beyond Melee range, you can mark a Stress to roll a d4 and gain a bonus to your Evasion equal to the result against the attack."
  },
  {
    "name": "Inspirational Words",
    "level": 1,
    "domain": "Grace",
    "recallCost": 1,
    "description": "Your speech is imbued with power. After a long rest, place a number of tokens on this card equal to your Presence. When you speak with an ally, you can spend a token from this card to give them one benefit from the following options:\r\n\r\n- Your ally clears a Stress.\r\n- Your ally clears a Hit Point.\r\n- Your ally gains a Hope.\r\n\r\nWhen you take a long rest, clear all unspent tokens."
  },
  {
    "name": "Mending Touch",
    "level": 1,
    "domain": "Splendor",
    "recallCost": 1,
    "description": "You lay your hands upon a creature and channel healing magic to close their wounds. When you can take a few minutes to focus on the target you're helping, you can spend 2 Hope to clear a Hit Point or a Stress on them.\r\n\r\nOnce per long rest, when you spend this healing time learning something new about them or revealing something about yourself, you can clear 2 Hit Points or 2 Stress on them instead."
  },
  {
    "name": "Natures Tongue",
    "level": 1,
    "domain": "Sage",
    "recallCost": 0,
    "description": "You can speak the language of the natural world. When you want to speak to the plants and animals around you, make an Instinct Roll (12). On a success, they'll give you the information they know. On a roll with Fear, their knowledge might be limited or come at a cost.\r\n\r\nAdditionally, before you make a Spellcast Roll while within a natural environment, you can spend a Hope to gain a +2 bonus to the roll."
  },
  {
    "name": "Not Good Enough",
    "level": 1,
    "domain": "Blade",
    "recallCost": 1,
    "description": "When you roll your damage dice, you can reroll any 1s or 2s."
  },
  {
    "name": "Pick and Pull",
    "level": 1,
    "domain": "Midnight",
    "recallCost": 0,
    "description": "You have advantage on action rolls to pick nonmagical locks, disarm nonmagical traps, or steal items from a target (either through stealth or by force)."
  },
  {
    "name": "Rain of Blades",
    "level": 1,
    "domain": "Midnight",
    "recallCost": 1,
    "description": "Spend a Hope to make a Spellcast Roll and conjure throwing blades that strike out at all targets within Very Close range. Targets you succeed against take d8+2 magic damage using your Proficiency.\r\n\r\nIf a target you hit is _Vulnerable_, they take an extra 1d8 damage."
  },
  {
    "name": "Reassurance",
    "level": 1,
    "domain": "Splendor",
    "recallCost": 0,
    "description": "Once per rest, after an ally attempts an action roll but before the consequences take place, you can offer assistance or words of support. When you do, your ally can reroll their dice."
  },
  {
    "name": "Rune Ward",
    "level": 1,
    "domain": "Arcana",
    "recallCost": 0,
    "description": "You have a deeply personal trinket that can be infused with protective magic and held as a ward by you or an ally. Describe what it is and why it's important to you. The ward's holder can spend a Hope to reduce incoming damage by 1d8.\r\n\r\nIf the Ward Die result is 8, the ward's power ends after it reduces damage this turn. It can be recharged for free on your next rest."
  },
  {
    "name": "Uncanny Disguise",
    "level": 1,
    "domain": "Midnight",
    "recallCost": 0,
    "description": "When you have a few minutes to prepare, you can mark a Stress to don the facade of any humanoid you can picture clearly in your mind. While disguised, you have advantage on Presence Rolls to avoid scrutiny.\r\n\r\nPlace a number of tokens equal to your Spellcast trait on this card. When you take an action while disguised, spend a token from this card. After the action that spends the last token is resolved, the disguise drops."
  },
  {
    "name": "Unleash Chaos",
    "level": 1,
    "domain": "Arcana",
    "recallCost": 1,
    "description": "At the beginning of a session, place a number of tokens equal to your Spellcast trait on this card.\r\n\r\nMake a Spellcast Roll against a target within Far range and spend any number of tokens to channel raw energy from within yourself to unleash against them. On a success, roll a number of d10s equal to the tokens you spent and deal that much magic damage to the target. Mark a Stress to replenish this card with tokens (up to your Spellcast trait).\r\n\r\nAt the end of each session, clear all unspent tokens."
  },
  {
    "name": "Untouchable",
    "level": 1,
    "domain": "Bone",
    "recallCost": 1,
    "description": "Gain a bonus to your Evasion equal to half your Agility."
  },
  {
    "name": "Vicious Entangle",
    "level": 1,
    "domain": "Sage",
    "recallCost": 1,
    "description": "Make a Spellcast Roll against a target within Far range. On a success, roots and vines reach out from the ground, dealing 1d8+1 physical damage and temporarily _Restraining_ the target.\r\n\r\nAdditionally on a success, you can spend a Hope to temporarily _Restrain_ another adversary within Very Close range of your target."
  },
  {
    "name": "Wall Walk",
    "level": 1,
    "domain": "Arcana",
    "recallCost": 1,
    "description": "Spend a Hope to allow a creature you can touch to climb on walls and ceilings as easily as walking on the ground. This lasts until the end of the scene or you cast Wall Walk again"
  },
  {
    "name": "Whirlwind",
    "level": 1,
    "domain": "Blade",
    "recallCost": 0,
    "description": "When you make a successful attack against a target within Very Close range, you can spend a Hope to use the attack against all other targets within Very Close range. All additional adversaries you succeed against with this ability take half damage."
  },
  {
    "name": "A Soldiers Bond",
    "level": 2,
    "domain": "Blade",
    "recallCost": 1,
    "description": "Once per long rest, when you compliment someone or ask them about something they're good at, you can both gain 3 Hope."
  },
  {
    "name": "Body Basher",
    "level": 2,
    "domain": "Valor",
    "recallCost": 1,
    "description": "You use the full force of your body in a fight. On a successful attack using a weapon with a Melee range, gain a bonus to your damage roll equal to your Strength."
  },
  {
    "name": "Bold Presence",
    "level": 2,
    "domain": "Valor",
    "recallCost": 0,
    "description": "When you make a Presence Roll, you can spend a Hope to add your Strength to the roll.\r\n\r\nAdditionally, once per rest when you would gain a condition, you can describe how your bold presence aids you in the situation and avoid gaining the condition."
  },
  {
    "name": "Book of Sitil",
    "level": 2,
    "domain": "Codex",
    "recallCost": 2,
    "description": "_Adjust Appearance:_ You magically shift your appearance and clothing to avoid recognition.\r\n\r\n_Parallela:_ Spend 2 Hope to cast this spell on yourself or an ally within Close range. The next time the target makes an attack, they can hit an additional target within range that their attack roll would succeed against. You can only hold this spell on one creature at a time.\r\n\r\n_Illusion:_ Make a Spellcast Roll (14). On a success, create a temporary visual illusion no larger than you within Close range that lasts for as long as you look at it. It holds up to scrutiny until an observer is within Melee range."
  },
  {
    "name": "Book of Vagras",
    "level": 2,
    "domain": "Codex",
    "recallCost": 2,
    "description": "_Runic Lock:_ Make a Spellcast Roll (15) on an object you're touching that can close (such as a lock, chest, or box). Once per rest on a success, you can lock the object so it can only be opened by creatures of your choice. Someone with access to magic and an hour of time to study the spell can break it.\r\n\r\n_Arcane Door:_ When you have no adversaries within Melee range, make a Spellcast Roll (13). On a success, spend a Hope to create a portal from where you are to a point within Far range you can see. It closes once a creature has passed through it.\r\n\r\n_Reveal:_ Make a Spellcast Roll. If there is anything magically hidden within Close range, it is revealed."
  },
  {
    "name": "Cinder Grasp",
    "level": 2,
    "domain": "Arcana",
    "recallCost": 1,
    "description": "Make a Spellcast Roll against a target within Melee range. On a success, the target instantly bursts into flames, takes 1d20+3 magic damage, and is temporarily lit _On Fire_.\r\n\r\nWhen a creature acts while _On Fire_, they must take an extra 2d6 magic damage if they are still _On Fire_ at the end of their action."
  },
  {
    "name": "Conjure Swarm",
    "level": 2,
    "domain": "Sage",
    "recallCost": 1,
    "description": "_Tekaira Armored Beetles:_ Mark a Stress to conjure armored beetles that encircle you. When you next take damage, reduce the severity by one threshold. You can spend a Hope to keep the beetles conjured after taking damage.\r\n\r\n_Fire Flies:_ Make a Spellcast Roll against all adversaries within Close range. Spend a Hope to deal 2d8+3 magic damage to targets you succeeded against."
  },
  {
    "name": "Ferocity",
    "level": 2,
    "domain": "Bone",
    "recallCost": 2,
    "description": "When you cause an adversary to mark 1 or more Hit Points, you can spend 2 Hope to increase your Evasion by the number of Hit Points they marked. This bonus lasts until after the next attack made against you."
  },
  {
    "name": "Final Words",
    "level": 2,
    "domain": "Splendor",
    "recallCost": 1,
    "description": "You can infuse a corpse with a moment of life to speak with it. Make a Spellcast Roll (13). On a success with Hope, the corpse answers up to three questions. On a success with Fear, the corpse answers one question. The corpse answers truthfully, but it can't impart information it didn't know in life. On a failure, or once the corpse has finished answering your questions, the body turns to dust."
  },
  {
    "name": "Floating Eye",
    "level": 2,
    "domain": "Arcana",
    "recallCost": 0,
    "description": "Spend a Hope to create a single, small floating orb that you can move anywhere within Very Far range. While this spell is active, you can see through the orb as though you're looking out from its position. You can transition between using your own senses and seeing through the orb freely. If the orb takes damage or moves out of range, the spell ends."
  },
  {
    "name": "Healing Hands",
    "level": 2,
    "domain": "Splendor",
    "recallCost": 1,
    "description": "Make a Spellcast Roll (13) and target a creature other than yourself within Melee range. On a success, mark a Stress to clear 2 Hit Points or 2 Stress on the target. On a failure, mark a Stress to clear a Hit Point or a Stress on the target. You can't heal the same target again until your next long rest."
  },
  {
    "name": "Midnight Spirit",
    "level": 2,
    "domain": "Midnight",
    "recallCost": 1,
    "description": "Spend a Hope to summon a humanoid-sized spirit that can move or carry things for you until your next rest.\r\n\r\nYou can also send it to attack an adversary. When you do, make a Spellcast Roll against a target within Very Far range. On a success, the spirit moves into Melee range with that target. Roll a number of d6s equal to your Spellcast trait and deal that much magic damage to the target. The spirit then dissipates. You can only have one spirit at a time."
  },
  {
    "name": "Natural Familiar",
    "level": 2,
    "domain": "Sage",
    "recallCost": 1,
    "description": "Spend a Hope to summon a small nature spirit or forest critter to your side until your next rest, you cast Natural Familiar again, or the familiar is targeted by an attack. If you spend an additional Hope, you can summon a familiar that flies. You can communicate with them, make a Spellcast Roll to command them to perform simple tasks, and mark a Stress to see through their eyes.\r\n\r\nWhen you deal damage to an adversary within Melee range of your familiar, you add a d6 to your damage roll."
  },
  {
    "name": "Reckless",
    "level": 2,
    "domain": "Blade",
    "recallCost": 1,
    "description": "Mark a Stress to gain advantage on an attack."
  },
  {
    "name": "Shadowbind",
    "level": 2,
    "domain": "Midnight",
    "recallCost": 0,
    "description": "Make a Spellcast Roll against all adversaries within Very Close range. Targets you succeed against are temporarily _Restrained_ as their shadow binds them in place."
  },
  {
    "name": "Strategic Approach",
    "level": 2,
    "domain": "Bone",
    "recallCost": 1,
    "description": "After a long rest, place a number of tokens equal to your Knowledge on this card (minimum 1). The first time you move within Close range of an adversary and make an attack against them, you can spend one token to choose one of the following options:\r\n\r\n- You make the attack with advantage.\r\n- You clear a Stress on an ally within Melee range of the adversary.\r\n- You add a d8 to your damage roll.\r\n\r\nWhen you take a long rest, clear all unspent tokens."
  },
  {
    "name": "Tell No Lies",
    "level": 2,
    "domain": "Grace",
    "recallCost": 1,
    "description": "Make a Spellcast Roll against a target within Very Close range. On a success, they can't lie to you while they remain within Close range, but they are not compelled to speak. If you ask them a question and they refuse to answer, they must mark a Stress and the effect ends. The target is typically unaware this spell has been cast on them until it causes them to utter the truth."
  },
  {
    "name": "Troublemaker",
    "level": 2,
    "domain": "Grace",
    "recallCost": 2,
    "description": "When you taunt or provoke a target within Far range, make a Presence Roll against them. Once per rest on a success, roll a number of d4s equal to your Proficiency. The target must mark Stress equal to the highest result rolled."
  },
  {
    "name": "Book of Korvax",
    "level": 3,
    "domain": "Codex",
    "recallCost": 2,
    "description": "_Levitation:_ Make a Spellcast Roll to temporarily lift a target you can see up into the air and move them within Close range of their original position.\r\n\r\n_Recant:_ Spend a Hope to force a target within Melee range to make a Reaction Roll (15). On a failure, they forget the last minute of your conversation.\r\n\r\n_Rune Circle:_ Mark a Stress to create a temporary magical circle on the ground where you stand. All adversaries within Melee range, or who enter Melee range, take 2d12+4 magic damage and are knocked back to Very Close range."
  },
  {
    "name": "Book of Norai",
    "level": 3,
    "domain": "Codex",
    "recallCost": 2,
    "description": "_Mystic Tether:_ Make a Spellcast Roll against a target within Far range. On a success, they're temporarily _Restrained_ and must mark a Stress. If you target a flying creature, this spell grounds and temporarily _Restrains_ them.\r\n\r\n_Fireball:_ Make a Spellcast Roll against a target within Very Far range. On a success, hurl a sphere of fire toward them that explodes on impact. The target and all creatures within Very Close range of them must make a Reaction Roll (13). Targets who fail take d20+5 magic damage using your Proficiency. Targets who succeed take half damage."
  },
  {
    "name": "Brace",
    "level": 3,
    "domain": "Bone",
    "recallCost": 1,
    "description": "When you mark an Armor Slot to reduce incoming damage, you can mark a Stress to mark an additional Armor Slot."
  },
  {
    "name": "Chokehold",
    "level": 3,
    "domain": "Midnight",
    "recallCost": 1,
    "description": "When you position yourself behind a creature who's about your size, you can mark a Stress to pull them into a chokehold, making them temporarily _Vulnerable_.\r\n\r\nWhen a creature attacks a target who is _Vulnerable_ in this way, they deal an extra 2d6 damage."
  },
  {
    "name": "Corrosive Projectile",
    "level": 3,
    "domain": "Sage",
    "recallCost": 1,
    "description": "Make a Spellcast Roll against a target within Far range. On a success, deal d6+4 magic damage using your Proficiency. Additionally, mark 2 or more Stress to make them permanently _Corroded_. While a target is _Corroded_, they gain a -1 penalty to their Difficulty for every 2 Stress you spent. This condition can stack."
  },
  {
    "name": "Counterspell",
    "level": 3,
    "domain": "Arcana",
    "recallCost": 2,
    "description": "You can interrupt a magical effect taking place by making a reaction roll using your Spellcast trait. On a success, the effect stops and any consequences are avoided, and this card is placed in your vault."
  },
  {
    "name": "Critical Inspiration",
    "level": 3,
    "domain": "Valor",
    "recallCost": 1,
    "description": "Once per rest, when you critically succeed on an attack, all allies within Very Close range can clear a Stress or gain a Hope."
  },
  {
    "name": "Flight",
    "level": 3,
    "domain": "Arcana",
    "recallCost": 1,
    "description": "Make a Spellcast Roll (15). On a success, place a number of tokens equal to your Agility on this card (minimum 1). When you make an action roll while flying, spend a token from this card. After the action that spends the last token is resolved, you descend to the ground directly below you."
  },
  {
    "name": "Hypnotic Shimmer",
    "level": 3,
    "domain": "Grace",
    "recallCost": 1,
    "description": "Make a Spellcast Roll against all adversaries in front of you within Close range. Once per rest on a success, create an illusion of flashing colors and lights that temporarily _Stuns_ targets you succeed against and forces them to mark a Stress. While _Stunned_, they can't use reactions and can't take any other actions until they clear this condition."
  },
  {
    "name": "Invisibility",
    "level": 3,
    "domain": "Grace",
    "recallCost": 1,
    "description": "Make a Spellcast Roll (10). On a success, mark a Stress and choose yourself or an ally within Melee range to become _Invisible_. An _Invisible_ creature can't be seen except through magical means and attack rolls against them are made with disadvantage. Place a number of tokens on this card equal to your Spellcast trait. When the _Invisible_ creature takes an action, spend a token from this card. After the action that spends the last token is resolved, the effect ends.\r\n\r\nYou can only hold Invisibility on one creature at a time."
  },
  {
    "name": "Lean on Me",
    "level": 3,
    "domain": "Valor",
    "recallCost": 1,
    "description": "Once per long rest, when you console or inspire an ally who failed an action roll, you can both clear 2 Stress."
  },
  {
    "name": "Scramble",
    "level": 3,
    "domain": "Blade",
    "recallCost": 1,
    "description": "Once per rest, when a creature within Melee range would deal damage to you, you can avoid the attack and safely move out of Melee range of the enemy."
  },
  {
    "name": "Second Wind",
    "level": 3,
    "domain": "Splendor",
    "recallCost": 2,
    "description": "Once per rest, when you succeed on an attack against an adversary, you can clear 3 Stress or a Hit Point. On a success with Hope, you also clear 3 Stress or a Hit Point on an ally within Close range of you."
  },
  {
    "name": "Tactician",
    "level": 3,
    "domain": "Bone",
    "recallCost": 1,
    "description": "When you Help an Ally, they can spend a Hope to add one of your Experiences to their roll alongside your advantage die.\r\n\r\nWhen making a Tag Team Roll, you can roll a d20 as your Hope Die."
  },
  {
    "name": "Towering Stalk",
    "level": 3,
    "domain": "Sage",
    "recallCost": 1,
    "description": "Once per rest, you can conjure a thick, twisting stalk within Close range that can be easily climbed. Its height can grow up to Far range.\r\n\r\nMark a Stress to use this spell as an attack. Make a Spellcast Roll against an adversary or group of adversaries within Close range. The erupting stalk lifts targets you succeed against into the air and drops them, dealing d8 physical damage using your Proficiency."
  },
  {
    "name": "Veil of Night",
    "level": 3,
    "domain": "Midnight",
    "recallCost": 1,
    "description": "Make a Spellcast Roll (13). On a success, you can create a temporary curtain of darkness between two points within Far range. Only you can see through this darkness. You're considered _Hidden_ to adversaries on the other side of the veil, and you have advantage on attacks you make through the darkness. The veil remains until you cast another spell."
  },
  {
    "name": "Versatile Fighter",
    "level": 3,
    "domain": "Blade",
    "recallCost": 1,
    "description": "You can use a different character trait for an equipped weapon, rather than the trait the weapon calls for.\r\n\r\nWhen you deal damage, you can mark a Stress to use the maximum result of one of your damage dice instead of rolling it."
  },
  {
    "name": "Voice of Reason",
    "level": 3,
    "domain": "Splendor",
    "recallCost": 1,
    "description": "You speak with an unmatched power and authority. You have advantage on action rolls to de-escalate violent situations or convince someone to follow your lead.\r\n\r\nAdditionally, you're emboldened in moments of duress. When all of your Stress slots are marked, you gain a +1 bonus to your Proficiency for damage rolls."
  },
  {
    "name": "Blink Out",
    "level": 4,
    "domain": "Arcana",
    "recallCost": 1,
    "description": "Make a Spellcast Roll (12). On a success, spend a Hope to teleport to another point you can see within Far range. If any willing creatures are within Very Close range, spend an additional Hope for each creature to bring them with you."
  },
  {
    "name": "Book of Exota",
    "level": 4,
    "domain": "Codex",
    "recallCost": 3,
    "description": "_Repudiate:_ You can interrupt a magical effect taking place. Make a reaction roll using your Spellcast trait. Once per rest on a success, the effect stops and any consequences are avoided.\r\n\r\n_Create Construct:_ Spend a Hope to choose a group of objects around you and create an animated construct from them that obeys basic commands. Make a Spellcast Roll to command them to take action. When necessary, they share your Evasion and traits and their attacks deal 2d10+3 physical damage. You can only maintain one construct at a time, and they fall apart when they take any amount of damage."
  },
  {
    "name": "Book of Grynn",
    "level": 4,
    "domain": "Codex",
    "recallCost": 2,
    "description": "_Arcane Deflection:_ Once per long rest, spend a Hope to negate the damage of an attack targeting you or an ally within Very Close range.\r\n\r\n_Time Lock:_ Target an object within Far range. That object stops in time and space exactly where it is until your next rest. If a creature tries to move it, make a Spellcast Roll against them to maintain this spell.\r\n\r\n_Wall of Flame:_ Make a Spellcast Roll (15). On a success, create a temporary wall of magical flame between two points within Far range. All creatures in its path must choose a side to be on, and anything that subsequently passes through the wall takes 4d10+3 magic damage."
  },
  {
    "name": "Boost",
    "level": 4,
    "domain": "Bone",
    "recallCost": 1,
    "description": "Mark a Stress to boost off a willing ally within Close range, fling yourself into the air, and perform an aerial attack against a target within Far range. You have advantage on the attack, add a d10 to the damage roll, and end your move within Melee range of the target."
  },
  {
    "name": "Deadly Focus",
    "level": 4,
    "domain": "Blade",
    "recallCost": 2,
    "description": "Once per rest, you can apply all your focus toward a target of your choice. Until you attack another creature, you defeat the target, or the battle ends, gain a +1 bonus to your Proficiency."
  },
  {
    "name": "Death Grip",
    "level": 4,
    "domain": "Sage",
    "recallCost": 1,
    "description": "Make a Spellcast Roll against a target within Close range and choose one of the following options:\r\n\r\n- You pull the target into Melee range or pull yourself into Melee range of them.\r\n- You constrict the target and force them to mark 2 Stress.\r\n- All adversaries between you and the target must succeed on a Reaction Roll (13) or be hit by vines, taking 3d6+2 physical damage.\r\n\r\nOn a success, vines reach out from your hands, causing the chosen effect and temporarily _Restraining_ the target."
  },
  {
    "name": "Divination",
    "level": 4,
    "domain": "Splendor",
    "recallCost": 1,
    "description": "Once per long rest, spend 3 Hope to reach out to the forces beyond and ask one \"yes or no\" question about an event, person, place, or situation in the near future. For a moment, the present falls away and you see the answer before you."
  },
  {
    "name": "Fortified Armor",
    "level": 4,
    "domain": "Blade",
    "recallCost": 0,
    "description": "While you are wearing armor, gain a +2 bonus to your damage thresholds."
  },
  {
    "name": "Glyph of Nightfall",
    "level": 4,
    "domain": "Midnight",
    "recallCost": 1,
    "description": "Make a Spellcast Roll against a target within Very Close range. On a success, spend a Hope to conjure a dark glyph upon their body that exposes their weak points, temporarily reducing the target's Difficulty by a value equal to your Knowledge (minimum 1)."
  },
  {
    "name": "Goad Them On",
    "level": 4,
    "domain": "Valor",
    "recallCost": 1,
    "description": "Describe how you taunt a target within Close range, then make a Presence Roll against them. On a success, the target must mark a Stress, and the next time the GM spotlights them, they must target you with an attack, which they make with disadvantage."
  },
  {
    "name": "Healing Field",
    "level": 4,
    "domain": "Sage",
    "recallCost": 2,
    "description": "Once per long rest, you can conjure a field of healing plants around you. Everywhere within Close range of you bursts to life with vibrant nature, allowing you and all allies in the area to clear a Hit Point.\r\n\r\nSpend 2 Hope to allow you and all allies to clear 2 Hit Points instead."
  },
  {
    "name": "Life Ward",
    "level": 4,
    "domain": "Splendor",
    "recallCost": 1,
    "description": "Spend 3 Hope and choose an ally within Close range. They are marked with a glowing sigil of protection. When this ally would make a death move, they clear a Hit Point instead.\r\n\r\nThis effect ends when it saves the target from a death move, you cast Life Ward on another target, or you take a long rest."
  },
  {
    "name": "Preservation Blast",
    "level": 4,
    "domain": "Arcana",
    "recallCost": 2,
    "description": "Make a Spellcast Roll against all targets within Melee range. Targets you succeed against are forced back to Far range and take d8+3 magic damage using your Spellcast trait."
  },
  {
    "name": "Redirect",
    "level": 4,
    "domain": "Bone",
    "recallCost": 1,
    "description": "When an attack made against you from beyond Melee range fails, roll a number of d6s equal to your Proficiency. If any roll a 6, you can mark a Stress to redirect the attack to damage an adversary within Very Close range instead."
  },
  {
    "name": "Soothing Speech",
    "level": 4,
    "domain": "Grace",
    "recallCost": 1,
    "description": "During a short rest, when you take the time to comfort another character while using the Tend to Wounds downtime move on them, clear an additional Hit Point on that character. When you do, you also clear 2 Hit Points."
  },
  {
    "name": "Stealth Expertise",
    "level": 4,
    "domain": "Midnight",
    "recallCost": 0,
    "description": "When you roll with Fear while attempting to move unnoticed through a dangerous area, you can mark a Stress to roll with Hope instead.\r\n\r\nIf an ally within Close range is also attempting to move unnoticed and rolls with Fear, you can mark a Stress to change their result to a roll with Hope."
  },
  {
    "name": "Support Tank",
    "level": 4,
    "domain": "Valor",
    "recallCost": 2,
    "description": "When an ally within Close range fails a roll, you can spend 2 Hope to allow them to reroll either their Hope or Fear Die."
  },
  {
    "name": "Through Your Eyes",
    "level": 4,
    "domain": "Grace",
    "recallCost": 1,
    "description": "Choose a target within Very Far range. You can see through their eyes and hear through their ears. You can transition between using your own senses or the target's freely until you cast another spell or until your next rest."
  },
  {
    "name": "Armorer",
    "level": 5,
    "domain": "Valor",
    "recallCost": 1,
    "description": "While you're wearing armor, gain a +1 bonus to your Armor Score.\r\n\r\nDuring a rest, when you choose to repair your armor as a downtime move, your allies also clear an Armor Slot."
  },
  {
    "name": "Chain Lightning",
    "level": 5,
    "domain": "Arcana",
    "recallCost": 1,
    "description": "Mark 2 Stress to make a Spellcast Roll, unleashing lightning on all targets within Close range. Targets you succeed against must make a reaction roll with a Difficulty equal to the result of your Spellcast Roll. Targets who fail take 2d8+4 magic damage. Additional adversaries not already targeted by Chain Lightning and within Close range of previous targets who took damage must also make the reaction roll. Targets who fail take 2d8+4 magic damage. This chain continues until there are no more adversaries within range."
  },
  {
    "name": "Champions Edge",
    "level": 5,
    "domain": "Blade",
    "recallCost": 1,
    "description": "When you critically succeed on an attack, you can spend up to 3 Hope and choose one of the following options for each Hope spent:\r\n\r\n- You clear a Hit Point.\r\n- You clear an Armor Slot.\r\n- The target must mark an additional Hit Point.\r\n\r\nYou can't choose the same option more than once."
  },
  {
    "name": "Hush",
    "level": 5,
    "domain": "Midnight",
    "recallCost": 1,
    "description": "Make a Spellcast Roll against a target within Close range. On a success, spend a Hope to conjure suppressive magic around the target that encompasses everything within Very Close range of them and follows them as they move.\r\n\r\nThe target and anything within the area is _Silenced_ until the GM spends a Fear on their turn to clear this condition, you cast Hush again, or you take Major damage. While _Silenced_, they can't make noise and can't cast spells."
  },
  {
    "name": "Know Thy Enemy",
    "level": 5,
    "domain": "Bone",
    "recallCost": 1,
    "description": "When observing a creature, you can make an Instinct Roll against them. On a success, spend a Hope and ask the GM for one set of information about the target from the following options:\r\n\r\n- Their unmarked Hit Points and Stress.\r\n- Their Difficulty and damage thresholds.\r\n- Their tactics and standard attack damage dice.\r\n- Their features and Experiences.\r\n\r\nAdditionally on a success, you can mark a Stress to remove a Fear from the GM's Fear Pool."
  },
  {
    "name": "Manifest Wall",
    "level": 5,
    "domain": "Codex",
    "recallCost": 2,
    "description": "Make a Spellcast Roll (15). Once per rest on a success, spend a Hope to create a temporary magical wall between two points within Far range. It can be up to 50 feet high and form at any angle. Creatures or objects in its path are shunted to a side of your choice. The wall stays up until your next rest or you cast Manifest Wall again."
  },
  {
    "name": "Phantom Retreat",
    "level": 5,
    "domain": "Midnight",
    "recallCost": 2,
    "description": "Spend a Hope to activate Phantom Retreat where you're currently standing. Spend another Hope at any time before your next rest to disappear from where you are and reappear where you were standing when you activated Phantom Retreat. This spell ends after you reappear."
  },
  {
    "name": "Premonition",
    "level": 5,
    "domain": "Arcana",
    "recallCost": 2,
    "description": "You can channel arcane energy to have visions of the future. Once per long rest, immediately after the GM conveys the consequences of a roll you made, you can rescind the move and consequences like they never happened and make another move instead."
  },
  {
    "name": "Rousing Strike",
    "level": 5,
    "domain": "Valor",
    "recallCost": 1,
    "description": "Once per rest, when you critically succeed on an attack, you and all allies who can see or hear you can clear a Hit Point or 1d4 Stress."
  },
  {
    "name": "Shape Material",
    "level": 5,
    "domain": "Splendor",
    "recallCost": 1,
    "description": "Spend a Hope to shape a section of natural material you're touching (such as stone, ice, or wood) to suit your purpose. The area of the material can be no larger than you. For example, you can form a rudimentary tool or create a door.\r\n\r\nYou can only affect the material within Close range of where you're touching it."
  },
  {
    "name": "Signature Move",
    "level": 5,
    "domain": "Bone",
    "recallCost": 1,
    "description": "Name and describe your signature combat move. Once per rest, when you perform this signature move as part of an action you're taking, you can roll a d20 as your Hope Die. On a success, clear a Stress."
  },
  {
    "name": "Smite",
    "level": 5,
    "domain": "Splendor",
    "recallCost": 2,
    "description": "Once per rest, spend 3 Hope to charge your powerful smite. When you next successfully attack with a weapon, double the result of your damage roll. This attack deals magic damage regardless of the weapon's damage type."
  },
  {
    "name": "Teleport",
    "level": 5,
    "domain": "Codex",
    "recallCost": 2,
    "description": "Once per long rest, you can instantly teleport yourself and any number of willing targets within Close range to a place you've been before. Choose one of the following options, then make a Spellcast Roll (16):\r\n\r\n- If you know the place very well, gain a +3 bonus.\r\n- If you've visited the place frequently, gain a +1 bonus.\r\n- If you've visited the place infrequently, gain no modifier.\r\n- If you've only been there once, gain a -2 penalty.\r\n\r\nOn a success, you appear where you were intending to go. On a failure, you appear off course, with the range of failure determining how far off course."
  },
  {
    "name": "Thorn Skin",
    "level": 5,
    "domain": "Sage",
    "recallCost": 1,
    "description": "Once per rest, spend a Hope to sprout thorns all over your body. When you do, place a number of tokens equal to your Spellcast trait on this card. When you take damage, you can spend any number of tokens to roll that number of d6s. Add the results together and reduce the incoming damage by that amount. If you're within Melee range of the attacker, deal that amount of damage back to them.\r\n\r\nWhen you take a rest, clear all unspent tokens."
  },
  {
    "name": "Thought Delver",
    "level": 5,
    "domain": "Grace",
    "recallCost": 2,
    "description": "You can peek into the minds of others. Spend a Hope to read the vague surface thoughts of a target within Far range. Make a Spellcast Roll against the target to delve for deeper, more hidden thoughts.\r\n\r\nOn a roll with Fear, the target might, at the GM's discretion, become aware that you're reading their thoughts."
  },
  {
    "name": "Vitality",
    "level": 5,
    "domain": "Blade",
    "recallCost": 0,
    "description": "When you choose this card, permanently gain two of the following benefits:\r\n\r\n- One Stress slot\r\n- One Hit Point slot\r\n- +2 bonus to your damage thresholds\r\n\r\nThen place this card in your vault permanently."
  },
  {
    "name": "Wild Fortress",
    "level": 5,
    "domain": "Sage",
    "recallCost": 1,
    "description": "Make a Spellcast Roll (13). On a success, spend 2 Hope to grow a natural barricade in the shape of a dome that you and one ally can take cover within. While inside the dome, a creature can't be targeted by attacks and can't make attacks. Attacks made against the dome automatically succeed. The dome has the following damage thresholds and lasts until it marks 3 Hit Points. Place tokens on this card to represent marking Hit Points.\r\n\r\nThresholds: 15/30"
  },
  {
    "name": "Words of Discord",
    "level": 5,
    "domain": "Grace",
    "recallCost": 1,
    "description": "Whisper words of discord to an adversary within Melee range and make a Spellcast Roll (13). On a success, the target must mark a Stress and make an attack against another adversary instead of against you or your allies.\r\n\r\nOnce this attack is over, the target realizes what happened. The next time you cast Words of Discord on them, gain a -5 penalty to the Spellcast Roll."
  },
  {
    "name": "Banish",
    "level": 6,
    "domain": "Codex",
    "recallCost": 0,
    "description": "Make a Spellcast Roll against a target within Close range. On a success, roll a number of d20s equal to your Spellcast trait. The target must make a reaction roll with a Difficulty equal to your highest result. On a success, the target must mark a Stress but isn't banished. Once per rest on a failure, they are banished from this realm.\r\n\r\nWhen the PCs roll with Fear, the Difficulty gains a -1 penalty and the target makes another reaction roll. On a success, they return from banishment."
  },
  {
    "name": "Battle-Hardened",
    "level": 6,
    "domain": "Blade",
    "recallCost": 2,
    "description": "Once per long rest when you would make a Death Move, you can spend a Hope to clear a Hit Point instead."
  },
  {
    "name": "Conjured Steeds",
    "level": 6,
    "domain": "Sage",
    "recallCost": 0,
    "description": "Spend any number of Hope to conjure that many magical steeds (such as horses, camels, or elephants) that you and your allies can ride until your next long rest or the steeds take any damage. The steeds double your land speed while traveling and, when in danger, allow you to move within Far range without having to roll. Creatures riding a steed gain a -2 penalty to attack rolls and a +2 bonus to damage rolls."
  },
  {
    "name": "Dark Whispers",
    "level": 6,
    "domain": "Midnight",
    "recallCost": 0,
    "description": "You can speak into the mind of any person with whom you've made physical contact. Once you've opened a channel with them, they can speak back into your mind. Additionally, you can mark a Stress to make a Spellcast Roll against them. On a success, you can ask the GM one of the following questions and receive an answer:\r\n\r\n- Where are they?\r\n- What are they doing?\r\n- What are they afraid of?\r\n- What do they cherish most in the world?"
  },
  {
    "name": "Forager",
    "level": 6,
    "domain": "Sage",
    "recallCost": 1,
    "description": "As an additional downtime move you can choose, roll a d6 to see what you forage. Work with the GM to describe it and add it to your inventory as a consumable. Your party can carry up to five foraged consumables at a time.\r\n\r\n1. A unique food (Clear 2 Stress)\r\n2. A beautiful relic (Gain 2 Hope)\r\n3. An arcane rune (+2 to a Spellcast Roll)\r\n4. A healing vial (Clear 2 Hit Points)\r\n5. A luck charm (Reroll any die)\r\n6. Choose one of the options above."
  },
  {
    "name": "Inevitable",
    "level": 6,
    "domain": "Valor",
    "recallCost": 1,
    "description": "When you fail an action roll, your next action roll has advantage."
  },
  {
    "name": "Mass Disguise",
    "level": 6,
    "domain": "Midnight",
    "recallCost": 0,
    "description": "When you have a few minutes of silence to focus, you can mark a Stress to change the appearance of all willing creatures within Close range. Their new forms must share a general body structure and size, and can be somebody or something you've seen before or entirely fabricated. A disguised creature has advantage on Presence Rolls to avoid scrutiny.\r\n\r\nActivate a Countdown (8). It ticks down as a consequence the GM chooses. When it triggers, the disguise drops."
  },
  {
    "name": "Never Upstaged",
    "level": 6,
    "domain": "Grace",
    "recallCost": 2,
    "description": "When you mark 1 or more Hit Points from an attack, you can mark a Stress to place a number of tokens equal to the number of Hit Points you marked on this card. On your next successful attack, gain a +5 bonus to your damage roll for each token on this card, then clear all tokens."
  },
  {
    "name": "Rage Up",
    "level": 6,
    "domain": "Blade",
    "recallCost": 1,
    "description": "Before you make an attack, you can mark a Stress to gain a bonus to your damage roll equal to twice your Strength.\r\n\r\nYou can Rage Up twice per attack."
  },
  {
    "name": "Rapid Riposte",
    "level": 6,
    "domain": "Bone",
    "recallCost": 0,
    "description": "When an attack made against you from within Melee range fails, you can mark a Stress and seize the opportunity to deal the weapon damage of one of your active weapons to the attacker."
  },
  {
    "name": "Recovery",
    "level": 6,
    "domain": "Bone",
    "recallCost": 1,
    "description": "During a short rest, you can choose a long rest downtime move instead. You can spend a Hope to let an ally do the same."
  },
  {
    "name": "Restoration",
    "level": 6,
    "domain": "Splendor",
    "recallCost": 2,
    "description": "After a long rest, place a number of tokens equal to your Spellcast trait on this card. Touch a creature and spend any number of tokens to clear 2 Hit Points or 2 Stress for each token spent.\r\n\r\nYou can also spend a token from this card when touching a creature to clear the _Vulnerable_ condition or heal a physical or magical ailment (the GM might require additional tokens depending on the strength of the ailment).\r\n\r\nWhen you take a long rest, clear all unspent tokens."
  },
  {
    "name": "Rift Walker",
    "level": 6,
    "domain": "Arcana",
    "recallCost": 2,
    "description": "Make a Spellcast Roll (15). On a success, you place an arcane marking on the ground where you currently stand. The next time you successfully cast Rift Walker, a rift in space opens up, providing safe passage back to the exact spot where the marking was placed. This rift stays open until you choose to close it or you cast another spell.\r\n\r\nYou can drop the spell at any time to cast Rift Walker again and place the marking somewhere new."
  },
  {
    "name": "Rise Up",
    "level": 6,
    "domain": "Valor",
    "recallCost": 2,
    "description": "Gain a bonus to your Severe threshold equal to your Proficiency.\r\n\r\nWhen you mark 1 or more Hit Points from an attack, clear a Stress."
  },
  {
    "name": "Share the Burden",
    "level": 6,
    "domain": "Grace",
    "recallCost": 0,
    "description": "Once per rest, take on the Stress from a willing creature within Melee range. The target describes what intimate knowledge or emotions telepathically leak from their mind in this moment between you. Transfer any number of their marked Stress to you, then gain a Hope for each Stress transferred."
  },
  {
    "name": "Sigil of Retribution",
    "level": 6,
    "domain": "Codex",
    "recallCost": 2,
    "description": "Mark an adversary within Close range with a sigil of retribution. The GM gains a Fear. When the marked adversary deals damage to you or your allies, place a d8 on this card. You can hold a number of d8s equal to your level. When you successfully attack the marked adversary, roll the dice on this card and add the total to your damage roll, then clear the dice. This effect ends when the marked adversary is defeated or you cast Sigil of Retribution again."
  },
  {
    "name": "Telekinesis",
    "level": 6,
    "domain": "Arcana",
    "recallCost": 0,
    "description": "Make a Spellcast Roll against a target within Far range. On a success, you can use your mind to move them anywhere within Far range of their original position. You can throw the lifted target as an attack by making an additional Spellcast Roll against the second target you're trying to attack. On a success, deal d12+4 physical damage to the second target using your Proficiency. This spell then ends."
  },
  {
    "name": "Zone of Protection",
    "level": 6,
    "domain": "Splendor",
    "recallCost": 2,
    "description": "Make a Spellcast Roll (16). Once per long rest on a success, choose a point within Far range and create a visible zone of protection there for all allies within Very Close range of that point. When you do, place a d6 on this card with the 1 value facing up. When an ally in this zone takes damage, they reduce it by the die's value. You then increase the die's value by one. When the die's value would exceed 6, this effect ends."
  },
  {
    "name": "Arcana-Touched",
    "level": 7,
    "domain": "Arcana",
    "recallCost": 2,
    "description": "When 4 or more of the domain cards in your loadout are from the Arcana domain, gain the following benefits:\r\n\r\n- +1 bonus to your Spellcast Rolls\r\n- Once per rest, you can switch the results of your Hope and Fear Dice."
  },
  {
    "name": "Blade-Touched",
    "level": 7,
    "domain": "Blade",
    "recallCost": 1,
    "description": "When 4 or more of the domain cards in your loadout are from the Blade domain, gain the following benefits:\r\n\r\n- +2 bonus to your attack rolls\r\n- +4 bonus to your Severe damage threshold"
  },
  {
    "name": "Bone-Touched",
    "level": 7,
    "domain": "Bone",
    "recallCost": 2,
    "description": "When 4 or more of the domain cards in your loadout are from the Bone domain, gain the following benefits:\r\n\r\n- +1 bonus to Agility\r\n- Once per rest, you can spend 3 Hope to cause an attack that succeeded against you to fail instead."
  },
  {
    "name": "Book of Homet",
    "level": 7,
    "domain": "Codex",
    "recallCost": 0,
    "description": "_Pass Through:_ Make a Spellcast Roll (13). Once per rest on a success, you and all creatures touching you can pass through a wall or door within Close range. The effect ends once everyone is on the other side.\r\n\r\n_Plane Gate:_ Make a Spellcast Roll (14). Once per long rest on a success, open a gateway to a location in another dimension or plane of existence you've been to before. This gateway lasts until your next rest."
  },
  {
    "name": "Cloaking Blast",
    "level": 7,
    "domain": "Arcana",
    "recallCost": 2,
    "description": "When you make a successful Spellcast Roll to cast a different spell, you can spend a Hope to become _Cloaked_. While _Cloaked_, you remain unseen if you are stationary when an adversary moves to where they would normally see you. When you move into or within an adversary's line of sight or make an attack, you are no longer _Cloaked_."
  },
  {
    "name": "Codex-Touched",
    "level": 7,
    "domain": "Codex",
    "recallCost": 2,
    "description": "When 4 or more of the domain cards in your loadout are from the Codex domain, gain the following benefits:\r\n\r\n- You can mark a Stress to add your Proficiency to a Spellcast Roll.\r\n- Once per rest, replace this card with any card from your vault without paying its Recall Cost."
  },
  {
    "name": "Cruel Precision",
    "level": 7,
    "domain": "Bone",
    "recallCost": 1,
    "description": "When you make a successful attack with a weapon, gain a bonus to your damage roll equal to either your Finesse or Agility."
  },
  {
    "name": "Endless Charisma",
    "level": 7,
    "domain": "Grace",
    "recallCost": 1,
    "description": "After you make an action roll to persuade, lie, or garner favor, you can spend a Hope to reroll the Hope or Fear Die."
  },
  {
    "name": "Glancing Blow",
    "level": 7,
    "domain": "Blade",
    "recallCost": 1,
    "description": "When you fail an attack, you can mark a Stress to deal weapon damage using half your Proficiency."
  },
  {
    "name": "Grace-Touched",
    "level": 7,
    "domain": "Grace",
    "recallCost": 2,
    "description": "When 4 or more of the domain cards in your loadout are from the Grace domain, gain the following benefits:\r\n\r\n- You can mark an Armor Slot instead of marking a Stress.\r\n- When you would force a target to mark a number of Hit Points, you can choose instead to force them to mark that number of Stress."
  },
  {
    "name": "Healing Strike",
    "level": 7,
    "domain": "Splendor",
    "recallCost": 1,
    "description": "When you deal damage to an adversary, you can spend 2 Hope to clear a Hit Point on an ally within Close range."
  },
  {
    "name": "Midnight-Touched",
    "level": 7,
    "domain": "Midnight",
    "recallCost": 2,
    "description": "When 4 or more of the domain cards in your loadout are from the Midnight domain, gain the following benefits:\r\n\r\n- Once per rest, when you have 0 Hope and the GM would gain a Fear, you can gain a Hope instead.\r\n- When you make a successful attack, you can mark a Stress to add the result of your Fear Die to your damage roll."
  },
  {
    "name": "Sage-Touched",
    "level": 7,
    "domain": "Sage",
    "recallCost": 2,
    "description": "When 4 or more of the domain cards in your loadout are from the Sage domain, gain the following benefits:\r\n\r\n- While you're in a natural environment, you gain a +2 bonus to your Spellcast Rolls.\r\n- Once per rest, you can double your Agility or Instinct when making a roll that uses that trait. You must choose to do this before you roll."
  },
  {
    "name": "Shrug It Off",
    "level": 7,
    "domain": "Valor",
    "recallCost": 1,
    "description": "When you would take damage, you can mark a Stress to reduce the severity of the damage by one threshold. When you do, roll a d6. On a result of 3 or lower, place this card in your vault."
  },
  {
    "name": "Splendor-Touched",
    "level": 7,
    "domain": "Splendor",
    "recallCost": 2,
    "description": "When 4 or more of the domain cards in your loadout are from the Splendor domain, gain the following benefits:\r\n\r\n- +3 bonus to your Severe damage threshold\r\n- Once per long rest, when incoming damage would require you to mark a number of Hit Points, you can choose to mark that much Stress or spend that much Hope instead."
  },
  {
    "name": "Valor-Touched",
    "level": 7,
    "domain": "Valor",
    "recallCost": 1,
    "description": "When 4 or more of the domain cards in your loadout are from the Valor domain, gain the following benefits:\r\n\r\n- +1 bonus to your Armor Score\r\n- When you mark 1 or more Hit Points without marking an Armor Slot, clear an Armor Slot."
  },
  {
    "name": "Vanishing Dodge",
    "level": 7,
    "domain": "Midnight",
    "recallCost": 1,
    "description": "When an attack made against you that would deal physical damage fails, you can spend a Hope to envelop yourself in shadow, becoming _Hidden_ and teleporting to a point within Close range of the attacker. You remain _Hidden_ until the next time you make an action roll."
  },
  {
    "name": "Wild Surge",
    "level": 7,
    "domain": "Sage",
    "recallCost": 2,
    "description": "Once per long rest, mark a Stress to channel the natural world around you and enhance yourself. Describe how your appearance changes, then place a d6 on this card with the 1 value facing up.\r\n\r\nWhile the Wild Surge Die is active, you add its value to every action roll you make. After you add its value to a roll, increase the Wild Surge Die's value by one. When the die's value would exceed 6 or you take a rest, this form drops and you must mark an additional Stress."
  },
  {
    "name": "Arcane Reflection",
    "level": 8,
    "domain": "Arcana",
    "recallCost": 1,
    "description": "When you would take magic damage, you can spend any number of Hope to roll that many d6s. If any roll a 6, the attack is reflected back to the caster, dealing the damage to them instead."
  },
  {
    "name": "Astral Projection",
    "level": 8,
    "domain": "Grace",
    "recallCost": 0,
    "description": "Once per long rest, mark a Stress to create a projected copy of yourself that can appear anywhere you've been before.\r\n\r\nYou can see and hear through the projection as though it were you and affect the world as though you were there. A creature investigating the projection can tell it's of magical origin. This effect lasts until your next rest or your projection takes any damage."
  },
  {
    "name": "Battle Cry",
    "level": 8,
    "domain": "Blade",
    "recallCost": 2,
    "description": "Once per long rest, while you're charging into danger, you can muster a rousing call that inspires your allies. All allies who can hear you each clear a Stress and gain a Hope. Additionally, your allies gain advantage on attack rolls until you or an ally rolls a failure with Fear."
  },
  {
    "name": "Book of Vyola",
    "level": 8,
    "domain": "Codex",
    "recallCost": 2,
    "description": "_Memory Delve:_ Make a Spellcast Roll against a target within Far range. On a success, peer into the target's mind and ask the GM a question. The GM describes any memories the target has pertaining to the answer.\r\n\r\n_Shared Clarity:_ Once per long rest, spend a Hope to choose two willing creatures. When one of them would mark Stress, they can choose between the two of them who marks it. This spell lasts until their next rest."
  },
  {
    "name": "Breaking Blow",
    "level": 8,
    "domain": "Bone",
    "recallCost": 3,
    "description": "When you make a successful attack, you can mark a Stress to make the next successful attack against that same target deal an extra 2d12 damage."
  },
  {
    "name": "Confusing Aura",
    "level": 8,
    "domain": "Arcana",
    "recallCost": 2,
    "description": "Make a Spellcast Roll (14). Once per long rest on a success, you create a layer of illusion over your body that makes it hard to tell exactly where you are. Mark any number of Stress to make that many additional layers. When an adversary makes an attack against you, roll a number of d6s equal to the number of layers currently active. If any roll a 5 or higher, one layer of the aura is destroyed and the attack fails. If all the results are 4 or lower, you take the damage and this spell ends"
  },
  {
    "name": "Forest Sprites",
    "level": 8,
    "domain": "Sage",
    "recallCost": 2,
    "description": "Make a Spellcast Roll (13). On a success, spend any number of Hope to create an equal number of small forest sprites who appear at points you choose within Far range, providing the following benefits:\r\n\r\n- Your allies gain a +3 bonus to attack rolls against adversaries within Melee range of a sprite.\r\n- An ally who marks an Armor Slot while within Melee range of a sprite can mark an additional Armor Slot.\r\n\r\nA sprite vanishes after granting a benefit or taking any damage."
  },
  {
    "name": "Frenzy",
    "level": 8,
    "domain": "Blade",
    "recallCost": 3,
    "description": "Once per long rest, you can go into a _Frenzy_ until there are no more adversaries within sight.\r\n\r\nWhile _Frenzied_, you can't use Armor Slots, and you gain a +10 bonus to your damage rolls and a +8 bonus to your Severe damage threshold."
  },
  {
    "name": "Full Surge",
    "level": 8,
    "domain": "Valor",
    "recallCost": 1,
    "description": "Once per long rest, mark 3 Stress to push your body to its limits. Gain a +2 bonus to all of your character traits until your next rest."
  },
  {
    "name": "Ground Pound",
    "level": 8,
    "domain": "Valor",
    "recallCost": 2,
    "description": "Spend 2 Hope to strike the ground where you stand and make a Strength Roll against all targets within Very Close range. Targets you succeed against are thrown back to Far range and must make a Reaction Roll (17). Targets who fail take 4d10+8 damage. Targets who succeed take half damage."
  },
  {
    "name": "Mass Enrapture",
    "level": 8,
    "domain": "Grace",
    "recallCost": 3,
    "description": "Make a Spellcast Roll against all targets within Far range. Targets you succeed against become temporarily _Enraptured_. While _Enraptured_, a target's attention is fixed on you, narrowing their field of view and drowning out any sound but your voice. Mark a Stress to force all _Enraptured_ targets to mark a Stress, ending this spell."
  },
  {
    "name": "Rejuvenation Barrier",
    "level": 8,
    "domain": "Sage",
    "recallCost": 1,
    "description": "Make a Spellcast Roll (15). Once per rest on a success, create a temporary barrier of protective energy around you at Very Close range. You and all allies within the barrier when this spell is cast clear 1d4 Hit Points. While the barrier is up, you and all allies within have resistance to physical damage from outside the barrier.\r\n\r\nWhen you move, the barrier follows you."
  },
  {
    "name": "Safe Haven",
    "level": 8,
    "domain": "Codex",
    "recallCost": 3,
    "description": "When you have a few minutes of calm to focus, you can spend 2 Hope to summon your Safe Haven, a large interdimensional home where you and your allies can take shelter. When you do, a magical door appears somewhere within Close range. Only creatures of your choice can enter. Once inside, you can make the entrance invisible. You and anyone else inside can always exit. Once you leave, the doorway must be summoned again.\r\n\r\nWhen you take a rest within your own Safe Haven, you can choose an additional downtime move."
  },
  {
    "name": "Shadowhunter",
    "level": 8,
    "domain": "Midnight",
    "recallCost": 2,
    "description": "Your prowess is enhanced under the cover of shadow. While you're shrouded in low light or darkness, you gain a +1 bonus to your Evasion and make attack rolls with advantage."
  },
  {
    "name": "Shield Aura",
    "level": 8,
    "domain": "Splendor",
    "recallCost": 2,
    "description": "Mark a Stress to cast a protective aura on a target within Very Close range. When the target marks an Armor Slot, they reduce the severity of the attack by an additional threshold. If this spell causes a creature who would be damaged to instead mark no Hit Points, the effect ends.\r\n\r\nYou can only hold Shield Aura on one creature at a time."
  },
  {
    "name": "Spellcharge",
    "level": 8,
    "domain": "Midnight",
    "recallCost": 1,
    "description": "When you take magic damage, place tokens equal to the number of Hit Points you marked on this card. You can store a number of tokens equal to your Spellcast trait.\r\n\r\nWhen you make a successful attack against a target, you can spend any number of tokens to add a d6 for each token spent to your damage roll."
  },
  {
    "name": "Stunning Sunlight",
    "level": 8,
    "domain": "Splendor",
    "recallCost": 2,
    "description": "Make a Spellcast Roll to unleash powerful rays of burning sunlight against all adversaries in front of you within Far range. On a success, spend any number of Hope and force that many targets you succeeded against to make a Reaction Roll (14).\r\n\r\nTargets who succeed take 3d20+3 magic damage. Targets who fail take 4d20+5 magic damage and are temporarily _Stunned_. While _Stunned_, they can't use reactions and can't take any other actions until they clear this condition."
  },
  {
    "name": "Wrangle",
    "level": 8,
    "domain": "Bone",
    "recallCost": 1,
    "description": "Make an Agility Roll against all targets within Close range. Spend a Hope to move targets you succeed against, and any willing allies within Close range, to another point within Close range."
  },
  {
    "name": "Book of Ronin",
    "level": 9,
    "domain": "Codex",
    "recallCost": 4,
    "description": "_Transform:_ Make a Spellcast Roll (15). On a success, transform into an inanimate object no larger than twice your normal size. You can remain in this shape until you take damage.\r\n\r\n_Eternal Enervation:_ Once per long rest, make a Spellcast Roll against a target within Close range. On a success, they become permanently _Vulnerable_. They can't clear this condition by any means."
  },
  {
    "name": "Copycat",
    "level": 9,
    "domain": "Grace",
    "recallCost": 3,
    "description": "Once per long rest, this card can mimic the features of another domain card of level 8 or lower in another player's loadout. Spend Hope equal to half the card's level to gain access to the feature. It lasts until your next rest or they place the card in their vault."
  },
  {
    "name": "Disintegration Wave",
    "level": 9,
    "domain": "Codex",
    "recallCost": 4,
    "description": "Make a Spellcast Roll (18). Once per long rest on a success, the GM tells you which adversaries within Far range have a Difficulty of 18 or lower. Mark a Stress for each one you wish to hit with this spell. They are killed and can't come back to life by any means."
  },
  {
    "name": "Earthquake",
    "level": 9,
    "domain": "Arcana",
    "recallCost": 2,
    "description": "Make a Spellcast Roll (16). Once per rest on a success, all targets within Very Far range who aren't flying must make a Reaction Roll (18). Targets who fail take 3d10+8 physical damage and are temporarily _Vulnerable_. Targets who succeed take half damage.\r\n\r\nAdditionally, when you succeed on the Spellcast Roll, all terrain within Very Far range becomes dicult to move through and structures within this range might sustain damage or crumble."
  },
  {
    "name": "Fane of the Wilds",
    "level": 9,
    "domain": "Sage",
    "recallCost": 2,
    "description": "After a long rest, place a number of tokens equal to the number of Sage domain cards in your loadout and vault on this card.\r\n\r\nWhen you would make a Spellcast Roll, you can spend any number of tokens after the roll to gain a +1 bonus for each token spent.\r\n\r\nWhen you critically succeed on a Spellcast Roll for a Sage domain spell, gain a token.\r\n\r\nWhen you take a long rest, clear all unspent tokens."
  },
  {
    "name": "Gore and Glory",
    "level": 9,
    "domain": "Blade",
    "recallCost": 2,
    "description": "When you critically succeed on a weapon attack, gain an additional Hope or clear an additional Stress.\r\n\r\nAdditionally, when you deal enough damage to defeat an enemy, gain a Hope or clear a Stress."
  },
  {
    "name": "Hold the Line",
    "level": 9,
    "domain": "Valor",
    "recallCost": 1,
    "description": "Describe the defensive stance you take and spend a Hope. If an adversary moves within Very Close range, they're pulled into Melee range and _Restrained_.\r\n\r\nThis condition lasts until you move or fail a roll with Fear, or the GM spends 2 Fear on their turn to clear it."
  },
  {
    "name": "Lead by Example",
    "level": 9,
    "domain": "Valor",
    "recallCost": 3,
    "description": "When you deal damage to an adversary, you can mark a Stress and describe how you encourage your allies. The next PC to make an attack against that adversary can clear a Stress or gain a Hope."
  },
  {
    "name": "Master of the Craft",
    "level": 9,
    "domain": "Grace",
    "recallCost": 0,
    "description": "Gain a permanent +2 bonus to two of your Experiences or a permanent +3 bonus to one of your Experiences. Then place this card in your vault permanently."
  },
  {
    "name": "Night Terror",
    "level": 9,
    "domain": "Midnight",
    "recallCost": 2,
    "description": "Once per long rest, choose any targets within Very Close range to perceive you as a nightmarish horror. The targets must succeed on a Reaction Roll (16) or become temporarily _Horrified_. While _Horrified_, they're _Vulnerable_. Steal a number of Fear from the GM equal to the number of targets that are _Horrified_ (up to the number of Fear in the GM's pool). Roll a number of d6s equal to the number of stolen Fear and deal the total damage to each _Horrified_ target. Discard the stolen Fear."
  },
  {
    "name": "On the Brink",
    "level": 9,
    "domain": "Bone",
    "recallCost": 1,
    "description": "When you have 2 or fewer Hit Points unmarked, you don't take Minor damage."
  },
  {
    "name": "Overwhelming Aura",
    "level": 9,
    "domain": "Splendor",
    "recallCost": 2,
    "description": "Make a Spellcast Roll (15) to magically empower your aura. On a success, spend 2 Hope to make your Presence equal to your Spellcast trait until your next long rest.\r\n\r\nWhile this spell is active, an adversary must mark a Stress when they target you with an attack."
  },
  {
    "name": "Plant Dominion",
    "level": 9,
    "domain": "Sage",
    "recallCost": 1,
    "description": "Make a Spellcast Roll (18). Once per long rest on a success, you reshape the natural world, changing the surrounding plant life anywhere within Far range of you. For example, you can grow trees instantly, clear a path through dense vines, or create a wall of roots."
  },
  {
    "name": "Reapers Strike",
    "level": 9,
    "domain": "Blade",
    "recallCost": 3,
    "description": "Once per long rest, spend a Hope to make an attack roll. The GM tells you which targets within range it would succeed against. Choose one of these targets and force them to mark 5 Hit Points."
  },
  {
    "name": "Salvation Beam",
    "level": 9,
    "domain": "Splendor",
    "recallCost": 2,
    "description": "Make a Spellcast Roll (16). On a success, mark any number of Stress to target a line of allies within Far range. You can clear Hit Points on the targets equal to the number of Stress marked, divided among them however you'd like."
  },
  {
    "name": "Sensory Projection",
    "level": 9,
    "domain": "Arcana",
    "recallCost": 0,
    "description": "Once per rest, make a Spellcast Roll (15). On a success, drop into a vision that lets you clearly see and hear any place you have been before as though you are standing there in this moment. You can move freely in this vision and are not constrained by the physics or impediments of a physical body. This spell cannot be detected by mundane or magical means. You drop out of this vision upon taking damage or casting another spell."
  },
  {
    "name": "Splintering Strike",
    "level": 9,
    "domain": "Bone",
    "recallCost": 3,
    "description": "Spend a Hope and make an attack against all adversaries within your weapon's range. Once per long rest, on a success against any targets, roll your weapon's damage and distribute that damage however you wish between the targets you succeeded against. Before you deal damage to each target, roll an additional damage die and add its result to the damage you deal to them."
  },
  {
    "name": "Twilight Toll",
    "level": 9,
    "domain": "Midnight",
    "recallCost": 1,
    "description": "Choose a target within Far range. When you succeed on an action roll against them that doesn't result in making a damage roll, place a token on this card. When you deal damage to this target, spend any number of tokens to add a d12 for each token spent to your damage roll. You can only hold Twilight Toll on one creature at a time.\r\n\r\nWhen you choose a new target or take a rest, clear all unspent tokens."
  },
  {
    "name": "Adjust Reality",
    "level": 10,
    "domain": "Arcana",
    "recallCost": 1,
    "description": "After you or a willing ally make any roll, you can spend 5 Hope to change the numerical result of that roll to a result of your choice instead. The result must be plausible within the range of the dice."
  },
  {
    "name": "Battle Monster",
    "level": 10,
    "domain": "Blade",
    "recallCost": 0,
    "description": "When you make a successful attack against an adversary, you can mark 4 Stress to force the target to mark a number of Hit Points equal to the number of Hit Points you currently have marked instead of rolling for damage."
  },
  {
    "name": "Book of Yarrow",
    "level": 10,
    "domain": "Codex",
    "recallCost": 2,
    "description": "_Timejammer:_ Make a Spellcast Roll (18). On a success, time temporarily slows to a halt for everyone within Far range except for you. It resumes the next time you make an action roll that targets another creature.\r\n\r\n_Magic Immunity:_ Spend 5 Hope to become immune to magic damage until your next rest."
  },
  {
    "name": "Deathrun",
    "level": 10,
    "domain": "Bone",
    "recallCost": 1,
    "description": "Spend 3 Hope to run a straight path through the battlefield to a point within Far range, making an attack against all adversaries within your weapon's range along that path. Choose the order in which you deal damage to the targets you succeeded against. For the first, roll your weapon damage with a +1 bonus to your Proficiency. Then remove a die from your damage roll and deal the remaining damage to the next target. Continue to remove a die for each subsequent target until you have no more damage dice or adversaries.\r\n\r\nYou can't target the same adversary more than once per attack."
  },
  {
    "name": "Eclipse",
    "level": 10,
    "domain": "Midnight",
    "recallCost": 2,
    "description": "Make a Spellcast Roll (16). Once per long rest on a success, plunge the entire area within Far range into complete darkness only you and your allies can see through. Attack rolls have disadvantage when targeting you or an ally within this shadow.\r\n\r\nAdditionally, when you or an ally succeeds with Hope against an adversary within this shadow, the target must mark a Stress.\r\n\r\nThis spell lasts until the GM spends a Fear on their turn to clear this effect or you take Severe damage."
  },
  {
    "name": "Encore",
    "level": 10,
    "domain": "Grace",
    "recallCost": 1,
    "description": "When an ally within Close range deals damage to an adversary, you can make a Spellcast Roll against that same target. On a success, you deal the same damage to the target that your ally dealt. If your Spellcast Roll succeeds with Fear, place this card in your vault."
  },
  {
    "name": "Falling Sky",
    "level": 10,
    "domain": "Arcana",
    "recallCost": 1,
    "description": "Make a Spellcast Roll against all adversaries within Far range. Mark any number of Stress to make shards of arcana rain down from above. Targets you succeed against take 1d20+2 magic damage for each Stress marked."
  },
  {
    "name": "Force of Nature",
    "level": 10,
    "domain": "Sage",
    "recallCost": 2,
    "description": "Mark a Stress to transform into a hulking nature spirit, gaining the following benefits:\r\n\r\n- When you succeed on an attack or Spellcast Roll, gain a +10 bonus to the damage roll.\r\n- When you deal enough damage to defeat a creature within Close range, you absorb them and clear an Armor Slot.\r\n- You can't be _Restrained_.\r\n\r\nBefore you make an action roll, you must spend a Hope. If you can't, you revert to your normal form."
  },
  {
    "name": "Invigoration",
    "level": 10,
    "domain": "Splendor",
    "recallCost": 3,
    "description": "When you or an ally within Close range has used a feature that has an exhaustion limit (such as once per rest or once per session), you can spend any number of Hope and roll that many d6s. If any roll a 6, the feature can be used again."
  },
  {
    "name": "Notorious",
    "level": 10,
    "domain": "Grace",
    "recallCost": 0,
    "description": "People know who you are and what you've done, and they treat you differently because of it. When you leverage your notoriety to get what you want, you can mark a Stress before you roll to gain a +10 bonus to the result. Your food and drinks are always free wherever you go, and everything else you buy is reduced in price by one bag of gold (to a minimum of one handful).\r\n\r\nThis card doesn't count against your loadout's domain card maximum of 5 and can't be placed in your vault."
  },
  {
    "name": "Onslaught",
    "level": 10,
    "domain": "Blade",
    "recallCost": 3,
    "description": "When you successfully make an attack with your weapon, you never deal damage beneath a target's Major damage threshold (the target always marks a minimum of 2 Hit Points).\r\n\r\nAdditionally, when a creature within your weapon's range deals damage to an ally with an attack that doesn't include you, you can mark a Stress to force them to make a Reaction Roll (15).\r\n\r\nOn a failure, the target must mark a Hit Point."
  },
  {
    "name": "Resurrection",
    "level": 10,
    "domain": "Splendor",
    "recallCost": 2,
    "description": "Make a Spellcast Roll (20). On a success, restore one creature who has been dead no longer than 100 years to full strength. Then roll a d6. On a result of 5 or lower, place this card in your vault permanently.\r\n\r\nOn a failure, you can't cast Resurrection again for a week."
  },
  {
    "name": "Specter of the Dark",
    "level": 10,
    "domain": "Midnight",
    "recallCost": 1,
    "description": "Mark a Stress to become _Spectral_ until you make an action roll targeting another creature. While _Spectral_, you're immune to physical damage and can float and pass through solid objects. Other creatures can still see you while you're in this form."
  },
  {
    "name": "Swift Step",
    "level": 10,
    "domain": "Bone",
    "recallCost": 2,
    "description": "When an attack made against you fails, clear a Stress. If you can't clear a Stress, gain a Hope."
  },
  {
    "name": "Tempest",
    "level": 10,
    "domain": "Sage",
    "recallCost": 2,
    "description": "Choose one of the following tempests and make a Spellcast Roll against all targets within Far range. Targets you succeed against experience its effects until the GM spends a Fear on their turn to end this spell.\r\n\r\n- _Blizzard_: Deal 2d20+8 magic damage and targets are temporararily _Vulnerable._\r\n- _Hurricane_: Deal 3d10+10 magic damage and choose a direction the wind is blowing. Targets can't move against the wind.\r\n- _Sandstorm_: Deal 5d6+9 magic damage. Attacks made from beyond Melee range have disadvantage."
  },
  {
    "name": "Transcendent Union",
    "level": 10,
    "domain": "Codex",
    "recallCost": 1,
    "description": "Once per long rest, spend 5 Hope to cast this spell on two or more willing creatures. Until your next rest, when a creature connected by this union would mark Stress or Hit Points, the connected creatures can choose who marks it."
  },
  {
    "name": "Unbreakable",
    "level": 10,
    "domain": "Valor",
    "recallCost": 4,
    "description": "When you mark your last Hit Point, instead of making a death move, you can roll a d6 and clear a number of Hit Points equal to the result. Then place this card in your vault."
  },
  {
    "name": "Unyielding Armor",
    "level": 10,
    "domain": "Valor",
    "recallCost": 1,
    "description": "When you would mark an Armor Slot, roll a number of d6s equal to your Proficiency. If any roll a 6, reduce the severity by one threshold without marking an Armor Slot."
  }
] as const

export const SRD_DOMAINS: SrdDomain[] = [
  {
    "name": "Arcana",
    "description": "Arcana is the domain of innate and instinctual magic.",
    "classes": [
      "Druid",
      "Sorcerer"
    ],
    "cardsByLevel": {
      "1": [
        "Rune Ward",
        "Unleash Chaos",
        "Wall Walk"
      ],
      "2": [
        "Cinder Grasp",
        "Floating Eye"
      ],
      "3": [
        "Counterspell",
        "Flight"
      ],
      "4": [
        "Blink Out",
        "Preservation Blast"
      ],
      "5": [
        "Chain Lightning",
        "Premonition"
      ],
      "6": [
        "Rift Walker",
        "Telekinesis"
      ],
      "7": [
        "Arcana-Touched",
        "Cloaking Blast"
      ],
      "8": [
        "Arcane Reflection",
        "Confusing Aura"
      ],
      "9": [
        "Earthquake",
        "Sensory Projection"
      ],
      "10": [
        "Adjust Reality",
        "Falling Sky"
      ]
    }
  },
  {
    "name": "Blade",
    "description": "Blade is the domain of weapon mastery.",
    "classes": [
      "Guardian",
      "Warrior"
    ],
    "cardsByLevel": {
      "1": [
        "Get Back Up",
        "Not Good Enough",
        "Whirlwind"
      ],
      "2": [
        "A Soldier's Bond",
        "Reckless"
      ],
      "3": [
        "Scramble",
        "Versatile Fighter"
      ],
      "4": [
        "Deadly Focus",
        "Fortified Armor"
      ],
      "5": [
        "Champion's Edge",
        "Vitality"
      ],
      "6": [
        "Battle-Hardened",
        "Rage Up"
      ],
      "7": [
        "Blade-Touched",
        "Glancing Blow"
      ],
      "8": [
        "Battle Cry",
        "Frenzy"
      ],
      "9": [
        "Gore and Glory",
        "Reaper's Strike"
      ],
      "10": [
        "Battle Monster",
        "Onslaught"
      ]
    }
  },
  {
    "name": "Bone",
    "description": "Bone is the domain of tactics and the body.",
    "classes": [
      "Ranger",
      "Warrior"
    ],
    "cardsByLevel": {
      "1": [
        "Deft Maneuvers",
        "I See It Coming",
        "Untouchable"
      ],
      "2": [
        "Ferocity",
        "Strategic Approach"
      ],
      "3": [
        "Brace",
        "Tactician"
      ],
      "4": [
        "Boost",
        "Redirect"
      ],
      "5": [
        "Know Thy Enemy",
        "Signature Move"
      ],
      "6": [
        "Rapid Riposte",
        "Recovery"
      ],
      "7": [
        "Bone-Touched",
        "Cruel Precision"
      ],
      "8": [
        "Breaking Blow",
        "Wrangle"
      ],
      "9": [
        "On the Brink",
        "Splintering Strike"
      ],
      "10": [
        "Deathrun",
        "Swift Step"
      ]
    }
  },
  {
    "name": "Codex",
    "description": "Codex is the domain of intensive magical study.",
    "classes": [
      "Bard",
      "Wizard"
    ],
    "cardsByLevel": {
      "1": [
        "Book of Ava",
        "Book of Illiat",
        "Book of Tyfar"
      ],
      "2": [
        "Book of Sitil",
        "Book of Vagras"
      ],
      "3": [
        "Book of Korvax",
        "Book of Norai"
      ],
      "4": [
        "Book of Exota",
        "Book of Grynn"
      ],
      "5": [
        "Manifest Wall",
        "Teleport"
      ],
      "6": [
        "Banish",
        "Sigil of Retribution"
      ],
      "7": [
        "Book of Homet",
        "Codex-Touched"
      ],
      "8": [
        "Book of Vyola",
        "Safe Haven"
      ],
      "9": [
        "Book of Ronin",
        "Disintegration Wave"
      ],
      "10": [
        "Book of Yarrow",
        "Transcendent Union"
      ]
    }
  },
  {
    "name": "Grace",
    "description": "Grace is the domain of charisma.",
    "classes": [
      "Bard",
      "Rogue"
    ],
    "cardsByLevel": {
      "1": [
        "Deft Deceiver",
        "Enrapture",
        "Inspirational Words"
      ],
      "2": [
        "Tell No Lies",
        "Troublemaker"
      ],
      "3": [
        "Hypnotic Shimmer",
        "Invisibility"
      ],
      "4": [
        "Soothing Speech",
        "Through Your Eyes"
      ],
      "5": [
        "Thought Delver",
        "Words of Discord"
      ],
      "6": [
        "Never Upstaged",
        "Share the Burden"
      ],
      "7": [
        "Endless Charisma",
        "Grace-Touched"
      ],
      "8": [
        "Astral Projection",
        "Mass Enrapture"
      ],
      "9": [
        "Copycat",
        "Master of the Craft"
      ],
      "10": [
        "Encore",
        "Notorious"
      ]
    }
  },
  {
    "name": "Midnight",
    "description": "Midnight is the domain of shadows and secrecy.",
    "classes": [
      "Rogue",
      "Sorcerer"
    ],
    "cardsByLevel": {
      "1": [
        "Pick and Pull",
        "Rain of Blades",
        "Uncanny Disguise"
      ],
      "2": [
        "Midnight Spirit",
        "Shadowbind"
      ],
      "3": [
        "Chokehold",
        "Veil of Night"
      ],
      "4": [
        "Stealth Expertise",
        "Glyph of Nightfall"
      ],
      "5": [
        "Hush",
        "Phantom Retreat"
      ],
      "6": [
        "Dark Whispers",
        "Mass Disguise"
      ],
      "7": [
        "Midnight-Touched",
        "Vanishing Dodge"
      ],
      "8": [
        "Shadowhunter",
        "Spellcharge"
      ],
      "9": [
        "Night Terror",
        "Twilight Toll"
      ],
      "10": [
        "Eclipse",
        "Specter of the Dark"
      ]
    }
  },
  {
    "name": "Sage",
    "description": "Sage is the domain of the natural world.",
    "classes": [
      "Druid",
      "Ranger"
    ],
    "cardsByLevel": {
      "1": [
        "Gifted Tracker",
        "Nature's Tongue",
        "Vicious Entangle"
      ],
      "2": [
        "Conjure Swarm",
        "Natural Familiar"
      ],
      "3": [
        "Corrosive Projectile",
        "Towering Stalk"
      ],
      "4": [
        "Death Grip",
        "Healing Field"
      ],
      "5": [
        "Thorn Skin",
        "Wild Fortress"
      ],
      "6": [
        "Conjured Steeds",
        "Forager"
      ],
      "7": [
        "Sage-Touched",
        "Wild Surge"
      ],
      "8": [
        "Forest Sprites",
        "Rejuvenation Barrier"
      ],
      "9": [
        "Fane of the Wilds",
        "Plant Dominion"
      ],
      "10": [
        "Force of Nature",
        "Tempest"
      ]
    }
  },
  {
    "name": "Splendor",
    "description": "Splendor is the domain of life.",
    "classes": [
      "Seraph",
      "Wizard"
    ],
    "cardsByLevel": {
      "1": [
        "Bolt Beacon",
        "Mending Touch",
        "Reassurance"
      ],
      "2": [
        "Final Words",
        "Healing Hands"
      ],
      "3": [
        "Second Wind",
        "Voice of Reason"
      ],
      "4": [
        "Divination",
        "Life Ward"
      ],
      "5": [
        "Shape Material",
        "Smite"
      ],
      "6": [
        "Restoration",
        "Zone of Protection"
      ],
      "7": [
        "Healing Strike",
        "Splendor-Touched"
      ],
      "8": [
        "Shield Aura",
        "Stunning Sunlight"
      ],
      "9": [
        "Overwhelming Aura",
        "Salvation Beam"
      ],
      "10": [
        "Invigoration",
        "Resurrection"
      ]
    }
  },
  {
    "name": "Valor",
    "description": "Valor is the domain of protection.",
    "classes": [
      "Guardian",
      "Seraph"
    ],
    "cardsByLevel": {
      "1": [
        "Bare Bones",
        "Forceful Push",
        "I Am Your Shield"
      ],
      "2": [
        "Body Basher",
        "Bold Presence"
      ],
      "3": [
        "Critical Inspiration",
        "Lean on Me"
      ],
      "4": [
        "Goad Them on",
        "Support Tank"
      ],
      "5": [
        "Armorer",
        "Rousing Strike"
      ],
      "6": [
        "Inevitable",
        "Rise Up"
      ],
      "7": [
        "Shrug It Off",
        "Valor-Touched"
      ],
      "8": [
        "Full Surge",
        "Ground Pound"
      ],
      "9": [
        "Hold the Line",
        "Lead by Example"
      ],
      "10": [
        "Unbreakable",
        "Unyielding Armor"
      ]
    }
  }
] as const

export const SRD_CLASSES: SrdClass[] = [
  {
    "name": "Bard",
    "description": "Bards are the most charismatic people in all the realms. Members of this class are masters of captivation and specialize in a variety of performance types, including singing, playing musical instruments, weaving tales, or telling jokes. Whether performing for an audience or speaking to an individual, bards thrive in social situations. Members of this profession bond and train at schools or guilds, but a current of egotism runs through those of the bardic persuasion. While they may be the most likely class to bring people together, a bard of ill temper can just as easily tear a party apart.",
    "domains": [
      "Grace",
      "Codex"
    ],
    "subclasses": [
      "Troubadour",
      "Wordsmith"
    ],
    "evasion": 10,
    "hp": 5,
    "items": "A romance novel or a letter never opened",
    "suggestedTraits": "0, -1, +1, 0, +2, +1",
    "suggestedPrimary": "Rapier",
    "suggestedSecondary": "Small Dagger",
    "suggestedArmor": "Gambeson Armor",
    "hopeFeature": {
      "name": "Make a Scene",
      "text": "**Spend 3 Hope** to temporarily _Distract_ a target within Close range, giving them a -2 penalty to their Difficulty."
    },
    "features": [
      {
        "name": "Rally",
        "text": "Once per session, describe how you rally the party and give yourself and each of your allies a Rally Die. At level 1, your Rally Die is a **d6**. A PC can spend their Rally Die to roll it, adding the result to their action roll, reaction roll, damage roll, or to clear a number of Stress equal to the result. At the end of each session, clear all unspent Rally Dice. At level 5, your Rally Die increases to a **d8**."
      }
    ]
  },
  {
    "name": "Druid",
    "description": "Becoming a druid is more than an occupation; it’s a calling for those who wish to learn from and protect the magic of the wilderness. While one might underestimate a gentle druid who practices the often-quiet work of cultivating flora, druids who channel the untamed forces of nature are terrifying to behold. Druids cultivate their abilities in small groups, often connected by a specific ethos or locale, but some choose to work alone. Through years of study and dedication, druids can learn to transform into beasts and shape nature itself.",
    "domains": [
      "Sage",
      "Arcana"
    ],
    "subclasses": [
      "Warden of the Elements",
      "Warden of Renewal"
    ],
    "evasion": 10,
    "hp": 6,
    "items": "A small bag of rocks and bones or a strange pendant found in the dirt",
    "suggestedTraits": "+1, 0, +1, +2, -1, 0",
    "suggestedPrimary": "Shortstaff",
    "suggestedSecondary": "Round Shield",
    "suggestedArmor": "Leather Armor",
    "hopeFeature": {
      "name": "Evolution",
      "text": "**Spend 3 Hope** to transform into a Beastform without marking a Stress. When you do, choose one trait to raise by +1 until you drop out of that Beastform."
    },
    "features": [
      {
        "name": "Beastform",
        "text": "Mark a Stress to magically transform into a creature of your tier or lower from the Beastform list. You can drop out of this form at any time. While transformed, you can't use weapons or cast spells from domain cards, but you can still use other features or abilities you have access to. Spells you cast before you transform stay active and last for their normal duration, and you can talk and communicate as normal. Additionally, you gain the Beastform's features, add their Evasion bonus to your Evasion, and use the trait specified in their statistics for your attack. While you're in a Beastform, your armor becomes part of your body and you mark Armor Slots as usual; when you drop out of a Beastform, those marked Armor Slots remain marked. If you mark your last Hit Point, you automatically drop out of this form."
      },
      {
        "name": "Wildtouch",
        "text": "You can perform harmless, subtle effects that involve nature—such as causing a flower to rapidly grow, summoning a slight gust of wind, or starting a campfire at will."
      }
    ]
  },
  {
    "name": "Guardian",
    "description": "The title of guardian represents an array of martial professions, speaking more to their moral compass and unshakeable fortitude than the means by which they fight. While many guardians join groups of militants for either a country or cause, they’re more likely to follow those few they truly care for, majority be damned. Guardians are known for fighting with remarkable ferocity even against overwhelming odds, defending their cohort above all else. Woe betide those who harm the ally of a guardian, as the guardian will answer this injury in kind.",
    "domains": [
      "Valor",
      "Blade"
    ],
    "subclasses": [
      "Stalwart",
      "Vengeance"
    ],
    "evasion": 9,
    "hp": 7,
    "items": "A totem from your mentor or a secret key",
    "suggestedTraits": "+1, +2, -1, 0, +1, 0",
    "suggestedPrimary": "Battleaxe",
    "suggestedSecondary": "",
    "suggestedArmor": "Chainmail Armor",
    "hopeFeature": {
      "name": "Frontline Tank",
      "text": "**Spend 3 Hope** to clear 2 Armor Slots."
    },
    "features": [
      {
        "name": "Unstoppable",
        "text": "Once per long rest, you can become _Unstoppable._ You gain an Unstoppable Die. At level 1, your Unstoppable Die is a **d4.** Place it on your character sheet in the space provided, starting with the 1 value facing up. After you make a damage roll that deals 1 or more Hit Points to a target, increase the Unstoppable Die value by one. When the die's value would exceed its maximum value or when the scene ends, remove the die and drop out of _Unstoppable_. At level 5, your Unstoppable Die increases to a **d6.**\n\nWhile _Unstoppable_, you gain the following benefits:\n\n- You reduce the severity of physical damage by one threshold (Severe to Major, Major to Minor, Minor to None).\n- You add the current value of the Unstoppable Die to your damage roll.\n- You can't be _Restrained_ or _Vulnerable_.\n\n> _**Tip:** If your Unstoppable Die is a d4 and the 4 is currently facing up, you remove the die the next time you would increase it. However, if your Unstoppable Die has increased to a d6 and the 4 is currently facing up, you'll turn it to 5 the next time you would increase it. In this case, you'll remove the die after you would need to increase it higher than 6._"
      }
    ]
  },
  {
    "name": "Ranger",
    "description": "Rangers are highly skilled hunters who, despite their martial abilities, rarely lend their skills to an army. Through mastery of the body and a deep understanding of the wilderness, rangers become sly tacticians, pursuing their quarry with cunning and patience. Many rangers track and fight alongside an animal companion with whom they’ve forged a powerful spiritual bond. By honing their skills in the wild, rangers become expert trackers, as likely to ensnare their foes in a trap as they are to assail them head-on.",
    "domains": [
      "Bone",
      "Sage"
    ],
    "subclasses": [
      "Beastbound",
      "Wayfinder"
    ],
    "evasion": 12,
    "hp": 6,
    "items": "A trophy from your first kill or a seemingly broken compass",
    "suggestedTraits": "+2, 0, +1, +1, -1, 0",
    "suggestedPrimary": "Shortbow",
    "suggestedSecondary": "",
    "suggestedArmor": "Leather Armor",
    "hopeFeature": {
      "name": "Hold Them Off",
      "text": "**Spend 3 Hope** when you succeed on an attack with a weapon to use that same roll against two additional adversaries within range of the attack."
    },
    "features": [
      {
        "name": "Ranger's Focus",
        "text": "**Spend a Hope** and make an attack against a target. On a success, deal your attack's normal damage and temporarily make the attack's target your _Focus_. Until this feature ends or you make a different creature your _Focus_, you gain the following benefits against your _Focus:_\n\n- You know precisely what direction they are in.\n- When you deal damage to them, they must mark a Stress.\n- When you fail an attack against them, you can end your Ranger's Focus feature to reroll your Duality Dice."
      }
    ]
  },
  {
    "name": "Rogue",
    "description": "Rogues are scoundrels, often in both attitude and practice. Broadly known as liars and thieves, the best among this class move through the world anonymously. Utilizing their sharp wits and blades, rogues trick their foes through social manipulation as easily as breaking locks, climbing through windows, or dealing underhanded blows. These masters of magical craft manipulate shadow and movement, adding an array of useful and deadly tools to their repertoire. Rogues frequently establish guilds to meet future accomplices, hire out jobs, and hone secret skills, proving that there’s honor among thieves for those who know where to look.",
    "domains": [
      "Midnight",
      "Grace"
    ],
    "subclasses": [
      "Nightwalker",
      "Syndicate"
    ],
    "evasion": 12,
    "hp": 6,
    "items": "A set of forgery tools or a grappling hook",
    "suggestedTraits": "+1, -1, +2, 0, +1, 0",
    "suggestedPrimary": "Dagger",
    "suggestedSecondary": "Small Dagger",
    "suggestedArmor": "Gambeson Armor",
    "hopeFeature": {
      "name": "Rogue's Dodge",
      "text": "**Spend 3 Hope** to gain a +2 bonus to your Evasion until the next time an attack succeeds against you. Otherwise, this bonus lasts until your next rest."
    },
    "features": [
      {
        "name": "Cloaked",
        "text": "Any time you would be _Hidden,_ you are instead _Cloaked._ In addition to the benefits of the _Hidden_ condition, while _Cloaked_ you remain unseen if you are stationary when an adversary moves to where they would normally see you. After you make an attack or end a move within line of sight of an adversary, you are no longer _Cloaked_."
      },
      {
        "name": "Sneak Attack",
        "text": "When you succeed on an attack while _Cloaked_ or while an ally is within Melee range of your target, add a number of **d6s** equal to your tier to your damage roll.\n\n- Level 1 → Tier 1\n- Levels 2-4 → Tier 2\n- Levels 5-7 → Tier 3\n- Levels 8-10 → Tier 4"
      }
    ]
  },
  {
    "name": "Seraph",
    "description": "Seraphs are divine fighters and healers imbued with sacred purpose. A wide array of deities exist within the realms, and thus numerous kinds of seraphs are appointed by these gods. Their ethos traditionally aligns with the domain or goals of their god, such as defending the weak, exacting vengeance, protecting a land or artifact, or upholding a particular faith. Some seraphs ally themselves with an army or locale, much to the satisfaction of their rulers, but other crusaders fight in opposition to the follies of the Mortal Realm. It is better to be a seraph’s ally than their enemy, as they are terrifying foes to those who defy their purpose.",
    "domains": [
      "Splendor",
      "Valor"
    ],
    "subclasses": [
      "Divine Wielder",
      "Winged Sentinel"
    ],
    "evasion": 9,
    "hp": 7,
    "items": "A bundle of offerings or a sigil of your god",
    "suggestedTraits": "0, +2, 0, +1, +1, -1",
    "suggestedPrimary": "Hallowed Axe",
    "suggestedSecondary": "Round Shield",
    "suggestedArmor": "Chainmail Armor",
    "hopeFeature": {
      "name": "Life Support",
      "text": "**Spend 3 Hope** to clear a Hit Point on an ally within Close range."
    },
    "features": [
      {
        "name": "Prayer Dice",
        "text": "At the beginning of each session, roll a number of **d4s** equal to your subclass's Spellcast trait and place them on your character sheet in the space provided. These are your Prayer Dice. You can spend any number of Prayer Dice to aid yourself or an ally within Far range. You can use a spent die's value to reduce incoming damage, add to a roll's result after the roll is made, or gain Hope equal to the result. At the end of each session, clear all unspent Prayer Dice."
      }
    ]
  },
  {
    "name": "Sorcerer",
    "description": "Not all innate magic users choose to hone their craft, but those who do can become powerful sorcerers. The gifts of these wielders are passed down through families, even if the family is unaware of or reluctant to practice them. A sorcerer’s abilities can range from the elemental to the illusionary and beyond, and many practitioners band together into collectives based on their talents. The act of becoming a formidable sorcerer is not the practice of acquiring power, but learning to cultivate and control the power one already possesses. The magic of a misguided or undisciplined sorcerer is a dangerous force indeed.",
    "domains": [
      "Arcana",
      "Midnight"
    ],
    "subclasses": [
      "Elemental Origin",
      "Primal Origin"
    ],
    "evasion": 10,
    "hp": 6,
    "items": "A whispering orb or a family heirloom",
    "suggestedTraits": "0, -1, +1, +2, +1, 0",
    "suggestedPrimary": "Dualstaff",
    "suggestedSecondary": "",
    "suggestedArmor": "Gambeson Armor",
    "hopeFeature": {
      "name": "Volatile Magic",
      "text": "**Spend 3 Hope** to reroll any number of your damage dice on an attack that deals magic damage."
    },
    "features": [
      {
        "name": "Arcane Sense",
        "text": "You can sense the presence of magical people and objects within Close range."
      },
      {
        "name": "Minor Illusion",
        "text": "Make a **Spellcast Roll (10).** On a success, you create a minor visual illusion no larger than yourself within Close range. This illusion is convincing to anyone at Close range or farther."
      },
      {
        "name": "Channel Raw Power",
        "text": "Once per long rest, you can place a domain card from your loadout into your vault and choose to either:\n\n- Gain Hope equal to the level of the card.\n- Enhance a spell that deals damage, gaining a bonus to your damage roll equal to twice the level of the card."
      }
    ]
  },
  {
    "name": "Warrior",
    "description": "Becoming a warrior requires years, often a lifetime, of training and dedication to the mastery of weapons and violence. While many who seek to fight hone only their strength, warriors understand the importance of an agile body and mind, making them some of the most sought-after fighters across the realms. Frequently, warriors find employment within an army, a band of mercenaries, or even a royal guard, but their potential is wasted in any position where they cannot continue to improve and expand their skills. Warriors are known to have a favored weapon; to come between them and their blade would be a grievous mistake.",
    "domains": [
      "Blade",
      "Bone"
    ],
    "subclasses": [
      "Call of the Brave",
      "Call of the Slayer"
    ],
    "evasion": 11,
    "hp": 6,
    "items": "The drawing of a lover or a sharpening stone",
    "suggestedTraits": "+2, +1, 0, +1, -1, 0",
    "suggestedPrimary": "Longsword",
    "suggestedSecondary": "",
    "suggestedArmor": "Chainmail Armor",
    "hopeFeature": {
      "name": "No Mercy",
      "text": "**Spend 3 Hope** to gain a +1 bonus to your attack rolls until your next rest."
    },
    "features": [
      {
        "name": "Attack of Opportunity",
        "text": "If an adversary within Melee range attempts to leave that range, make a reaction roll using a trait of your choice against their Difficulty. Choose one effect on a success, or two if you critically succeed:\n\n- They can't move from where they are.\n- You deal damage to them equal to your primary weapon's damage.\n- You move with them."
      },
      {
        "name": "Combat Training",
        "text": "You ignore burden when equipping weapons. When you deal physical damage, you gain a bonus to your damage roll equal to your level."
      }
    ]
  },
  {
    "name": "Wizard",
    "description": "Whether through an institution or individual study, those known as wizards acquire and hone immense magical power over years of learning using a variety of tools, including books, stones, potions, and herbs. Some wizards dedicate their lives to mastering a particular school of magic, while others learn from a wide variety of disciplines. Many wizards become wise and powerful figures in their communities, advising rulers, providing medicines and healing, and even leading war councils. While these mages all work toward the common goal of collecting magical knowledge, wizards often have the most conflict within their own ranks, as the acquisition, keeping, and sharing of powerful secrets is a topic of intense debate that has resulted in innumerable deaths.",
    "domains": [
      "Codex",
      "Splendor"
    ],
    "subclasses": [
      "School of Knowledge",
      "School of War"
    ],
    "evasion": 11,
    "hp": 5,
    "items": "A book you’re trying to translate or a tiny, harmless elemental pet",
    "suggestedTraits": "-1, 0, 0, +1, +1, +2",
    "suggestedPrimary": "Greatstaff",
    "suggestedSecondary": "",
    "suggestedArmor": "Leather Armor",
    "hopeFeature": {
      "name": "Not This Time",
      "text": "**Spend 3 Hope** to force an adversary within Far range to reroll an attack or damage roll."
    },
    "features": [
      {
        "name": "Prestidigitation",
        "text": "You can perform harmless, subtle magical effects at will. For example, you can change an object's color, create a smell, light a candle, cause a tiny object to float, illuminate a room, or repair a small object."
      },
      {
        "name": "Strange Patterns",
        "text": "Choose a number between 1 and 12. When you roll that number on a Duality Die, gain a Hope or clear a Stress.\n\nYou can change this number when you take a long rest."
      }
    ]
  }
] as const

export const SRD_ANCESTRIES: SrdAncestry[] = [
  {
    "name": "Clank",
    "description": "Clanks are sentient mechanical beings built from a variety of materials, including metal, wood, and stone. They can resemble humanoids, animals, or even inanimate objects. Like organic beings, their bodies come in a wide array of sizes. Because of their bespoke construction, many clanks have highly specialized physical configurations. Examples include clawed hands for grasping, wheels for movement, or built-in weaponry.\n\nMany clanks embrace body modifications for style as well as function, and members of other ancestries often turn to clank artisans to construct customized mobility aids and physical adornments. Other ancestries can create clanks, even using their own physical characteristics as inspiration, but it's also common for clanks to build one another. A clank's lifespan extends as long as they're able to acquire or craft new parts, making their physical form effectively immortal. That said, their minds are subject to the effects of time, and deteriorate as the magic that powers them loses potency.",
    "features": [
      {
        "name": "Purposeful Design",
        "text": "Decide who made you and for what purpose. At character creation, choose one of your Experiences that best aligns with this purpose and gain a permanent +1 bonus to it."
      },
      {
        "name": "Efficient",
        "text": "When you take a short rest, you can choose a long rest move instead of a short rest move."
      }
    ]
  },
  {
    "name": "Drakona",
    "description": "Drakona resemble wingless dragons in humanoid form and possess a powerful elemental breath. All drakona have thick scales that provide excellent natural armor against both attacks and the forces of nature. They are large in size, ranging from 5 feet to 7 feet on average, with long sharp teeth. New teeth grow throughout a Drakona's approximately 350-year lifespan, so they are never in danger of permanently losing an incisor. Unlike their dragon ancestors, drakona don't have wings and can't fly without magical aid. Members of this ancestry pass down the element of their breath through generations, though in rare cases, a drakona's elemental power will differ from the rest of their family's.",
    "features": [
      {
        "name": "Scales",
        "text": "Your scales act as natural protection. When you would take Severe damage, you can **mark a Stress** to mark 1 fewer Hit Points."
      },
      {
        "name": "Elemental Breath",
        "text": "Choose an element for your breath (such as electricity, fire, or ice). You can use this breath against a target or group of targets within Very Close range, treating it as an Instinct weapon that deals **d8** magic damage using your Proficiency."
      }
    ]
  },
  {
    "name": "Dwarf",
    "description": "Dwarves are most easily recognized as short humanoids with square frames, dense musculature, and thick hair. Their average height ranges from 4 to 5 ½ feet, and they are often broad in proportion to their stature. Their skin and nails contain a high amount of keratin, making them naturally resilient. This allows dwarves to embed gemstones into their bodies and decorate themselves with tattoos or piercings. Their hair grows thickly—usually on their heads, but some dwarves have thick hair across their bodies as well. Dwarves of all genders can grow facial hair, which they often style in elaborate arrangements. Typically, dwarves live up to 250 years of age, maintaining their muscle mass well into later life.",
    "features": [
      {
        "name": "Thick Skin",
        "text": "When you take Minor damage, you can **mark 2 Stress** instead of marking a Hit Point."
      },
      {
        "name": "Increased Fortitude",
        "text": "**Spend 3 Hope** to halve incoming physical damage."
      }
    ]
  },
  {
    "name": "Elf",
    "description": "Elves are typically tall humanoids with pointed ears and acutely attuned senses. Their ears vary in size and pointed shape, and as they age, the tips begin to droop. While elves come in a wide range of body types, they are all fairly tall, with heights ranging from about 6 to 6 ½ feet. All elves have the ability to drop into a celestial trance, rather than sleep. This allows them to rest effectively in a short amount of time.\n\nSome elves possess what is known as a \"mystic form,\" which occurs when an elf has dedicated themself to the study or protection of the natural world so deeply that their physical form changes. These characteristics can include celestial freckles, the presence of leaves, vines, or flowers in their hair, eyes that flicker like fire, and more. Sometimes these traits are inherited from parents, but if an elf changes their environment or magical focus, their appearance changes over time. Because elves live for about 350 years, these traits can shift more than once throughout their lifespan.",
    "features": [
      {
        "name": "Quick Reactions",
        "text": "**Mark a Stress** to gain advantage on a reaction roll."
      },
      {
        "name": "Celestial Trance",
        "text": "During a rest, you can drop into a trance to choose an additional downtime move."
      }
    ]
  },
  {
    "name": "Faerie",
    "description": "Faeries are winged humanoid creatures with insectile features. These characteristics cover a broad spectrum from humanoid to insectoid—some possess additional arms, compound eyes, lantern organs, chitinous exoskeletons, or stingers. Because of their close ties to the natural world, they also frequently possess attributes that allow them to blend in with various plants. The average height of a faerie ranges from about 2 feet to 5 feet, but some faeries grow up to 7 feet tall. All faeries possess membranous wings and they each go through a process of metamorphosis. The process and changes differ from faerie to faerie, but during this transformation each individual manifests the unique appearance they will carry throughout the rest of their approximately 50-year lifespan.",
    "features": [
      {
        "name": "Luckbender",
        "text": "Once per session, after you or a willing ally within Close range makes an action roll, you can **spend 3 Hope** to reroll the Duality Dice."
      },
      {
        "name": "Wings",
        "text": "You can fly. While flying, you can **mark a Stress** after an adversary makes an attack against you to gain a +2 bonus to your Evasion against that attack."
      }
    ]
  },
  {
    "name": "Faun",
    "description": "Fauns resemble humanoid goats with curving horns, square pupils, and cloven hooves. Though their appearances may vary, most fauns have a humanoid torso and a goatlike lower body covered in dense fur. Faun faces can be more caprine or more humanlike, and they have a wide variety of ear and horn shapes. Faun horns range from short with minimal curvature to much larger with a distinct curl. The average faun ranges from 4 feet to 6 ½ feet tall, but their height can change dramatically from one moment to the next based on their stance. The majority of fauns have proportionately long limbs, no matter their size or shape, and are known for their ability to deliver powerful blows with their split hooves. Fauns live for roughly 225 years, and as they age, their appearance can become increasingly goatlike.",
    "features": [
      {
        "name": "Caprine Leap",
        "text": "You can leap anywhere within Close range as though you were using normal movement, allowing you to vault obstacles, jump across gaps, or scale barriers with ease."
      },
      {
        "name": "Kick",
        "text": "When you succeed on an attack against a target within Melee range, you can **mark a Stress** to kick yourself off them, dealing an extra **2d6** damage and knocking back either yourself or the target to Very Close range."
      }
    ]
  },
  {
    "name": "Firbolg",
    "description": "Firbolgs are bovine humanoids typically recognized by their broad noses and long, drooping ears. Some have faces that are a blend of humanoid and bison, ox, cow, or other bovine creatures. Others, often referred to as minotaurs, have heads that entirely resemble cattle. They are tall and muscular creatures, with heights ranging from around 5 feet to 7 feet, and possess remarkable strength no matter their age. Some firbolgs are known to use this strength to charge their adversaries, an action that is particuarly effective for those who have one of the many varieties of horn styles commonly found in this ancestry. Though their unique characteristics can vary, all firbolgs are covered in fur, which can be muted and earth-toned in color, or come in a variety of pastels, such as soft pinks and blues. On average, firbolgs live for about 150 years.",
    "features": [
      {
        "name": "Charge",
        "text": "When you succeed on an Agility Roll to move from Far or Very Far range into Melee range with one or more targets, you can **mark a Stress** to deal **1d12** physical damage to all targets within Melee range."
      },
      {
        "name": "Unshakable",
        "text": "When you would mark a Stress, roll a **d6.** On a result of 6, don't mark it."
      }
    ]
  },
  {
    "name": "Fungril",
    "description": "Fungril resemble humanoid mushrooms. They can be either more humanoid or more fungal in appearance, and they come in an assortment of colors, from earth tones to bright reds, yellows, purples, and blues. Fungril display an incredible variety of bodies, faces, and limbs, as there's no single common shape among them. Even their heights range from a tiny 2 feet tall to a staggering 7 feet tall. While the common lifespan of a fungril is about 300 years, some have been reported to live much longer. They can communicate nonverbally, and many members of this ancestry use a mycelial array to chemically exchange information with other fungril across long distances.",
    "features": [
      {
        "name": "Fungril Network",
        "text": "Make an **Instinct Roll (12)** to use your mycelial array to speak with others of your ancestry. On a success, you can communicate across any distance."
      },
      {
        "name": "Death Connection",
        "text": "While touching a corpse that died recently, you can **mark a Stress** to extract one memory from the corpse related to a specific emotion or sensation of your choice."
      }
    ]
  },
  {
    "name": "Galapa",
    "description": "Galapa resemble anthropomorphic turtles with large, domed shells into which they can retract. On average, they range from 4 feet to 6 feet in height, and their head and body shapes can resemble any type of turtle. Galapa come in a variety of earth tones—most often shades of green and brown— and possess unique patterns on their shells. Members of this ancestry can draw their head, arms, and legs into their shell for protection to use it as a natural shield when defensive measures are needed. Some supplement their shell's strength or appearance by attaching armor or carving unique designs, but the process is exceedingly painful. Most galapa move slowly no matter their age, and they can live approximately 150 years.",
    "features": [
      {
        "name": "Shell",
        "text": "Gain a bonus to your damage thresholds equal to your Proficiency."
      },
      {
        "name": "Retract",
        "text": "**Mark a Stress** to retract into your shell. While in your shell, you have resistance to physical damage, you have disadvantage on action rolls, and you can't move."
      }
    ]
  },
  {
    "name": "Giant",
    "description": "Giants are towering humanoids with broad shoulders, long arms, and one to three eyes. Adult giants range from 6 ½ to 8 ½ feet tall and are naturally muscular, regardless of body type. They are easily recognized by their wide frames and elongated arms and necks. Though they can have up to three eyes, all giants are born with none and remain sightless for their first year of life. Until a giant reaches the age of 10 and their features fully develop, the formation of their eyes may fluctuate. Those with a single eye are commonly known as cyclops. The average giant lifespan is about 75 years.",
    "features": [
      {
        "name": "Endurance",
        "text": "Gain an additional Hit Point slot at character creation."
      },
      {
        "name": "Reach",
        "text": "Treat any weapon, ability, spell, or other feature that has a Melee range as though it has a Very Close range instead."
      }
    ]
  },
  {
    "name": "Goblin",
    "description": "Goblins are small humanoids easily recognizable by their large eyes and massive membranous ears. With keen hearing and sharp eyesight, they perceive details both at great distances and in darkness, allowing them to move through less-optimal environments with ease. Their skin and eye colors are incredibly varied, with no one hue, either vibrant or subdued, more dominant than another. A typical goblin stands between 3 feet and 4 feet tall, and each of their ears is about the size of their head. Goblins are known to use ear positions to very specific effect when communicating nonverbally. A goblin's lifespan is roughly 100 years, and many maintain their keen hearing and sight well into advanced age.",
    "features": [
      {
        "name": "Surefooted",
        "text": "You ignore disadvantage on Agility Rolls."
      },
      {
        "name": "Danger Sense",
        "text": "Once per rest, **mark a Stress** to force an adversary to reroll an attack against you or an ally within Very Close range."
      }
    ]
  },
  {
    "name": "Halfling",
    "description": "Halflings are small humanoids with large hairy feet and prominent rounded ears. On average, halflings are 3 to 4 feet in height, and their ears, nose, and feet are larger in proportion to the rest of their body. Members of this ancestry live for around 150 years, and a halfling's appearance is likely to remain youthful even as they progress from adulthood into old age. Halflings are naturally attuned to the magnetic fields of the Mortal Realm, granting them a strong internal compass. They also possess acute senses of hearing and smell, and can often detect those who are familiar to them by the sound of their movements.",
    "features": [
      {
        "name": "Luckbringer",
        "text": "At the start of each session, everyone in your party gains a Hope."
      },
      {
        "name": "Internal Compass",
        "text": "When you roll a 1 on your Hope Die, you can reroll it."
      }
    ]
  },
  {
    "name": "Human",
    "description": "Humans are most easily recognized by their dexterous hands, rounded ears, and bodies built for endurance. Their average height ranges from just under 5 feet to about 6 ½ feet. They have a wide variety of builds, with some being quite broad, others lithe, and many inhabiting the spectrum in between. Humans are physically adaptable and adjust to harsh climates with relative ease. In general, humans live to an age of about 100, with their bodies changing dramatically between their youngest and oldest years.",
    "features": [
      {
        "name": "High Stamina",
        "text": "Gain an additional Stress slot at character creation."
      },
      {
        "name": "Adaptability",
        "text": "When you fail a roll that utilized one of your Experiences, you can **mark a Stress** to reroll."
      }
    ]
  },
  {
    "name": "Infernis",
    "description": "Infernis are humanoids who possess sharp canine teeth, pointed ears, and horns. They are the descendants of demons from the Circles Below. On average, infernis range in height from 5 feet to 7 feet and are known to have long fingers and pointed nails. Some have long, thin, and smooth tails that end in points, forks, or arrowheads. It's common for infernis to have two or four horns—though some have crowns of many horns, or only one. These horns can also grow asymmetrically, forming unique, often curving, shapes that infernis enhance with carving and ornamentation. Their skin, hair, and horns come in an assortment of colors that can include soft pastels, stark tones, or vibrant hues, such as rosy scarlet, deep purple, and pitch black.\n\nInfernis possess a \"dread visage\" that manifests both involuntarily, such as when they experience fear or other strong emotions, or purposefully, such as when they wish to intimidate an adversary. This visage can briefly modify their appearance in a variety of ways, including lengthening their teeth and nails, changing the colors of their eyes, twisting their horns, or enhancing their height. On average, infernis live up to 350 years, with some attributing this lifespan to their demonic lineage.",
    "features": [
      {
        "name": "Fearless",
        "text": "When you roll with Fear, you can **mark 2 Stress** to change it into a roll with Hope instead."
      },
      {
        "name": "Dread Visage",
        "text": "You have advantage on rolls to intimidate hostile creatures."
      }
    ]
  },
  {
    "name": "Katari",
    "description": "Katari are feline humanoids with retractable claws, vertically slit pupils, and high, triangular ears. They can also have small, pointed canine teeth, soft fur, and long whiskers that assist their perception and navigation. Their ears can swivel nearly 180 degrees to detect sound, adding to their heightened senses. Katari may look more or less feline or humanoid, with catlike attributes in the form of hair, whiskers, and a muzzle. About half of the katari population have tails. Their skin and fur come in a wide range of hues and patterns, including solid colors, calico tones, tabby stripes, and an array of spots, patches, marbling, or bands. Their height ranges from about 3 feet to 6 ½ feet, and they live to around 150 years.",
    "features": [
      {
        "name": "Feline Instincts",
        "text": "When you make an Agility Roll, you can **spend 2 Hope** to reroll your Hope Die."
      },
      {
        "name": "Retracting Claws",
        "text": "Make an **Agility Roll** to scratch a target within Melee range. On a success, they become temporarily _Vulnerable._"
      }
    ]
  },
  {
    "name": "Orc",
    "description": "Orcs are humanoids most easily recognized by their square features and boar-like tusks that protrude from their lower jaw. Tusks come in various sizes, and though they extend from the mouth, they aren't used for consuming food. Instead, many orcs choose to decorate their tusks with significant ornamentation. Orcs typically live for 125 years, and unless altered, their tusks continue to grow throughout the course of their lives. Their ears are pointed, and their hair and skin typically have green, blue, pink, or gray tones. Orcs tend toward a muscular build, and their average height ranges from 5 feet to 6 ½ feet.",
    "features": [
      {
        "name": "Sturdy",
        "text": "When you have 1 Hit Point remaining, attacks against you have disadvantage."
      },
      {
        "name": "Tusks",
        "text": "When you succeed on an attack against a target within Melee range, you can **spend a Hope** to gore the target with your tusks, dealing an extra **1d6** damage."
      }
    ]
  },
  {
    "name": "Ribbet",
    "description": "Ribbets resemble anthropomorphic frogs with protruding eyes and webbed hands and feet. They have smooth (though sometimes warty) moist skin and eyes positioned on either side of their head. Some ribbets have hind legs more than twice the length of their torso, while others have short limbs. No matter their size (which ranges from about 3 feet to 4 ½ feet), ribbets primarily move by hopping. All ribbets have webbed appendages, allowing them to swim with ease. Some ribbets possess a natural green-and-brown camouflage, while others are vibrantly colored with bold patterns. No matter their appearance, all ribbets are born from eggs laid in the water, hatch into tadpoles, and after about 6 to 7 years, grow into amphibians that can move around on land. Ribbets live for approximately 100 years.",
    "features": [
      {
        "name": "Amphibious",
        "text": "You can breathe and move naturally underwater."
      },
      {
        "name": "Long Tongue",
        "text": "You can use your long tongue to grab onto things within Close range. **Mark a Stress** to use your tongue as a Finesse Close weapon that deals **d12** physical damage using your Proficiency."
      }
    ]
  },
  {
    "name": "Simiah",
    "description": "Simiah resemble anthropomorphic monkeys and apes with long limbs and prehensile feet. While their appearance reflects all simian creatures, from the largest gorilla to the smallest marmoset, their size does not align with their animal counterparts, and they can be anywhere from 2 to 6 feet tall. All simiah can use their dexterous feet for nonverbal communication, work, and combat. Additionally, some also have prehensile tails that can grasp objects or help with balance during dicult maneuvers. These traits grant members of this ancestry unique agility that aids them in a variety of physical tasks. In particular, simiah are skilled climbers and can easily transition from bipedal movement to knuckle-walking and climbing, and back again. On average, simiah live for about 100 years.",
    "features": [
      {
        "name": "Natural Climber",
        "text": "You have advantage on Agility Rolls that involve balancing and climbing."
      },
      {
        "name": "Nimble",
        "text": "Gain a permanent +1 bonus to your Evasion at character creation."
      }
    ]
  }
] as const

export const SRD_COMMUNITIES: SrdCommunity[] = [
  {
    "name": "Highborne",
    "description": "Being part of a highborne community means you're accustomed to a life of elegance, opulence, and prestige within the upper echelons of society. Traditionally, members of a highborne community possess incredible material wealth. While this can take a variety of forms depending on the community—including gold and other minerals, land, or controlling the means of production—this status always comes with power and influence. Highborne place great value on titles and possessions, and there is little social mobility within their ranks. Members of a highborne community often control the political and economic status of the areas in which they live due to their ability to influence people and the economy with their substantial wealth. The health and safety of the less affuent people who live in these locations often hinges on the ability of this highborne ruling class to prioritize the well-being of their subjects over profit.",
    "note": "Highborne are often amiable, candid, conniving, enterprising, ostentatious, and unflappable.",
    "features": [
      {
        "name": "Privilege",
        "text": "You have advantage on rolls to consort with nobles, negotiate prices, or leverage your reputation to get what you want."
      }
    ]
  },
  {
    "name": "Loreborne",
    "description": "Being part of a loreborne community means you're from a society that favors strong academic or political prowess. Loreborne communities highly value knowledge, frequently in the form of historical preservation, political advancement, scientific study, skill development, or lore and mythology compilation. Most members of these communities research in institutions built in bastions of civilization, while some eclectic few thrive in gathering information from the natural world. Some may be isolationists, operating in smaller enclaves, schools, or guilds and following their own unique ethos. Others still wield their knowledge on a larger scale, making deft political maneuvers across governmental landscapes.",
    "note": "Loreborne are often direct, eloquent, inquisitive, patient, rhapsodic, and witty.",
    "features": [
      {
        "name": "Well-Read",
        "text": "You have advantage on rolls that involve the history, culture, or politics of a prominent person or place."
      }
    ]
  },
  {
    "name": "Orderborne",
    "description": "Being part of an orderborne community means you're from a collective that focuses on discipline or faith, and you uphold a set of principles that reflect your experience there. Orderborne are frequently some of the most powerful among the surrounding communities. By aligning the members of their society around a common value or goal, such as a god, doctrine, ethos, or even a shared business or trade, the ruling bodies of these enclaves can mobilize larger populations with less effort. While orderborne communities take a variety of forms—some even profoundly pacifistic—perhaps the most feared are those that structure themselves around military prowess. In such a case, it's not uncommon for orderborne to provide soldiers for hire to other cities or countries.",
    "note": "Orderborne are often ambitious, benevolent, pensive, prudent, sardonic, and stoic.",
    "features": [
      {
        "name": "Dedicated",
        "text": "Record three sayings or values your upbringing instilled in you. Once per rest, when you describe how you're embodying one of these principles through your current action, you can roll a **d20** as your Hope Die."
      }
    ]
  },
  {
    "name": "Ridgeborne",
    "description": "Being part of a ridgeborne community means you've called the rocky peaks and sharp cliffs of the mountainside home. Those who've lived in the mountains often consider themselves hardier than most because they've thrived among the most dangerous terrain many continents have to offer. These groups are adept at adaptation, developing unique technologies and equipment to move both people and products across dicult terrain. As such, ridgeborne grow up scrambling and climbing, making them sturdy and strong-willed. Ridgeborne localities appear in a variety of forms—some cities carve out entire cliff faces, others construct castles of stone, and still more live in small homes on windblown peaks. Outside forces often struggle to attack ridgeborne groups, as the small militias and large military forces of the mountains are adept at utilizing their high-ground advantage.",
    "note": "Ridgeborne are often bold, hardy, indomitable, loyal, reserved, and stubborn.",
    "features": [
      {
        "name": "Steady",
        "text": "You have advantage on rolls to traverse dangerous cliffs and ledges, navigate harsh environments, and use your survival knowledge."
      }
    ]
  },
  {
    "name": "Seaborne",
    "description": "Being part of a seaborne community means you lived on or near a large body of water. Seaborne communities are built, both physically and culturally, around the specific waters they call home. Some of these groups live along the shore, constructing ports for locals and travelers alike. These harbors function as centers of commerce, tourist attractions, or even just a safe place to lay down one's head after weeks of travel. Other seaborne live on the water in small boats or large ships, with the idea of \"home\" comprising a ship and its crew, rather than any one landmass. No matter their exact location, seaborne communities are closely tied to the ocean tides and the creatures who inhabit them. Seaborne learn to fish at a young age, and train from birth to hold their breath and swim in even the most tumultuous waters. Individuals from these groups are highly sought after for their sailing skills, and many become captains of vessels, whether within their own community, working for another, or even at the helm of a powerful naval operation.",
    "note": "Seaborne are often candid, cooperative, exuberant, fierce, resolute, and weathered.",
    "features": [
      {
        "name": "Know the Tide",
        "text": "You can sense the ebb and flow of life. When you roll with Fear, place a token on your community card. You can hold a number of tokens equal to your level. Before you make an action roll, you can spend any number of these tokens to gain a +1 bonus to the roll for each token spent. At the end of each session, clear all unspent tokens."
      }
    ]
  },
  {
    "name": "Slyborne",
    "description": "Being part of a slyborne community means you come from a group that operates outside the law, including all manner of criminals, grifters, and con artists. Members of slyborne communities are brought together by their disreputable goals and their clever means of achieving them. Many people in these communities have an array of unscrupulous skills: forging, thievery, smuggling, and violence. People of any social class can be slyborne, from those who have garnered vast wealth and influence to those without a coin to their name. To the outside eye, slyborne might appear to be ruans with no loyalty, but these communities possess some of the strictest codes of honor which, when broken, can result in a terrifying end for the transgressor.",
    "note": "Slyborne are often calculating, clever, formidable, perceptive, shrewd, and tenacious.",
    "features": [
      {
        "name": "Scoundrel",
        "text": "You have advantage on rolls to negotiate with criminals, detect lies, or find a safe place to hide."
      }
    ]
  },
  {
    "name": "Underborne",
    "description": "Being part of an underborne community means you're from a subterranean society. Many underborne live right beneath the cities and villages of other collectives, while some live much deeper. These communities range from small family groups in burrows to massive metropolises in caverns of stone. In many locales, underborne are recognized for their incredible boldness and skill that enable great feats of architecture and engineering. Underborne are regularly hired for their bravery, as even the least daring among them has likely encountered formidable belowground beasts, and learning to dispatch such creatures is common practice amongst these societies. Because of the dangers of their environment, many underborne communities develop unique nonverbal languages that prove equally useful on the surface.",
    "note": "Underborne are often composed, elusive, indomitable, innovative, resourceful, and unpretentious.",
    "features": [
      {
        "name": "Low-Light Living",
        "text": "When you're in an area with low light or heavy shadow, you have advantage on rolls to hide, investigate, or perceive details within that area."
      }
    ]
  },
  {
    "name": "Wanderborne",
    "description": "Being part of a wanderborne community means you've lived as a nomad, forgoing a permanent home and experiencing a wide variety of cultures. Unlike many communities that are defined by their locale, wanderborne are defined by their traveling lifestyle. Because of their frequent migration, wanderborne put less value on the accumulation of material possessions in favor of acquiring information, skills, and connections. While some wanderborne are allied by a common ethos, such as a religion or a set of political or economic values, others come together after shared tragedy, such as the loss of their home or land. No matter the reason, the dangers posed by life on the road and the choice to continue down that road together mean that wanderborne are known for their unwavering loyalty.",
    "note": "Wanderborne are often inscrutable, magnanimous, mirthful, reliable, savvy, and unorthodox.",
    "features": [
      {
        "name": "Nomadic Pack",
        "text": "Add a Nomadic Pack to your inventory. Once per session, you can **spend a Hope** to reach into this pack and pull out a mundane item that's useful to your situation. Work with the GM to figure out what item you take out."
      }
    ]
  },
  {
    "name": "Wildborne",
    "description": "Being part of a wildborne community means you lived deep within the forest. Wildborne communities are defined by their dedication to the conservation of their homelands, and many have strong religious or cultural ties to the fauna they live among. This results in unique architectural and technological advancements that favor sustainability over short-term, high-yield results. It is a hallmark of wildborne societies to integrate their villages and cities with the natural environment and avoid disturbing the lives of the plants and animals. While some construct their lodgings high in the branches of trees, others establish their homes on the ground beneath the forest canopy. It's not uncommon for wildborne to remain reclusive and hidden within their woodland homes.",
    "note": "Wildborne are often hardy, loyal, nurturing, reclusive, sagacious, and vibrant.",
    "features": [
      {
        "name": "Lightfoot",
        "text": "Your movement is naturally silent. You have advantage on rolls to move without being heard."
      }
    ]
  }
] as const

export const SRD_SUBCLASSES: SrdSubclass[] = [
  {
    "name": "Beastbound",
    "description": "Play the Beastbound if you want to form a deep bond with an animal ally.",
    "spellcastTrait": "Agility",
    "foundation": [
      {
        "name": "Companion",
        "text": "You have an animal companion of your choice (at the GM's discretion). They stay by your side unless you tell them otherwise.\n\nTake the Ranger Companion sheet. When you level up your character, choose a level-up option for your companion from this sheet as well."
      }
    ],
    "specialization": [
      {
        "name": "Expert Training",
        "text": "Choose an additional level-up option for your companion."
      },
      {
        "name": "Battle-Bonded",
        "text": "When an adversary attacks you while they're within your companion's Melee range, you gain a +2 bonus to your Evasion against the attack."
      }
    ],
    "mastery": [
      {
        "name": "Advanced Training",
        "text": "Choose two additional level-up options for your companion."
      },
      {
        "name": "Loyal Friend",
        "text": "Once per long rest, when the damage from an attack would mark your companion's last Stress or your last Hit Point and you're within Close range of each other, you or your companion can rush to the other's side and take that damage instead."
      }
    ]
  },
  {
    "name": "Call of the Brave",
    "description": "Play the Call of the Brave if you want to use the might of your enemies to fuel your own power.",
    "spellcastTrait": "",
    "foundation": [
      {
        "name": "Courage",
        "text": "When you fail a roll with Fear, you gain a Hope."
      },
      {
        "name": "Battle Ritual",
        "text": "Once per long rest, before you attempt something incredibly dangerous or face off against a foe who clearly outmatches you, describe what ritual you perform or preparations you make. When you do, clear 2 Stress and gain 2 Hope."
      }
    ],
    "specialization": [
      {
        "name": "Rise to the Challenge",
        "text": "You are vigilant in the face of mounting danger. While you have 2 or fewer Hit Points unmarked, you can roll a **d20** as your Hope Die."
      }
    ],
    "mastery": [
      {
        "name": "Camaraderie",
        "text": "Your unwavering bravery is a rallying point for your allies. You can initiate a Tag Team Roll one additional time per session. Additionally, when an ally initiates a Tag Team Roll with you, they only need to spend 2 Hope to do so."
      }
    ]
  },
  {
    "name": "Call of the Slayer",
    "description": "Play the Call of the Slayer if you want to strike down adversaries with immense force.",
    "spellcastTrait": "",
    "foundation": [
      {
        "name": "Slayer",
        "text": "You gain a pool of dice called Slayer Dice. On a roll with Hope, you can place a **d6** on this card instead of gaining a Hope, adding the die to the pool. You can store a number of Slayer Dice equal to your Proficiency. When you make an attack roll or damage roll, you can spend any number of these Slayer Dice, rolling them and adding their result to the roll. At the end of each session, clear any unspent Slayer Dice on this card and gain a Hope per die cleared."
      }
    ],
    "specialization": [
      {
        "name": "Weapon Specialist",
        "text": "You can wield multiple weapons with dangerous ease. When you succeed on an attack, you can **spend a Hope** to add one of the damage dice from your secondary weapon to the damage roll. Additionally, once per long rest when you roll your Slayer Dice, reroll any 1s."
      }
    ],
    "mastery": [
      {
        "name": "Martial Preparation",
        "text": "You're an inspirational warrior to all who travel with you. Your party gains access to the Martial Preparation downtime move. To use this move during a rest, describe how you instruct and train with your party. You and each ally who chooses this downtime move gain a **d6** Slayer Die. A PC with a Slayer Die can spend it to roll the die and add the result to an attack or damage roll of their choice."
      }
    ]
  },
  {
    "name": "Divine Wielder",
    "description": "Play the Divine Wielder if you want to dominate the battlefield with a legendary weapon.",
    "spellcastTrait": "Strength",
    "foundation": [
      {
        "name": "Spirit Weapon",
        "text": "When you have an equipped weapon with a range of Melee or Very Close, it can fly from your hand to attack an adversary within Close range and then return to you. You can **mark a Stress** to target an additional adversary within range with the same attack roll."
      },
      {
        "name": "Sparing Touch",
        "text": "Once per long rest, touch a creature and clear 2 Hit Points or 2 Stress from them."
      }
    ],
    "specialization": [
      {
        "name": "Devout",
        "text": "When you roll your Prayer Dice, you can roll an additional die and discard the lowest result. Additionally, you can use your \"Sparing Touch\" feature twice instead of once per long rest."
      }
    ],
    "mastery": [
      {
        "name": "Sacred Resonance",
        "text": "When you roll damage for your \"Spirit Weapon\" feature, if any of the die results match, double the value of each matching die. For example, if you roll two 5s, they count as two 10s."
      }
    ]
  },
  {
    "name": "Elemental Origin",
    "description": "Play the Elemental Origin if you want to channel raw magic to take the shape of a particular element.",
    "spellcastTrait": "Instinct",
    "foundation": [
      {
        "name": "Elementalist",
        "text": "Choose one of the following elements at character creation: air, earth, fire, lightning, water.\n\nYou can shape this element into harmless effects. Additionally, **spend a Hope** and describe how your control over this element helps an action roll you're about to make, then either gain a +2 bonus to the roll or a +3 bonus to the roll's damage."
      }
    ],
    "specialization": [
      {
        "name": "Natural Evasion",
        "text": "You can call forth your element to protect you from harm. When an attack roll against you succeeds, you can **mark a Stress** and describe how you use your element to defend you. When you do, roll a **d6** and add its result to your Evasion against the attack."
      }
    ],
    "mastery": [
      {
        "name": "Transcendence",
        "text": "Once per long rest, you can transform into a physical manifestation of your element. When you do, describe your transformation and choose two of the following benefits to gain until your next rest:\n\n- +4 bonus to your Severe threshold\n- +1 bonus to a character trait of your choice\n- +1 bonus to your Proficiency\n- +2 bonus to your Evasion"
      }
    ]
  },
  {
    "name": "Nightwalker",
    "description": "Play the Nightwalker if you want to manipulate shadows to maneuver through the environment.",
    "spellcastTrait": "Finesse",
    "foundation": [
      {
        "name": "Shadow Stepper",
        "text": "You can move from shadow to shadow. When you move into an area of darkness or a shadow cast by another creature or object, you can **mark a Stress** to disappear from where you are and reappear inside another shadow within Far range. When you reappear, you are _Cloaked._"
      }
    ],
    "specialization": [
      {
        "name": "Dark Cloud",
        "text": "Make a **Spellcast Roll (15).** On a success, create a temporary dark cloud that covers any area within Close range. Anyone in this cloud can't see outside of it, and anyone outside of it can't see in. You're considered _Cloaked_ from any adversary for whom the cloud blocks line of sight."
      },
      {
        "name": "Adrenaline",
        "text": "While you're _Vulnerable,_ add your level to your damage rolls."
      }
    ],
    "mastery": [
      {
        "name": "Fleeting Shadow",
        "text": "Gain a permanent +1 bonus to your Evasion. You can use your \"Shadow Stepper\" feature to move within Very Far range."
      },
      {
        "name": "Vanishing Act",
        "text": "**Mark a Stress** to become _Cloaked_ at any time. When _Cloaked_ from this feature, you automatically clear the _Restrained_ condition if you have it. You remain _Cloaked_ in this way until you roll with Fear or until your next rest."
      }
    ]
  },
  {
    "name": "Primal Origin",
    "description": "Play the Primal Origin if you want to extend the versatility of your spells in powerful ways.",
    "spellcastTrait": "Instinct",
    "foundation": [
      {
        "name": "Manipulate Magic",
        "text": "Your primal origin allows you to modify the essence of magic itself. After you cast a spell or make an attack using a weapon that deals magic damage, you can **mark a Stress** to do one of the following:\n\n- Extend the spell or attack's reach by one range\n- Gain a +2 bonus to the action roll's result\n- Double a damage die of your choice\n- Hit an additional target within range"
      }
    ],
    "specialization": [
      {
        "name": "Enchanted Aid",
        "text": "You can enhance the magic of others with your essence. When you Help an Ally with a Spellcast Roll, you can roll a **d8** as your advantage die. Once per long rest, after an ally has made a Spellcast Roll with your help, you can swap the results of their Duality Dice."
      }
    ],
    "mastery": [
      {
        "name": "Arcane Charge",
        "text": "You can gather magical energy to enhance your capabilities. When you take magic damage, you become _Charged_. Alternatively, you can **spend 2 Hope** to become _Charged_. When you successfully make an attack that deals magic damage while _Charged_, you can clear your _Charge_ to either gain a +10 bonus to the damage roll or gain a +3 bonus to the Difficulty of a reaction roll the spell causes the target to make. You stop being _Charged_ at your next long rest."
      }
    ]
  },
  {
    "name": "School of Knowledge",
    "description": "Play the School of Knowledge if you want a keen understanding of the world around you.",
    "spellcastTrait": "Knowledge",
    "foundation": [
      {
        "name": "Prepared",
        "text": "Take an additional domain card of your level or lower from a domain you have access to."
      },
      {
        "name": "Adept",
        "text": "When you Utilize an Experience, you can **mark a Stress** instead of spending a Hope. If you do, double your Experience modifier for that roll."
      }
    ],
    "specialization": [
      {
        "name": "Accomplished",
        "text": "Take an additional domain card of your level or lower from a domain you have access to."
      },
      {
        "name": "Perfect Recall",
        "text": "Once per rest, when you recall a domain card in your vault, you can reduce its Recall Cost by 1."
      }
    ],
    "mastery": [
      {
        "name": "Brilliant",
        "text": "Take an additional domain card of your level or lower from a domain you have access to."
      },
      {
        "name": "Honed Expertise",
        "text": "When you use an Experience, roll a **d6.** On a result of 5 or higher, you can use it without spending Hope."
      }
    ]
  },
  {
    "name": "School of War",
    "description": "Play the School of War if you want to utilize trained magic for violence.",
    "spellcastTrait": "Knowledge",
    "foundation": [
      {
        "name": "Battlemage",
        "text": "You've focused your studies on becoming an unconquerable force on the battlefield. Gain an additional Hit Point slot."
      },
      {
        "name": "Face Your Fear",
        "text": "When you succeed with Fear on an attack roll, you deal an extra **1d10** magic damage."
      }
    ],
    "specialization": [
      {
        "name": "Conjure Shield",
        "text": "You can maintain a protective barrier of magic. While you have at least 2 Hope, you add your Proficiency to your Evasion."
      },
      {
        "name": "Fueled by Fear",
        "text": "The extra magic damage from your \"Face Your Fear\" feature increases to **2d10**."
      }
    ],
    "mastery": [
      {
        "name": "Thrive in Chaos",
        "text": "When you succeed on an attack, you can **mark a Stress** after rolling damage to force the target to mark an additional Hit Point."
      },
      {
        "name": "Have No Fear",
        "text": "The extra magic damage from your \"Face Your Fear\" feature increases to **3d10.**"
      }
    ]
  },
  {
    "name": "Stalwart",
    "description": "Play the Stalwart if you want to take heavy blows and keep fighting.",
    "spellcastTrait": "",
    "foundation": [
      {
        "name": "Unwavering",
        "text": "Gain a permanent +1 bonus to your damage thresholds."
      },
      {
        "name": "Iron Will",
        "text": "When you take physical damage, you can **mark an additional Armor Slot** to reduce the severity."
      }
    ],
    "specialization": [
      {
        "name": "Unrelenting",
        "text": "Gain a permanent +2 bonus to your damage thresholds."
      },
      {
        "name": "Partners-in-Arms",
        "text": "When an ally within Very Close range takes damage, you can **mark an Armor Slot** to reduce the severity by one threshold."
      }
    ],
    "mastery": [
      {
        "name": "Undaunted",
        "text": "Gain a permanent +3 bonus to your damage thresholds."
      },
      {
        "name": "Loyal Protector",
        "text": "When an ally within Close range has 2 or fewer Hit Points and would take damage, you can **mark a Stress** to sprint to their side and take the damage instead."
      }
    ]
  },
  {
    "name": "Syndicate",
    "description": "Play the Syndicate if you want to have a web of contacts everywhere you go.",
    "spellcastTrait": "Finesse",
    "foundation": [
      {
        "name": "Well-Connected",
        "text": "When you arrive in a prominent town or environment, you know somebody who calls this place home. Give them a name, note how you think they could be useful, and choose one fact from the following list:\n\n- They owe me a favor, but they'll be hard to find.\n- They're going to ask for something in exchange.\n- They're always in a great deal of trouble.\n- We used to be together. It's a long story.\n- We didn't part on great terms."
      }
    ],
    "specialization": [
      {
        "name": "Contacts Everywhere",
        "text": "Once per session, you can briefly call on a shady contact. Choose one of the following benefits and describe what brought them here to help you in this moment:\n\n- They provide 1 handful of gold, a unique tool, or a mundane object that the situation requires.\n- On your next action roll, their help provides a +3 bonus to the result of your Hope or Fear Die.\n- The next time you deal damage, they snipe from the shadows, adding **2d8** to your damage roll."
      }
    ],
    "mastery": [
      {
        "name": "Reliable Backup",
        "text": "You can use your \"Contacts Everywhere\" feature three times per session. The following options are added to the list of benefits you can choose from when you use that feature:\n\n- When you mark 1 or more Hit Points, they can rush out to shield you, reducing the Hit Points marked by 1.\n- When you make a Presence Roll in conversation, they back you up. You can roll a **d20** as your Hope Die."
      }
    ]
  },
  {
    "name": "Troubadour",
    "description": "Play the Troubadour if you want to play music to bolster your allies.",
    "spellcastTrait": "Presence",
    "foundation": [
      {
        "name": "Gifted Performer",
        "text": "You can play three different types of songs, once each per long rest; describe how you perform for others to gain the listed benefit:\n\n- _Relaxing Song:_ You and all allies within Close range clear a Hit Point.\n- _Epic Song:_ Make a target within Close range temporarily _Vulnerable._\n- _Heartbreaking Song:_ You and all allies within Close range gain a Hope."
      }
    ],
    "specialization": [
      {
        "name": "Maestro",
        "text": "Your rallying songs steel the courage of those who listen. When you give a Rally Die to an ally, they can gain a Hope or clear a Stress."
      }
    ],
    "mastery": [
      {
        "name": "Virtuoso",
        "text": "You are among the greatest of your craft and your skill is boundless. You can perform each of your \"Gifted Performer\" feature's songs twice per long rest."
      }
    ]
  },
  {
    "name": "Vengeance",
    "description": "Play the Vengeance if you want to strike down enemies who harm you or your allies.",
    "spellcastTrait": "",
    "foundation": [
      {
        "name": "At Ease",
        "text": "Gain an additional Stress slot."
      },
      {
        "name": "Revenge",
        "text": "When an adversary within Melee range succeeds on an attack against you, you can **mark 2 Stress** to force the attacker to mark a Hit Point."
      }
    ],
    "specialization": [
      {
        "name": "Act of Reprisal",
        "text": "When an adversary damages an ally within Melee range, you gain a +1 bonus to your Proficiency for the next successful attack you make against that adversary."
      }
    ],
    "mastery": [
      {
        "name": "Nemesis",
        "text": "**Spend 2 Hope** to _Prioritize_ an adversary until your next rest. When you make an attack against your _Prioritized_ adversary, you can swap the results of your Hope and Fear Dice. You can only _Prioritize_ one adversary at a time."
      }
    ]
  },
  {
    "name": "Warden of Renewal",
    "description": "_Play the Warden of Renewal if you want to use powerful magic to heal your party._",
    "spellcastTrait": "Instinct",
    "foundation": [
      {
        "name": "Clarity of Nature",
        "text": "Once per long rest, you can create a space of natural serenity within Close range. When you spend a few minutes resting within the space, clear Stress equal to your Instinct, distributed as you choose between you and your allies."
      },
      {
        "name": "Regeneration",
        "text": "Touch a creature and **spend 3 Hope.** That creature clears **1d4** Hit Points."
      }
    ],
    "specialization": [
      {
        "name": "Regenerative Reach",
        "text": "You can target creatures within Very Close range with your \"Regeneration\" feature."
      },
      {
        "name": "Warden's Protection",
        "text": "Once per long rest, **spend 2 Hope** to clear 2 Hit Points on **1d4** allies within Close range."
      }
    ],
    "mastery": [
      {
        "name": "Defender",
        "text": "Your animal transformation embodies a healing guardian spirit. When you're in Beastform and an ally within Close range marks 2 or more Hit Points, you can **mark a Stress** to reduce the number of Hit Points they mark by 1."
      }
    ]
  },
  {
    "name": "Warden of the Elements",
    "description": "Play the Warden of the Elements if you want to embody the natural elements of the wild.",
    "spellcastTrait": "Instinct",
    "foundation": [
      {
        "name": "Elemental Incarnation",
        "text": "**Mark a Stress** to _Channel_ one of the following elements until you take Severe damage or until your next rest:\n\n- _Fire:_ When an adversary within Melee range deals damage to you, they take **1d10** magic damage.\n- _Earth:_ Gain a bonus to your damage thresholds equal to your Proficiency.\n- _Water:_ When you deal damage to an adversary within Melee range, all other adversaries within Very Close range must mark a Stress.\n- _Air:_ You can hover, gaining advantage on Agility Rolls."
      }
    ],
    "specialization": [
      {
        "name": "Elemental Aura",
        "text": "Once per rest while _Channeling_, you can assume an aura matching your element. The aura affects targets within Close range until your _Channeling_ ends.\n\n- _Fire:_ When an adversary marks 1 or more Hit Points, they must also mark a Stress.\n- _Earth:_ Your allies gain a +1 bonus to Strength.\n- _Water:_ When an adversary deals damage to you, you can **mark a Stress** to move them anywhere within Very Close range of where they are.\n- _Air:_ When you or an ally takes damage from an attack beyond Melee range, reduce the damage by **1d8**."
      }
    ],
    "mastery": [
      {
        "name": "Elemental Dominion",
        "text": "You further embody your element. While _Channeling_, you gain the following benefit:\n\n- _Fire:_ You gain a +1 bonus to your Proficiency for attacks and spells that deal damage.\n- _Earth:_ When you would mark Hit Points, roll a **d6** per Hit Point marked. For each result of 6, reduce the number of Hit Points you mark by 1.\n- _Water:_ When an attack against you succeeds, you can **mark a Stress** to make the attacker temporarily _Vulnerable_.\n- _Air:_ You gain a +1 bonus to your Evasion and can fly."
      }
    ]
  },
  {
    "name": "Wayfinder",
    "description": "Play the Wayfinder if you want to hunt your prey and strike with deadly force.",
    "spellcastTrait": "Agility",
    "foundation": [
      {
        "name": "Ruthless Predator",
        "text": "When you make a damage roll, you can **mark a Stress** to gain a +1 bonus to your Proficiency. Additionally, when you deal Severe damage to an adversary, they must mark a Stress."
      },
      {
        "name": "Path Forward",
        "text": "When you're traveling to a place you've previously visited or you carry an object that has been at the location before, you can identify the shortest, most direct path to your destination."
      }
    ],
    "specialization": [
      {
        "name": "Elusive Predator",
        "text": "When your Focus makes an attack against you, you gain a +2 bonus to your Evasion against the attack."
      }
    ],
    "mastery": [
      {
        "name": "Apex Predator",
        "text": "Before you make an attack roll against your _Focus_, you can **spend a Hope.** On a successful attack, you remove a Fear from the GM's Fear pool."
      }
    ]
  },
  {
    "name": "Winged Sentinel",
    "description": "Play the Winged Sentinel if you want to take flight and strike crushing blows from the sky.",
    "spellcastTrait": "Strength",
    "foundation": [
      {
        "name": "Wings of Light",
        "text": "You can fly. While flying, you can do the following:\n\n- **Mark a Stress** to pick up and carry another willing creature approximately your size or smaller.\n- **Spend a Hope** to deal an extra **1d8** damage on a successful attack."
      }
    ],
    "specialization": [
      {
        "name": "Ethereal Visage",
        "text": "Your supernatural visage strikes awe and fear. While flying, you have advantage on Presence Rolls. When you succeed with Hope on a Presence Roll, you can remove a Fear from the GM's Fear pool instead of gaining Hope."
      }
    ],
    "mastery": [
      {
        "name": "Ascendant",
        "text": "Gain a permanent +4 bonus to your Severe damage threshold."
      },
      {
        "name": "Power of the Gods",
        "text": "While flying, you deal an extra **1d12** damage instead of 1d8 from your \"Wings of Light\" feature."
      }
    ]
  },
  {
    "name": "Wordsmith",
    "description": "Play the Wordsmith if you want to use clever wordplay and captivate crowds.",
    "spellcastTrait": "Presence",
    "foundation": [
      {
        "name": "Rousing Speech",
        "text": "Once per long rest, you can give a heartfelt, inspiring speech. All allies within Far range clear 2 Stress."
      },
      {
        "name": "Heart of a Poet",
        "text": "After you make an action roll to impress, persuade, or offend someone, you can **spend a Hope** to add a **d4** to the roll."
      }
    ],
    "specialization": [
      {
        "name": "Eloquent",
        "text": "Your moving words boost morale. Once per session, when you encourage an ally, you can do one of the following:\n\n- Allow them to find a mundane object or tool they need.\n- Help an Ally without spending Hope.\n- Give them an additional downtime move during their next rest."
      }
    ],
    "mastery": [
      {
        "name": "Epic Poetry",
        "text": "Your Rally Die increases to a **d10.** Additionally, when you Help an Ally, you can narrate the moment as if you were writing the tale of their heroism in a memoir. When you do, roll a **d10** as your advantage die."
      }
    ]
  }
] as const
