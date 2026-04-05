import type { CharacterData } from "@/lib/character-types"
import { srdIdCache } from "@/lib/srd/srd-id-cache"
import { apiFetch } from "@/lib/srd/api-client"

export interface SyncExperiencePayload {
  name: string
  modifier: number
}

export interface SyncDomainCardPayload {
  name: string
}

export interface SyncCharacterPayload {
  name: string
  level: number
  class: string
  subclass: string
  ancestry: string
  secondaryAncestry?: string
  ancestryFeature: string
  secondaryAncestryFeature?: string
  community: string
  agility: number
  strength: number
  finesse: number
  instinct: number
  presence: number
  knowledge: number
  hpTotal: number
  hpMarked: number
  stressTotal: number
  stressMarked: number
  evasion: number
  armorMarked: number
  hope: number
  goldHandfuls: number
  goldBags: number
  goldChests: number
  proficiency: number
  markedTraits: string[]
  experiences: SyncExperiencePayload[]
  domainCards: SyncDomainCardPayload[]
  primaryWeapon?: string
  secondaryWeapon?: string
  armorName?: string
  items: string[]
  notes: string
}

/** Returns false if required identity fields are not set (skip sync). */
export function canSync(data: CharacterData): boolean {
  return !!(
    data.class &&
    data.subclass &&
    data.ancestry &&
    data.ancestryFeature &&
    data.community &&
    srdIdCache.classByName.has(data.class) &&
    srdIdCache.ancestryByName.has(data.ancestry) &&
    srdIdCache.communityByName.has(data.community)
  )
}

export function buildSyncPayload(data: CharacterData): SyncCharacterPayload {
  return {
    name: data.name,
    level: data.level,
    class: data.class,
    subclass: data.subclass,
    ancestry: data.ancestry,
    secondaryAncestry: data.secondaryAncestry || undefined,
    ancestryFeature: data.ancestryFeature,
    secondaryAncestryFeature: data.secondaryAncestryFeature || undefined,
    community: data.community,
    agility: data.agility,
    strength: data.strength,
    finesse: data.finesse,
    instinct: data.instinct,
    presence: data.presence,
    knowledge: data.knowledge,
    hpTotal: data.hpTotal,
    hpMarked: data.hpMarked,
    stressTotal: data.stressTotal,
    stressMarked: data.stressMarked,
    evasion: data.evasion,
    armorMarked: data.armorMarked,
    hope: data.hope,
    goldHandfuls: data.goldHandfuls,
    goldBags: data.goldBags,
    goldChests: data.goldChests,
    proficiency: data.proficiency,
    markedTraits: data.markedTraits,
    experiences: data.experiences.map((e) => ({ name: e.name, modifier: e.modifier })),
    domainCards: data.domainCards.map((dc) => ({ name: dc.name })),
    primaryWeapon: data.primaryWeapon || undefined,
    secondaryWeapon: data.secondaryWeapon || undefined,
    armorName: data.armorName || undefined,
    items: data.items ?? [],
    notes: data.notes,
  }
}

export async function syncCharacterToApi(
  data: CharacterData,
  token: string | null,
): Promise<void> {
  if (!canSync(data)) return
  const payload = buildSyncPayload(data)
  const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000"
  const headers: Record<string, string> = { "Content-Type": "application/json" }
  if (token) headers["Authorization"] = `Bearer ${token}`
  const res = await fetch(`${BASE}/characters/sync`, {
    method: "PUT",
    headers,
    body: JSON.stringify(payload),
  })
  if (!res.ok) throw new Error(`Character sync failed: ${res.status}`)
}
