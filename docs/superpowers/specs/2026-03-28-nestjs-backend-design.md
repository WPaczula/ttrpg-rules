# Daggerheart NestJS Backend — V1 Design Spec

## Overview

Move the Daggerheart character sheet data and logic from browser localStorage to a NestJS backend with Prisma + Postgres. V1 covers character CRUD, SRD reference data, and computed stats. No auth, no frontend integration, no level-up.

**Stack:** NestJS, Prisma, PostgreSQL, Railway
**Testing:** Unit + Integration + E2E, heavily tested game logic

---

## Database Schema

### SRD Reference Tables (seeded, read-only)

#### `classes`

| Column | Type | Notes |
|---|---|---|
| id | UUID | PK |
| name | text | unique |
| description | text | |
| evasion | int | base evasion value |
| hp | int | base HP |
| items | text | suggested starting items |
| suggestedTraits | int[] | fixed order: [agi, str, fin, ins, pre, kno] |
| suggestedPrimaryId | UUID? | FK → weapons |
| suggestedSecondaryId | UUID? | FK → weapons |
| suggestedArmorId | UUID? | FK → armor |
| hopeFeatureName | text | |
| hopeFeatureText | text | |

#### `class_features`

| Column | Type | Notes |
|---|---|---|
| id | UUID | PK |
| classId | UUID | FK → classes, CASCADE delete |
| name | text | |
| text | text | |

#### `subclasses`

| Column | Type | Notes |
|---|---|---|
| id | UUID | PK |
| classId | UUID | FK → classes, CASCADE delete |
| name | text | unique |
| description | text | |
| spellcastTrait | text | |

#### `subclass_features`

| Column | Type | Notes |
|---|---|---|
| id | UUID | PK |
| subclassId | UUID | FK → subclasses, CASCADE delete |
| tier | text | 'foundation' / 'specialization' / 'mastery' |
| name | text | |
| text | text | |

#### `ancestries`

| Column | Type | Notes |
|---|---|---|
| id | UUID | PK |
| name | text | unique |
| description | text | |

#### `ancestry_features`

| Column | Type | Notes |
|---|---|---|
| id | UUID | PK |
| ancestryId | UUID | FK → ancestries, CASCADE delete |
| name | text | |
| text | text | |

#### `communities`

| Column | Type | Notes |
|---|---|---|
| id | UUID | PK |
| name | text | unique |
| description | text | |
| note | text | |

#### `community_features`

| Column | Type | Notes |
|---|---|---|
| id | UUID | PK |
| communityId | UUID | FK → communities, CASCADE delete |
| name | text | |
| text | text | |

#### `domains`

| Column | Type | Notes |
|---|---|---|
| id | UUID | PK |
| name | text | unique |
| description | text | |

#### `class_domains` (join table)

| Column | Type | Notes |
|---|---|---|
| classId | UUID | FK → classes |
| domainId | UUID | FK → domains |
| | | composite PK |

#### `domain_cards`

| Column | Type | Notes |
|---|---|---|
| id | UUID | PK |
| domainId | UUID | FK → domains, CASCADE delete |
| name | text | |
| level | int | 1-10 |
| recallCost | int | |
| description | text | |

#### `weapons`

| Column | Type | Notes |
|---|---|---|
| id | UUID | PK |
| name | text | |
| tier | int | 1-4 |
| type | text | 'Primary' / 'Secondary' |
| damageType | text | 'Physical' / 'Magical' |
| trait | text | associated trait for attack |
| range | text | 'Melee', 'Very Close', etc. |
| damage | text | e.g. "d10+3 phy" |
| burden | text | 'One-Handed' / 'Two-Handed' |
| feature | text? | optional special feature |

#### `armor`

| Column | Type | Notes |
|---|---|---|
| id | UUID | PK |
| name | text | |
| tier | int | 1-4 |
| baseScore | int | 2-5 |
| baseThresholds | text | stored as "major / severe" e.g. "6 / 13", parsed by game-logic |
| evasionModifier | int? | optional |
| feature | text? | optional special feature |

### Character Tables (user data)

#### `characters`

