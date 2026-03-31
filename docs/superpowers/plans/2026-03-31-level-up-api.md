# Level-Up API Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add backend endpoints to compute level-up options and apply level-up choices atomically, with full validation and history tracking.

**Architecture:** Two new Prisma models (`LevelUpRecord`, `LevelUpAdvancement`) store level-up history. A `LevelUpService` derives available advancement slots from history and applies level-ups in a Prisma transaction. Two new endpoints on the existing `CharactersController` serve options and accept submissions. All game rules live server-side; the frontend is not changed.

**Tech Stack:** NestJS, Prisma (PostgreSQL), class-validator, Jest

---

## File Structure

| Action | Path | Responsibility |
|--------|------|----------------|
| Create | `api/src/characters/enums/advancement-type.enum.ts` | AdvancementType enum |
| Create | `api/src/characters/enums/trait.enum.ts` | Trait enum |
| Modify | `api/prisma/schema.prisma` | Add LevelUpRecord + LevelUpAdvancement models |
| Create | `api/src/characters/repositories/level-up.repository.ts` | Prisma queries for level-up history |
| Create | `api/src/characters/dto/apply-level-up.dto.ts` | Input DTO with class-validator |
| Create | `api/src/characters/interfaces/level-up-options.interface.ts` | Response shape for GET options |
| Create | `api/src/characters/level-up.service.ts` | Business logic: options computation + apply |
| Modify | `api/src/characters/characters.controller.ts` | Add 2 new endpoints |
| Modify | `api/src/characters/characters.module.ts` | Register new providers |
| Modify | `api/src/common/error-codes.ts` | Add level-up error codes |
| Create | `api/src/characters/level-up.service.spec.ts` | Unit tests for LevelUpService |
| Create | `api/src/characters/repositories/level-up.repository.spec.ts` | Unit tests for repository |

---

### Task 1: Prisma Schema — Add LevelUpRecord and LevelUpAdvancement models

**Files:**
- Modify: `api/prisma/schema.prisma`

- [ ] **Step 1: Add the AdvancementType enum and new models to schema.prisma**

Add at the bottom of the file, before the closing (after `CharacterMarkedTrait`):

```prisma
enum AdvancementType {
  INCREASE_TRAITS
  ADD_HP
  ADD_STRESS
  BOOST_EXPERIENCES
  EXTRA_DOMAIN_CARD
  INCREASE_EVASION
}

model LevelUpRecord {
  id                String   @id @default(uuid())
  characterId       String   @map("character_id")
  fromLevel         Int      @map("from_level")
  toLevel           Int      @map("to_level")
  fromTier          Int      @map("from_tier")
  toTier            Int      @map("to_tier")
  newExperienceName String?  @map("new_experience_name")
  createdAt         DateTime @default(now()) @map("created_at")

  character    Character            @relation(fields: [characterId], references: [id], onDelete: Cascade)
  advancements LevelUpAdvancement[]

  @@map("level_up_records")
}

model LevelUpAdvancement {
  id              String          @id @default(uuid())
  levelUpRecordId String          @map("level_up_record_id")
  type            AdvancementType
  metadata        Json?

  levelUpRecord LevelUpRecord @relation(fields: [levelUpRecordId], references: [id], onDelete: Cascade)

  @@map("level_up_advancements")
}
```

Also add the relation to the existing `Character` model. Find the `markedTraits` line and add after it:

```prisma
  levelUpRecords   LevelUpRecord[]
```

- [ ] **Step 2: Generate and run the migration**

Run:
```bash
cd api && npx prisma migrate dev --name add-level-up-history
```

Expected: Migration created and applied successfully. Prisma client regenerated.

- [ ] **Step 3: Verify the generated client has the new types**

Run:
```bash
cd api && npx ts-node -e "import { AdvancementType } from '@prisma/client'; console.log(AdvancementType)"
```

Expected: Prints the enum values object.

- [ ] **Step 4: Commit**

```bash
git add api/prisma/schema.prisma api/prisma/migrations/
git commit -m "feat: add LevelUpRecord and LevelUpAdvancement Prisma models"
```

---

### Task 2: Enums — Create shared TypeScript enums

**Files:**
- Create: `api/src/characters/enums/advancement-type.enum.ts`
- Create: `api/src/characters/enums/trait.enum.ts`

- [ ] **Step 1: Create AdvancementType enum**

Create `api/src/characters/enums/advancement-type.enum.ts`:

```typescript
export { AdvancementType } from '@prisma/client';
```

We re-export the Prisma enum so consumers import from our code, not directly from Prisma. This makes future extraction easier.

- [ ] **Step 2: Create Trait enum**

Create `api/src/characters/enums/trait.enum.ts`:

```typescript
export enum Trait {
  AGILITY = 'agility',
  STRENGTH = 'strength',
  FINESSE = 'finesse',
  INSTINCT = 'instinct',
  PRESENCE = 'presence',
  KNOWLEDGE = 'knowledge',
}
```

- [ ] **Step 3: Commit**

```bash
git add api/src/characters/enums/
git commit -m "feat: add AdvancementType and Trait enums"
```

---

### Task 3: Error Codes — Add level-up specific error codes

**Files:**
- Modify: `api/src/common/error-codes.ts`

- [ ] **Step 1: Add new error codes**

Add these entries to the `ErrorCode` enum in `api/src/common/error-codes.ts`:

```typescript
  MAX_LEVEL_REACHED = 'MAX_LEVEL_REACHED',
  INVALID_ADVANCEMENT = 'INVALID_ADVANCEMENT',
  ADVANCEMENT_SLOT_FULL = 'ADVANCEMENT_SLOT_FULL',
  TRAIT_ALREADY_MARKED = 'TRAIT_ALREADY_MARKED',
  EXPERIENCE_MODIFIER_MAXED = 'EXPERIENCE_MODIFIER_MAXED',
  MISSING_EXPERIENCE_NAME = 'MISSING_EXPERIENCE_NAME',
```

- [ ] **Step 2: Commit**

```bash
git add api/src/common/error-codes.ts
git commit -m "feat: add level-up error codes"
```

---

### Task 4: Interfaces — Level-up options response shape

