# Remove localStorage — TanStack Query as Source of Truth

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the localStorage-backed character sheet state with TanStack Query, migrating any existing localStorage data to the server on first load, then using the server as the only source of truth.

**Architecture:** `useCharacterSheet` is rewritten to use `useQuery(['character'])` for loading and two `useMutation` hooks (PATCH for simple fields, PUT sync for structural changes) with optimistic cache updates and rollback on error. `CharacterSheetTab` drops the snapshot/pause/flush pattern in favour of a local `draft` state during edit mode. Dead sync infrastructure (`use-sync.ts`, `sync-engine.ts`, `use-update-character.ts`) is deleted.

**Tech Stack:** TanStack Query (`@tanstack/react-query`), Clerk (`useAuth`), Next.js App Router

---

## File Map

| Action | File | Responsibility |
|---|---|---|
| Rewrite | `web/hooks/use-character-sheet.ts` | Query + migrations + mutations + public API |
| Modify | `web/components/character-sheet-tab.tsx` | Replace snapshot pattern with local draft state |
| Delete | `web/hooks/use-sync.ts` | No longer needed |
| Delete | `web/hooks/use-update-character.ts` | Inlined into use-character-sheet |
| Delete | `web/lib/sync/sync-engine.ts` | Replaced by TanStack Query mutation lifecycle |
| Keep | `web/lib/sync/character-sync.ts` | Still used for migration + syncMutation |

---

## Task 1: Rewrite `use-character-sheet.ts`

**Files:**
- Modify: `web/hooks/use-character-sheet.ts`

This is the core task. The rewritten hook:
- Uses `useQuery(['character'])` — the `queryFn` checks localStorage once, syncs any found data to the server via `syncCharacterToApi`, clears localStorage, then returns the server character.
- Exposes two internal mutations: a PATCH mutation (for `PATCH_FIELDS`) and a full-sync PUT mutation. Both use `onMutate` for optimistic cache update and `onError` for rollback.
- `setCharacter` diffs changed keys, picks the right mutation, fires immediately (no debounce).
- Removes `pauseSave`, `resumeSave`, `takeSnapshot`, `restoreSnapshot`, `flushToStorage` from the public API.
- Removes all `debugger` statements.

- [ ] **Step 1: Replace the file**

Replace the entire contents of `web/hooks/use-character-sheet.ts` with:

```typescript
"use client"

import { useCallback } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useAuth } from "@clerk/nextjs"
import { CharacterData, DEFAULT_CHARACTER } from "@/lib/character-types"
import { canSync, syncCharacterToApi } from "@/lib/sync/character-sync"
import { apiFetch } from "@/lib/srd/api-client"

const STORAGE_KEY = "daggerheart-character-sheet"

export interface CharacterPatch {
  hpMarked?: number
  stressMarked?: number
  hope?: number
  goldHandfuls?: number
  goldBags?: number
  goldChests?: number
  armorMarked?: number
  agility?: number
  strength?: number
  finesse?: number
  instinct?: number
  presence?: number
  knowledge?: number
  notes?: string
}

export const PATCH_FIELDS = new Set<keyof CharacterPatch>([
  "hpMarked", "stressMarked", "hope",
  "goldHandfuls", "goldBags", "goldChests",
  "armorMarked",
  "agility", "strength", "finesse", "instinct", "presence", "knowledge",
  "notes",
])

interface ServerCharacterResponse {
  id: string
  class: { name: string }
  subclass: { name: string }
  ancestry: { name: string }
  secondaryAncestry: { name: string } | null
  ancestryFeature: { name: string }
  secondaryAncestryFeature: { name: string } | null
  community: { name: string }
  armor: { name: string } | null
  primaryWeapon: { name: string } | null
  secondaryWeapon: { name: string } | null
  markedTraits: { trait: string }[]
  experiences: { id: string; name: string; modifier: number }[]
  domainCards: { id: string; domainCard: { id: string; name: string; level: number; domainName: string } }[]
  name: string
  level: number
  agility: number
  strength: number
  finesse: number
  instinct: number
  presence: number
  knowledge: number
  hpTotal: number
  hpMarked: number
  stressTotal: number
  stressMarked: number
  evasion: number
  armorMarked: number
  hope: number
  goldHandfuls: number
  goldBags: number
  goldChests: number
  proficiency: number
  notes: string
  items: string[]
}

interface CharacterQueryData {
  character: CharacterData
  id: string
}

function serverResponseToCharacterData(res: ServerCharacterResponse): CharacterData {
  return {
    ...DEFAULT_CHARACTER,
    name: res.name,
    level: res.level,
    class: res.class.name,
    subclass: res.subclass.name,
    ancestry: res.ancestry.name,
    secondaryAncestry: res.secondaryAncestry?.name ?? "",
    ancestryFeature: res.ancestryFeature.name,
    secondaryAncestryFeature: res.secondaryAncestryFeature?.name ?? "",
    community: res.community.name,
    agility: res.agility,
    strength: res.strength,
    finesse: res.finesse,
    instinct: res.instinct,
    presence: res.presence,
    knowledge: res.knowledge,
    hpTotal: res.hpTotal,
    hpMarked: res.hpMarked,
    stressTotal: res.stressTotal,
    stressMarked: res.stressMarked,
    evasion: res.evasion,
    armorMarked: res.armorMarked,
    hope: res.hope,
    goldHandfuls: res.goldHandfuls,
    goldBags: res.goldBags,
    goldChests: res.goldChests,
    proficiency: res.proficiency,
    primaryWeapon: res.primaryWeapon?.name ?? "",
    secondaryWeapon: res.secondaryWeapon?.name ?? "",
    armorName: res.armor?.name ?? "",
    markedTraits: res.markedTraits.map((t) => t.trait),
    experiences: res.experiences.map((e) => ({ id: e.id, name: e.name, modifier: e.modifier })),
    domainCards: res.domainCards.map((dc) => ({
      id: dc.id,
      name: dc.domainCard.name,
      level: dc.domainCard.level,
      domain: dc.domainCard.domainName,
    })),
    notes: res.notes,
    items: res.items,
  }
}

export function useCharacterSheet() {
  const queryClient = useQueryClient()
  const { getToken } = useAuth()

  const { data, isLoading } = useQuery<CharacterQueryData | null>({
    queryKey: ["character"],
    queryFn: async () => {
      const token = await getToken()

      // One-time localStorage migration: sync existing data to server then clear
      try {
        const raw = localStorage.getItem(STORAGE_KEY)
        if (raw) {
          const parsed = JSON.parse(raw)
          delete parsed.minorThreshold
          delete parsed.majorThreshold
          delete parsed.severeThreshold
          delete parsed._id
          const migrationData: CharacterData = { ...DEFAULT_CHARACTER, ...parsed }
          if (canSync(migrationData)) {
            await syncCharacterToApi(migrationData, token)
          }
          localStorage.removeItem(STORAGE_KEY)
        }
      } catch {
        // Migration failure must not block loading
        try { localStorage.removeItem(STORAGE_KEY) } catch {}
      }

      const res = await apiFetch<ServerCharacterResponse | null>("/characters/me", token)
      if (!res) return null
      return { character: serverResponseToCharacterData(res), id: res.id }
    },
    staleTime: Infinity,
    retry: false,
  })

  const character = data?.character ?? DEFAULT_CHARACTER
  const characterId = data?.id ?? null

  const patchMutation = useMutation<
    void,
    Error,
    { id: string; patch: Partial<CharacterPatch>; next: CharacterData },
    { previous: CharacterQueryData | null | undefined }
  >({
    mutationFn: async ({ id, patch }) => {
      const token = await getToken()
      await apiFetch(`/characters/${id}`, token, {
        method: "PATCH",
        body: JSON.stringify(patch),
      })
    },
    onMutate: async ({ next }) => {
      await queryClient.cancelQueries({ queryKey: ["character"] })
      const previous = queryClient.getQueryData<CharacterQueryData | null>(["character"])
      queryClient.setQueryData<CharacterQueryData | null>(["character"], (old) =>
        old ? { ...old, character: next } : null,
      )
      return { previous }
    },
    onError: (_err, _vars, context) => {
      if (context?.previous !== undefined) {
        queryClient.setQueryData(["character"], context.previous)
      }
    },
  })

  const syncMutation = useMutation<
    void,
    Error,
    { next: CharacterData },
    { previous: CharacterQueryData | null | undefined }
  >({
    mutationFn: async ({ next }) => {
      const token = await getToken()
      await syncCharacterToApi(next, token)
    },
    onMutate: async ({ next }) => {
      await queryClient.cancelQueries({ queryKey: ["character"] })
      const previous = queryClient.getQueryData<CharacterQueryData | null>(["character"])
      queryClient.setQueryData<CharacterQueryData | null>(["character"], (old) =>
        old ? { ...old, character: next } : null,
      )
      return { previous }
    },
    onError: (_err, _vars, context) => {
      if (context?.previous !== undefined) {
        queryClient.setQueryData(["character"], context.previous)
      }
    },
  })

  const setCharacter = useCallback(
    (updater: CharacterData | ((prev: CharacterData) => CharacterData)) => {
      const current = queryClient.getQueryData<CharacterQueryData | null>(["character"])
      const prev = current?.character ?? DEFAULT_CHARACTER
      const next = typeof updater === "function" ? updater(prev) : updater

      const changedKeys = (Object.keys(next) as (keyof CharacterData)[]).filter(
        (key) => prev[key] !== next[key],
      )
      const allPatchable =
        changedKeys.length > 0 &&
        changedKeys.every((k) => PATCH_FIELDS.has(k as keyof CharacterPatch))

      const id = current?.id ?? null

      if (allPatchable && id) {
        const patch: Partial<CharacterPatch> = {}
        for (const key of changedKeys) {
          ;(patch as Record<string, unknown>)[key] = next[key as keyof CharacterData]
        }
        patchMutation.mutate({ id, patch, next })
      } else {
        syncMutation.mutate({ next })
      }
    },
    [queryClient, patchMutation, syncMutation],
  )

  const resetCharacter = useCallback(() => {
    // Reset local cache only — server data is preserved until user recreates a character
    queryClient.setQueryData<CharacterQueryData | null>(["character"], (old) =>
      old ? { ...old, character: DEFAULT_CHARACTER } : null,
    )
  }, [queryClient])

  return {
    character,
    characterId,
    setCharacter,
    resetCharacter,
    isLoaded: !isLoading,
  }
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd web && rtk tsc --noEmit 2>&1 | head -50
```

