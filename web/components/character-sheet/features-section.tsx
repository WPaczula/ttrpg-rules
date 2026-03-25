"use client"

import { Textarea } from "@/components/ui/textarea"
import type { CharacterData } from "@/lib/character-types"
import { CLASS_FEATURE_THRESHOLD_BONUSES, CLASS_LEVEL_FEATURE_THRESHOLD_BONUSES } from "@/lib/character-types"
import type { SrdAncestry, SrdClass, SrdCommunity, SrdSubclass } from "@/lib/srd-data"
import { Scroll, Shield } from "lucide-react"
import { Section, FeatureList } from "./primitives"

function ThresholdToggle({
  sourceId,
  label,
  majorVal,
  severeVal,
  thresholdBonuses,
  update,
}: {
  sourceId: string
  label: string
  majorVal: number
  severeVal: number
  thresholdBonuses: { [sourceId: string]: { major: number; severe: number } }
  update: (patch: Partial<CharacterData>) => void
}) {
  const isActive = !!thresholdBonuses[sourceId]
  const bonusLabel = [
    majorVal > 0 ? `+${majorVal} Major` : "",
    severeVal > 0 ? `+${severeVal} Severe` : "",
  ].filter(Boolean).join(", ")

  return (
    <button
      onClick={() => {
        const next = { ...thresholdBonuses }
        if (isActive) {
          delete next[sourceId]
        } else {
          next[sourceId] = { major: majorVal, severe: severeVal }
        }
        update({ thresholdBonuses: next })
      }}
      className={`flex items-center gap-1.5 px-2 py-1 rounded text-[11px] border transition-colors ${
        isActive
          ? "bg-gold/20 border-gold/50 text-gold"
          : "bg-transparent border-border text-muted-foreground hover:border-gold/30"
      }`}
    >
      <Shield className="w-3 h-3" />
      {label}: {bonusLabel}
      <span className="ml-1 text-[10px]">{isActive ? "ON" : "OFF"}</span>
    </button>
  )
}

interface FeaturesSectionProps {
  character: CharacterData
  update: (patch: Partial<CharacterData>) => void
  selectedClass: SrdClass | undefined
  selectedSubclass: SrdSubclass | undefined
  selectedAncestry: SrdAncestry | undefined
  selectedSecondaryAncestry: SrdAncestry | undefined
  selectedCommunity: SrdCommunity | undefined
  editing?: boolean
}

export function FeaturesSection({
  character: c,
  update,
  selectedClass,
  selectedSubclass,
  selectedAncestry,
  selectedSecondaryAncestry,
  selectedCommunity,
  editing = false,
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
            {selectedClass.features.map((f) => {
              const key = `${selectedClass.name}:${f.name}`
              const bonusDef = CLASS_LEVEL_FEATURE_THRESHOLD_BONUSES[key]
              if (!bonusDef) return null
              const sourceId = `classFeature:${key}`
              const majorVal = bonusDef.major === "proficiency" ? c.proficiency : bonusDef.major
              const severeVal = bonusDef.severe === "proficiency" ? c.proficiency : bonusDef.severe
              return (
                <ThresholdToggle
                  key={sourceId}
                  sourceId={sourceId}
                  label={f.name}
                  majorVal={majorVal}
                  severeVal={severeVal}
                  thresholdBonuses={c.thresholdBonuses ?? {}}
                  update={update}
                />
              )
            })}
          </div>
        )}
        {selectedSubclass && (
          <div className="space-y-2">
            <FeatureList label={`${selectedSubclass.name} — Foundation`} features={selectedSubclass.foundation} />
            <FeatureList label={`${selectedSubclass.name} — Specialization`} features={selectedSubclass.specialization} />
            <FeatureList label={`${selectedSubclass.name} — Mastery`} features={selectedSubclass.mastery} />
            {[...selectedSubclass.foundation, ...selectedSubclass.specialization, ...selectedSubclass.mastery].map((f) => {
              const key = `${selectedSubclass.name}:${f.name}`
              const bonusDef = CLASS_FEATURE_THRESHOLD_BONUSES[key]
              if (!bonusDef) return null
              const sourceId = `subclassFeature:${key}`
              const majorVal = bonusDef.major === "proficiency" ? c.proficiency : bonusDef.major
              const severeVal = bonusDef.severe === "proficiency" ? c.proficiency : bonusDef.severe
              return (
                <ThresholdToggle
                  key={sourceId}
                  sourceId={sourceId}
                  label={f.name}
                  majorVal={majorVal}
                  severeVal={severeVal}
                  thresholdBonuses={c.thresholdBonuses ?? {}}
                  update={update}
                />
              )
            })}
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
            {isMultiancestry && primaryAncestryFeatures.length === 0 && (
              <p className="text-xs text-muted-foreground italic">
                Select your ancestry feature in the identity editor to see the paired features here.
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
        {editing ? (
          <Textarea
            value={c.features}
            onChange={(e) => update({ features: e.target.value })}
            placeholder="Additional custom features or notes…"
            className="min-h-[80px] bg-input border-border text-sm resize-none"
          />
        ) : c.features ? (
          <p className="text-xs text-muted-foreground whitespace-pre-wrap">{c.features}</p>
        ) : null}
      </div>
    </Section>
  )
}