| Column | Type | Notes |
|---|---|---|
| id | UUID | PK |
| name | text | |
| level | int | default 1 |
| classId | UUID | FK → classes |
| subclassId | UUID | FK → subclasses |
| ancestryId | UUID | FK → ancestries |
| secondaryAncestryId | UUID? | FK → ancestries |
| ancestryFeatureId | UUID | FK → ancestry_features |
| secondaryAncestryFeatureId | UUID? | FK → ancestry_features |
| communityId | UUID | FK → communities |
| agility | int | default 0 |
| strength | int | default 0 |
| finesse | int | default 0 |
| instinct | int | default 0 |
| presence | int | default 0 |
| knowledge | int | default 0 |
| hpTotal | int | default 6 |
| hpMarked | int | default 0 |
| stressTotal | int | default 6 |
| stressMarked | int | default 0 |
| armorId | UUID? | FK → armor |
| armorMarked | int | default 0 |
| evasion | int | default 10 |
| proficiency | int | default 1 |
| hope | int | default 2 |
| goldHandfuls | int | default 0 |
| goldBags | int | default 0 |
| goldChests | int | default 0 |
| primaryWeaponId | UUID? | FK → weapons |
| secondaryWeaponId | UUID? | FK → weapons |
| notes | text | default '' |
| createdAt | timestamp | auto |
| updatedAt | timestamp | auto |

#### `character_experiences`

| Column | Type | Notes |
|---|---|---|
| id | UUID | PK |
| characterId | UUID | FK → characters, CASCADE delete |
| name | text | |
| modifier | int | 1-6 |

#### `character_domain_cards`

| Column | Type | Notes |
|---|---|---|
| id | UUID | PK |
| characterId | UUID | FK → characters, CASCADE delete |
| domainCardId | UUID | FK → domain_cards |

#### `character_threshold_bonuses`

| Column | Type | Notes |
|---|---|---|
| id | UUID | PK |
| characterId | UUID | FK → characters, CASCADE delete |
| sourceType | text | 'domainCard' / 'subclassFeature' / 'classFeature' |
| sourceId | text | human-readable key, e.g. "Fortified Armor" or "Stalwart:Unwavering" |
| majorBonus | int | |
| severeBonus | int | |
| active | boolean | default false |

#### `character_marked_traits`

| Column | Type | Notes |
|---|---|---|
| id | UUID | PK |
| characterId | UUID | FK → characters, CASCADE delete |
| trait | text | trait name |

---

## API Endpoints

### SRD Module (read-only)

```
GET /srd/classes              — list all classes (with features, domains, subclasses)
GET /srd/classes/:id          — single class detail
GET /srd/subclasses           — list all subclasses (with features by tier)
GET /srd/subclasses/:id       — single subclass detail
GET /srd/ancestries           — list all ancestries (with features)
GET /srd/ancestries/:id       — single ancestry detail
GET /srd/communities          — list all communities (with features)
GET /srd/communities/:id      — single community detail
GET /srd/domains              — list all domains (with cards)
GET /srd/domains/:id          — single domain detail
GET /srd/domain-cards         — list all domain cards (filterable by domain, level)
GET /srd/weapons              — list all weapons (filterable by tier, type)
GET /srd/armor                — list all armor (filterable by tier)
```

### Characters Module

```
POST   /characters            — create character (validated against SRD)
GET    /characters             — list all characters
GET    /characters/:id         — full character with computed stats
PATCH  /characters/:id         — update mutable state (hpMarked, stressMarked, hope,
                                 gold, armorMarked, equipment, traits, etc.)
DELETE /characters/:id         — delete character

POST   /characters/:id/experiences          — add experience
PATCH  /characters/:id/experiences/:expId   — update experience
DELETE /characters/:id/experiences/:expId   — remove experience

POST   /characters/:id/domain-cards         — add domain card to character
DELETE /characters/:id/domain-cards/:cardId — remove domain card

PATCH  /characters/:id/threshold-bonuses/:bonusId — toggle active on/off
```

### Computed Stats (returned in GET /characters/:id)

```json
{
  "character": { "...raw stored data with relations..." },
  "computed": {
    "tier": 2,
    "thresholds": {
      "major": 8,
      "severe": 15,
      "breakdown": {
        "base": [6, 13],
        "levelBonus": 1,
        "activeBonuses": [
          { "source": "Fortified Armor", "major": 2, "severe": 2 }
        ]
      }
    },
    "effectiveEvasion": 10,
    "traitModifiers": { "agility": -1 }
  }
}
```

---

## Module Architecture