**Files:**
- Create: `api/src/characters/interfaces/level-up-options.interface.ts`

- [ ] **Step 1: Create the interface file**

Create `api/src/characters/interfaces/level-up-options.interface.ts`:

```typescript
import { AdvancementType } from '../enums/advancement-type.enum';

export interface IAdvancementOption {
  type: AdvancementType;
  slotsUsed: number;
  slotsMax: number;
  available: boolean;
}

export interface ITierBonuses {
  proficiencyIncrease: boolean;
  clearMarkedTraits: boolean;
  requiresNewExperience: boolean;
}

export interface IEligibleDomainCard {
  id: string;
  name: string;
  level: number;
  domainName: string;
}

export interface ILevelUpOptions {
  currentLevel: number;
  nextLevel: number;
  currentTier: number;
  nextTier: number;
  isTierTransition: boolean;
  tierBonuses: ITierBonuses | null;
  availableAdvancements: IAdvancementOption[];
  eligibleDomainCards: IEligibleDomainCard[];
}
```

- [ ] **Step 2: Commit**

```bash
git add api/src/characters/interfaces/level-up-options.interface.ts
git commit -m "feat: add level-up options interface"
```

---

### Task 5: Repository — LevelUpRepository

**Files:**
- Create: `api/src/characters/repositories/level-up.repository.ts`
- Create: `api/src/characters/repositories/level-up.repository.spec.ts`

- [ ] **Step 1: Write the failing test for getAdvancementsForCharacterInTier**

Create `api/src/characters/repositories/level-up.repository.spec.ts`:

```typescript
jest.mock('@prisma/client', () => ({ PrismaClient: jest.fn() }));

import { LevelUpRepository } from './level-up.repository';
import { PrismaService } from '../../prisma/prisma.service';
import { AdvancementType } from '@prisma/client';

const mockPrisma = {
  levelUpRecord: {
    create: jest.fn(),
  },
  levelUpAdvancement: {
    findMany: jest.fn(),
  },
};

describe('LevelUpRepository', () => {
  let repo: LevelUpRepository;

  beforeEach(() => {
    jest.clearAllMocks();
    repo = new LevelUpRepository(mockPrisma as unknown as PrismaService);
  });

  describe('getAdvancementsInTier', () => {
    it('should return advancements for levels within the tier range', async () => {
      const mockAdvancements = [
        { id: 'adv-1', type: AdvancementType.ADD_HP, metadata: null },
        { id: 'adv-2', type: AdvancementType.ADD_HP, metadata: null },
      ];
      mockPrisma.levelUpAdvancement.findMany.mockResolvedValue(mockAdvancements);

      const result = await repo.getAdvancementsInTier('char-1', 2, 4);

      expect(mockPrisma.levelUpAdvancement.findMany).toHaveBeenCalledWith({
        where: {
          levelUpRecord: {
            characterId: 'char-1',
            toLevel: { gte: 2, lte: 4 },
          },
        },
        select: { id: true, type: true, metadata: true },
      });
      expect(result).toEqual(mockAdvancements);
    });
  });

  describe('createWithAdvancements', () => {
    it('should create a level-up record with nested advancements', async () => {
      const mockRecord = {
        id: 'rec-1',
        characterId: 'char-1',
        fromLevel: 1,
        toLevel: 2,
        fromTier: 1,
        toTier: 2,
        newExperienceName: 'Scouting',
        advancements: [
          { id: 'adv-1', type: AdvancementType.ADD_HP, metadata: null },
        ],
      };
      mockPrisma.levelUpRecord.create.mockResolvedValue(mockRecord);

      const result = await repo.createWithAdvancements({
        characterId: 'char-1',
        fromLevel: 1,
        toLevel: 2,
        fromTier: 1,
        toTier: 2,
        newExperienceName: 'Scouting',
        advancements: [{ type: AdvancementType.ADD_HP, metadata: null }],
      });

      expect(mockPrisma.levelUpRecord.create).toHaveBeenCalledWith({
        data: {
          characterId: 'char-1',
          fromLevel: 1,
          toLevel: 2,
          fromTier: 1,
          toTier: 2,
          newExperienceName: 'Scouting',
          advancements: {
            create: [{ type: AdvancementType.ADD_HP, metadata: null }],
          },
        },
        include: { advancements: true },
      });
      expect(result).toEqual(mockRecord);
    });
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run:
```bash
cd api && npx jest src/characters/repositories/level-up.repository.spec.ts --no-coverage
```

Expected: FAIL — cannot find module `./level-up.repository`

- [ ] **Step 3: Implement LevelUpRepository**

Create `api/src/characters/repositories/level-up.repository.ts`:

```typescript
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AdvancementType } from '../enums/advancement-type.enum';

interface CreateLevelUpData {
  characterId: string;
  fromLevel: number;
  toLevel: number;
  fromTier: number;
  toTier: number;
  newExperienceName: string | null;
  advancements: { type: AdvancementType; metadata: unknown }[];
}

@Injectable()
export class LevelUpRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getAdvancementsInTier(
    characterId: string,
    tierStartLevel: number,
    tierEndLevel: number,
  ) {
    return this.prisma.levelUpAdvancement.findMany({
      where: {
        levelUpRecord: {
          characterId,
          toLevel: { gte: tierStartLevel, lte: tierEndLevel },
        },
      },
      select: { id: true, type: true, metadata: true },
    });
  }

  async createWithAdvancements(data: CreateLevelUpData) {
    return this.prisma.levelUpRecord.create({
      data: {
        characterId: data.characterId,
        fromLevel: data.fromLevel,
        toLevel: data.toLevel,
        fromTier: data.fromTier,
        toTier: data.toTier,
        newExperienceName: data.newExperienceName,
        advancements: {
          create: data.advancements.map((a) => ({
            type: a.type,
            metadata: a.metadata ?? undefined,
          })),
        },
      },
      include: { advancements: true },
    });
  }
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run:
```bash
cd api && npx jest src/characters/repositories/level-up.repository.spec.ts --no-coverage
```

Expected: PASS — 2 tests passing

- [ ] **Step 5: Commit**

