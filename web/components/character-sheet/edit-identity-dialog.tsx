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
import { NumberStepper } from "./primitives"

interface ApiClass {
  id: string
  name: string
  evasion: number
  hp: number
  subclasses: { id: string; name: string }[]
  domains: { id: string; name: string }[]
  features: { id: string; name: string; text: string }[]
}

interface ApiAncestry {
  id: string
  name: string
  description: string
  features: { id: string; name: string; text: string }[]
}

interface EditIdentityDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  character: CharacterData
  update: (patch: Partial<CharacterData>) => void
  classItems: ComboboxItem[]
  classData: ApiClass[]
  subclassItems: ComboboxItem[]
  ancestryItems: ComboboxItem[]
  ancestryData: ApiAncestry[]
  communityItems: ComboboxItem[]
  /** Disable class selection — class is locked once the character has advanced. */
  classLocked?: boolean
}

export function EditIdentityDialog({
  open,
  onOpenChange,
  character: c,
  update,
  classItems,
  classData,
  subclassItems,
  ancestryItems,
  ancestryData,
  communityItems,
  classLocked = false,
}: EditIdentityDialogProps) {
  const primaryAncestry = useMemo(
    () => ancestryData.find((a) => a.name === c.ancestry),
    [ancestryData, c.ancestry]
  )

  const secondaryAncestry = useMemo(
    () => ancestryData.find((a) => a.name === c.secondaryAncestry),
    [ancestryData, c.secondaryAncestry]
  )

  const secondaryAncestryItems = useMemo<ComboboxItem[]>(
    () => [
      { value: "", label: "None (single ancestry)", detail: "" },
      ...ancestryData
        .filter((a) => a.name !== c.ancestry)
        .map((a) => ({
          value: a.name,
          label: a.name,
          detail: a.features.map((f) => f.name).join(", "),
        })),
    ],
    [ancestryData, c.ancestry]
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

  const isMultiancestry = !!c.secondaryAncestry

  const selectedPrimaryIndex = primaryAncestry
    ? primaryAncestry.features.findIndex((f) => f.name === c.ancestryFeature)
    : -1
  const autoSecondaryFeature =
    secondaryAncestry && selectedPrimaryIndex !== -1
      ? secondaryAncestry.features[selectedPrimaryIndex === 0 ? 1 : 0]
      : undefined

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
            {classLocked ? (
              <>
                <div
                  className="flex w-full items-center justify-between rounded-md border border-border bg-input px-3 py-2 text-sm text-muted-foreground cursor-not-allowed"
                  aria-disabled="true"
                >
                  <span className="truncate">{c.class || "No class selected"}</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Class is locked — it cannot be changed once the character has advanced past level 1.
                </p>
              </>
            ) : (
              <Combobox
                items={classItems}
                value={c.class}
                onSelect={(name) => {
                  const cls = classData.find((cl) => cl.name === name)
                  const patch: Partial<CharacterData> = { class: name }
                  if (cls) {
                    patch.evasion = cls.evasion
                    patch.hpTotal = cls.hp
                    const subclassNames = cls.subclasses.map((s) => s.name)
                    if (!subclassNames.includes(c.subclass)) {
                      patch.subclass = ""
                    }
                  }
                  update(patch)
                }}
                placeholder="Select class…"
                searchPlaceholder="Search classes…"
                className="text-sm"
              />
            )}
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
                const patch: Partial<CharacterData> = {
                  ancestry: name,
                  ancestryFeature: "",
                  secondaryAncestryFeature: "",
                }
                if (name === c.secondaryAncestry) {
                  patch.secondaryAncestry = ""
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
              onSelect={(name) => update({ secondaryAncestry: name, secondaryAncestryFeature: "" })}
              placeholder="None (single ancestry)"
              searchPlaceholder="Search ancestries…"
              className="text-sm"
            />
            <p className="text-xs text-muted-foreground">
              Pick a second ancestry to create a mixed heritage. You'll choose one feature from each.
            </p>
          </div>

          {/* Feature selector when multiancestry is active */}
          {isMultiancestry && primaryAncestry && secondaryAncestry && (
            <div className="space-y-1.5 border border-border rounded-md p-3 bg-purple-deep/10">
              <span className="text-[10px] text-gold uppercase tracking-wider font-semibold">
                Multiancestry Feature Selection
              </span>
              <p className="text-xs text-muted-foreground mt-1">
                Pick one feature from {primaryAncestry.name} — the opposite feature from{" "}
                {secondaryAncestry.name} is automatically paired.
              </p>
              <div className="space-y-3 mt-2">
                <div className="space-y-1.5">
                  <label className="text-xs text-muted-foreground">
                    Feature from {primaryAncestry.name}
                  </label>
                  <Combobox
                    items={primaryFeatureItems}
                    value={c.ancestryFeature}
                    onSelect={(name) => {
                      const idx = primaryAncestry.features.findIndex((f) => f.name === name)
                      const pairedFeature = secondaryAncestry.features[idx === 0 ? 1 : 0]
                      update({
                        ancestryFeature: name,
                        secondaryAncestryFeature: pairedFeature?.name ?? "",
                      })
                    }}
                    placeholder={`Pick a ${primaryAncestry.name} feature…`}
                    searchPlaceholder="Search features…"
                    className="text-sm"
                  />
                </div>
                {autoSecondaryFeature && (
                  <div className="space-y-1.5">
                    <label className="text-xs text-muted-foreground">
                      Paired feature from {secondaryAncestry.name}
                    </label>
                    <div className="bg-purple-deep/30 border border-border rounded-md px-3 py-2">
                      <span className="text-xs font-medium text-gold">{autoSecondaryFeature.name}</span>
                      <p className="text-xs text-muted-foreground leading-relaxed mt-0.5">
                        {autoSecondaryFeature.text}
                      </p>
                    </div>
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
