# Design: Split Adversaries Tab into Adversaries + Encounters

**Date:** 2026-04-06

## Overview

Split the single "Adversaries" GM navigation tab into two separate top-level tabs: "Adversaries" (AI Builder) and "Encounters" (encounter management). Add a music URL field per encounter, stored in localStorage, opening in a new tab.

## Navigation Changes

`web/app/(gm)/GMLayout.tsx` — replace the single `adversaries` entry in `gmTabs` with two entries:

- `{ value: "adversaries", href: "/adversaries", icon: Bot, label: "Adversaries" }`
- `{ value: "encounters", href: "/encounters", icon: Swords, label: "Encounters" }`

## Page Split

### `web/app/(gm)/adversaries/page.tsx`

Renders only `AdversaryChat` with the two handlers currently in `EncounterTab`:
- `handleAcceptEncounter` — imports adversaries to library, creates encounter, switches are now irrelevant (different page)
- `handleAddAdversary` — imports to library, adds to active encounter or creates one

The page uses `useAdversaryStore` directly for `importAdversaries`, `addEncounter`, `addToEncounter`.

### `web/app/(gm)/encounters/page.tsx` (new)

Renders the full encounters UI currently in the "Encounters" sub-tab of `EncounterTab`:
- Adversary Library section (with clear button)
- Encounter Builder section
- Active Encounter cards

Uses `useAdversaryStore` for all encounter/library operations.

### `web/components/encounter-tab.tsx`

Deleted — no longer needed once both pages render their content directly.

## Data Model

`web/lib/adversary-types.ts` — add optional `musicUrl` to `Encounter`:

```ts
export interface Encounter {
  id: string
  name: string
  pcCount: number
  adversaries: EncounterAdversary[]
  musicUrl?: string  // NEW
}
```

No migration needed — optional field, existing stored data remains valid on load.

## Music UI

Location: inside the encounter builder, on each encounter entry (where name and pcCount are already editable).

- A small URL input field labelled "Music URL"
- When the field has a value, show a link icon button next to it that opens the URL in a new tab (`window.open(url, '_blank')`)
- Persists via `updateEncounter(id, { musicUrl })` — already supported by the existing store

## Files Changed

| File | Change |
|------|--------|
| `web/app/(gm)/GMLayout.tsx` | Add `Bot` import, split one tab into two |
| `web/app/(gm)/adversaries/page.tsx` | Inline AI Builder page (was a one-liner) |
| `web/app/(gm)/encounters/page.tsx` | New — encounters UI |
| `web/components/encounter-tab.tsx` | Deleted |
| `web/lib/adversary-types.ts` | Add `musicUrl?: string` to `Encounter` |
| `web/components/encounter/encounter-builder.tsx` | Add music URL input + open-link button |