```bash
git add api/src/characters/repositories/level-up.repository.ts api/src/characters/repositories/level-up.repository.spec.ts
git commit -m "feat: add LevelUpRepository with tier advancement queries"
```

---

### Task 6: DTOs — ApplyLevelUpDto with class-validator

**Files:**
- Create: `api/src/characters/dto/apply-level-up.dto.ts`

- [ ] **Step 1: Create the DTO file**

Create `api/src/characters/dto/apply-level-up.dto.ts`:

```typescript
import {
  IsEnum,
  IsOptional,
  IsString,
  MinLength,
  ArrayMinSize,
  ArrayMaxSize,
  ValidateNested,
  IsArray,
  IsUUID,
} from 'class-validator';
import { Type } from 'class-transformer';
import { AdvancementType } from '../enums/advancement-type.enum';
import { Trait } from '../enums/trait.enum';

export class IncreaseTraitsMetadataDto {
  @IsArray()
  @ArrayMinSize(2)
  @ArrayMaxSize(2)
  @IsEnum(Trait, { each: true })
  traits: [Trait, Trait];
}

export class BoostExperiencesMetadataDto {
  @IsArray()
  @ArrayMinSize(2)
  @ArrayMaxSize(2)
  @IsUUID('4', { each: true })
  experienceIds: [string, string];
}

export class DomainCardMetadataDto {
  @IsUUID()
  domainCardId: string;
}

export class AdvancementDto {
  @IsEnum(AdvancementType)
  type: AdvancementType;

  @IsOptional()
  @ValidateNested()
  @Type(() => Object, {
    discriminator: {
      property: 'type',
      subTypes: [
        { value: IncreaseTraitsMetadataDto, name: AdvancementType.INCREASE_TRAITS },
        { value: BoostExperiencesMetadataDto, name: AdvancementType.BOOST_EXPERIENCES },
        { value: DomainCardMetadataDto, name: AdvancementType.EXTRA_DOMAIN_CARD },
      ],
    },
    keepDiscriminatorProperty: true,
  })
  metadata?: IncreaseTraitsMetadataDto | BoostExperiencesMetadataDto | DomainCardMetadataDto;
}

export class ApplyLevelUpDto {
  @IsArray()
  @ArrayMinSize(2)
  @ArrayMaxSize(2)
  @ValidateNested({ each: true })
  @Type(() => AdvancementDto)
  advancements: [AdvancementDto, AdvancementDto];

  @IsOptional()
  @IsString()
  @MinLength(1)
  newExperienceName?: string;
}
```

- [ ] **Step 2: Commit**

```bash
git add api/src/characters/dto/apply-level-up.dto.ts
git commit -m "feat: add ApplyLevelUpDto with class-validator decorators"
```

---

### Task 7: LevelUpService — getLevelUpOptions

**Files:**
- Create: `api/src/characters/level-up.service.ts`
- Create: `api/src/characters/level-up.service.spec.ts`

- [ ] **Step 1: Write failing tests for getLevelUpOptions**

Create `api/src/characters/level-up.service.spec.ts`:

```typescript
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn(),
  AdvancementType: {
    INCREASE_TRAITS: 'INCREASE_TRAITS',
    ADD_HP: 'ADD_HP',
    ADD_STRESS: 'ADD_STRESS',
    BOOST_EXPERIENCES: 'BOOST_EXPERIENCES',
    EXTRA_DOMAIN_CARD: 'EXTRA_DOMAIN_CARD',
    INCREASE_EVASION: 'INCREASE_EVASION',
  },
}));

import { Test, TestingModule } from '@nestjs/testing';
import { LevelUpService } from './level-up.service';
import { CharacterRepository } from './repositories/character.repository';
import { LevelUpRepository } from './repositories/level-up.repository';
import { GameLogicService } from '../game-logic/game-logic.service';
import { DomainCardRepository } from '../srd/repositories/domain-card.repository';
import { ICharacterWithRelations } from './interfaces/character.interface';
import { AdvancementType } from '@prisma/client';

const makeCharacter = (
  overrides: Partial<ICharacterWithRelations> = {},
): ICharacterWithRelations => ({
  id: 'char-1',
  userId: 'user-1',
  name: 'Aria',
  level: 1,
  classId: 'cls-1',
  subclassId: 'sub-1',
  ancestryId: 'anc-1',
  secondaryAncestryId: null,
  ancestryFeatureId: 'af-1',
  secondaryAncestryFeatureId: null,
  communityId: 'com-1',
  agility: 1,
  strength: 0,
  finesse: 2,
  instinct: 0,
  presence: 1,
  knowledge: -1,
  hpTotal: 6,
  hpMarked: 0,
  stressTotal: 6,
  stressMarked: 0,
  armorId: null,
  armorMarked: 0,
  evasion: 10,
  proficiency: 1,
  hope: 2,
  goldHandfuls: 0,
  goldBags: 0,
  goldChests: 0,
  primaryWeaponId: null,
  secondaryWeaponId: null,
  notes: '',
  createdAt: new Date(),
  updatedAt: new Date(),
  class: { id: 'cls-1', name: 'Warrior' },
  subclass: { id: 'sub-1', name: 'Berserker' },
  ancestry: { id: 'anc-1', name: 'Human' },
  secondaryAncestry: null,
  ancestryFeature: { id: 'af-1', name: 'Versatile', text: 'Flexible' },
  secondaryAncestryFeature: null,
  community: { id: 'com-1', name: 'Wanderers' },
  armor: null,
  primaryWeapon: null,
  secondaryWeapon: null,
  experiences: [],
  domainCards: [],
  thresholdBonuses: [],
  markedTraits: [],
  ...overrides,
});

const mockCharacterRepo = {
  findById: jest.fn(),
  update: jest.fn(),
};

const mockLevelUpRepo = {
  getAdvancementsInTier: jest.fn(),
  createWithAdvancements: jest.fn(),
};

const mockDomainCardRepo = {
  findAll: jest.fn(),
  findById: jest.fn(),
};

describe('LevelUpService', () => {
  let service: LevelUpService;
  let gameLogic: GameLogicService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LevelUpService,
        GameLogicService,
        { provide: CharacterRepository, useValue: mockCharacterRepo },
        { provide: LevelUpRepository, useValue: mockLevelUpRepo },
        { provide: DomainCardRepository, useValue: mockDomainCardRepo },
      ],
    }).compile();
    service = module.get(LevelUpService);
    gameLogic = module.get(GameLogicService);
  });

  describe('getLevelUpOptions', () => {
    it('should throw ConflictException when character is level 10', async () => {
      mockCharacterRepo.findById.mockResolvedValue(makeCharacter({ level: 10 }));

      await expect(service.getLevelUpOptions('char-1')).rejects.toThrow(
        'already at maximum level',
      );
    });

    it('should return options for a level 1 character (non-tier transition)', async () => {
      mockCharacterRepo.findById.mockResolvedValue(makeCharacter({ level: 1 }));
      mockLevelUpRepo.getAdvancementsInTier.mockResolvedValue([]);
      mockDomainCardRepo.findAll.mockResolvedValue([
        { id: 'dc-1', name: 'Flame Bolt', level: 1, domainName: 'Arcana', recallCost: 1, description: '' },
      ]);

      const result = await service.getLevelUpOptions('char-1');

      expect(result.currentLevel).toBe(1);
      expect(result.nextLevel).toBe(2);
      expect(result.isTierTransition).toBe(true);
      expect(result.tierBonuses).toEqual({
        proficiencyIncrease: true,
        clearMarkedTraits: false,
        requiresNewExperience: true,
      });
      expect(result.availableAdvancements).toHaveLength(6);
      expect(result.availableAdvancements.every((a) => a.available)).toBe(true);
    });

    it('should return options for level 4 character (tier transition to tier 3 at level 5)', async () => {
      mockCharacterRepo.findById.mockResolvedValue(makeCharacter({ level: 4 }));
      mockLevelUpRepo.getAdvancementsInTier.mockResolvedValue([]);
      mockDomainCardRepo.findAll.mockResolvedValue([]);

      const result = await service.getLevelUpOptions('char-1');

      expect(result.nextLevel).toBe(5);
      expect(result.isTierTransition).toBe(true);
      expect(result.tierBonuses!.clearMarkedTraits).toBe(true);
    });

    it('should mark slots as unavailable when tier limit reached', async () => {
      mockCharacterRepo.findById.mockResolvedValue(makeCharacter({ level: 2 }));
      mockLevelUpRepo.getAdvancementsInTier.mockResolvedValue([
        { id: 'a1', type: AdvancementType.BOOST_EXPERIENCES, metadata: null },
      ]);
      mockDomainCardRepo.findAll.mockResolvedValue([]);

      const result = await service.getLevelUpOptions('char-1');

      const boostOption = result.availableAdvancements.find(
        (a) => a.type === AdvancementType.BOOST_EXPERIENCES,
      );
      expect(boostOption!.slotsUsed).toBe(1);
      expect(boostOption!.slotsMax).toBe(1);
      expect(boostOption!.available).toBe(false);
    });

    it('should filter eligible domain cards by next level', async () => {
      mockCharacterRepo.findById.mockResolvedValue(makeCharacter({ level: 2 }));
      mockLevelUpRepo.getAdvancementsInTier.mockResolvedValue([]);
      mockDomainCardRepo.findAll.mockResolvedValue([
        { id: 'dc-1', name: 'Card L1', level: 1, domainName: 'Blade', recallCost: 1, description: '' },
        { id: 'dc-2', name: 'Card L3', level: 3, domainName: 'Blade', recallCost: 1, description: '' },
        { id: 'dc-5', name: 'Card L5', level: 5, domainName: 'Blade', recallCost: 1, description: '' },
      ]);

      const result = await service.getLevelUpOptions('char-1');

      expect(result.eligibleDomainCards).toHaveLength(2);
      expect(result.eligibleDomainCards.map((c) => c.id)).toEqual(['dc-1', 'dc-2']);
    });

    it('should exclude domain cards already owned', async () => {
      mockCharacterRepo.findById.mockResolvedValue(
        makeCharacter({
          level: 2,
          domainCards: [{ id: 'cdc-1', domainCard: { id: 'dc-1', name: 'Card L1', level: 1, domainName: 'Blade' } }],
        }),
      );
      mockLevelUpRepo.getAdvancementsInTier.mockResolvedValue([]);
      mockDomainCardRepo.findAll.mockResolvedValue([
        { id: 'dc-1', name: 'Card L1', level: 1, domainName: 'Blade', recallCost: 1, description: '' },
        { id: 'dc-2', name: 'Card L2', level: 2, domainName: 'Blade', recallCost: 1, description: '' },
      ]);

      const result = await service.getLevelUpOptions('char-1');

      expect(result.eligibleDomainCards).toHaveLength(1);
      expect(result.eligibleDomainCards[0].id).toBe('dc-2');
    });

    it('should return non-tier-transition for level 2 -> 3', async () => {
      mockCharacterRepo.findById.mockResolvedValue(makeCharacter({ level: 2 }));
      mockLevelUpRepo.getAdvancementsInTier.mockResolvedValue([]);
      mockDomainCardRepo.findAll.mockResolvedValue([]);

      const result = await service.getLevelUpOptions('char-1');

      expect(result.nextLevel).toBe(3);
      expect(result.isTierTransition).toBe(false);
      expect(result.tierBonuses).toBeNull();
    });
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run:
```bash
cd api && npx jest src/characters/level-up.service.spec.ts --no-coverage
```

Expected: FAIL — cannot find module `./level-up.service`

- [ ] **Step 3: Implement getLevelUpOptions in LevelUpService**

Create `api/src/characters/level-up.service.ts`:

```typescript
import { Injectable } from '@nestjs/common';
import { CharacterRepository } from './repositories/character.repository';
import { LevelUpRepository } from './repositories/level-up.repository';
import { GameLogicService } from '../game-logic/game-logic.service';
import { DomainCardRepository } from '../srd/repositories/domain-card.repository';
import { AdvancementType } from './enums/advancement-type.enum';
import {
  NotFoundException,
  ConflictException,
  ErrorCode,
} from '../common/error-codes';
import { ILevelUpOptions } from './interfaces/level-up-options.interface';

