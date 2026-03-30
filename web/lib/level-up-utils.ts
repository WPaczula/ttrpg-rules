import { type CharacterData, type DomainCard, type Experience } from "@/lib/character-types"
import { SRD_DOMAIN_CARDS } from "@/lib/srd-data"

// ─── Types ──────────────────────────────────────────────────────────────────

export type WizardStep = "idle" | "tier-achievement" | "advancements" | "domain-card" | "confirm"

export type AdvancementChoice =
  | { type: "increase-traits"; traits: [string, string] }
  | { type: "add-hp" }
  | { type: "add-stress" }
  | { type: "boost-experiences"; experienceIds: string[] }
  | { type: "extra-domain-card" }
  | { type: "increase-evasion" }

// ─── Constants ──────────────────────────────────────────────────────────────

export const TRAIT_KEYS = ["agility", "strength", "finesse", "instinct", "presence", "knowledge"] as const

export const TRAIT_LABELS: Record<string, string> = {
  agility: "AGI",
  strength: "STR",
  finesse: "FIN",
  instinct: "INS",
  presence: "PRE",
  knowledge: "KNO",
}

export const SLOT_LIMITS = {
  traits: 3,
  hp: 2,
  stress: 2,
  experiences: 1,
  domainCard: 1,
  evasion: 1,
} as const

export const EMPTY_SLOTS = { traits: 0, hp: 0, stress: 0, experiences: 0, domainCard: 0, evasion: 0 }

// ─── Helpers ────────────────────────────────────────────────────────────────

export function isTierTransition(newLevel: number): boolean {
  return newLevel === 2 || newLevel === 5 || newLevel === 8
}

export function getTierSlots(character: CharacterData, tier: number) {
  return character.advancementSlots?.[tier] ?? { ...EMPTY_SLOTS }
}

export function slotAvailable(
  slots: typeof EMPTY_SLOTS,
  advancements: AdvancementChoice[],
  key: keyof typeof SLOT_LIMITS
): boolean {
  const currentlyPicked = advancements.filter((a) => {
    switch (key) {
      case "traits": return a.type === "increase-traits"
      case "hp": return a.type === "add-hp"
      case "stress": return a.type === "add-stress"
      case "experiences": return a.type === "boost-experiences"
      case "domainCard": return a.type === "extra-domain-card"
      case "evasion": return a.type === "increase-evasion"
    }
  }).length
  return (slots[key] + currentlyPicked) < SLOT_LIMITS[key]
}

// ─── Apply Level Up ─────────────────────────────────────────────────────────

export interface ApplyLevelUpOptions {
  nextLevel: number
  nextTier: number
  tierTransition: boolean
  advancements: AdvancementChoice[]
  newDomainCard: string
  newExperienceName: string
}

export function applyLevelUp(prev: CharacterData, opts: ApplyLevelUpOptions): CharacterData {
  const { nextLevel, nextTier, tierTransition, advancements, newDomainCard, newExperienceName } = opts

  const patch: Partial<CharacterData> = {
    level: nextLevel,
  }

  if (tierTransition) {
    patch.proficiency = (prev.proficiency ?? 1) + 1
    const newExp: Experience = {
      id: crypto.randomUUID(),
      name: newExperienceName || "New experience",
      modifier: 2,
    }
    patch.experiences = [...prev.experiences, newExp]
    if (nextLevel >= 5) {
      patch.markedTraits = []
    }
  }

  const allSlots = { ...(prev.advancementSlots ?? {}) }
  const newSlots = { ...(allSlots[nextTier] ?? { ...EMPTY_SLOTS }) }

  for (const adv of advancements) {
    switch (adv.type) {
      case "increase-traits": {
        const [t1, t2] = adv.traits as [keyof CharacterData, keyof CharacterData]
        ;(patch as Record<string, unknown>)[t1] =
          (((patch as Record<string, unknown>)[t1] as number | undefined) ?? (prev[t1] as number)) + 1
        ;(patch as Record<string, unknown>)[t2] =
          (((patch as Record<string, unknown>)[t2] as number | undefined) ?? (prev[t2] as number)) + 1
        patch.markedTraits = [...(patch.markedTraits ?? prev.markedTraits ?? []), t1, t2]
        newSlots.traits++
        break
      }
      case "add-hp":
        patch.hpTotal = (patch.hpTotal ?? prev.hpTotal) + 1
        newSlots.hp++
        break
      case "add-stress":
        patch.stressTotal = (patch.stressTotal ?? prev.stressTotal) + 1
        newSlots.stress++
        break
      case "boost-experiences": {
        const exps = patch.experiences ?? [...prev.experiences]
        const boostedIds = new Set(adv.experienceIds)
        patch.experiences = exps.map((e) =>
          boostedIds.has(e.id) ? { ...e, modifier: Math.min(6, e.modifier + 1) } : e
        )
        newSlots.experiences++
        break
      }
      case "extra-domain-card":
        newSlots.domainCard++
        break
      case "increase-evasion":
        patch.evasion = (patch.evasion ?? prev.evasion) + 1
        newSlots.evasion++
        break
    }
  }

  allSlots[nextTier] = newSlots
  patch.advancementSlots = allSlots

  if (newDomainCard) {
    const match = SRD_DOMAIN_CARDS.find((dc) => dc.name === newDomainCard)
    const card: DomainCard = {
      id: crypto.randomUUID(),
      name: newDomainCard,
      level: match?.level ?? nextLevel,
      domain: match?.domain ?? "",
    }
    patch.domainCards = [...(patch.domainCards ?? prev.domainCards), card]
  }

  return { ...prev, ...patch }
}
