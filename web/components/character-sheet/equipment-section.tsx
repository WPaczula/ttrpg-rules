"use client"

import { Combobox, type ComboboxItem } from "@/components/ui/combobox"
import type { CharacterData } from "@/lib/character-types"
import { SRD_WEAPONS, SRD_ARMOR } from "@/lib/srd-data"
import { Sword } from "lucide-react"
import { Section } from "./primitives"
import { SrdMarkdown } from "./srd-markdown"

interface EquipmentSectionProps {
  character: CharacterData
  update: (patch: Partial<CharacterData>) => void
  primaryWeaponItems: ComboboxItem[]
  secondaryWeaponItems: ComboboxItem[]
  armorItems: ComboboxItem[]
  editing?: boolean
}

export function EquipmentSection({
  character: c,
  update,
  primaryWeaponItems,
  secondaryWeaponItems,
  armorItems,
  editing = false,
}: EquipmentSectionProps) {
  return (
    <Section icon={<Sword className="w-4 h-4" />} title="Equipment">
      <div className="space-y-3">
        <div className="space-y-1.5">
          <label className="text-xs text-muted-foreground uppercase tracking-wider">Primary Weapon</label>
          {editing ? (
            <Combobox
              items={primaryWeaponItems}
              value={c.primaryWeapon}
              onSelect={(v) => update({ primaryWeapon: v })}
              placeholder="Search weapons…"
              searchPlaceholder="Type to search weapons…"
              className="text-sm"
            />
          ) : (
            <p className="text-sm text-foreground">{c.primaryWeapon || <span className="text-muted-foreground italic">None</span>}</p>
          )}
          {(() => {
            const w = SRD_WEAPONS.find((w) => w.name === c.primaryWeapon)
            return w ? (
              <>
                <div className="text-xs text-muted-foreground flex flex-wrap gap-x-2 gap-y-0.5 mt-1">
                  <span>{w.damage}</span>
                  <span>· {w.trait}</span>
                  <span>· {w.range}</span>
                  <span>· {w.burden}</span>
                </div>
                {w.feature && <SrdMarkdown className="mt-1">{w.feature}</SrdMarkdown>}
              </>
            ) : null
          })()}
        </div>
        <div className="space-y-1.5">
          <label className="text-xs text-muted-foreground uppercase tracking-wider">Secondary Weapon</label>
          {editing ? (
            <Combobox
              items={secondaryWeaponItems}
              value={c.secondaryWeapon}
              onSelect={(v) => update({ secondaryWeapon: v })}
              placeholder="Search weapons…"
              searchPlaceholder="Type to search weapons…"
              className="text-sm"
            />
          ) : (
            <p className="text-sm text-foreground">{c.secondaryWeapon || <span className="text-muted-foreground italic">None</span>}</p>
          )}
          {(() => {
            const w = SRD_WEAPONS.find((w) => w.name === c.secondaryWeapon)
            return w ? (
              <>
                <div className="text-xs text-muted-foreground flex flex-wrap gap-x-2 gap-y-0.5 mt-1">
                  <span>{w.damage}</span>
                  <span>· {w.trait}</span>
                  <span>· {w.range}</span>
                  <span>· {w.burden}</span>
                </div>
                {w.feature && <SrdMarkdown className="mt-1">{w.feature}</SrdMarkdown>}
              </>
            ) : null
          })()}
        </div>
        <div className="space-y-1.5">
          <label className="text-xs text-muted-foreground uppercase tracking-wider">Armor</label>
          {editing ? (
            <Combobox
              items={armorItems}
              value={c.armorName}
              onSelect={(v) => {
                const newArmor = SRD_ARMOR.find((a) => a.name === v)
                const oldArmor = SRD_ARMOR.find((a) => a.name === c.armorName)
                const patch: Partial<CharacterData> = { armorName: v }
                if (newArmor) {
                  patch.armorScore = newArmor.baseScore
                  // Thresholds are now computed on the fly from armor base + level + bonuses
                  const oldMod = oldArmor?.evasionModifier ?? 0
                  const newMod = newArmor.evasionModifier ?? 0
                  if (oldMod !== newMod) {
                    patch.evasion = c.evasion - oldMod + newMod
                  }
                }
                update(patch)
              }}
              placeholder="Search armor…"
              searchPlaceholder="Type to search armor…"
              className="text-sm"
            />
          ) : (
            <p className="text-sm text-foreground">{c.armorName || <span className="text-muted-foreground italic">None</span>}</p>
          )}
          {(() => {
            const a = SRD_ARMOR.find((a) => a.name === c.armorName)
            return a ? (
              <>
                <div className="text-xs text-muted-foreground flex flex-wrap gap-x-2 gap-y-0.5 mt-1">
                  <span>Score {a.baseScore}</span>
                  <span>· Thresholds {a.baseThresholds}</span>
                  {a.evasionModifier !== undefined && a.evasionModifier !== 0 && (
                    <span className="text-amber-400">· Evasion {a.evasionModifier}</span>
                  )}
                </div>
                {a.feature && <SrdMarkdown className="mt-1">{a.feature}</SrdMarkdown>}
              </>
            ) : null
          })()}
        </div>
      </div>
    </Section>
  )
}
