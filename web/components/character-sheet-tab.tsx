"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog"
import { useCharacterSheet } from "@/hooks/use-character-sheet"
import { DEFAULT_CHARACTER, getTier } from "@/lib/character-types"
import { useSrdClasses } from "@/lib/srd/use-srd-classes"
import { useSrdAncestries } from "@/lib/srd/use-srd-ancestries"
import { useSrdCommunities } from "@/lib/srd/use-srd-communities"
import { useSrdSubclasses } from "@/lib/srd/use-srd-subclasses"
import { useSrdWeapons } from "@/lib/srd/use-srd-weapons"
import { useSrdArmor } from "@/lib/srd/use-srd-armor"
import { useSrdDomainCards } from "@/lib/srd/use-srd-domain-cards"
import { cn } from "@/lib/utils"
import { RotateCcw, Pencil, Save, X, Activity, Backpack, BookOpen } from "lucide-react"
import { EditIdentityDialog } from "@/components/character-sheet/edit-identity-dialog"
import { StatsTab } from "@/components/character-sheet/stats-tab"
import { EquipmentTab } from "@/components/character-sheet/equipment-tab"
import { BackgroundTab } from "@/components/character-sheet/background-tab"
import type { CharacterData } from "@/lib/character-types"

interface CharacterSheetTabProps {
  character?: CharacterData
  setCharacter?: (updater: CharacterData | ((prev: CharacterData) => CharacterData)) => void
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
  const [discardDialogOpen, setDiscardDialogOpen] = useState(false)
  const [draft, setDraft] = useState<CharacterData | null>(null)

  // While in edit mode, render draft; otherwise render server-synced character
  const displayChar = editing && draft ? draft : c

  const tier = getTier(displayChar.level)

  // ── SRD hooks ────────────────────────────────────────────────
  const { items: classItems, data: classData } = useSrdClasses()
  const { items: ancestryItems, data: ancestryData } = useSrdAncestries()
  const { items: communityItems, data: communityData } = useSrdCommunities()
  const selectedClass = useMemo(
    () => classData.find((cls) => cls.name === displayChar.class),
    [classData, displayChar.class]
  )
  const classDomainNames = useMemo(
    () => selectedClass?.domains.map((d) => d.name),
    [selectedClass]
  )
  const classSubclassNames = useMemo(
    () => selectedClass?.subclasses.map((s) => s.name),
    [selectedClass]
  )
  const { items: subclassItems, data: subclassData } = useSrdSubclasses(classSubclassNames)
  const { primaryItems: primaryWeaponItems, secondaryItems: secondaryWeaponItems } = useSrdWeapons(tier)
  const { items: armorItems } = useSrdArmor(tier)
  const { items: domainCardItems } = useSrdDomainCards(displayChar.level, classDomainNames)

  const selectedAncestry = useMemo(
    () => ancestryData.find((a) => a.name === displayChar.ancestry),
    [ancestryData, displayChar.ancestry]
  )
  const selectedSecondaryAncestry = useMemo(
    () => ancestryData.find((a) => a.name === displayChar.secondaryAncestry),
    [ancestryData, displayChar.secondaryAncestry]
  )
  const selectedSubclass = useMemo(
    () => subclassData.find((s) => s.name === displayChar.subclass),
    [subclassData, displayChar.subclass]
  )
  const selectedCommunity = useMemo(
    () => communityData.find((cm) => cm.name === displayChar.community),
    [communityData, displayChar.community]
  )

  const enterEditMode = () => {
    setDraft(c)
    setEditing(true)
  }

  const handleSave = () => {
    if (draft) setCharacter(draft)
    setDraft(null)
    setEditing(false)
  }

  const handleDiscard = () => {
    setDiscardDialogOpen(true)
  }

  const confirmDiscard = () => {
    setDraft(null)
    setEditing(false)
    setDiscardDialogOpen(false)
  }

  // In edit mode: update local draft only. Outside edit mode: fire mutation immediately.
  const update = (patch: Partial<CharacterData>) => {
    if (editing) {
      setDraft((prev) => (prev ? { ...prev, ...patch } : { ...c, ...patch }))
    } else {
      setCharacter((prev) => ({ ...prev, ...patch }))
    }
  }