Expected: no errors related to `use-character-sheet.ts`. Fix any type errors before continuing.

- [ ] **Step 3: Commit**

```bash
rtk git add web/hooks/use-character-sheet.ts && rtk git commit -m "refactor: rewrite useCharacterSheet with TanStack Query, migrate localStorage on load"
```

---

## Task 2: Update `CharacterSheetTab` — replace snapshot with local draft

**Files:**
- Modify: `web/components/character-sheet-tab.tsx`

The edit mode pattern changes:
- `enterEditMode()`: copy current character into `draft` state, no longer calls `takeSnapshot`/`pauseSave`
- While editing: all `update()` calls mutate `draft` (no server calls)
- `handleSave()`: calls `setCharacter(draft)` → fires mutation; clears draft
- `confirmDiscard()`: clears draft; query cache still holds clean server data

The `character` rendered in the sheet is `draft` while editing, `c` otherwise.

- [ ] **Step 1: Replace the character-sheet-tab file**

Replace the entire contents of `web/components/character-sheet-tab.tsx` with:

```typescript
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
import { getTier } from "@/lib/character-types"
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

  const playerTier = getTier(displayChar.level)

  // ── SRD hooks ────────────────────────────────────────────────
  const { items: classItems, data: classData } = useSrdClasses()
  const { items: ancestryItems, data: ancestryData } = useSrdAncestries()
  const { items: communityItems } = useSrdCommunities()
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
  const { items: subclassItems } = useSrdSubclasses(classSubclassNames)
  const { primaryItems: primaryWeaponItems, secondaryItems: secondaryWeaponItems } = useSrdWeapons(playerTier)
  const { items: armorItems } = useSrdArmor(playerTier)
  const { items: domainCardItems } = useSrdDomainCards(displayChar.level, classDomainNames)

  const selectedAncestry = useMemo(
    () => ancestryData.find((a) => a.name === displayChar.ancestry),
    [ancestryData, displayChar.ancestry]
  )
  const selectedSecondaryAncestry = useMemo(
    () => ancestryData.find((a) => a.name === displayChar.secondaryAncestry),
    [ancestryData, displayChar.secondaryAncestry]
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

  const tier = getTier(displayChar.level)

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
            selectedSubclass={undefined}
            selectedAncestry={selectedAncestry}
            selectedSecondaryAncestry={selectedSecondaryAncestry}
            selectedCommunity={undefined}
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
  )
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd web && rtk tsc --noEmit 2>&1 | head -50
```

