"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { CharacterData } from "@/lib/character-types"
import type { ComboboxItem } from "@/components/ui/combobox"
import { Backpack, Plus, Trash2 } from "lucide-react"
import { Section } from "./primitives"
import { EquipmentSection } from "./equipment-section"
import { GoldSection } from "./gold-section"

interface EquipmentTabProps {
  character: CharacterData
  update: (patch: Partial<CharacterData>) => void
  primaryWeaponItems: ComboboxItem[]
  secondaryWeaponItems: ComboboxItem[]
  armorItems: ComboboxItem[]
  editing: boolean
}

export function EquipmentTab({
  character: c,
  update,
  primaryWeaponItems,
  secondaryWeaponItems,
  armorItems,
  editing,
}: EquipmentTabProps) {
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
    <>
      <EquipmentSection
        character={c}
        update={update}
        primaryWeaponItems={primaryWeaponItems}
        secondaryWeaponItems={secondaryWeaponItems}
        armorItems={armorItems}
        editing={editing}
      />
      <GoldSection character={c} update={update} />
      <Section icon={<Backpack className="w-4 h-4" />} title="Items">
        <div className="space-y-2">
          {c.items.length === 0 && (
            <p className="text-xs text-muted-foreground italic">No items.</p>
          )}
          {c.items.map((item, i) => (
            <div key={i} className="flex gap-2">
              <Input
                value={item}
                onChange={(e) => updateItem(i, e.target.value)}
                placeholder="Item…"
                className="flex-1 h-8 bg-input border-border text-sm"
              />
              <button
                onClick={() => removeItem(i)}
                className="w-7 h-7 flex items-center justify-center rounded text-muted-foreground hover:text-destructive active:scale-95"
                aria-label="Remove item"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
          <Button
            variant="outline"
            size="sm"
            onClick={addItem}
            className="w-full border-dashed border-border text-muted-foreground hover:text-foreground hover:border-gold"
          >
            <Plus className="w-3.5 h-3.5 mr-1" /> Add Item
          </Button>
        </div>
      </Section>
    </>
  )
}
