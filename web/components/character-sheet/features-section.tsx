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
  selectedSecondaryAncestry: SrdAncestry | undefined
  selectedCommunity: SrdCommunity | undefined
}

export function FeaturesSection({
  character: c,
  update,
  selectedClass,
  selectedSubclass,
  selectedAncestry,
  selectedSecondaryAncestry,
  selectedCommunity,
}: FeaturesSectionProps) {
  const isMultiancestry = !!selectedSecondaryAncestry

  // For multiancestry, show only the selected features; for single ancestry, show all
  const primaryAncestryFeatures = selectedAncestry
    ? isMultiancestry
      ? selectedAncestry.features.filter((f) => f.name === c.ancestryFeature)
      : selectedAncestry.features
    : []

  const secondaryAncestryFeatures = selectedSecondaryAncestry
    ? selectedSecondaryAncestry.features.filter((f) => f.name === c.secondaryAncestryFeature)
    : []

  const ancestryLabel = isMultiancestry
    ? `${selectedAncestry?.name} + ${selectedSecondaryAncestry?.name} — Ancestry Features`
    : selectedAncestry
      ? `${selectedAncestry.name} — Ancestry Features`
      : ""

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
          <div className="space-y-2">
            <FeatureList
              label={ancestryLabel}
              features={[...primaryAncestryFeatures, ...secondaryAncestryFeatures]}
            />
            {isMultiancestry && (primaryAncestryFeatures.length === 0 || secondaryAncestryFeatures.length === 0) && (
              <p className="text-xs text-muted-foreground italic">
                Select your ancestry features in the identity editor to see them here.
              </p>
            )}
          </div>
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
