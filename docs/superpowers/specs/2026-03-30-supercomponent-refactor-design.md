# Supercomponent Refactor Design

**Date:** 2026-03-30
**Goal:** Break oversized hand-written components into focused, readable files while extracting shared UI patterns into reusable components.

## Targets

| File | Lines | Issue |
|------|-------|-------|
| `components/level-up-tab.tsx` | 916 | Single 770-line component with inline sub-components, multi-step wizard, complex state |
| `components/loot-tab.tsx` | 390 | Monolithic component with 4 repeated button-group patterns |

Out of scope: `lib/srd-data.ts` (auto-generated), `components/ui/sidebar.tsx` (third-party), `components/character-sheet-tab.tsx` (already decomposed).

## Approach

Feature-folder decomposition matching the existing `character-sheet/` and `encounter/` conventions. Split at natural seams, extract shared patterns into `components/ui/`. No behavior changes — pure structural refactor.

## File Structure

```
components/
  level-up/
    level-up-tab.tsx            # Orchestrator: state, derived values, step routing (~150 lines)
    idle-state.tsx              # Idle view: preview, slots overview, CTA (~90 lines)
    wizard-shell.tsx            # Progress bar + nav buttons wrapping active step (~50 lines)
    tier-achievement-step.tsx   # New experience name input + tier info (~60 lines)
    advancements-step.tsx       # 6 advancement options with sub-forms (~220 lines)
    domain-card-step.tsx        # Combobox + card preview (~50 lines)
    confirm-step.tsx            # Summary table + apply button (~80 lines)
    primitives.tsx              # AdvancementOption, SummaryRow, StepHeader (~80 lines)
  loot/
    loot-tab.tsx                # Orchestrator: store integration, state (~60 lines)
    roller-section.tsx          # Type/rarity/dice/quantity selectors + input + result card (~150 lines)
    gold-section.tsx            # Gold denomination counters (~30 lines)
    session-log.tsx             # Log list + log entry rendering (~80 lines)
  ui/
    button-group.tsx            # New: toggle button group with active state styling (~60 lines)
lib/
  level-up-utils.ts             # Pure functions + constants extracted from level-up-tab (~100 lines)
```

## Level-Up Decomposition

### `level-up-tab.tsx` (orchestrator, ~150 lines)

- Owns all wizard state: `step`, `advancements`, `traitPicks`, `newDomainCard`, `newExperienceName`
- Owns derived values: `nextLevel`, `currentTier`, `nextTier`, `tierTransition`, `slots`, `domainCardItems`, `srdNewCard`
- Owns `goNext`/`goBack`/`reset` navigation
- Calls `applyLevelUp` from `lib/level-up-utils.ts`
- Renders loading/max-level guards, then delegates to `IdleState` or `WizardShell`

### `idle-state.tsx` (~90 lines)

- Props: `character`, `nextLevel`, `currentTier`, `nextTier`, `tierTransition`, `slots`, `onStart`
- Pure presentational: preview list, slots grid, CTA button

### `wizard-shell.tsx` (~50 lines)

- Props: `step`, `currentLevel`, `nextLevel`, `onNext`, `onBack`, `canProceed`, `children`
- Renders progress indicator + back/next buttons, wrapping the active step as `children`

### `tier-achievement-step.tsx` (~60 lines)

- Props: `nextLevel`, `nextTier`, `selectedClass`, `newExperienceName`, `onExperienceNameChange`
- Proficiency info, subclass unlock info, experience name input

### `advancements-step.tsx` (~220 lines)

- Props: `character`, `advancements`, `setAdvancements`, `traitPicks`, `setTraitPicks`, `canAddAdvancement`, `slotAvailable`, `slots`
- Renders 6 `AdvancementOption` cards with their sub-forms (trait picker, experience booster)
- Largest step but cohesive — all 6 options share the same toggle pattern and state

### `domain-card-step.tsx` (~50 lines)

- Props: `domainCardItems`, `newDomainCard`, `onSelect`, `srdNewCard`, `existingCardCount`
- Combobox + preview card

### `confirm-step.tsx` (~80 lines)

- Props: `character`, `advancements`, `newDomainCard`, `srdNewCard`, `tierTransition`, `nextLevel`, `newExperienceName`, `onApply`
- Summary table using `SummaryRow`, apply button

### `primitives.tsx` (~80 lines)

- `AdvancementOption` — clickable card with active/disabled states and optional children
- `SummaryRow` — label/value row for confirm step
- `StepHeader` — icon + title pattern used in every step

## Loot Decomposition

### `loot-tab.tsx` (orchestrator, ~60 lines)

- Owns store integration (`useLootStore`)
- Owns roller state: `itemType`, `rarity`, `diceIndex`, `quantity`, `rollInput`, `lastResult`, `confirmClear`
- Owns callbacks: `handleLookUp`, `handleGold`, `handleClearLog`, `handleRarityChange`
- Renders header, then delegates to `RollerSection`, `GoldSection`, `SessionLog`

### `roller-section.tsx` (~150 lines)

- Props: `itemType`, `rarity`, `diceIndex`, `quantity`, `rollInput`, `lastResult`, `diceOptions`, `selectedDice`, plus setters and `onLookUp`
- 4 `ButtonGroup` instances (item type, rarity, dice, quantity) + roll input + result card
- Result card stays inline (~20 lines)

### `gold-section.tsx` (~30 lines)

- Props: `goldHandfuls`, `goldBags`, `goldChests`, `onAddGold`
- 3 denomination displays with add buttons

### `session-log.tsx` (~80 lines)

- Props: `log`, `onClear`, `confirmClear`
- Entry count header, clear button with confirmation, scrollable log list
- Log entry rendering (item vs gold conditional) stays inline (~35 lines)

## Shared UI Component

### `ui/button-group.tsx` (~60 lines)

Generic toggle button group replacing the repeated pattern across loot roller (4 instances) and potentially level-up advancements:

```tsx
interface ButtonGroupProps<T extends string> {
  value: T
  onChange: (value: T) => void
  options: { value: T; label: string; icon?: React.ReactNode }[]
  label?: string        // accessible group label
  size?: "sm" | "md"
}
```

- Active state styling (gold highlight vs default)
- Accessible `role="group"` with `aria-label`
- Optional icons per option

### `lib/level-up-utils.ts` (~100 lines)

Pure functions extracted from the component:

- `isTierTransition(level)` — returns true for levels 2, 5, 8
- `getTierSlots(character, tier)` — retrieves advancement slots with fallback
- `slotAvailable(slots, advancements, key)` — pure function (currently a closure)
- `applyLevelUp(prev, options)` — returns patched `CharacterData`, no React dependencies
- Constants: `SLOT_LIMITS`, `EMPTY_SLOTS`, `TRAIT_KEYS`, `TRAIT_LABELS`

## Migration Strategy

### Re-exports for zero-breakage

The current `level-up-tab.tsx` and `loot-tab.tsx` are imported elsewhere. After moving into folders, add re-export barrel files:

- `components/level-up-tab.tsx` → `export { LevelUpTab } from "./level-up/level-up-tab"`
- `components/loot-tab.tsx` → `export { LootTab } from "./loot/loot-tab"`

No changes needed in `page.tsx` or other consumers. Barrel files can be removed later.

### Verification

No behavior changes. Verify by running the app and confirming:

1. Level-up idle state renders correctly with preview and slots
2. Full wizard flow: tier achievement → advancements → domain card → confirm → apply
3. Loot roller: type/rarity/dice/quantity selection, roll input, result display
4. Gold denomination tracking
5. Session log: entries appear, clear with confirmation works
