"use client"

import type { CharacterData } from "@/lib/character-types"
import type { ComboboxItem } from "@/components/ui/combobox"
import type { ApiClass, ApiSubclass, ApiAncestry, ApiCommunity, ApiWeapon, ApiArmor, ApiDomainCard } from "@/lib/srd/types"
import { TraitsDefenseSection } from "./traits-defense-section"
import { HpStressHopeSection } from "./hp-stress-hope-section"
import { ExperiencesSection } from "./experiences-section"
import { DomainCardsSection } from "./domain-cards-section"
import { FeaturesSection } from "./features-section"

interface StatsTabProps {
  character: CharacterData
  tier: number
  update: (patch: Partial<CharacterData>) => void
  editing: boolean
  domainCardItems: ComboboxItem[]
  selectedClass: ApiClass | undefined
  selectedSubclass: ApiSubclass | undefined
  selectedAncestry: ApiAncestry | undefined
  selectedSecondaryAncestry: ApiAncestry | undefined
  selectedCommunity: ApiCommunity | undefined
}

export function StatsTab({
  character: c,
  tier,
  update,
  editing,
  domainCardItems,
  selectedClass,
  selectedSubclass,
  selectedAncestry,
  selectedSecondaryAncestry,
  selectedCommunity,
}: StatsTabProps) {
  return (
    <>
      <TraitsDefenseSection character={c} tier={tier} update={update} editing={editing} />
      <HpStressHopeSection character={c} update={update} editing={editing} />
      <ExperiencesSection experiences={c.experiences} update={update} editing={editing} />
      <DomainCardsSection
        domainCards={c.domainCards}
        domainCardItems={domainCardItems}
        thresholdBonuses={c.thresholdBonuses ?? {}}
        proficiency={c.proficiency}
        update={update}
        editing={editing}
      />
      <FeaturesSection
        character={c}
        update={update}
        selectedClass={selectedClass}
        selectedSubclass={selectedSubclass}
        selectedAncestry={selectedAncestry}
        selectedSecondaryAncestry={selectedSecondaryAncestry}
        selectedCommunity={selectedCommunity}
      />
    </>
  )
}
