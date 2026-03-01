"use client"

import { Combobox, type ComboboxItem } from "@/components/ui/combobox"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import type { CharacterData } from "@/lib/character-types"
import { SRD_CLASSES } from "@/lib/srd-data"
import { NumberStepper } from "./primitives"

interface EditIdentityDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  character: CharacterData
  update: (patch: Partial<CharacterData>) => void
  classItems: ComboboxItem[]
  subclassItems: ComboboxItem[]
  ancestryItems: ComboboxItem[]
  communityItems: ComboboxItem[]
}

export function EditIdentityDialog({
  open,
  onOpenChange,
  character: c,
  update,
  classItems,
  subclassItems,
  ancestryItems,
  communityItems,
}: EditIdentityDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange} modal={false}>
      <DialogContent className="bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-gold">Edit Character Identity</DialogTitle>
          <DialogDescription>
            Change your class, subclass, ancestry, community, and other build options.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <label className="text-xs text-muted-foreground uppercase tracking-wider">Level</label>
            <select
              value={c.level}
              onChange={(e) => update({ level: Number(e.target.value) })}
              className="w-full bg-input border border-border rounded px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-gold"
              aria-label="Level"
            >
              {Array.from({ length: 10 }, (_, i) => i + 1).map((l) => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs text-muted-foreground uppercase tracking-wider">Class</label>
            <Combobox
              items={classItems}
              value={c.class}
              onSelect={(name) => {
                const cls = SRD_CLASSES.find((cl) => cl.name === name)
                const patch: Partial<CharacterData> = { class: name }
                if (cls) {
                  patch.evasion = cls.evasion
                  patch.hpTotal = cls.hp
                  if (!cls.subclasses.includes(c.subclass)) {
                    patch.subclass = ""
                  }
                }
                update(patch)
              }}
              placeholder="Select class…"
              searchPlaceholder="Search classes…"
              className="text-sm"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs text-muted-foreground uppercase tracking-wider">Subclass</label>
            <Combobox
              items={subclassItems}
              value={c.subclass}
              onSelect={(name) => update({ subclass: name })}
              placeholder="Select subclass…"
              searchPlaceholder="Search subclasses…"
              className="text-sm"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs text-muted-foreground uppercase tracking-wider">Ancestry</label>
            <Combobox
              items={ancestryItems}
              value={c.ancestry}
              onSelect={(name) => update({ ancestry: name })}
              placeholder="Select ancestry…"
              searchPlaceholder="Search ancestries…"
              className="text-sm"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs text-muted-foreground uppercase tracking-wider">Community</label>
            <Combobox
              items={communityItems}
              value={c.community}
              onSelect={(name) => update({ community: name })}
              placeholder="Select community…"
              searchPlaceholder="Search communities…"
              className="text-sm"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs text-muted-foreground uppercase tracking-wider">Evasion</label>
            <NumberStepper
              label="Evasion"
              value={c.evasion}
              onChange={(v) => update({ evasion: v })}
              min={0}
              max={30}
            />
            <p className="text-xs text-muted-foreground">
              Auto-set when choosing a class. Override here if needed.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