  if (!isLoaded) {
    return (
      <div className="p-4 space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-16 rounded-lg bg-card animate-pulse" />
        ))}
      </div>
    )
  }

  const handleReset = () => {
    if (confirmReset) {
      setDraft(DEFAULT_CHARACTER)
      setConfirmReset(false)
    } else {
      setConfirmReset(true)
      setTimeout(() => setConfirmReset(false), 3000)
    }
  }

  return (
    <div className="h-full overflow-y-auto">
    <div className="max-w-2xl mx-auto px-4 pb-8">

      {/* ── Identity Header (static display) ────────────────────── */}
      <div className="py-4 space-y-2">
        <div className="flex items-center gap-2">
          {editing ? (
            <Input
              value={displayChar.name}
              onChange={(e) => update({ name: e.target.value })}
              placeholder="Character name…"
              className="text-lg font-semibold text-gold bg-transparent border-0 border-b border-border rounded-none px-0 focus-visible:ring-0 placeholder:text-muted-foreground/50 flex-1"
            />
          ) : (
            <span className="text-lg font-semibold text-gold flex-1 truncate">
              {displayChar.name || <span className="text-muted-foreground/50 italic font-normal">Character name…</span>}
            </span>
          )}
          {!editing && (
            <Button
              variant="ghost"
              size="icon"
              onClick={enterEditMode}
              className="shrink-0 transition-colors text-muted-foreground hover:text-gold"
              aria-label="Edit character sheet"
            >
              <Pencil className="w-4 h-4" />
            </Button>
          )}
        </div>

        <div className="flex flex-wrap gap-x-3 gap-y-1 items-center text-sm">
          <div className="flex items-center gap-1">
            <span className="text-xs text-muted-foreground">Lvl</span>
            <span className="font-medium text-foreground">{displayChar.level}</span>
          </div>
          <Badge className="bg-purple-glow/20 text-gold border-purple-glow/40 text-xs">
            Tier {tier}
          </Badge>
          {displayChar.class && <span className="text-foreground font-medium">{displayChar.class}</span>}
          {displayChar.subclass && <span className="text-muted-foreground">({displayChar.subclass})</span>}
        </div>
        {(displayChar.ancestry || displayChar.community) && (
          <div className="flex flex-wrap gap-x-2 gap-y-0.5 text-sm text-muted-foreground">
            {displayChar.ancestry && (
              <span>
                {displayChar.ancestry}
                {displayChar.secondaryAncestry && ` + ${displayChar.secondaryAncestry}`}
              </span>
            )}
            {displayChar.ancestry && displayChar.community && <span>·</span>}
            {displayChar.community && <span>{displayChar.community}</span>}
          </div>
        )}
        {!displayChar.class && !displayChar.ancestry && !displayChar.community && (
          <button
            onClick={() => { enterEditMode(); setIdentityDialogOpen(true) }}
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
          character={displayChar}
          update={update}
          classItems={classItems}
          classData={classData}
          subclassItems={subclassItems}
          ancestryItems={ancestryItems}
          ancestryData={ancestryData}
          communityItems={communityItems}
        />
      )}

      {editing && (
        <p className="text-xs text-gold/70 italic text-center pb-2">
          Edit mode — traits, experiences, domain cards, and equipment are unlocked
        </p>
      )}

      {/* ── Inner Tabs ───────────────────────────────────────────── */}
      <Tabs defaultValue="stats" className="w-full">
        <TabsList className="sticky top-0 z-40 w-full rounded-none border-b border-border bg-card/95 backdrop-blur-sm h-9 justify-start gap-0.5 px-1 p-0.5 mb-1">
          <TabsTrigger value="stats" className="gap-1 text-xs data-[state=active]:bg-gold/10 data-[state=active]:text-gold data-[state=active]:border-gold/30">
            <Activity className="w-3.5 h-3.5" />
            Stats
          </TabsTrigger>
          <TabsTrigger value="equipment" className="gap-1 text-xs data-[state=active]:bg-gold/10 data-[state=active]:text-gold data-[state=active]:border-gold/30">
            <Backpack className="w-3.5 h-3.5" />
            Equipment
          </TabsTrigger>
          <TabsTrigger value="background" className="gap-1 text-xs data-[state=active]:bg-gold/10 data-[state=active]:text-gold data-[state=active]:border-gold/30">
            <BookOpen className="w-3.5 h-3.5" />
            Background
          </TabsTrigger>
        </TabsList>

        <TabsContent value="stats" className="mt-0">
          <StatsTab
            character={displayChar}
            tier={tier}
            update={update}
            editing={editing}
            domainCardItems={domainCardItems}
            selectedClass={selectedClass}
            selectedSubclass={selectedSubclass}
            selectedAncestry={selectedAncestry}
            selectedSecondaryAncestry={selectedSecondaryAncestry}
            selectedCommunity={selectedCommunity}
          />
        </TabsContent>

        <TabsContent value="equipment" className="mt-0">
          <EquipmentTab
            character={displayChar}
            update={update}
            primaryWeaponItems={primaryWeaponItems}
            secondaryWeaponItems={secondaryWeaponItems}
            armorItems={armorItems}
            editing={editing}
          />
        </TabsContent>

        <TabsContent value="background" className="mt-0">
          <BackgroundTab character={displayChar} update={update} />
        </TabsContent>
      </Tabs>

      {/* ── Reset ────────────────────────────────────────────────── */}
      {editing && (
        <div className="pt-4 pb-20">
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

      {/* ── Floating Save / Discard bar (edit mode) ────────────── */}
      {editing && (
        <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center pointer-events-none">
          <div className="pointer-events-auto mb-4 flex gap-3 rounded-lg border border-gold/30 bg-card/90 backdrop-blur-sm px-5 py-3 shadow-lg shadow-black/40">
            <Button
              variant="outline"
              size="sm"
              onClick={handleDiscard}
              className="border-destructive/50 text-destructive hover:bg-destructive/10 hover:border-destructive"
            >
              <X className="w-3.5 h-3.5 mr-1.5" />
              Discard
            </Button>
            <Button
              size="sm"
              onClick={handleSave}
              className="bg-gold text-background hover:bg-gold/80 font-semibold"
            >
              <Save className="w-3.5 h-3.5 mr-1.5" />
              Save
            </Button>
          </div>
        </div>
      )}

      {/* ── Discard confirmation dialog ────────────────────────── */}
      <AlertDialog open={discardDialogOpen} onOpenChange={setDiscardDialogOpen}>
        <AlertDialogContent className="border-gold/20 bg-card">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-gold">Discard changes?</AlertDialogTitle>
            <AlertDialogDescription>
              All unsaved changes will be lost. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-border">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDiscard}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              Discard changes
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
    </div>
  )
}
