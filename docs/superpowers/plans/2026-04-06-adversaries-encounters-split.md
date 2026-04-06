# Adversaries/Encounters Tab Split Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Split the single "Adversaries" GM navigation tab into two top-level tabs — "Adversaries" (AI Builder only) and "Encounters" (encounter management) — and add a per-encounter music URL field stored in localStorage.

**Architecture:** Inline the content of `encounter-tab.tsx` directly into two separate Next.js page components; delete the now-redundant wrapper. Add `musicUrl?: string` to the `Encounter` type and wire a URL input + open-in-new-tab link into the `EncounterBuilder` component.

**Tech Stack:** Next.js App Router, React, TypeScript, localStorage via existing `useAdversaryStore` hook, Tailwind CSS, Lucide icons, shadcn/ui `Input` + `Button`.

---

## File Map

| File | Action |
|------|--------|
| `web/lib/adversary-types.ts` | Modify — add `musicUrl?: string` to `Encounter` |
| `web/app/(gm)/GMLayout.tsx` | Modify — split one tab entry into two |
| `web/app/(gm)/adversaries/page.tsx` | Rewrite — inline AI Builder page |
| `web/app/(gm)/encounters/page.tsx` | Create — inline Encounters page |
| `web/components/encounter/encounter-builder.tsx` | Modify — add music URL input + link button |
| `web/components/encounter-tab.tsx` | Delete |

---

### Task 1: Add `musicUrl` to the `Encounter` type

**Files:**
- Modify: `web/lib/adversary-types.ts:69-74`

- [ ] **Step 1: Add the field**

In `web/lib/adversary-types.ts`, update the `Encounter` interface:

```ts
export interface Encounter {
  id: string
  name: string
  pcCount: number
  adversaries: EncounterAdversary[]
  musicUrl?: string
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd web && npx tsc --noEmit
```

Expected: no errors (the field is optional so existing code requires no changes).

- [ ] **Step 3: Commit**

```bash
cd web && git add lib/adversary-types.ts && git commit -m "feat: add musicUrl field to Encounter type"
```

---

### Task 2: Add music URL input to EncounterBuilder

**Files:**
- Modify: `web/components/encounter/encounter-builder.tsx`

- [ ] **Step 1: Add the music URL row after the existing name input**

Replace the section inside `{activeEncounter && ( <> ... </> )}` — after the `<Input>` for encounter name (around line 107) and before the PC Count block — add a new row:

```tsx
{/* Music URL */}
<div className="flex items-center gap-2">
  <Input
    value={activeEncounter.musicUrl ?? ""}
    onChange={(e) =>
      onUpdateEncounter(activeEncounter.id, { musicUrl: e.target.value || undefined })
    }
    placeholder="Music URL (opens in new tab)..."
    className="h-8 bg-input border-border text-sm flex-1"
  />
  {activeEncounter.musicUrl && (
    <Button
      variant="ghost"
      size="icon"
      className="h-8 w-8 text-gold hover:bg-gold/10 shrink-0"
      aria-label="Open music in new tab"
      onClick={() => window.open(activeEncounter.musicUrl, "_blank", "noopener,noreferrer")}
    >
      <Music className="w-3.5 h-3.5" />
    </Button>
  )}
</div>
```

- [ ] **Step 2: Import `Music` from lucide-react**

Update the existing lucide import line at the top of `encounter-builder.tsx`:

```tsx
import { Plus, Trash2, Music } from "lucide-react"
```

- [ ] **Step 3: Verify TypeScript compiles**

```bash
cd web && npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
cd web && git add components/encounter/encounter-builder.tsx && git commit -m "feat: add music URL input to EncounterBuilder"
```

---

### Task 3: Split the GM navigation into Adversaries + Encounters

**Files:**
- Modify: `web/app/(gm)/GMLayout.tsx`

- [ ] **Step 1: Update the tab list and imports**

Replace the full contents of `web/app/(gm)/GMLayout.tsx`:

```tsx
'use client'

import { MobileTabsNav } from "@/components/mobile-tabs-nav"
import { TabsHeader } from "@/components/tabs-header"
import { BookOpen, Bot, Dices, Swords } from "lucide-react"
import React from "react"

const gmTabs = [
    { value: "rules", href: "/rules", icon: BookOpen, label: "Rules" },
    { value: "adversaries", href: "/adversaries", icon: Bot, label: "Adversaries" },
    { value: "encounters", href: "/encounters", icon: Swords, label: "Encounters" },
    { value: "loot", href: "/loot", icon: Dices, label: "Loot" },
]

export const GMLayout = ({ children, role }: { children: React.ReactNode, role: "GM" | 'DEMO' }) => {
    return <div className="flex flex-col h-dvh bg-background gap-0">
        <TabsHeader tabs={gmTabs} role={role} />
        <main className="flex-1 min-h-0">{children}</main>
        <MobileTabsNav tabs={gmTabs} />
    </div>
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd web && npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
cd web && git add app/\(gm\)/GMLayout.tsx && git commit -m "feat: add Encounters tab to GM navigation"
```

---

### Task 4: Rewrite the Adversaries page (AI Builder only)

**Files:**
- Rewrite: `web/app/(gm)/adversaries/page.tsx`

- [ ] **Step 1: Replace the page with an inline AI Builder**

Replace the entire file content:

```tsx
"use client"

import { useCallback } from "react"
import { AdversaryChat } from "@/components/encounter/adversary-chat"
import { useAdversaryStore } from "@/hooks/use-adversary-store"
import type { Adversary } from "@/lib/adversary-types"

export default function AdversariesPage() {
  const { store, importAdversaries, addEncounter, addToEncounter } = useAdversaryStore()

  const handleAcceptEncounter = useCallback(
    (name: string, adversaries: Adversary[]) => {
      importAdversaries(adversaries)
      const encounterId = addEncounter(name)
      for (const adv of adversaries) {
        addToEncounter(encounterId, adv.name)
      }
    },
    [importAdversaries, addEncounter, addToEncounter]
  )

  const handleAddAdversary = useCallback(
    (adversary: Adversary) => {
      importAdversaries([adversary])
      const encId = store.activeEncounterId ?? addEncounter("New Encounter")
      addToEncounter(encId, adversary.name)
    },
    [store.activeEncounterId, importAdversaries, addEncounter, addToEncounter]
  )

  return (
    <AdversaryChat
      isActive
      onAcceptEncounter={handleAcceptEncounter}
      onAddAdversary={handleAddAdversary}
    />
  )
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd web && npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
cd web && git add app/\(gm\)/adversaries/page.tsx && git commit -m "feat: rewrite adversaries page as AI builder"
```

---

### Task 5: Create the Encounters page

**Files:**
- Create: `web/app/(gm)/encounters/page.tsx`

- [ ] **Step 1: Create the encounters directory and page**

Create file `web/app/(gm)/encounters/page.tsx`:

```tsx
"use client"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { useAdversaryStore } from "@/hooks/use-adversary-store"
import { Section } from "@/components/character-sheet/primitives"
import { AdversaryLibrary } from "@/components/encounter/adversary-library"
import { AdversaryCard } from "@/components/encounter/adversary-card"
import { EncounterBuilder } from "@/components/encounter/encounter-builder"
import { BookOpen, Swords, RotateCcw } from "lucide-react"
import { cn } from "@/lib/utils"

export default function EncountersPage() {
  const {
    store,
    isLoaded,
    removeFromLibrary,
    clearLibrary,
    activeEncounter,
    addEncounter,
    deleteEncounter,
    setActiveEncounter,
    updateEncounter,
    addToEncounter,
    removeFromEncounter,
    updateAdversaryInstance,
  } = useAdversaryStore()

  const [confirmClear, setConfirmClear] = useState(false)

  const handleClearLibrary = useCallback(() => {
    if (confirmClear) {
      clearLibrary()
      setConfirmClear(false)
    } else {
      setConfirmClear(true)
      setTimeout(() => setConfirmClear(false), 3000)
    }
  }, [confirmClear, clearLibrary])

  if (!isLoaded) {
    return (
      <div className="p-4 space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-16 rounded-lg bg-card animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <div className="flex-1 min-h-0 overflow-y-auto">
      <div className="max-w-2xl mx-auto px-4 pb-8">
        {/* Header */}
        <div className="py-4 space-y-1">
          <h1 className="text-lg font-semibold text-gold flex items-center gap-2">
            <Swords className="w-5 h-5" />
            Encounters
          </h1>
          <p className="text-xs text-muted-foreground">
            Manage your adversary library, build encounters, and track combat.
          </p>
        </div>
        <Separator className="bg-border mb-1" />

        {/* Library section */}
        <Section icon={<BookOpen className="w-4 h-4" />} title="Adversary Library" defaultOpen={store.library.length === 0}>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              {store.library.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearLibrary}
                  className={cn(
                    "text-xs",
                    confirmClear
                      ? "text-destructive hover:text-destructive"
                      : "text-muted-foreground hover:text-destructive"
                  )}
                >
                  <RotateCcw className="w-3 h-3 mr-1" />
                  {confirmClear ? "Confirm clear?" : "Clear All"}
                </Button>
              )}
              <span className="text-[10px] text-muted-foreground ml-auto">
                {store.library.length} adversar{store.library.length === 1 ? "y" : "ies"}
              </span>
            </div>
            <AdversaryLibrary
              library={store.library}
              onAdd={(name) => {
                if (activeEncounter) {
                  addToEncounter(activeEncounter.id, name)
                }
              }}
              onRemove={removeFromLibrary}
              hasActiveEncounter={!!activeEncounter}
            />
          </div>
        </Section>

        {/* Encounter Builder section */}
        <Section icon={<Swords className="w-4 h-4" />} title="Encounter Builder" defaultOpen>
          <EncounterBuilder
            encounters={store.encounters}
            activeEncounter={activeEncounter}
            library={store.library}
            onAddEncounter={addEncounter}
            onDeleteEncounter={deleteEncounter}
            onSelectEncounter={setActiveEncounter}
            onUpdateEncounter={updateEncounter}
            onAddAdversary={addToEncounter}
          />
        </Section>

        {/* Active Encounter Cards */}
        {activeEncounter && activeEncounter.adversaries.length > 0 && (
          <div className="space-y-3 pt-2">
            <div className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold px-1">
              Active Encounter — {activeEncounter.adversaries.length} adversar{activeEncounter.adversaries.length === 1 ? "y" : "ies"}
            </div>
            {activeEncounter.adversaries.map((inst) => {
              const adv = store.library.find((a) => a.name === inst.adversaryName)
              if (!adv) return null
              return (
                <AdversaryCard
                  key={inst.id}
                  instance={inst}
                  adversary={adv}
                  onUpdateHp={(hp) =>
                    updateAdversaryInstance(activeEncounter.id, inst.id, { hpMarked: hp })
                  }
                  onUpdateStress={(stress) =>
                    updateAdversaryInstance(activeEncounter.id, inst.id, { stressMarked: stress })
                  }
                  onRemove={() => removeFromEncounter(activeEncounter.id, inst.id)}
                />
              )
            })}
          </div>
        )}

        {/* Empty state */}
        {activeEncounter && activeEncounter.adversaries.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Swords className="w-8 h-8 mx-auto mb-2 opacity-30" />
            <p className="text-sm">No adversaries in this encounter yet.</p>
            <p className="text-xs mt-1">
              {store.library.length === 0
                ? "Use the Adversaries tab to create adversaries, then add them here."
                : "Use the library or the dropdown above to add adversaries."}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd web && npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
cd web && git add app/\(gm\)/encounters/ && git commit -m "feat: create Encounters page"
```

---

### Task 6: Delete encounter-tab.tsx

**Files:**
- Delete: `web/components/encounter-tab.tsx`

- [ ] **Step 1: Verify nothing imports encounter-tab**

```bash
cd web && grep -r "encounter-tab" --include="*.tsx" --include="*.ts" .
```

Expected: no output (the file is only imported by `app/(gm)/adversaries/page.tsx` which was already rewritten in Task 4).

- [ ] **Step 2: Delete the file**

```bash
cd web && rm components/encounter-tab.tsx
```

- [ ] **Step 3: Verify TypeScript compiles**

```bash
cd web && npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
cd web && git add -A && git commit -m "chore: delete encounter-tab.tsx (split into separate pages)"
```
