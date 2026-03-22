"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { type ComboboxItem } from "@/components/ui/combobox"
import { useCharacterSheet } from "@/hooks/use-character-sheet"
import { getTier } from "@/lib/character-types"
import {
  SRD_WEAPONS,
  SRD_ARMOR,
  SRD_DOMAIN_CARDS,
  SRD_CLASSES,
  SRD_ANCESTRIES,
  SRD_COMMUNITIES,
  SRD_SUBCLASSES,
} from "@/lib/srd-data"
import { cn } from "@/lib/utils"
import { NotebookPen, RotateCcw, Pencil, PencilOff } from "lucide-react"
import { Section } from "@/components/character-sheet/primitives"
import { EditIdentityDialog } from "@/components/character-sheet/edit-identity-dialog"
import { TraitsDefenseSection } from "@/components/character-sheet/traits-defense-section"
import { HpStressHopeSection } from "@/components/character-sheet/hp-stress-hope-section"
import { ExperiencesSection } from "@/components/character-sheet/experiences-section"
import { DomainCardsSection } from "@/components/character-sheet/domain-cards-section"
import { FeaturesSection } from "@/components/character-sheet/features-section"
import { EquipmentSection } from "@/components/character-sheet/equipment-section"
import { GoldSection } from "@/components/character-sheet/gold-section"

// ─── Main Component ───────────────────────────────────────────────────────────

interface CharacterSheetTabProps {
  character?: import("@/lib/character-types").CharacterData
  setCharacter?: (updater: import("@/lib/character-types").CharacterData | ((prev: import("@/lib/character-types").CharacterData) => import("@/lib/character-types").CharacterData)) => void
  resetCharacter?: () => void
  isLoaded?: boolean
}