```
src/
├── app.module.ts
├── main.ts
├── prisma/
│   ├── prisma.module.ts          — PrismaClient lifecycle only, exported globally
│   ├── prisma.service.ts         — extends PrismaClient
│   └── schema.prisma
├── srd/
│   ├── srd.module.ts
│   ├── srd.controller.ts
│   ├── srd.service.ts
│   ├── interfaces/               — domain interfaces (SrdClass, SrdWeapon, etc.)
│   ├── dto/                      — response/query DTOs
│   ├── repositories/             — one per entity, maps DB → domain interfaces
│   └── seed/
│       └── srd-seed.service.ts   — loads JSON, seeds DB via Prisma
├── characters/
│   ├── characters.module.ts
│   ├── characters.controller.ts
│   ├── characters.service.ts
│   ├── interfaces/               — Character, Experience, ComputedStats, etc.
│   ├── dto/                      — create/update/response DTOs
│   └── repositories/             — character, experience, domain-card, threshold-bonus
├── game-logic/
│   ├── game-logic.module.ts
│   ├── game-logic.service.ts     — pure calculations, no DB access
│   └── interfaces/               — ThresholdBreakdown, etc.
└── common/
    ├── filters/
    │   └── http-exception.filter.ts
    ├── interceptors/
    │   └── logging.interceptor.ts
    └── pipes/
        └── validation.pipe.ts
```

### Layer Responsibilities

- **Prisma module**: only PrismaClient lifecycle, knows nothing about business logic
- **Repositories**: inject PrismaService, map DB rows → domain interfaces. Only layer that knows Prisma types
- **Services**: work with domain interfaces, delegate DB to repositories, delegate computation to game-logic
- **Controllers**: validate input (DTOs + pipes), call services, return response DTOs
- **Game logic**: pure functions operating on domain interfaces, no DB dependency

---

## Computation Logic

All derived values are computed on the fly during GET requests by `GameLogicService`. Nothing computed is persisted.

### Tier Derivation

| Level | Tier |
|---|---|
| 1 | 1 |
| 2-4 | 2 |
| 5-7 | 3 |
| 8-10 | 4 |

### Damage Threshold Calculation

```
totalMajor = armorBaseMajor + (level - 1) + sum(activeBonuses.major)
totalSevere = armorBaseSevere + (level - 1) + sum(activeBonuses.severe)
```

### Threshold Bonus Sources (hardcoded in game-logic)

**Domain card bonuses:**
- Fortified Armor: +2 / +2
- Vitality: +2 / +2
- Rise Up: +0 / +proficiency
- Blade-Touched: +0 / +4
- Splendor-Touched: +0 / +3
- Frenzy: +0 / +8

**Subclass feature bonuses:**
- Stalwart:Unwavering: +1 / +1
- Stalwart:Unrelenting: +2 / +2
- Stalwart:Undaunted: +3 / +3
- Winged Sentinel:Ascendant: +0 / +4
- Elemental Origin:Transcendence: +0 / +4

**Class level bonuses:**
- Druid:Shell: +proficiency / +proficiency

### Equipment Modifier Parsing

Parse weapon/armor feature text for trait modifiers using patterns:
- "+N to Trait" / "-N to Trait"
- "+N bonus to Trait"
- "decrease Trait by N" / "increase Trait by N"

### Effective Evasion

```
effectiveEvasion = character.evasion + (armor.evasionModifier ?? 0)
```

---

## Error Handling

### Error Response Shape

```json
{
  "error": "CHARACTER_NOT_FOUND",
  "message": "Character with id 'abc-123' does not exist",
  "timestamp": "2026-03-28T12:00:00.000Z"
}
```

### Error Codes

| Code | HTTP Status | Description |
|---|---|---|
| VALIDATION_ERROR | 400 | Request body/params failed validation |
| CHARACTER_NOT_FOUND | 404 | Character ID doesn't exist |
| SRD_RESOURCE_NOT_FOUND | 404 | SRD reference not found |
| INVALID_SRD_REFERENCE | 400 | FK reference to SRD doesn't exist |
| DOMAIN_CARD_NOT_AVAILABLE | 400 | Card not in character's class domains or exceeds level |
| DUPLICATE_DOMAIN_CARD | 409 | Character already has this card |
| EXPERIENCE_NOT_FOUND | 404 | Experience doesn't exist on character |
| INTERNAL_ERROR | 500 | Unexpected server error |

### Global Exception Filter

- Maps Prisma `NotFoundError` → appropriate 404 error code
- Maps `class-validator` errors → `VALIDATION_ERROR` with field details
- Maps custom business exceptions → specific error codes
- Catches unhandled errors → `INTERNAL_ERROR` (stack trace logged, not exposed)

---

## Validation

- Global `ValidationPipe` with `whitelist: true`, `forbidNonWhitelisted: true`, `transform: true`
- DTOs use `class-validator` decorators (`@IsUUID`, `@IsInt`, `@Min`, `@Max`, etc.)
- SRD reference existence validated at service level (classId, subclassId, etc. must exist in DB)

---

## Logging

- **Request/response interceptor**: logs method, path, duration for every request
- **Service-level**: logs character created/updated/deleted operations
- **Exception filter**: logs full error context + stack trace for 500s
- Uses NestJS built-in `Logger` with class context

---

## Testing Strategy

### Unit Tests

