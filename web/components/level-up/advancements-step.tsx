"use client"

import { Badge } from "@/components/ui/badge"
import { type CharacterData, formatModifier } from "@/lib/character-types"
import {
  type AdvancementChoice,
  type EMPTY_SLOTS,
  TRAIT_KEYS,
  TRAIT_LABELS,
  SLOT_LIMITS,
} from "@/lib/level-up-utils"
import { AdvancementOption, StepHeader } from "./primitives"
import {
  Star,
  Heart,
  Zap,
  Sparkles,
  BookOpen,
  Eye,
  Swords,
} from "lucide-react"

interface AdvancementsStepProps {
  character: CharacterData
  advancements: AdvancementChoice[]
  setAdvancements: React.Dispatch<React.SetStateAction<AdvancementChoice[]>>
  traitPicks: string[]
  setTraitPicks: React.Dispatch<React.SetStateAction<string[]>>
  canAddAdvancement: boolean
  slotAvailable: (key: keyof typeof SLOT_LIMITS) => boolean
  slots: typeof EMPTY_SLOTS
  setNewDomainCard: React.Dispatch<React.SetStateAction<string>>
}

export function AdvancementsStep({
  character: c,
  advancements,
  setAdvancements,
  traitPicks,
  setTraitPicks,
  canAddAdvancement,
  slotAvailable,
  slots,
  setNewDomainCard,
}: AdvancementsStepProps) {
  const slotsUsed = advancements.length

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <StepHeader
          icon={<Swords className="w-5 h-5" />}
          title="Choose Advancements"
        />
        <Badge variant="tier" className="ml-auto text-xs">
          {slotsUsed}/2
        </Badge>
      </div>
      <p className="text-sm text-muted-foreground">
        Choose two options from the list below and mark them.
      </p>

      <div className="space-y-3">
        {/* Increase Traits (3 slots) */}
        <AdvancementOption
          title="Increase Traits"
          description={`+1 to two unmarked traits and mark them. (${slots.traits}/${SLOT_LIMITS.traits} used)`}
          icon={<Star className="w-4 h-4" />}
          disabled={!canAddAdvancement || !slotAvailable("traits")}
          selected={advancements.some((a) => a.type === "increase-traits")}
          onSelect={() => {
            if (advancements.some((a) => a.type === "increase-traits")) {
              setAdvancements((prev) =>
                prev.filter((a) => a.type !== "increase-traits")
              )
              setTraitPicks([])
            }
          }}
        >
          {(canAddAdvancement || advancements.some((a) => a.type === "increase-traits")) &&
            slotAvailable("traits") && (
            <div className="space-y-2 mt-2">
              <p className="text-xs text-muted-foreground">
                Select 2 unmarked traits to increase:
              </p>
              <div className="grid grid-cols-3 gap-2">
                {TRAIT_KEYS.map((trait) => {
                  const picked = traitPicks.includes(trait)
                  const locked = advancements.some((a) => a.type === "increase-traits")
                  const alreadyMarked = (c.markedTraits ?? []).includes(trait)
                  return (
                    <button
                      key={trait}
                      disabled={alreadyMarked || locked || (!picked && traitPicks.length >= 2)}
                      onClick={() => {
                        const next = picked
                          ? traitPicks.filter((t) => t !== trait)
                          : [...traitPicks, trait]
                        setTraitPicks(next)
                        if (next.length === 2) {
                          setAdvancements((prev) => [
                            ...prev.filter(
                              (a) => a.type !== "increase-traits"
                            ),
                            {
                              type: "increase-traits",
                              traits: [next[0], next[1]],
                            },
                          ])
                        } else {
                          setAdvancements((prev) =>
                            prev.filter((a) => a.type !== "increase-traits")
                          )
                        }
                      }}
                      className={`px-3 py-2 rounded-md border text-xs font-medium transition-all active:scale-95 ${
                        alreadyMarked
                          ? "bg-muted/30 border-border text-muted-foreground/40 cursor-not-allowed line-through"
                          : picked
                            ? "bg-gold/15 border-gold/40 text-gold"
                            : "bg-input border-border text-muted-foreground hover:border-gold/30 hover:text-foreground"
                      } ${locked && !alreadyMarked ? "opacity-60" : ""}`}
                    >
                      {TRAIT_LABELS[trait]}
                      <span className="ml-1 text-[10px]">
                        ({formatModifier(c[trait as keyof CharacterData] as number)})
                      </span>
                      {alreadyMarked && <span className="ml-0.5 text-[9px]"> marked</span>}
                    </button>
                  )
                })}
              </div>
            </div>
          )}
        </AdvancementOption>

        {/* Add HP Slot (2 slots) */}
        <AdvancementOption
          title="Add HP Slot"
          description={`Permanently gain one Hit Point slot. (${slots.hp}/${SLOT_LIMITS.hp} used)`}
          icon={<Heart className="w-4 h-4" />}
          disabled={!canAddAdvancement || !slotAvailable("hp")}
          selected={advancements.some((a) => a.type === "add-hp")}
          onSelect={() => {
            if (advancements.some((a) => a.type === "add-hp")) {
              setAdvancements((prev) => prev.filter((a) => a.type !== "add-hp"))
            } else if (canAddAdvancement && slotAvailable("hp")) {
              setAdvancements((prev) => [...prev, { type: "add-hp" }])
            }
          }}
        />

        {/* Add Stress Slot (2 slots) */}
        <AdvancementOption
          title="Add Stress Slot"
          description={`Permanently gain one Stress slot. (${slots.stress}/${SLOT_LIMITS.stress} used)`}
          icon={<Zap className="w-4 h-4" />}
          disabled={!canAddAdvancement || !slotAvailable("stress")}
          selected={advancements.some((a) => a.type === "add-stress")}
          onSelect={() => {
            if (advancements.some((a) => a.type === "add-stress")) {
              setAdvancements((prev) => prev.filter((a) => a.type !== "add-stress"))
            } else if (canAddAdvancement && slotAvailable("stress")) {
              setAdvancements((prev) => [...prev, { type: "add-stress" }])
            }
          }}
        />

        {/* Boost Experiences (1 slot) */}
        <AdvancementOption
          title="Boost Experiences"
          description={`+1 bonus to two Experiences. Pick two below. (${slots.experiences}/${SLOT_LIMITS.experiences} used)`}
          icon={<Sparkles className="w-4 h-4" />}
          disabled={!canAddAdvancement || !slotAvailable("experiences")}
          selected={advancements.some((a) => a.type === "boost-experiences")}
          onSelect={() => {
            if (advancements.some((a) => a.type === "boost-experiences")) {
              setAdvancements((prev) => prev.filter((a) => a.type !== "boost-experiences"))
            } else if (canAddAdvancement && slotAvailable("experiences")) {
              setAdvancements((prev) => [...prev, { type: "boost-experiences", experienceIds: [] }])
            }
          }}
        >
          {advancements.some((a) => a.type === "boost-experiences") && (
            <div className="mt-2 space-y-1">
              <p className="text-[11px] text-muted-foreground mb-1.5">
                Choose 2 experiences to boost:
              </p>
              <div className="flex flex-wrap gap-1.5">
                {c.experiences.map((exp) => {
                  const boostAdv = advancements.find((a) => a.type === "boost-experiences") as
                    | { type: "boost-experiences"; experienceIds: string[] }
                    | undefined
                  const picked = boostAdv?.experienceIds.includes(exp.id) ?? false
                  const locked = (boostAdv?.experienceIds.length ?? 0) >= 2

                  return (
                    <button
                      key={exp.id}
                      type="button"
                      disabled={locked && !picked}
                      onClick={() => {
                        setAdvancements((prev) => {
                          const idx = prev.findIndex((a) => a.type === "boost-experiences")
                          if (idx === -1) return prev
                          const cur = prev[idx] as { type: "boost-experiences"; experienceIds: string[] }
                          let next: string[]
                          if (picked) {
                            next = cur.experienceIds.filter((id) => id !== exp.id)
                          } else if (cur.experienceIds.length < 2) {
                            next = [...cur.experienceIds, exp.id]
                          } else {
                            return prev
                          }
                          const updated = [...prev]
                          updated[idx] = { type: "boost-experiences", experienceIds: next }
                          return updated
                        })
                      }}
                      className={`px-3 py-2 rounded-md border text-xs font-medium transition-all active:scale-95 ${
                        picked
                          ? "bg-gold/15 border-gold/40 text-gold"
                          : "bg-input border-border text-muted-foreground hover:border-gold/30 hover:text-foreground"
                      } ${locked && !picked ? "opacity-60" : ""}`}
                    >
                      {exp.name}
                      <span className="ml-1 text-[10px]">
                        ({formatModifier(exp.modifier)})
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>
          )}
        </AdvancementOption>

        {/* Extra Domain Card (1 slot) */}
        <AdvancementOption
          title="Extra Domain Card"
          description={`Choose an additional domain card of your level or lower. (${slots.domainCard}/${SLOT_LIMITS.domainCard} used)`}
          icon={<BookOpen className="w-4 h-4" />}
          disabled={!canAddAdvancement || !slotAvailable("domainCard")}
          selected={advancements.some((a) => a.type === "extra-domain-card")}
          onSelect={() => {
            if (advancements.some((a) => a.type === "extra-domain-card")) {
              setAdvancements((prev) => prev.filter((a) => a.type !== "extra-domain-card"))
              setNewDomainCard("")
            } else if (canAddAdvancement && slotAvailable("domainCard")) {
              setAdvancements((prev) => [...prev, { type: "extra-domain-card" }])
            }
          }}
        />

        {/* Increase Evasion (1 slot) */}
        <AdvancementOption
          title="Increase Evasion"
          description={`Permanently gain +1 to your Evasion. (${slots.evasion}/${SLOT_LIMITS.evasion} used)`}
          icon={<Eye className="w-4 h-4" />}
          disabled={!canAddAdvancement || !slotAvailable("evasion")}
          selected={advancements.some((a) => a.type === "increase-evasion")}
          onSelect={() => {
            if (advancements.some((a) => a.type === "increase-evasion")) {
              setAdvancements((prev) => prev.filter((a) => a.type !== "increase-evasion"))
            } else if (canAddAdvancement && slotAvailable("evasion")) {
              setAdvancements((prev) => [...prev, { type: "increase-evasion" }])
            }
          }}
        />
      </div>
    </div>
  )
}
