export interface CachedClass {
  id: string
  evasion: number
  hp: number
  subclassIds: string[]
  domainNames: string[]
}

export interface CachedAncestry {
  id: string
  features: { id: string; name: string; text: string }[]
}

export interface SrdIdCache {
  classByName: Map<string, CachedClass>
  subclassByName: Map<string, { id: string; className: string }>
  ancestryByName: Map<string, CachedAncestry>
  communityByName: Map<string, { id: string }>
  weaponByName: Map<string, { id: string }>
  armorByName: Map<string, { id: string }>
  domainCardByName: Map<string, { id: string }>
}

export const srdIdCache: SrdIdCache = {
  classByName: new Map(),
  subclassByName: new Map(),
  ancestryByName: new Map(),
  communityByName: new Map(),
  weaponByName: new Map(),
  armorByName: new Map(),
  domainCardByName: new Map(),
}