Expected: no errors from `character-sheet-tab.tsx`.

- [ ] **Step 3: Commit**

```bash
rtk git add web/components/character-sheet-tab.tsx && rtk git commit -m "refactor: replace snapshot/pause/flush with local draft state in CharacterSheetTab"
```

---

## Task 3: Delete dead files

**Files:**
- Delete: `web/hooks/use-sync.ts`
- Delete: `web/hooks/use-update-character.ts`
- Delete: `web/lib/sync/sync-engine.ts`

- [ ] **Step 1: Delete the files**

```bash
rm web/hooks/use-sync.ts web/hooks/use-update-character.ts web/lib/sync/sync-engine.ts
```

- [ ] **Step 2: Verify TypeScript compiles cleanly**

```bash
cd web && rtk tsc --noEmit 2>&1 | head -50
```

Expected: no errors. If anything imports the deleted files, fix those imports now.

- [ ] **Step 3: Check for any remaining localStorage references in character-related files**

```bash
grep -r "localStorage" web/hooks web/components web/app --include="*.ts" --include="*.tsx"
```

Expected: no results from `hooks/` or `components/`. If any remain in character-related files, investigate and remove them.

- [ ] **Step 4: Commit**

```bash
rtk git add -A && rtk git commit -m "chore: delete dead sync infrastructure (use-sync, use-update-character, sync-engine)"
```

---

## Task 4: Fix `page.tsx` role persistence

**Files:**
- Modify: `web/app/page.tsx`

The role preference (`daggerheart-role`) still uses localStorage. This is explicitly out of scope (the user only asked to remove character sheet localStorage), but there's a `loadRole()` call at startup that reads from localStorage. This is fine to keep as-is.

However, `page.tsx` no longer needs to pass `pauseSave`, `resumeSave`, etc. down — verify the props it passes to `CharacterSheetTab` still match the new signature.

- [ ] **Step 1: Verify page.tsx props match updated CharacterSheetTab**

Read `web/app/page.tsx` and confirm `CharacterSheetTab` is called with only `character`, `setCharacter`, `resetCharacter`, `isLoaded` — all of which still exist in the new API.

Expected: `page.tsx` passes `{ character, setCharacter, resetCharacter, isLoaded }` — the destructure on line 42 should still compile.

- [ ] **Step 2: Run final TypeScript check**

```bash
cd web && rtk tsc --noEmit 2>&1 | head -80
```

Expected: zero errors across all files.

- [ ] **Step 3: Commit**

```bash
rtk git add web/app/page.tsx && rtk git commit -m "chore: verify page.tsx props after CharacterSheetTab API cleanup"
```

(If no changes needed, skip this commit.)
