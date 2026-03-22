"use client"

import { useMemo } from "react"
import { Combobox, type ComboboxItem } from "@/components/ui/combobox"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import type { CharacterData } from "@/lib/character-types"
import { SRD_CLASSES, SRD_ANCESTRIES } from "@/lib/srd-data"
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
  const primaryAncestry = useMemo(
    () => SRD_ANCESTRIES.find((a) => a.name === c.ancestry),
    [c.ancestry]
  )

  const secondaryAncestry = useMemo(
    () => SRD_ANCESTRIES.find((a) => a.name === c.secondaryAncestry),
    [c.secondaryAncestry]
  )

  const secondaryAncestryItems = useMemo<ComboboxItem[]>(
    () => [
      { value: "", label: "None (single ancestry)", detail: "" },
      ...SRD_ANCESTRIES.filter((a) => a.name !== c.ancestry).map((a) => ({
        value: a.name,
        label: a.name,
        detail: a.features.map((f) => f.name).join(", "),
      })),
    ],
    [c.ancestry]
  )

  const primaryFeatureItems = useMemo<ComboboxItem[]>(
    () =>
      primaryAncestry
        ? primaryAncestry.features.map((f) => ({
            value: f.name,
            label: f.name,
            detail: f.text.slice(0, 80) + (f.text.length > 80 ? "…" : ""),
          }))
        : [],
    [primaryAncestry]
  )

  const secondaryFeatureItems = useMemo<ComboboxItem[]>(
    () =>
      secondaryAncestry
        ? secondaryAncestry.features.map((f) => ({
            value: f.name,
            label: f.name,
            detail: f.text.slice(0, 80) + (f.text.length > 80 ? "…" : ""),
          }))
        : [],
    [secondaryAncestry]
  )

  const isMultiancestry = !!c.secondaryAncestry

  return (
    <Dialog open={open} onOpenChange={onOpenChange} modal={false}>
      <DialogContent className="bg-card border-border max-h-[85vh] overflow-y-auto">
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

          {/* Primary Ancestry */}
          <div className="space-y-1.5">
            <label className="text-xs text-muted-foreground uppercase tracking-wider">
              {isMultiancestry ? "Primary Ancestry" : "Ancestry"}
            </label>
            <Combobox
              items={ancestryItems}
              value={c.ancestry}
              onSelect={(name) => {
                const patch: Partial<CharacterData> = { ancestry: name, ancestryFeature: "" }
                if (name === c.secondaryAncestry) {
                  patch.secondaryAncestry = ""
                  patch.secondaryAncestryFeature = ""
                }
                update(patch)
              }}
              placeholder="Select ancestry…"
              searchPlaceholder="Search ancestries…"
              className="text-sm"
            />
          </div>

          {/* Secondary Ancestry */}
          <div className="space-y-1.5">
            <label className="text-xs text-muted-foreground uppercase tracking-wider">
              Secondary Ancestry
            </label>
            <Combobox
              items={secondaryAncestryItems}
              value={c.secondaryAncestry}
              onSelect={(name) => {
                update({
                  secondaryAncestry: name,
                  secondaryAncestryFeature: "",
                })
              }}
              placeholder="None (single ancestry)"
              searchPlaceholder="Search ancestries…"
              className="text-sm"
            />
            <p className="text-xs text-muted-foreground">
              Pick a second ancestry to create a mixed heritage. You'll choose one feature from each.
            </p>
          </div>

          {/* Feature selectors when multiancestry is active */}
          {isMultiancestry && primaryAncestry && (
            <div className="space-y-1.5 border border-border rounded-md p-3 bg-purple-deep/10">
              <span className="text-[10px] text-gold uppercase tracking-wider font-semibold">
                Multiancestry Feature Selection
              </span>
              <div className="space-y-3 mt-2">
                <div className="space-y-1.5">
                  <label className="text-xs text-muted-foreground">
                    Feature from {primaryAncestry.name}
                  </label>
                  <Combobox
                    items={primaryFeatureItems}
                    value={c.ancestryFeature}
                    onSelect={(name) => update({ ancestryFeature: name })}
                    placeholder={`Pick a ${primaryAncestry.name} feature…`}
                    searchPlaceholder="Search features…"
                    className="text-sm"
                  />
                </div>
                {secondaryAncestry && (
                  <div className="space-y-1.5">
                    <label className="text-xs text-muted-foreground">
                      Feature from {secondaryAncestry.name}
                    </label>
                    <Combobox
                      items={secondaryFeatureItems}
                      value={c.secondaryAncestryFeature}
                      onSelect={(name) => update({ secondaryAncestryFeature: name })}
                      placeholder={`Pick a ${secondaryAncestry.name} feature…`}
                      searchPlaceholder="Search features…"
                      className="text-sm"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

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
