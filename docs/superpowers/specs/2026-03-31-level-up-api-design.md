# Level-Up API Design

**Date:** 2026-03-31
**Status:** Approved

## Summary

Move leveling-up logic from the frontend (localStorage) to the NestJS API. Two new endpoints provide level-up options and apply level-up choices atomically. A normalized history of all level-up decisions enables deriving advancement slot usage per tier.

Frontend changes are out of scope — this builds the API only. The frontend will be migrated in a separate task.

## Decisions

- **Slot tracking:** Derived from history (LevelUpRecord + LevelUpAdvancement tables), not stored as counts.
- **Endpoint style:** Single atomic `POST` — frontend wizard collects all choices, submits once.
- **API responsibility:** Smart API — serves available options AND validates submissions. API is the source of truth for game rules.
- **Module placement:** Lives inside `CharactersModule` for now. `LevelUpService` is self-contained for easy extraction to a standalone module later.
- **History storage:** Fully normalized — `LevelUpRecord` (one per level-up) + `LevelUpAdvancement` (one per chosen advancement).

## Data Models

### LevelUpRecord

| Field              | Type     | Notes                          |
|--------------------|----------|--------------------------------|
| id                 | String   | cuid, PK                      |
| characterId        | String   | FK -> Character                |
| fromLevel          | Int      | Level before (1-9)            |
| toLevel            | Int      | Level after (2-10)            |
| fromTier           | Int      | Tier before                   |
| toTier             | Int      | Tier after                    |
| newExperienceName  | String?  | Only set on tier transitions  |
| createdAt          | DateTime | Audit trail                   |

### LevelUpAdvancement

| Field            | Type            | Notes                                                                 |
|------------------|-----------------|-----------------------------------------------------------------------|
| id               | String          | cuid, PK                                                             |
| levelUpRecordId  | String          | FK -> LevelUpRecord                                                  |
| type             | AdvancementType | Enum: INCREASE_TRAITS, ADD_HP, ADD_STRESS, BOOST_EXPERIENCES, EXTRA_DOMAIN_CARD, INCREASE_EVASION |
| metadata         | Json?           | Type-specific data (traits chosen, experience IDs, domain card ID)   |

### Character Model Changes

No new columns. Existing fields (`level`, `proficiency`, `hpTotal`, `stressTotal`, `evasion`, trait values) are updated as side effects of applying a level-up. New relation: `levelUpRecords LevelUpRecord[]`.

## API Endpoints

### GET /characters/:id/level-up/options

**Guard:** `@OwnerOnly()`

Returns available options for the next level-up:

```typescript
{
  currentLevel: number
  nextLevel: number
  currentTier: number
  nextTier: number
  isTierTransition: boolean

  tierBonuses: {
    proficiencyIncrease: boolean
    clearMarkedTraits: boolean       // tier 3+ transitions
    requiresNewExperience: boolean
  } | null

  availableAdvancements: {
    type: AdvancementType
    slotsUsed: number
    slotsMax: number
    available: boolean
  }[]

  eligibleDomainCards: {
    id: string
    name: string
    level: number
    domain: string
  }[]
}
```

**Error responses:**
- 404: Character not found
- 409: Character already at level 10

### POST /characters/:id/level-up

**Guard:** `@OwnerOnly()`

Request body:

```typescript
{
  advancements: [
    { type: AdvancementType, metadata?: object },
    { type: AdvancementType, metadata?: object }
  ]
  newExperienceName?: string   // required iff tier transition
}
```

**Metadata by advancement type:**
- `INCREASE_TRAITS`: `{ traits: [Trait, Trait] }` — two unmarked traits
- `BOOST_EXPERIENCES`: `{ experienceIds: [string, string] }` — two existing experience IDs
- `EXTRA_DOMAIN_CARD`: `{ domainCardId: string }` — eligible domain card
- `ADD_HP`, `ADD_STRESS`, `INCREASE_EVASION`: no metadata

**Validation (DTO layer — structural):**
- Exactly 2 advancements
- Valid enum values
- Correct metadata shape per type

**Validation (service layer — business rules):**
- Character not at level 10
- Each advancement type has available slots (derived from tier history)
- `INCREASE_TRAITS`: both traits exist, neither is already marked
- `BOOST_EXPERIENCES`: both experiences exist and belong to character, modifier < 6
- `EXTRA_DOMAIN_CARD`: card exists, card level <= next level, not already owned
- `newExperienceName` required iff tier transition
- No duplicate advancement types that would exceed slot limits