- **Game logic service**: every calculation path — tier, thresholds with all bonus combos, equipment modifier parsing, edge cases (level 1/10, no armor, all bonuses active)
- **Repositories**: mock PrismaService, verify queries and DB → domain mapping
- **Services**: mock repositories, test business rules (invalid SRD references, duplicate cards, etc.)
- **DTOs**: validate class-validator decorators catch bad input
- **Exception filter**: verify error code mapping, response shape

### Integration Tests

- Real test Postgres, seeded with SRD data
- Repository queries against real schema, FK constraints, cascade deletes
- Full create → read → update → delete flows
- PATCH flows: HP/stress/hope/gold, experiences, domain cards, threshold toggles

### E2E Tests

- Full HTTP requests against running app
- Happy paths: create character, GET with computed stats, PATCH state
- Error paths: 400/404/409 with correct error codes
- SRD endpoints: list/filter/detail
- Edge cases: minimal fields, all optional fields, boundary values

### Test Infrastructure

- Separate Postgres instance (docker-compose for local dev)
- SRD seed runs once before integration/E2E suites
- Character tables truncated between tests (SRD kept)

---

## Hosting (Railway)

- Railway project with 2 services: NestJS app + Postgres database
- `DATABASE_URL` environment variable auto-provisioned by Railway
- Private networking between app and DB
- Prisma `schema.prisma` uses `env("DATABASE_URL")`
- Prisma migrations run on deploy

---

## Implementation Phases

Each phase is a self-contained unit of work that can be completed in one session and produces a working, tested increment.

### Phase 1: Project Scaffold, Prisma Setup & Cross-cutting Concerns

- Initialize NestJS project with required dependencies (Prisma, class-validator, class-transformer)
- Create `schema.prisma` with full database schema (all tables above)
- Set up `PrismaModule` and `PrismaService`
- Configure docker-compose with Postgres for local dev
- Implement global exception filter with error codes
- Implement logging interceptor
- Configure global ValidationPipe
- Run initial migration, verify schema
- Write unit tests for exception filter (error code mapping, response shape)
- **Done when:** `npx prisma migrate dev` succeeds, empty DB with all tables created, exception filter and logging interceptor work

### Phase 2: SRD Seed & SRD Module

- Build seed script that loads SRD JSON files and populates all reference tables
- Create SRD domain interfaces
- Create SRD repositories (one per entity)
- Create SRD service and controller with all GET endpoints
- Create response DTOs
- Write integration tests for seeding
- Write E2E tests for all SRD endpoints
- **Done when:** all SRD endpoints return correct data from seeded DB, tests pass

### Phase 3: Game Logic Service

- Create `GameLogicModule` and `GameLogicService`
- Implement tier calculation
- Implement damage threshold computation (base + level + bonuses)
- Implement threshold bonus source definitions
- Implement equipment modifier parsing
- Implement effective evasion calculation
- Create domain interfaces (ThresholdBreakdown, ComputedStats)
- Write comprehensive unit tests for every calculation path and edge case
- **Done when:** all computation logic works, unit tests cover all paths

### Phase 4: Character CRUD

- Create character domain interfaces
- Create character repositories (character, experience, domain-card, threshold-bonus)
- Create character service with create and read operations
- Create DTOs (CreateCharacterDto, CharacterResponseDto) with validation
- Create character controller (POST, GET list, GET by id, DELETE)
- GET by id returns raw + computed stats via GameLogicService
- Validate SRD references on create (classId, subclassId, etc. must exist)
- Write unit tests for service business logic
- Write integration tests for repository + service
- Write E2E tests for all character endpoints
- **Done when:** can create, read, list, delete characters via API with computed stats, all tests pass

### Phase 5: Character PATCH & Sub-resources

- Add PATCH endpoint for mutable character state (hpMarked, stressMarked, hope, gold, armorMarked, equipment, traits)
- Create UpdateCharacterDto with partial validation
- Add experience sub-resource endpoints (POST, PATCH, DELETE)
- Add domain card sub-resource endpoints (POST, DELETE) with validation (card must be in character's domains, not duplicate, not above level)
- Add threshold bonus toggle endpoint (PATCH active on/off)
- Write unit tests for all update business rules
- Write integration tests for all PATCH/sub-resource flows
- Write E2E tests for all new endpoints
- **Done when:** full character lifecycle works (create → update state → add/remove sub-resources), all tests pass

### Phase 6: Polish & Documentation

- Document error codes table in README
- Add any missing edge-case tests
- Verify all tests pass end-to-end
- Review and clean up any TODOs or rough edges
- **Done when:** README documents error codes, full test suite green, API ready for V2 frontend integration
