"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Combobox, type ComboboxItem } from "@/components/ui/combobox"
import type { CharacterData } from "@/lib/character-types"
import { SRD_WEAPONS, SRD_ARMOR } from "@/lib/srd-data"
import { Sword, Plus, Trash2 } from "lucide-react"
import { Section } from "./primitives"

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
  const addItem = () => {
    update({ items: [...c.items, ""] })
  }

  const updateItem = (index: number, value: string) => {
    const items = [...c.items]
    items[index] = value
    update({ items })
  }

  const removeItem = (index: number) => {
    update({ items: c.items.filter((_, i) => i !== index) })
  }

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
              <div className="text-xs text-muted-foreground flex flex-wrap gap-x-2 gap-y-0.5 mt-1">
                <span>{w.damage}</span>
                <span>· {w.trait}</span>
                <span>· {w.range}</span>
                <span>· {w.burden}</span>
                {w.feature && <span className="text-gold-muted">· {w.feature}</span>}
              </div>
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
              <div className="text-xs text-muted-foreground flex flex-wrap gap-x-2 gap-y-0.5 mt-1">
                <span>{w.damage}</span>
                <span>· {w.trait}</span>
                <span>· {w.range}</span>
                <span>· {w.burden}</span>
                {w.feature && <span className="text-gold-muted">· {w.feature}</span>}
              </div>
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
                  const parts = newArmor.baseThresholds.split("/").map((s) => parseInt(s.trim(), 10))
                  if (parts.length >= 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
                    patch.minorThreshold = parts[0]
                    patch.majorThreshold = parts[1]
                  }
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
              <div className="text-xs text-muted-foreground flex flex-wrap gap-x-2 gap-y-0.5 mt-1">
                <span>Score {a.baseScore}</span>
                <span>· Thresholds {a.baseThresholds}</span>
                {a.evasionModifier !== undefined && a.evasionModifier !== 0 && (
                  <span className="text-amber-400">· Evasion {a.evasionModifier}</span>
                )}
                {a.feature && <span className="text-gold-muted">· {a.feature}</span>}
              </div>
            ) : null
          })()}
        </div>
        <div className="space-y-2">
          <label className="text-xs text-muted-foreground uppercase tracking-wider">Other Items</label>
          {c.items.length === 0 && !editing && (
            <p className="text-xs text-muted-foreground italic">No items.</p>
          )}
          {c.items.map((item, i) => (
            <div key={i} className="flex gap-2">
              {editing ? (
                <Input
                  value={item}
                  onChange={(e) => updateItem(i, e.target.value)}
                  placeholder="Item…"
                  className="flex-1 h-8 bg-input border-border text-sm"
                />
              ) : (
                <span className="flex-1 text-sm text-foreground">{item || <span className="text-muted-foreground italic">—</span>}</span>
              )}
              {editing && (
                <button
                  onClick={() => removeItem(i)}
                  className="w-7 h-7 flex items-center justify-center rounded text-muted-foreground hover:text-destructive active:scale-95"
                  aria-label="Remove item"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ))}
          {editing && (
            <Button
              variant="outline"
              size="sm"
              onClick={addItem}
              className="w-full border-dashed border-border text-muted-foreground hover:text-foreground hover:border-gold"
            >
              <Plus className="w-3.5 h-3.5 mr-1" /> Add Item
            </Button>
          )}
        </div>
      </div>
    </Section>
  )
}
