"use client"

import { Textarea } from "@/components/ui/textarea"
import type { CharacterData } from "@/lib/character-types"
import type { SrdAncestry, SrdClass, SrdCommunity, SrdSubclass } from "@/lib/srd-data"
import { Scroll } from "lucide-react"
import { Section, FeatureList } from "./primitives"

interface FeaturesSectionProps {
  character: CharacterData
  update: (patch: Partial<CharacterData>) => void
  selectedClass: SrdClass | undefined
  selectedSubclass: SrdSubclass | undefined
  selectedAncestry: SrdAncestry | undefined
  selectedCommunity: SrdCommunity | undefined
}

export function FeaturesSection({
  character: c,
  update,
  selectedClass,
  selectedSubclass,
  selectedAncestry,
  selectedCommunity,
}: FeaturesSectionProps) {
  return (
    <Section icon={<Scroll className="w-4 h-4" />} title="Features & Abilities">
      <div className="space-y-4">
        {selectedClass && (
          <div className="space-y-2">
            <FeatureList label={`${selectedClass.name} — Hope Feature`} features={[selectedClass.hopeFeature]} />
            <FeatureList label={`${selectedClass.name} — Class Features`} features={selectedClass.features} />
          </div>
        )}
        {selectedSubclass && (
          <div className="space-y-2">
            <FeatureList label={`${selectedSubclass.name} — Foundation`} features={selectedSubclass.foundation} />
            <FeatureList label={`${selectedSubclass.name} — Specialization`} features={selectedSubclass.specialization} />
            <FeatureList label={`${selectedSubclass.name} — Mastery`} features={selectedSubclass.mastery} />
            {selectedSubclass.spellcastTrait && (
              <div className="bg-purple-deep/30 border border-border rounded-md px-3 py-2">
                <span className="text-xs text-muted-foreground">Spellcast Trait: </span>
                <span className="text-xs font-medium text-gold">{selectedSubclass.spellcastTrait}</span>
              </div>
            )}
          </div>
        )}
        {selectedAncestry && (
          <FeatureList label={`${selectedAncestry.name} — Ancestry Features`} features={selectedAncestry.features} />
        )}
        {selectedCommunity && (
          <FeatureList label={`${selectedCommunity.name} — Community Feature`} features={selectedCommunity.features} />
        )}
        {!selectedClass && !selectedSubclass && !selectedAncestry && !selectedCommunity && (
          <p className="text-xs text-muted-foreground italic">
            Select a class, subclass, ancestry, or community to see their features here.
          </p>
        )}
        <Textarea
          value={c.features}
          onChange={(e) => update({ features: e.target.value })}
          placeholder="Additional custom features or notes…"
          className="min-h-[80px] bg-input border-border text-sm resize-none"
        />
      </div>
    </Section>
  )
}