const SLOT_LIMITS: Record<AdvancementType, number> = {
  [AdvancementType.INCREASE_TRAITS]: 3,
  [AdvancementType.ADD_HP]: 2,
  [AdvancementType.ADD_STRESS]: 2,
  [AdvancementType.BOOST_EXPERIENCES]: 1,
  [AdvancementType.EXTRA_DOMAIN_CARD]: 1,
  [AdvancementType.INCREASE_EVASION]: 1,
};

const TIER_LEVEL_RANGES: Record<number, [number, number]> = {
  1: [1, 1],
  2: [2, 4],
  3: [5, 7],
  4: [8, 10],
};

@Injectable()
export class LevelUpService {
  constructor(
    private readonly characters: CharacterRepository,
    private readonly levelUps: LevelUpRepository,
    private readonly gameLogic: GameLogicService,
    private readonly domainCards: DomainCardRepository,
  ) {}

  async getLevelUpOptions(characterId: string): Promise<ILevelUpOptions> {
    const character = await this.characters.findById(characterId);
    if (!character) {
      throw new NotFoundException(
        ErrorCode.CHARACTER_NOT_FOUND,
        `Character ${characterId} not found`,
      );
    }

    if (character.level >= 10) {
      throw new ConflictException(
        ErrorCode.MAX_LEVEL_REACHED,
        `Character is already at maximum level 10`,
      );
    }

    const currentLevel = character.level;
    const nextLevel = currentLevel + 1;
    const currentTier = this.gameLogic.computeTier(currentLevel);
    const nextTier = this.gameLogic.computeTier(nextLevel);
    const isTierTransition = nextTier > currentTier;

    // Get the tier range for the tier the character is leveling INTO
    const [tierStart, tierEnd] = TIER_LEVEL_RANGES[nextTier];

    // Count existing advancements in this tier
    const tierAdvancements = await this.levelUps.getAdvancementsInTier(
      characterId,
      tierStart,
      tierEnd,
    );

    const slotUsage: Record<string, number> = {};
    for (const adv of tierAdvancements) {
      slotUsage[adv.type] = (slotUsage[adv.type] || 0) + 1;
    }

    const availableAdvancements = Object.values(AdvancementType).map((type) => {
      const slotsUsed = slotUsage[type] || 0;
      const slotsMax = SLOT_LIMITS[type];
      return {
        type,
        slotsUsed,
        slotsMax,
        available: slotsUsed < slotsMax,
      };
    });

    // Get eligible domain cards: level <= nextLevel and not already owned
    const allCards = await this.domainCards.findAll();
    const ownedCardIds = new Set(
      character.domainCards.map((dc) => dc.domainCard.id),
    );
    const eligibleDomainCards = allCards
      .filter((c) => c.level <= nextLevel && !ownedCardIds.has(c.id))
      .map((c) => ({
        id: c.id,
        name: c.name,
        level: c.level,
        domainName: c.domainName,
      }));

    const tierBonuses = isTierTransition
      ? {
          proficiencyIncrease: true,
          clearMarkedTraits: nextLevel >= 5,
          requiresNewExperience: true,
        }
      : null;

    return {
      currentLevel,
      nextLevel,
      currentTier,
      nextTier,
      isTierTransition,
      tierBonuses,
      availableAdvancements,
      eligibleDomainCards,
    };
  }
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run:
```bash
cd api && npx jest src/characters/level-up.service.spec.ts --no-coverage
```

Expected: PASS — all 6 tests passing

- [ ] **Step 5: Commit**

```bash
git add api/src/characters/level-up.service.ts api/src/characters/level-up.service.spec.ts
git commit -m "feat: add LevelUpService.getLevelUpOptions with slot derivation"
```

---

### Task 8: LevelUpService — applyLevelUp

**Files:**
- Modify: `api/src/characters/level-up.service.ts`
- Modify: `api/src/characters/level-up.service.spec.ts`
- Modify: `api/src/characters/interfaces/character.interface.ts` (extend ICharacterUpdate)

- [ ] **Step 1: Extend ICharacterUpdate to support level-up fields**

In `api/src/characters/interfaces/character.interface.ts`, update `ICharacterUpdate` to include the fields that level-up needs to write:

```typescript
export type ICharacterUpdate = Partial<
  Pick<
    ICharacter,
    | 'level'
    | 'proficiency'
    | 'hpMarked'
    | 'stressMarked'
    | 'hope'
    | 'goldHandfuls'
    | 'goldBags'
    | 'goldChests'
    | 'armorMarked'
    | 'agility'
    | 'strength'
    | 'finesse'
    | 'instinct'
    | 'presence'
    | 'knowledge'
    | 'primaryWeaponId'
    | 'secondaryWeaponId'
    | 'armorId'
    | 'notes'
    | 'hpTotal'
    | 'stressTotal'
    | 'evasion'
  >
>;
```

- [ ] **Step 2: Write failing tests for applyLevelUp**

Add to `api/src/characters/level-up.service.spec.ts`, inside the main `describe` block, after the `getLevelUpOptions` describe:

```typescript
  describe('applyLevelUp', () => {
    it('should apply a basic level-up with ADD_HP and ADD_STRESS', async () => {
      const character = makeCharacter({ level: 2 });
      mockCharacterRepo.findById.mockResolvedValue(character);
      mockLevelUpRepo.getAdvancementsInTier.mockResolvedValue([]);
      mockDomainCardRepo.findAll.mockResolvedValue([]);
      mockLevelUpRepo.createWithAdvancements.mockResolvedValue({});
      const updatedCharacter = makeCharacter({ level: 3, hpTotal: 7, stressTotal: 7 });
      mockCharacterRepo.update.mockResolvedValue(updatedCharacter);

      const result = await service.applyLevelUp('char-1', {
        advancements: [
          { type: AdvancementType.ADD_HP },
          { type: AdvancementType.ADD_STRESS },
        ],
      });

      expect(mockCharacterRepo.update).toHaveBeenCalledWith('char-1', expect.objectContaining({
        level: 3,
        hpTotal: 7,
        stressTotal: 7,
      }));
      expect(result.character).toEqual(updatedCharacter);
    });

    it('should apply INCREASE_TRAITS and create marked trait records', async () => {
      const character = makeCharacter({ level: 2, agility: 1, strength: 0 });
      mockCharacterRepo.findById.mockResolvedValue(character);
      mockLevelUpRepo.getAdvancementsInTier.mockResolvedValue([]);
      mockDomainCardRepo.findAll.mockResolvedValue([]);
      mockLevelUpRepo.createWithAdvancements.mockResolvedValue({});
      mockCharacterRepo.update.mockResolvedValue(makeCharacter({ level: 3 }));

      await service.applyLevelUp('char-1', {
        advancements: [
          { type: AdvancementType.INCREASE_TRAITS, metadata: { traits: ['agility', 'strength'] } },
          { type: AdvancementType.ADD_HP },
        ],
      });

      expect(mockCharacterRepo.update).toHaveBeenCalledWith('char-1', expect.objectContaining({
        agility: 2,
        strength: 1,
      }));
    });

    it('should reject when character is at max level', async () => {
      mockCharacterRepo.findById.mockResolvedValue(makeCharacter({ level: 10 }));

      await expect(
        service.applyLevelUp('char-1', {
          advancements: [
            { type: AdvancementType.ADD_HP },
            { type: AdvancementType.ADD_STRESS },
          ],
        }),
      ).rejects.toThrow('already at maximum level');
    });

    it('should reject when advancement slot is full', async () => {
      mockCharacterRepo.findById.mockResolvedValue(makeCharacter({ level: 2 }));
      mockLevelUpRepo.getAdvancementsInTier.mockResolvedValue([
        { id: 'a1', type: AdvancementType.BOOST_EXPERIENCES, metadata: null },
      ]);
      mockDomainCardRepo.findAll.mockResolvedValue([]);

      await expect(
        service.applyLevelUp('char-1', {
          advancements: [
            { type: AdvancementType.BOOST_EXPERIENCES, metadata: { experienceIds: ['exp-1', 'exp-2'] } },
            { type: AdvancementType.ADD_HP },
          ],
        }),
      ).rejects.toThrow('ADVANCEMENT_SLOT_FULL');
    });

    it('should reject INCREASE_TRAITS when trait is already marked', async () => {
      mockCharacterRepo.findById.mockResolvedValue(
        makeCharacter({
          level: 2,
          markedTraits: [{ id: 'mt-1', trait: 'agility' }],
        }),
      );
      mockLevelUpRepo.getAdvancementsInTier.mockResolvedValue([]);
      mockDomainCardRepo.findAll.mockResolvedValue([]);

      await expect(
        service.applyLevelUp('char-1', {
          advancements: [
            { type: AdvancementType.INCREASE_TRAITS, metadata: { traits: ['agility', 'strength'] } },
            { type: AdvancementType.ADD_HP },
          ],
        }),
      ).rejects.toThrow('TRAIT_ALREADY_MARKED');
    });

    it('should apply tier transition bonuses at level 2', async () => {
      const character = makeCharacter({ level: 1, proficiency: 1 });
      mockCharacterRepo.findById.mockResolvedValue(character);
      mockLevelUpRepo.getAdvancementsInTier.mockResolvedValue([]);
      mockDomainCardRepo.findAll.mockResolvedValue([]);
      mockLevelUpRepo.createWithAdvancements.mockResolvedValue({});
      mockCharacterRepo.update.mockResolvedValue(makeCharacter({ level: 2, proficiency: 2 }));

      await service.applyLevelUp('char-1', {
        advancements: [
          { type: AdvancementType.ADD_HP },
          { type: AdvancementType.ADD_STRESS },
        ],
        newExperienceName: 'Scouting',
      });

      expect(mockCharacterRepo.update).toHaveBeenCalledWith('char-1', expect.objectContaining({
        level: 2,
        proficiency: 2,
      }));
    });

    it('should require newExperienceName on tier transitions', async () => {
      mockCharacterRepo.findById.mockResolvedValue(makeCharacter({ level: 1 }));
      mockLevelUpRepo.getAdvancementsInTier.mockResolvedValue([]);
      mockDomainCardRepo.findAll.mockResolvedValue([]);

      await expect(
        service.applyLevelUp('char-1', {
          advancements: [
            { type: AdvancementType.ADD_HP },
            { type: AdvancementType.ADD_STRESS },
          ],
        }),
      ).rejects.toThrow('MISSING_EXPERIENCE_NAME');
    });

    it('should reject BOOST_EXPERIENCES when experience modifier is already 6', async () => {
      mockCharacterRepo.findById.mockResolvedValue(
        makeCharacter({
          level: 2,
          experiences: [
            { id: 'exp-1', name: 'Fighting', modifier: 6 },
            { id: 'exp-2', name: 'Tracking', modifier: 3 },
          ],
        }),
      );
      mockLevelUpRepo.getAdvancementsInTier.mockResolvedValue([]);
      mockDomainCardRepo.findAll.mockResolvedValue([]);

      await expect(
        service.applyLevelUp('char-1', {
          advancements: [
            { type: AdvancementType.BOOST_EXPERIENCES, metadata: { experienceIds: ['exp-1', 'exp-2'] } },
            { type: AdvancementType.ADD_HP },
          ],
        }),
      ).rejects.toThrow('EXPERIENCE_MODIFIER_MAXED');
    });
  });
```

- [ ] **Step 3: Run tests to verify new tests fail**

Run:
```bash
cd api && npx jest src/characters/level-up.service.spec.ts --no-coverage
```

Expected: FAIL — `service.applyLevelUp is not a function`

- [ ] **Step 4: Implement applyLevelUp**

Add these imports at the top of `api/src/characters/level-up.service.ts`:

```typescript
import { BadRequestException } from '../common/error-codes';
import { ApplyLevelUpDto } from './dto/apply-level-up.dto';
import { Trait } from './enums/trait.enum';
import { PrismaService } from '../prisma/prisma.service';
import { CharacterResponse } from './characters.service';
import { CharactersGateway } from './characters.gateway';
```

Update the constructor to add `PrismaService`, `ExperienceRepository`, `CharacterDomainCardRepository`, `CharactersGateway`:

```typescript
import { ExperienceRepository } from './repositories/experience.repository';
import { CharacterDomainCardRepository } from './repositories/character-domain-card.repository';
```

```typescript
  constructor(
    private readonly characters: CharacterRepository,
    private readonly levelUps: LevelUpRepository,
    private readonly experiences: ExperienceRepository,
    private readonly characterDomainCards: CharacterDomainCardRepository,
    private readonly gameLogic: GameLogicService,
    private readonly domainCards: DomainCardRepository,
    private readonly prisma: PrismaService,
    private readonly gateway: CharactersGateway,
  ) {}
```

Add the `applyLevelUp` method after `getLevelUpOptions`:

```typescript
  async applyLevelUp(
    characterId: string,
    dto: ApplyLevelUpDto,
  ): Promise<CharacterResponse> {
    const options = await this.getLevelUpOptions(characterId);
    const character = (await this.characters.findById(characterId))!;

    // Validate tier transition requires experience name
    if (options.isTierTransition && !dto.newExperienceName) {
      throw new BadRequestException(
        ErrorCode.MISSING_EXPERIENCE_NAME,
        'Tier transition requires a new experience name',
      );
    }

    // Validate each advancement
    const characterUpdate: Record<string, number> = {};
    const newMarkedTraits: string[] = [];
    const experienceUpdates: { id: string; modifier: number }[] = [];
    let domainCardId: string | null = null;

    for (const adv of dto.advancements) {
      const optionSlot = options.availableAdvancements.find(
        (a) => a.type === adv.type,
      );
      if (!optionSlot || !optionSlot.available) {
        throw new BadRequestException(
          ErrorCode.ADVANCEMENT_SLOT_FULL,
          `Advancement slot for ${adv.type} is full (${optionSlot?.slotsUsed ?? 0}/${optionSlot?.slotsMax ?? 0})`,
        );
      }
      // Decrement availability for duplicate type detection
      optionSlot.slotsUsed++;
      optionSlot.available = optionSlot.slotsUsed < optionSlot.slotsMax;

      switch (adv.type) {
        case AdvancementType.INCREASE_TRAITS: {
          const traits = (adv.metadata as { traits: string[] })?.traits;
          if (!traits || traits.length !== 2) {
            throw new BadRequestException(
              ErrorCode.INVALID_ADVANCEMENT,
              'INCREASE_TRAITS requires exactly 2 traits',
            );
          }
          const markedSet = new Set(character.markedTraits.map((m) => m.trait));
          for (const t of traits) {
            if (markedSet.has(t) || newMarkedTraits.includes(t)) {
              throw new BadRequestException(
                ErrorCode.TRAIT_ALREADY_MARKED,
                `Trait ${t} is already marked`,
              );
            }
          }
          for (const t of traits) {
            const traitKey = t as keyof typeof character;
            characterUpdate[t] =
              (characterUpdate[t] ?? (character[traitKey] as number)) + 1;
            newMarkedTraits.push(t);
          }
          break;
        }
        case AdvancementType.ADD_HP:
          characterUpdate.hpTotal =
            (characterUpdate.hpTotal ?? character.hpTotal) + 1;
          break;
        case AdvancementType.ADD_STRESS:
          characterUpdate.stressTotal =
            (characterUpdate.stressTotal ?? character.stressTotal) + 1;
          break;
        case AdvancementType.BOOST_EXPERIENCES: {
          const expIds = (adv.metadata as { experienceIds: string[] })
            ?.experienceIds;
          if (!expIds || expIds.length !== 2) {
            throw new BadRequestException(
              ErrorCode.INVALID_ADVANCEMENT,
              'BOOST_EXPERIENCES requires exactly 2 experience IDs',
            );
          }
          for (const expId of expIds) {
            const exp = character.experiences.find((e) => e.id === expId);
            if (!exp) {
              throw new BadRequestException(
                ErrorCode.INVALID_ADVANCEMENT,
                `Experience ${expId} not found on character`,
              );
            }
            if (exp.modifier >= 6) {
              throw new BadRequestException(
                ErrorCode.EXPERIENCE_MODIFIER_MAXED,
                `Experience ${exp.name} is already at maximum modifier 6`,
              );
            }
            experienceUpdates.push({ id: expId, modifier: exp.modifier + 1 });
          }
          break;
        }
        case AdvancementType.EXTRA_DOMAIN_CARD: {
          const cardMeta = adv.metadata as { domainCardId: string } | undefined;
          if (!cardMeta?.domainCardId) {
            throw new BadRequestException(
              ErrorCode.INVALID_ADVANCEMENT,
              'EXTRA_DOMAIN_CARD requires a domainCardId in metadata',
            );
          }
          const eligible = options.eligibleDomainCards.find(
            (c) => c.id === cardMeta.domainCardId,
          );
          if (!eligible) {
            throw new BadRequestException(
              ErrorCode.DOMAIN_CARD_NOT_AVAILABLE,
              `Domain card ${cardMeta.domainCardId} is not eligible`,
            );
          }
          domainCardId = cardMeta.domainCardId;
          break;
        }
        case AdvancementType.INCREASE_EVASION:
          characterUpdate.evasion =
            (characterUpdate.evasion ?? character.evasion) + 1;
          break;
      }
    }

    // Apply tier transition bonuses
    if (options.isTierTransition) {
      characterUpdate.proficiency = (character.proficiency ?? 1) + 1;
    }

    characterUpdate.level = options.nextLevel;

    // Execute in a transaction
    await this.prisma.$transaction(async (tx) => {
      // Create level-up record
      await this.levelUps.createWithAdvancements({
        characterId,
        fromLevel: options.currentLevel,
        toLevel: options.nextLevel,
        fromTier: options.currentTier,
        toTier: options.nextTier,
        newExperienceName: dto.newExperienceName ?? null,
        advancements: dto.advancements.map((a) => ({
          type: a.type,
          metadata: a.metadata ?? null,
        })),
      });
    });

    // Apply character updates (outside transaction since repo uses its own prisma)
    const updated = await this.characters.update(characterId, characterUpdate);

    // Create marked traits
    for (const trait of newMarkedTraits) {
      await this.prisma.characterMarkedTrait.create({
        data: { characterId, trait },
      });
    }

    // Update experience modifiers
    for (const exp of experienceUpdates) {
      await this.experiences.update(exp.id, { modifier: exp.modifier });
    }

    // Add domain card
    if (domainCardId) {
      await this.characterDomainCards.add(characterId, domainCardId);
    }

    // Tier transition: add new experience, clear marked traits
    if (options.isTierTransition) {
      await this.experiences.create(characterId, dto.newExperienceName!, 2);
      if (options.nextLevel >= 5) {
        await this.prisma.characterMarkedTrait.deleteMany({
          where: { characterId },
        });
      }
    }

    // Refetch to get all relations
    const finalCharacter = (await this.characters.findById(characterId))!;
    const computed = this.gameLogic.computeAll({
      level: finalCharacter.level,
      baseEvasion: finalCharacter.evasion,
      armorBaseThresholds: finalCharacter.armor
        ? [finalCharacter.armor.majorThreshold, finalCharacter.armor.severeThreshold]
        : null,
      armorEvasionModifier: finalCharacter.armor?.evasionModifier ?? null,
      primaryWeaponFeature: finalCharacter.primaryWeapon?.feature ?? null,
      secondaryWeaponFeature: finalCharacter.secondaryWeapon?.feature ?? null,
      armorFeature: finalCharacter.armor?.feature ?? null,
      thresholdBonuses: finalCharacter.thresholdBonuses,
    });

    this.gateway.broadcastStatUpdates(finalCharacter.userId, [
      {
        characterId,
        characterName: finalCharacter.name,
        stat: 'level',
        value: finalCharacter.level,
      },
    ]);

    return { character: finalCharacter, computed };
  }
```

- [ ] **Step 5: Run tests to verify they pass**

Run:
```bash
cd api && npx jest src/characters/level-up.service.spec.ts --no-coverage
```

Expected: PASS — all 13 tests passing. Note: The test mocks will need to be updated to include the new constructor dependencies. Add these mocks to the test file:

```typescript
const mockExperienceRepo = {
  create: jest.fn(),
  update: jest.fn(),
};

const mockCharacterDomainCardRepo = {
  add: jest.fn(),
};

const mockPrisma = {
  $transaction: jest.fn((fn: any) => fn(mockPrisma)),
  characterMarkedTrait: {
    create: jest.fn(),
    deleteMany: jest.fn(),
  },
};

const mockGateway = {
  broadcastStatUpdates: jest.fn(),
};
```

And add them to the test module providers:

```typescript
        { provide: ExperienceRepository, useValue: mockExperienceRepo },
        { provide: CharacterDomainCardRepository, useValue: mockCharacterDomainCardRepo },
        { provide: PrismaService, useValue: mockPrisma },
        { provide: CharactersGateway, useValue: mockGateway },
```

Add the necessary imports:

```typescript
import { ExperienceRepository } from './repositories/experience.repository';
import { CharacterDomainCardRepository } from './repositories/character-domain-card.repository';
import { PrismaService } from '../prisma/prisma.service';
import { CharactersGateway } from './characters.gateway';
```

- [ ] **Step 6: Commit**

```bash
git add api/src/characters/level-up.service.ts api/src/characters/level-up.service.spec.ts api/src/characters/interfaces/character.interface.ts
git commit -m "feat: add LevelUpService.applyLevelUp with full validation"
```

---

### Task 9: Controller — Add level-up endpoints

**Files:**
- Modify: `api/src/characters/characters.controller.ts`

- [ ] **Step 1: Add the two new endpoints to the controller**

Add the import at the top of `api/src/characters/characters.controller.ts`:

```typescript
import { LevelUpService } from './level-up.service';
import { ApplyLevelUpDto } from './dto/apply-level-up.dto';
```

Add a second constructor parameter:

```typescript
  constructor(
    private readonly service: CharactersService,
    private readonly levelUpService: LevelUpService,
  ) {}
```

Add the two new endpoints at the bottom of the class (before the closing brace):

```typescript
  @OwnerOnly()
  @Get(':id/level-up/options')
  getLevelUpOptions(@Param('id', ParseUUIDPipe) id: string) {
    return this.levelUpService.getLevelUpOptions(id);
  }

  @OwnerOnly()
  @Post(':id/level-up')
  applyLevelUp(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ApplyLevelUpDto,
  ) {
    return this.levelUpService.applyLevelUp(id, dto);
  }
```

- [ ] **Step 2: Commit**

```bash
git add api/src/characters/characters.controller.ts
git commit -m "feat: add level-up endpoints to characters controller"
```

---

### Task 10: Module Wiring — Register new providers

**Files:**
- Modify: `api/src/characters/characters.module.ts`

- [ ] **Step 1: Add LevelUpService and LevelUpRepository to module providers**

Add imports at the top of `api/src/characters/characters.module.ts`:

```typescript
import { LevelUpService } from './level-up.service';
import { LevelUpRepository } from './repositories/level-up.repository';
```

Add to the `providers` array:

```typescript
    LevelUpService,
    LevelUpRepository,
```

The full providers array becomes:

```typescript
  providers: [
    CharactersGateway,
    CharactersService,
    LevelUpService,
    CharacterRepository,
    ExperienceRepository,
    CharacterDomainCardRepository,
    ThresholdBonusRepository,
    LevelUpRepository,
    ClassRepository,
    ArmorRepository,
    DomainCardRepository,
    CharacterOwnerGuard,
  ],
```

- [ ] **Step 2: Verify the app compiles**

Run:
```bash
cd api && npx nest build
```

Expected: Build succeeds with no errors.

- [ ] **Step 3: Commit**

```bash
git add api/src/characters/characters.module.ts
git commit -m "feat: register LevelUpService and LevelUpRepository in CharactersModule"
```

---

### Task 11: Run all tests

**Files:** (none — verification only)

- [ ] **Step 1: Run the full test suite**

Run:
```bash
cd api && npx jest --no-coverage
```

Expected: All tests pass, including existing and new tests.

- [ ] **Step 2: Run the build**

Run:
```bash
cd api && npx nest build
```

Expected: No compilation errors.

- [ ] **Step 3: Commit (if any fixes were needed)**

Only if changes were required to fix test/build issues.