**On success:**
- Creates LevelUpRecord + LevelUpAdvancements
- Updates character in a Prisma transaction:
  - `level` incremented
  - `proficiency` incremented on tier transition
  - Trait values incremented (INCREASE_TRAITS) + MarkedTrait rows created
  - `hpTotal` incremented (ADD_HP)
  - `stressTotal` incremented (ADD_STRESS)
  - Experience modifiers incremented (BOOST_EXPERIENCES)
  - CharacterDomainCard row created (EXTRA_DOMAIN_CARD)
  - `evasion` incremented (INCREASE_EVASION)
  - New CharacterExperience created on tier transition (+2 modifier)
  - MarkedTrait rows deleted on tier 3+ transition
- Returns updated character
- Broadcasts stat update via WebSocket

**Error responses:**
- 400: Validation failure (details in body)
- 404: Character not found
- 409: Character already at level 10

## Service Layer

### LevelUpService

Self-contained within `CharactersModule`. Dependencies: `PrismaService`, `GameLogicService`, `SrdService`, `LevelUpRepository`, `CharacterRepository`.

**`getLevelUpOptions(characterId)`**
1. Fetch character with relations (experiences, domainCards, markedTraits)
2. Compute nextLevel, nextTier, isTierTransition via GameLogicService
3. Query LevelUpAdvancements for character's current tier to derive slot usage
4. Fetch eligible domain cards (level <= nextLevel, not already owned)
5. Return assembled options

**`applyLevelUp(characterId, dto)`**
1. Re-derive options at apply time (prevents race conditions)
2. Validate dto against current options
3. Execute Prisma transaction:
   - Create LevelUpRecord + LevelUpAdvancements
   - Apply all character mutations
   - Apply tier transition bonuses if applicable
4. Return updated character

### LevelUpRepository

Queries for `LevelUpRecord` and `LevelUpAdvancement`. Key query: all advancements for a character within a given tier (for slot counting).

## DTOs & Validation

### Enums (shared, in game-logic or shared types)

```typescript
enum AdvancementType {
  INCREASE_TRAITS
  ADD_HP
  ADD_STRESS
  BOOST_EXPERIENCES
  EXTRA_DOMAIN_CARD
  INCREASE_EVASION
}

enum Trait {
  AGILITY
  STRENGTH
  FINESSE
  INSTINCT
  PRESENCE
  KNOWLEDGE
}
```

### ApplyLevelUpDto

- `advancements`: array of exactly 2 AdvancementDto
- `newExperienceName`: optional string, min length 1
- Each AdvancementDto: `type` (enum) + optional `metadata` (validated nested, discriminated by type)

### Metadata DTOs

- `IncreaseTraitsMetadataDto`: `traits` — array of exactly 2 Trait enums
- `BoostExperiencesMetadataDto`: `experienceIds` — array of exactly 2 strings
- `DomainCardMetadataDto`: `domainCardId` — string

## Advancement Slot Limits Per Tier

| Advancement Type    | Max Per Tier |
|---------------------|-------------|
| INCREASE_TRAITS     | 3           |
| ADD_HP              | 2           |
| ADD_STRESS          | 2           |
| BOOST_EXPERIENCES   | 1           |
| EXTRA_DOMAIN_CARD   | 1           |
| INCREASE_EVASION    | 1           |

## Tier Rules

| Level | Tier | Notes                                      |
|-------|------|--------------------------------------------|
| 1     | 1    |                                            |
| 2-4   | 2    | Tier transition at level 2                 |
| 5-7   | 3    | Tier transition at level 5, clear marks    |
| 8-10  | 4    | Tier transition at level 8, clear marks    |

Tier transitions grant:
- +1 proficiency (automatic)
- New experience with +2 modifier (requires name input)
- Clear marked traits at tier 3+ transitions

## Testing Strategy

- **Unit tests:** LevelUpService — mock repository, test slot derivation, validation logic, each advancement type application
- **Integration tests:** LevelUpRepository — test queries against real DB
- **E2E tests:** Full endpoint tests — happy path level-up, all advancement types, tier transitions, validation errors, 409 at max level

## Future Considerations

- `LevelUpService` is designed for extraction to a standalone `LevelUpModule` when other character sub-resources are also refactored
- Frontend migration to use these endpoints is a separate task
