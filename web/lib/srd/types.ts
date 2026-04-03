export interface ApiFeature {
  id: string
  name: string
  text: string
}

export interface ApiClass {
  id: string
  name: string
  evasion: number
  hp: number
  subclasses: { id: string; name: string }[]
  domains: { id: string; name: string }[]
  features: ApiFeature[]
  hopeFeature?: ApiFeature
}

export interface ApiAncestry {
  id: string
  name: string
  description: string
  features: ApiFeature[]
}

export interface ApiCommunity {
  id: string
  name: string
  description: string
  note: string
  features: ApiFeature[]
}

export interface ApiSubclass {
  id: string
  name: string
  description: string
  spellcastTrait: string
  className: string
  features: (ApiFeature & { tier: string })[]
}

export interface ApiWeapon {
  id: string
  name: string
  tier: number
  type: string
  damageType: string
  trait: string
  range: string
  damage: string
  burden: string
  feature: string | null
}

export interface ApiArmor {
  id: string
  name: string
  tier: number
  baseScore: number
  baseThresholds: string
  evasionModifier: number | null
  feature: string | null
}

export interface ApiDomainCard {
  id: string
  name: string
  level: number
  recallCost: number
  description: string
  domainName: string
}
