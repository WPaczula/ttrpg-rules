# Atomic Character Creation with Experiences & Domain Cards

## Problem

Creating a character currently requires 1 + N + M sequential API calls:
- `POST /characters` — base character
- `POST /characters/:id/experiences` × N
- `POST /characters/:id/domain-cards` × N

Additionally, the domain card tier eligibility check in `addDomainCard` uses `tier * 2` as the max level, which is wrong. A level 2 character should be able to pick domain cards up to level 2, not level 4.

## Goals

1. `POST /characters` accepts `experiences` and `domainCardIds` inline — one call creates everything atomically.
2. Fix the domain card eligibility rule in the existing `addDomainCard` path.
3. Remove `any` types from `tools.ts`.

---

## API Changes

### `CreateCharacterDto`

Add two optional fields:

```typescript
@IsArray()
@IsOptional()
@ValidateNested({ each: true })
@Type(() => CreateExperienceDto)
experiences?: CreateExperienceDto[];

@IsArray()
@IsOptional()
@IsUUID('4', { each: true })
domainCardIds?: string[];
```

### `CharactersService.create()`

Before writing to the DB, validate each `domainCardId`:
- Card must exist (throw `NotFoundException` if not)
- `card.level <= 1` — new characters are always level 1, so only level 1 cards are eligible (same rule as `addDomainCard`: `card.level <= character.level`)

Then delegate to the repository with the new fields.

### `CharacterRepository.create()`

Extend to accept `experiences` and `domainCardIds`, using Prisma nested writes so all records are created in a single atomic operation:

```typescript
await this.prisma.character.create({
  data: {
    ...fields,
    experiences: {
      create: experiences?.map(e => ({ name: e.name, modifier: e.modifier })) ?? [],
    },
    domainCards: {
      create: domainCardIds?.map(id => ({ domainCardId: id })) ?? [],
    },
  },
  include: CHARACTER_INCLUDE,
})
```

No explicit `$transaction` needed — Prisma nested writes are atomic.

### Bug fix: `addDomainCard` eligibility

```typescript
// Before (wrong)
const tier = this.gameLogic.computeTier(character.level);
const maxLevel = tier * 2;

// After (correct)
const maxLevel = character.level;
```

Rule: a character may equip domain cards whose level is ≤ their character level.

---

## Web Changes (`tools.ts`)

### Add `CharacterApiResponse` type

```typescript
type CharacterApiResponse = {
  character: {
    id: string;
    name: string;
    class: { name: string };
    subclass: { name: string };
    ancestry: { name: string };
    secondaryAncestry: { name: string } | null;
    community: { name: string };
    agility: number;
    strength: number;
    finesse: number;
    instinct: number;
    presence: number;
    knowledge: number;
    primaryWeapon: { name: string } | null;
    secondaryWeapon: { name: string } | null;
    armor: { name: string } | null;
    notes: string;
    experiences: { id: string; name: string; modifier: number }[];
    domainCards: { domainCard: { name: string; level: number; domainName: string } }[];
  };
};
```

### Simplify `finalize_character` execute

Replace 1 + N + M calls with:
1. `POST /characters` with `{ ...dto, experiences, domainCardIds }` — typed as `CharacterApiResponse`
2. `GET /characters/me` — typed as `CharacterApiResponse`

Remove the sequential experience and domain card loops entirely.

Replace all `any` usages with `CharacterApiResponse` (or the nested character type).

---

## Out of Scope

- `mapCharacter` `any` types in `character.repository.ts` — separate concern
- Updating tests for the new DTO fields — follow-on work
