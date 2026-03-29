# SRD Entity Migration: Missing Categories

**Date:** 2026-03-29
**Status:** Approved

## Goal

Migrate 5 missing SRD categories (adversaries, beastforms, consumables, environments, items) from markdown/JSON source files into the NestJS API with Prisma models, seed script, endpoints, and tests. Abilities are already seeded as `DomainCard` — no new model needed.

## Source Data

All JSON files exist at `daggerheart-srd/.build/03_json/`. The seed script already reads from this directory.

## New Prisma Models

### Adversary + AdversaryFeature

Source: `adversaries.json` (~130 records)

```prisma
model Adversary {
  id                String  @id @default(uuid())
  name              String  @unique
  tier              Int
  type              String  // 'Solo' | 'Bruiser' | 'Leader' | 'Standard' | 'Ranged' | 'Skulk' | 'Horde' | 'Minion' | 'Support' | 'Social'
  hp                Int
  stress            Int
  difficulty        String  // usually int but "Special (see ...)" exists
  thresholds        String  // "major/severe" e.g. "8/15"
  atk               String  // e.g. "+3"
  attack            String  // weapon/attack name e.g. "Claws"
  range             String  // "Very Close", "Close", "Far", etc.
  damage            String  // "1d12+2 phy"
  description       String?
  motivesAndTactics String? @map("motives_and_tactics")
  experience        String?

  features AdversaryFeature[]

  @@map("adversaries")
}

model AdversaryFeature {
  id          String @id @default(uuid())
  adversaryId String @map("adversary_id")
  name        String
  text        String

  adversary Adversary @relation(fields: [adversaryId], references: [id], onDelete: Cascade)

  @@map("adversary_features")
}
```

### Beastform + BeastformFeature

Source: `beastforms.json` (~24 records)

```prisma
model Beastform {
  id           String  @id @default(uuid())
  name         String  @unique
  tier         Int
  examples     String  // "(Fox, Mouse, Weasel, etc.)"
  traitBonus   String  @map("trait_bonus")   // "Agility +1"
  evasionBonus String  @map("evasion_bonus") // "Evasion +2"
  attack       String  // "Melee Agility d4 phy"
  advantages   String  // "deceive, locate, sneak"

  features BeastformFeature[]

  @@map("beastforms")
}

model BeastformFeature {
  id          String @id @default(uuid())
  beastformId String @map("beastform_id")
  name        String
  text        String

  beastform Beastform @relation(fields: [beastformId], references: [id], onDelete: Cascade)

  @@map("beastform_features")
}
```

### Consumable

Source: `consumables.json` (~61 records)

```prisma
model Consumable {
  id          String @id @default(uuid())
  name        String @unique
  roll        Int    // loot table position (1-60)
  description String

  @@map("consumables")
}
```

### Environment + EnvironmentFeature

Source: `environments.json` (~19 records)

```prisma
model Environment {
  id                  String  @id @default(uuid())
  name                String  @unique
  tier                Int
  type                String  // 'Exploration' | 'Social' | etc.
  description         String
  difficulty          String  // usually int but can be "Special (...)"
  impulses            String
  potentialAdversaries String? @map("potential_adversaries")

  features EnvironmentFeature[]

  @@map("environments")
}

model EnvironmentFeature {
  id            String  @id @default(uuid())
  environmentId String  @map("environment_id")
  name          String
  text          String
  question      String? // GM prompt question

  environment Environment @relation(fields: [environmentId], references: [id], onDelete: Cascade)

  @@map("environment_features")
}
```

### Item

Source: `items.json` (~60 records)

```prisma
model Item {
  id          String @id @default(uuid())
  name        String @unique
  roll        Int    // loot table position (1-60)
  description String

  @@map("items")
}
```

## Seed Script

Extend existing `prisma/seed.ts`:
- Add raw interfaces for each new type
- Add delete calls (in dependency order) at the top of seed()
- Add seeding loops for each new category after existing seeds
- Parse numeric fields from strings where needed (tier, hp, stress, roll)

## NestJS Layer

### Repositories

One repository per model in `src/srd/repositories/`:
- `adversary.repository.ts` — findAll(filters?: {tier, type}), findById
- `beastform.repository.ts` — findAll(filters?: {tier}), findById
- `consumable.repository.ts` — findAll(), findById
- `environment.repository.ts` — findAll(filters?: {tier, type}), findById
- `item.repository.ts` — findAll(), findById

### Service

Extend existing `SrdService` with new methods following the same pattern:
- getAdversaries(filters?), getAdversary(id)
- getBeastforms(filters?), getBeastform(id)
- getConsumables(), getConsumable(id)
- getEnvironments(filters?), getEnvironment(id)
- getItems(), getItem(id)

### Controller

Extend existing `SrdController` with new endpoints:
- `GET /srd/adversaries`, `GET /srd/adversaries/:id`
- `GET /srd/beastforms`, `GET /srd/beastforms/:id`
- `GET /srd/consumables`, `GET /srd/consumables/:id`
- `GET /srd/environments`, `GET /srd/environments/:id`
- `GET /srd/items`, `GET /srd/items/:id`

### DTOs

Query DTOs for filterable entities:
- `AdversaryQueryDto` — optional tier (int), type (string)
- `BeastformQueryDto` — optional tier (int)
- `EnvironmentQueryDto` — optional tier (int), type (string)

No query DTOs needed for consumables/items (no meaningful filters).

### Module

Update `SrdModule` to provide the new repositories.

## Testing

E2E tests for each new endpoint set following the existing SRD test patterns:
- List all, filter by tier/type, get by ID, 404 for unknown ID

## Out of Scope

- RAG/vector search migration (separate future work)
- MCP server (being dropped entirely)
- Web app changes (will consume new API endpoints later)
- Relationships between entities (e.g. environment -> adversary links)