export function CharacterSheetTab(props: CharacterSheetTabProps) {
  const internal = useCharacterSheet()
  const c = props.character ?? internal.character
  const setCharacter = props.setCharacter ?? internal.setCharacter
  const resetCharacter = props.resetCharacter ?? internal.resetCharacter
  const isLoaded = props.isLoaded ?? internal.isLoaded
  const [confirmReset, setConfirmReset] = useState(false)
  const [identityDialogOpen, setIdentityDialogOpen] = useState(false)
  const [editing, setEditing] = useState(false)

  const update = (patch: Partial<typeof c>) => setCharacter((prev) => ({ ...prev, ...patch }))

  // ── SRD combobox items (memoized) ────────────────────────────
  const classItems = useMemo<ComboboxItem[]>(
    () =>
      SRD_CLASSES.map((cls) => ({
        value: cls.name,
        label: cls.name,
        detail: `${cls.domains[0]} & ${cls.domains[1]} · HP ${cls.hp} · Evasion ${cls.evasion}`,
      })),
    []
  )

  const ancestryItems = useMemo<ComboboxItem[]>(
    () =>
      SRD_ANCESTRIES.map((a) => ({
        value: a.name,
        label: a.name,
        detail: a.features.map((f) => f.name).join(", "),
      })),
    []
  )

  const communityItems = useMemo<ComboboxItem[]>(
    () =>
      SRD_COMMUNITIES.map((cm) => ({
        value: cm.name,
        label: cm.name,
        detail: cm.features.map((f) => f.name).join(", "),
      })),
    []
  )

  const selectedClass = useMemo(
    () => SRD_CLASSES.find((cls) => cls.name === c.class),
    [c.class]
  )

  const subclassItems = useMemo<ComboboxItem[]>(() => {
    if (selectedClass) {
      return SRD_SUBCLASSES.filter((sc) =>
        selectedClass.subclasses.includes(sc.name)
      ).map((sc) => ({
        value: sc.name,
        label: sc.name,
        detail: sc.description,
      }))
    }
    return SRD_SUBCLASSES.map((sc) => ({
      value: sc.name,
      label: sc.name,
      detail: sc.description,
    }))
  }, [selectedClass])

  const selectedAncestry = useMemo(
    () => SRD_ANCESTRIES.find((a) => a.name === c.ancestry),
    [c.ancestry]
  )
  const selectedCommunity = useMemo(
    () => SRD_COMMUNITIES.find((cm) => cm.name === c.community),
    [c.community]
  )
  const selectedSubclass = useMemo(
    () => SRD_SUBCLASSES.find((sc) => sc.name === c.subclass),
    [c.subclass]
  )

  const domainCardItems = useMemo<ComboboxItem[]>(() => {
    let cards = SRD_DOMAIN_CARDS
    if (selectedClass) {
      const classDomains = selectedClass.domains
      cards = SRD_DOMAIN_CARDS.filter((dc) => classDomains.includes(dc.domain))
    }
    return cards.map((dc) => ({
      value: dc.name,
      label: dc.name,
      detail: `Lvl ${dc.level} · Recall ${dc.recallCost}`,
      group: dc.domain,
    }))
  }, [selectedClass])

  const primaryWeaponItems = useMemo<ComboboxItem[]>(
    () =>
      SRD_WEAPONS.filter((w) => w.type === "Primary").map((w) => ({
        value: w.name,
        label: w.name,
        detail: `${w.damage} · ${w.trait} · ${w.range} · ${w.burden}`,
        group: `Tier ${w.tier} — ${w.damageType}`,
      })),
    []
  )

  const secondaryWeaponItems = useMemo<ComboboxItem[]>(
    () =>
      SRD_WEAPONS.filter((w) => w.type === "Secondary").map((w) => ({
        value: w.name,
        label: w.name,
        detail: `${w.damage} · ${w.trait} · ${w.range} · ${w.burden}`,
        group: `Tier ${w.tier} — ${w.damageType}`,
      })),
    []
  )

  const armorItems = useMemo<ComboboxItem[]>(
    () =>
      SRD_ARMOR.map((a) => ({
        value: a.name,
        label: a.name,
        detail: `Score ${a.baseScore} · Thresholds ${a.baseThresholds}${a.feature ? ` · ${a.feature}` : ""}`,
        group: `Tier ${a.tier}`,
      })),
    []
  )

  if (!isLoaded) {
    return (
      <div className="p-4 space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-16 rounded-lg bg-card animate-pulse" />
        ))}
      </div>
    )
  }

  const tier = getTier(c.level)

  const handleReset = () => {
    if (confirmReset) {
      resetCharacter()
      setConfirmReset(false)
    } else {
      setConfirmReset(true)
      setTimeout(() => setConfirmReset(false), 3000)
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 pb-8">

      {/* ── Identity Header (static display) ────────────────────── */}
      <div className="py-4 space-y-2">
        <div className="flex items-center gap-2">
          {editing ? (
            <Input
              value={c.name}
              onChange={(e) => update({ name: e.target.value })}
              placeholder="Character name…"
              className="text-lg font-semibold text-gold bg-transparent border-0 border-b border-border rounded-none px-0 focus-visible:ring-0 placeholder:text-muted-foreground/50 flex-1"
            />
          ) : (
            <span className="text-lg font-semibold text-gold flex-1 truncate">
              {c.name || <span className="text-muted-foreground/50 italic font-normal">Character name…</span>}
            </span>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setEditing(!editing)}
            className={cn(
              "shrink-0 transition-colors",
              editing ? "text-gold hover:text-gold/80" : "text-muted-foreground hover:text-gold"
            )}
            aria-label={editing ? "Lock character sheet" : "Edit character sheet"}
          >
            {editing ? <PencilOff className="w-4 h-4" /> : <Pencil className="w-4 h-4" />}
          </Button>
        </div>

        <div className="flex flex-wrap gap-x-3 gap-y-1 items-center text-sm">
          <div className="flex items-center gap-1">
            <span className="text-xs text-muted-foreground">Lvl</span>
            <span className="font-medium text-foreground">{c.level}</span>
          </div>
          <Badge className="bg-purple-glow/20 text-gold border-purple-glow/40 text-xs">
            Tier {tier}
          </Badge>
          {c.class && (
            <span className="text-foreground font-medium">{c.class}</span>
          )}
          {c.subclass && (
            <span className="text-muted-foreground">({c.subclass})</span>
          )}
        </div>
        {(c.ancestry || c.community) && (
          <div className="flex flex-wrap gap-x-2 gap-y-0.5 text-sm text-muted-foreground">
            {c.ancestry && <span>{c.ancestry}</span>}
            {c.ancestry && c.community && <span>·</span>}
            {c.community && <span>{c.community}</span>}
          </div>
        )}
        {!c.class && !c.ancestry && !c.community && (
          <button
            onClick={() => { setEditing(true); setIdentityDialogOpen(true) }}
            className="text-xs text-muted-foreground/70 italic hover:text-gold transition-colors"
          >
            Tap the pencil icon to edit and set your class, ancestry, and community
          </button>
        )}
      </div>

      <Separator className="bg-border mb-1" />

      {/* ── Edit Identity Dialog ─────────────────────────────────── */}
      {editing && (
        <EditIdentityDialog
          open={identityDialogOpen}
          onOpenChange={setIdentityDialogOpen}
          character={c}
          update={update}
          classItems={classItems}
          subclassItems={subclassItems}
          ancestryItems={ancestryItems}
          communityItems={communityItems}
        />
      )}

      {editing && (
        <p className="text-xs text-gold/70 italic text-center pb-2">
          Edit mode — traits, experiences, domain cards, and equipment are unlocked
        </p>
      )}

      {/* ── Sections ─────────────────────────────────────────────── */}
      <TraitsDefenseSection character={c} tier={tier} update={update} editing={editing} />
      <HpStressHopeSection character={c} update={update} />
      <ExperiencesSection experiences={c.experiences} update={update} editing={editing} />
      <DomainCardsSection domainCards={c.domainCards} domainCardItems={domainCardItems} update={update} editing={editing} />
      <FeaturesSection
        character={c}
        update={update}
        selectedClass={selectedClass}
        selectedSubclass={selectedSubclass}
        selectedAncestry={selectedAncestry}
        selectedCommunity={selectedCommunity}
        editing={editing}
      />
      <EquipmentSection
        character={c}
        update={update}
        primaryWeaponItems={primaryWeaponItems}
        secondaryWeaponItems={secondaryWeaponItems}
        armorItems={armorItems}
        editing={editing}
      />
      <GoldSection character={c} update={update} />

      {/* ── Notes ────────────────────────────────────────────────── */}
      <Section icon={<NotebookPen className="w-4 h-4" />} title="Notes">
        <Textarea
          value={c.notes}
          onChange={(e) => update({ notes: e.target.value })}
          placeholder="Backstory, session notes, reminders…"
          className="min-h-[120px] bg-input border-border text-sm resize-none"
        />
      </Section>

      {/* ── Reset ────────────────────────────────────────────────── */}
      {editing && (
        <div className="pt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={handleReset}
            className={cn(
              "w-full border-border text-muted-foreground transition-colors",
              confirmReset
                ? "border-destructive text-destructive hover:bg-destructive/10"
                : "hover:border-destructive/50 hover:text-destructive/80"
            )}
          >
            <RotateCcw className="w-3.5 h-3.5 mr-2" />
            {confirmReset ? "Tap again to confirm reset" : "Reset Character Sheet"}
          </Button>
        </div>
      )}
    </div>
  )
}
