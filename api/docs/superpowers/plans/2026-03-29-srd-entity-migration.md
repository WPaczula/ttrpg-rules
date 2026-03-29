# SRD Entity Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add 5 missing SRD categories (adversaries, beastforms, consumables, environments, items) to the NestJS API with Prisma models, seed script, repositories, service endpoints, controller routes, and E2E tests.

**Architecture:** Extend the existing `SrdModule` following established patterns — one repository per entity, service methods on `SrdService`, routes on `SrdController`. Entities with sub-records (adversaries, beastforms, environments) get separate feature tables with cascade delete. The existing seed script (`prisma/seed.ts`) is extended to read from the JSON files already present in `daggerheart-srd/.build/03_json/`.

**Tech Stack:** NestJS, Prisma ORM, PostgreSQL, class-validator, Jest + supertest (E2E)

---

## File Map

**Create:**
- `prisma/migrations/<timestamp>_add_srd_entities/migration.sql` (auto-generated)
- `src/srd/interfaces/srd-adversary.interface.ts`
- `src/srd/interfaces/srd-beastform.interface.ts`
- `src/srd/interfaces/srd-consumable.interface.ts`
- `src/srd/interfaces/srd-environment.interface.ts`
- `src/srd/interfaces/srd-item.interface.ts`
- `src/srd/repositories/adversary.repository.ts`
- `src/srd/repositories/beastform.repository.ts`
- `src/srd/repositories/consumable.repository.ts`
- `src/srd/repositories/environment.repository.ts`
- `src/srd/repositories/item.repository.ts`
- `src/srd/dto/adversary-query.dto.ts`
- `src/srd/dto/beastform-query.dto.ts`
- `src/srd/dto/environment-query.dto.ts`

**Modify:**
- `prisma/schema.prisma` — add 8 new models
- `prisma/seed.ts` — add seeding for 5 new categories
- `src/srd/srd.module.ts` — register 5 new repository providers
- `src/srd/srd.service.ts` — add 10 new methods (get/list per entity)
- `src/srd/srd.controller.ts` — add 10 new route handlers
- `test/srd.e2e-spec.ts` — add test suites for 5 new endpoint groups

---

### Task 1: Prisma Schema — Add New Models

**Files:**
- Modify: `prisma/schema.prisma`

- [ ] **Step 1: Add Adversary and AdversaryFeature models**

Add after the `DomainCard` model (before the `// ── User Tables` comment) in `prisma/schema.prisma`:

```prisma
model Adversary {
  id                String  @id @default(uuid())
  name              String  @unique
  tier              Int
  type              String  // 'Solo' | 'Bruiser' | 'Leader' | 'Standard' | 'Ranged' | 'Skulk' | 'Horde' | 'Minion' | 'Support' | 'Social'
  hp                Int
  stress            Int
  difficulty        String  // usually int, but can be "Special (...)"
  thresholds        String  // "major/severe" e.g. "8/15"
  atk               String  // e.g. "+3"
  attack            String  // weapon/attack name
  range             String  // "Very Close", "Close", "Far"
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

- [ ] **Step 2: Add Beastform and BeastformFeature models**

Add directly after `AdversaryFeature` in `prisma/schema.prisma`:

```prisma
model Beastform {
  id           String @id @default(uuid())
  name         String @unique
  tier         Int
  examples     String // "(Fox, Mouse, Weasel, etc.)"
  traitBonus   String @map("trait_bonus")   // "Agility +1"
  evasionBonus String @map("evasion_bonus") // "Evasion +2"
  attack       String // "Melee Agility d4 phy"
  advantages   String // "deceive, locate, sneak"

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

- [ ] **Step 3: Add Consumable, Environment, EnvironmentFeature, and Item models**

Add directly after `BeastformFeature` in `prisma/schema.prisma`:

```prisma
model Consumable {
  id          String @id @default(uuid())
  name        String @unique
  roll        Int    // loot table position (1-60)
  description String

  @@map("consumables")
}

model Environment {
  id                   String  @id @default(uuid())
  name                 String  @unique
  tier                 Int
  type                 String  // 'Exploration' | 'Social' | etc.
  description          String
  difficulty           String  // usually int, but can be "Special (...)"
  impulses             String
  potentialAdversaries String? @map("potential_adversaries")

  features EnvironmentFeature[]

  @@map("environments")
}

model EnvironmentFeature {
  id            String  @id @default(uuid())
  environmentId String  @map("environment_id")
  name          String
  text          String
  question      String?

  environment Environment @relation(fields: [environmentId], references: [id], onDelete: Cascade)

  @@map("environment_features")
}

model Item {
  id          String @id @default(uuid())
  name        String @unique
  roll        Int    // loot table position (1-60)
  description String

  @@map("items")
}
```

- [ ] **Step 4: Generate and apply the migration**

Run:
```bash
npx prisma migrate dev --name add_srd_entities
```
Expected: Migration created and applied successfully, Prisma Client regenerated.

- [ ] **Step 5: Commit**

```bash
git add prisma/schema.prisma prisma/migrations/
git commit -m "feat: add Prisma models for adversaries, beastforms, consumables, environments, items"
```

---

### Task 2: Seed Script — Add New Categories

**Files:**
- Modify: `prisma/seed.ts`

- [ ] **Step 1: Add raw interfaces for new types**

Add these interfaces after the existing `RawAbility` interface (around line 94) in `prisma/seed.ts`:

```typescript
interface RawAdversary {
  name: string;
  tier: string;
  type: string;
  hp: string;
  stress: string;
  difficulty: string;
  thresholds: string;
  atk: string;
  attack: string;
  range: string;
  damage: string;
  description?: string;
  motives_and_tactics?: string;
  experience?: string;
  feature?: { name: string; text: string }[];
}

interface RawBeastform {
  name: string;
  tier: string;
  examples: string;
  trait_bonus: string;
  evasion_bonus: string;
  attack: string;
  advantages: string;
  feature?: { name: string; text: string }[];
}

interface RawConsumable {
  name: string;
  roll: string;
  description: string;
}

interface RawEnvironment {
  name: string;
  tier: string;
  type: string;
  description: string;
  difficulty: string;
  impulses: string;
  potential_adversaries?: string;
  feature?: { name: string; text: string; question?: string }[];
}

interface RawItem {
  name: string;
  roll: string;
  description: string;
}
```

- [ ] **Step 2: Add delete calls for new tables**

Add these lines at the top of the `seed()` function, right after line 99 (`await prisma.characterMarkedTrait.deleteMany();`), before the existing character delete:

```typescript
  await prisma.environmentFeature.deleteMany();
  await prisma.environment.deleteMany();
  await prisma.beastformFeature.deleteMany();
  await prisma.beastform.deleteMany();
  await prisma.adversaryFeature.deleteMany();
  await prisma.adversary.deleteMany();
  await prisma.consumable.deleteMany();
  await prisma.item.deleteMany();
```

- [ ] **Step 3: Add seeding loops for all 5 new categories**

Add these blocks at the end of the `seed()` function, before the `console.log('Seeding complete!')` line:

```typescript
  // 8. Seed adversaries
  const rawAdversaries = readJson<RawAdversary[]>('adversaries.json');
  for (const a of rawAdversaries) {
    await prisma.adversary.create({
      data: {
        name: a.name,
        tier: parseInt(a.tier, 10),
        type: a.type,
        hp: parseInt(a.hp, 10),
        stress: parseInt(a.stress, 10),
        difficulty: a.difficulty,
        thresholds: a.thresholds,
        atk: a.atk,
        attack: a.attack,
        range: a.range,
        damage: a.damage,
        description: a.description || null,
        motivesAndTactics: a.motives_and_tactics || null,
        experience: a.experience || null,
        features: {
          create: (a.feature || []).map(f => ({ name: f.name, text: f.text })),
        },
      },
    });
  }
  console.log(`  Seeded ${rawAdversaries.length} adversaries`);

  // 9. Seed beastforms
  const rawBeastforms = readJson<RawBeastform[]>('beastforms.json');
  for (const b of rawBeastforms) {
    await prisma.beastform.create({
      data: {
        name: b.name,
        tier: parseInt(b.tier, 10),
        examples: b.examples,
        traitBonus: b.trait_bonus,
        evasionBonus: b.evasion_bonus,
        attack: b.attack,
        advantages: b.advantages,
        features: {
          create: (b.feature || []).map(f => ({ name: f.name, text: f.text })),
        },
      },
    });
  }
  console.log(`  Seeded ${rawBeastforms.length} beastforms`);

  // 10. Seed consumables
  const rawConsumables = readJson<RawConsumable[]>('consumables.json');
  for (const c of rawConsumables) {
    await prisma.consumable.create({
      data: {
        name: c.name,
        roll: parseInt(c.roll, 10),
        description: c.description,
      },
    });
  }
  console.log(`  Seeded ${rawConsumables.length} consumables`);

  // 11. Seed environments
  const rawEnvironments = readJson<RawEnvironment[]>('environments.json');
  for (const e of rawEnvironments) {
    await prisma.environment.create({
      data: {
        name: e.name,
        tier: parseInt(e.tier, 10),
        type: e.type,
        description: e.description,
        difficulty: e.difficulty,
        impulses: e.impulses,
        potentialAdversaries: e.potential_adversaries || null,
        features: {
          create: (e.feature || []).map(f => ({
            name: f.name,
            text: f.text,
            question: f.question || null,
          })),
        },
      },
    });
  }
  console.log(`  Seeded ${rawEnvironments.length} environments`);

  // 12. Seed items
  const rawItems = readJson<RawItem[]>('items.json');
  for (const i of rawItems) {
    await prisma.item.create({
      data: {
        name: i.name,
        roll: parseInt(i.roll, 10),
        description: i.description,
      },
    });
  }
  console.log(`  Seeded ${rawItems.length} items`);
```

- [ ] **Step 4: Run the seed script to verify**

Run:
```bash
npx prisma db seed
```
Expected: Output showing all categories seeded with correct counts (~130 adversaries, ~24 beastforms, ~61 consumables, ~19 environments, ~60 items).

- [ ] **Step 5: Commit**

```bash
git add prisma/seed.ts
git commit -m "feat: add seed data for adversaries, beastforms, consumables, environments, items"
```

---

### Task 3: Interfaces and Repositories

**Files:**
- Create: `src/srd/interfaces/srd-adversary.interface.ts`
- Create: `src/srd/interfaces/srd-beastform.interface.ts`
- Create: `src/srd/interfaces/srd-consumable.interface.ts`
- Create: `src/srd/interfaces/srd-environment.interface.ts`
- Create: `src/srd/interfaces/srd-item.interface.ts`
- Create: `src/srd/repositories/adversary.repository.ts`
- Create: `src/srd/repositories/beastform.repository.ts`
- Create: `src/srd/repositories/consumable.repository.ts`
- Create: `src/srd/repositories/environment.repository.ts`
- Create: `src/srd/repositories/item.repository.ts`

- [ ] **Step 1: Create interfaces**

`src/srd/interfaces/srd-adversary.interface.ts`:
```typescript
import { ISrdFeature } from './srd-class.interface';

export interface ISrdAdversary {
  id: string;
  name: string;
  tier: number;
  type: string;
  hp: number;
  stress: number;
  difficulty: string;
  thresholds: string;
  atk: string;
  attack: string;
  range: string;
  damage: string;
  description: string | null;
  motivesAndTactics: string | null;
  experience: string | null;
  features: ISrdFeature[];
}
```

`src/srd/interfaces/srd-beastform.interface.ts`:
```typescript
import { ISrdFeature } from './srd-class.interface';

export interface ISrdBeastform {
  id: string;
  name: string;
  tier: number;
  examples: string;
  traitBonus: string;
  evasionBonus: string;
  attack: string;
  advantages: string;
  features: ISrdFeature[];
}
```

`src/srd/interfaces/srd-consumable.interface.ts`:
```typescript
export interface ISrdConsumable {
  id: string;
  name: string;
  roll: number;
  description: string;
}
```

`src/srd/interfaces/srd-environment.interface.ts`:
```typescript
export interface ISrdEnvironmentFeature {
  id: string;
  name: string;
  text: string;
  question: string | null;
}

export interface ISrdEnvironment {
  id: string;
  name: string;
  tier: number;
  type: string;
  description: string;
  difficulty: string;
  impulses: string;
  potentialAdversaries: string | null;
  features: ISrdEnvironmentFeature[];
}
```

`src/srd/interfaces/srd-item.interface.ts`:
```typescript
export interface ISrdItem {
  id: string;
  name: string;
  roll: number;
  description: string;
}
```

- [ ] **Step 2: Create repositories**

`src/srd/repositories/adversary.repository.ts`:
```typescript
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ISrdAdversary } from '../interfaces/srd-adversary.interface';

@Injectable()
export class AdversaryRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(filters?: { tier?: number; type?: string }): Promise<ISrdAdversary[]> {
    const where: Record<string, unknown> = {};
    if (filters?.tier !== undefined) where.tier = filters.tier;
    if (filters?.type !== undefined) where.type = filters.type;
    return this.prisma.adversary.findMany({ where, include: { features: true }, orderBy: [{ tier: 'asc' }, { name: 'asc' }] });
  }

  async findById(id: string): Promise<ISrdAdversary | null> {
    return this.prisma.adversary.findUnique({ where: { id }, include: { features: true } });
  }
}
```

`src/srd/repositories/beastform.repository.ts`:
```typescript
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ISrdBeastform } from '../interfaces/srd-beastform.interface';

@Injectable()
export class BeastformRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(filters?: { tier?: number }): Promise<ISrdBeastform[]> {
    const where: Record<string, unknown> = {};
    if (filters?.tier !== undefined) where.tier = filters.tier;
    return this.prisma.beastform.findMany({ where, include: { features: true }, orderBy: [{ tier: 'asc' }, { name: 'asc' }] });
  }

  async findById(id: string): Promise<ISrdBeastform | null> {
    return this.prisma.beastform.findUnique({ where: { id }, include: { features: true } });
  }
}
```

`src/srd/repositories/consumable.repository.ts`:
```typescript
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ISrdConsumable } from '../interfaces/srd-consumable.interface';

@Injectable()
export class ConsumableRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<ISrdConsumable[]> {
    return this.prisma.consumable.findMany({ orderBy: { roll: 'asc' } });
  }

  async findById(id: string): Promise<ISrdConsumable | null> {
    return this.prisma.consumable.findUnique({ where: { id } });
  }
}
```

`src/srd/repositories/environment.repository.ts`:
```typescript
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ISrdEnvironment } from '../interfaces/srd-environment.interface';

@Injectable()
export class EnvironmentRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(filters?: { tier?: number; type?: string }): Promise<ISrdEnvironment[]> {
    const where: Record<string, unknown> = {};
    if (filters?.tier !== undefined) where.tier = filters.tier;
    if (filters?.type !== undefined) where.type = filters.type;
    return this.prisma.environment.findMany({ where, include: { features: true }, orderBy: [{ tier: 'asc' }, { name: 'asc' }] });
  }

  async findById(id: string): Promise<ISrdEnvironment | null> {
    return this.prisma.environment.findUnique({ where: { id }, include: { features: true } });
  }
}
```

`src/srd/repositories/item.repository.ts`:
```typescript
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ISrdItem } from '../interfaces/srd-item.interface';

@Injectable()
export class ItemRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<ISrdItem[]> {
    return this.prisma.item.findMany({ orderBy: { roll: 'asc' } });
  }

  async findById(id: string): Promise<ISrdItem | null> {
    return this.prisma.item.findUnique({ where: { id } });
  }
}
```

- [ ] **Step 3: Commit**

```bash
git add src/srd/interfaces/ src/srd/repositories/
git commit -m "feat: add interfaces and repositories for new SRD entities"
```

---

### Task 4: DTOs, Service, Controller, and Module Wiring

**Files:**
- Create: `src/srd/dto/adversary-query.dto.ts`
- Create: `src/srd/dto/beastform-query.dto.ts`
- Create: `src/srd/dto/environment-query.dto.ts`
- Modify: `src/srd/srd.service.ts`
- Modify: `src/srd/srd.controller.ts`
- Modify: `src/srd/srd.module.ts`

- [ ] **Step 1: Create query DTOs**

`src/srd/dto/adversary-query.dto.ts`:
```typescript
import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class AdversaryQueryDto {
  @IsInt()
  @Min(1)
  @Max(4)
  @IsOptional()
  @Type(() => Number)
  tier?: number;

  @IsString()
  @IsOptional()
  type?: string;
}
```

`src/srd/dto/beastform-query.dto.ts`:
```typescript
import { IsInt, IsOptional, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class BeastformQueryDto {
  @IsInt()
  @Min(1)
  @Max(4)
  @IsOptional()
  @Type(() => Number)
  tier?: number;
}
```

`src/srd/dto/environment-query.dto.ts`:
```typescript
import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class EnvironmentQueryDto {
  @IsInt()
  @Min(1)
  @Max(4)
  @IsOptional()
  @Type(() => Number)
  tier?: number;

  @IsString()
  @IsOptional()
  type?: string;
}
```

- [ ] **Step 2: Add service methods**

Add these imports to the top of `src/srd/srd.service.ts`:

```typescript
import { AdversaryRepository } from './repositories/adversary.repository';
import { BeastformRepository } from './repositories/beastform.repository';
import { ConsumableRepository } from './repositories/consumable.repository';
import { EnvironmentRepository } from './repositories/environment.repository';
import { ItemRepository } from './repositories/item.repository';
```

Add these constructor parameters (after `private readonly domainCards: DomainCardRepository`):

```typescript
    private readonly adversaries: AdversaryRepository,
    private readonly beastforms: BeastformRepository,
    private readonly consumables: ConsumableRepository,
    private readonly environments: EnvironmentRepository,
    private readonly items: ItemRepository,
```

Add these methods at the end of the `SrdService` class:

```typescript
  getAdversaries(filters?: { tier?: number; type?: string }) {
    return this.adversaries.findAll(filters);
  }

  async getAdversary(id: string) {
    const adversary = await this.adversaries.findById(id);
    if (!adversary) throw new NotFoundException(ErrorCode.SRD_RESOURCE_NOT_FOUND, `Adversary ${id} not found`);
    return adversary;
  }

  getBeastforms(filters?: { tier?: number }) {
    return this.beastforms.findAll(filters);
  }

  async getBeastform(id: string) {
    const beastform = await this.beastforms.findById(id);
    if (!beastform) throw new NotFoundException(ErrorCode.SRD_RESOURCE_NOT_FOUND, `Beastform ${id} not found`);
    return beastform;
  }

  getConsumables() {
    return this.consumables.findAll();
  }

  async getConsumable(id: string) {
    const consumable = await this.consumables.findById(id);
    if (!consumable) throw new NotFoundException(ErrorCode.SRD_RESOURCE_NOT_FOUND, `Consumable ${id} not found`);
    return consumable;
  }

  getEnvironments(filters?: { tier?: number; type?: string }) {
    return this.environments.findAll(filters);
  }

  async getEnvironment(id: string) {
    const environment = await this.environments.findById(id);
    if (!environment) throw new NotFoundException(ErrorCode.SRD_RESOURCE_NOT_FOUND, `Environment ${id} not found`);
    return environment;
  }

  getItems() {
    return this.items.findAll();
  }

  async getItem(id: string) {
    const item = await this.items.findById(id);
    if (!item) throw new NotFoundException(ErrorCode.SRD_RESOURCE_NOT_FOUND, `Item ${id} not found`);
    return item;
  }
```

- [ ] **Step 3: Add controller routes**

Add these imports to the top of `src/srd/srd.controller.ts`:

```typescript
import { AdversaryQueryDto } from './dto/adversary-query.dto';
import { BeastformQueryDto } from './dto/beastform-query.dto';
import { EnvironmentQueryDto } from './dto/environment-query.dto';
```

Add these route handlers at the end of the `SrdController` class:

```typescript
  @Get('adversaries')
  getAdversaries(@Query() query: AdversaryQueryDto) {
    return this.srd.getAdversaries(query);
  }

  @Get('adversaries/:id')
  getAdversary(@Param('id', ParseUUIDPipe) id: string) {
    return this.srd.getAdversary(id);
  }

  @Get('beastforms')
  getBeastforms(@Query() query: BeastformQueryDto) {
    return this.srd.getBeastforms(query);
  }

  @Get('beastforms/:id')
  getBeastform(@Param('id', ParseUUIDPipe) id: string) {
    return this.srd.getBeastform(id);
  }

  @Get('consumables')
  getConsumables() {
    return this.srd.getConsumables();
  }

  @Get('consumables/:id')
  getConsumable(@Param('id', ParseUUIDPipe) id: string) {
    return this.srd.getConsumable(id);
  }

  @Get('environments')
  getEnvironments(@Query() query: EnvironmentQueryDto) {
    return this.srd.getEnvironments(query);
  }

  @Get('environments/:id')
  getEnvironment(@Param('id', ParseUUIDPipe) id: string) {
    return this.srd.getEnvironment(id);
  }

  @Get('items')
  getItems() {
    return this.srd.getItems();
  }

  @Get('items/:id')
  getItem(@Param('id', ParseUUIDPipe) id: string) {
    return this.srd.getItem(id);
  }
```

- [ ] **Step 4: Register new repositories in the module**

Add these imports to `src/srd/srd.module.ts`:

```typescript
import { AdversaryRepository } from './repositories/adversary.repository';
import { BeastformRepository } from './repositories/beastform.repository';
import { ConsumableRepository } from './repositories/consumable.repository';
import { EnvironmentRepository } from './repositories/environment.repository';
import { ItemRepository } from './repositories/item.repository';
```

Add these to the `providers` array (after `DomainCardRepository`):

```typescript
    AdversaryRepository,
    BeastformRepository,
    ConsumableRepository,
    EnvironmentRepository,
    ItemRepository,
```

- [ ] **Step 5: Verify the app compiles**

Run:
```bash
npx nest build
```
Expected: Build succeeds with no errors.

- [ ] **Step 6: Commit**

```bash
git add src/srd/
git commit -m "feat: add SRD endpoints for adversaries, beastforms, consumables, environments, items"
```

---

### Task 5: E2E Tests

**Files:**
- Modify: `test/srd.e2e-spec.ts`

- [ ] **Step 1: Add adversary tests**

Add these `describe` blocks at the end of the outer `describe('SRD Endpoints (e2e)')` block in `test/srd.e2e-spec.ts`:

```typescript
  describe('GET /srd/adversaries', () => {
    it('should return all adversaries with features', async () => {
      const res = await request(app.getHttpServer()).get('/srd/adversaries').expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
      expect(res.body[0].name).toBeDefined();
      expect(res.body[0].tier).toBeDefined();
      expect(res.body[0].type).toBeDefined();
      expect(res.body[0].features).toBeDefined();
    });

    it('should filter by tier', async () => {
      const res = await request(app.getHttpServer())
        .get('/srd/adversaries?tier=1')
        .expect(200);

      expect(res.body.length).toBeGreaterThan(0);
      expect(res.body.every((a: { tier: number }) => a.tier === 1)).toBe(true);
    });

    it('should filter by type', async () => {
      const res = await request(app.getHttpServer())
        .get('/srd/adversaries?type=Solo')
        .expect(200);

      expect(res.body.length).toBeGreaterThan(0);
      expect(res.body.every((a: { type: string }) => a.type === 'Solo')).toBe(true);
    });
  });

  describe('GET /srd/adversaries/:id', () => {
    it('should return a single adversary', async () => {
      const listRes = await request(app.getHttpServer()).get('/srd/adversaries');
      const id = listRes.body[0].id;

      const res = await request(app.getHttpServer()).get(`/srd/adversaries/${id}`).expect(200);

      expect(res.body.id).toBe(id);
      expect(res.body.features).toBeDefined();
    });

    it('should return 404 for unknown id', async () => {
      const res = await request(app.getHttpServer())
        .get('/srd/adversaries/00000000-0000-0000-0000-000000000000')
        .expect(404);

      expect(res.body.error).toBe('SRD_RESOURCE_NOT_FOUND');
    });
  });
```

- [ ] **Step 2: Add beastform tests**

```typescript
  describe('GET /srd/beastforms', () => {
    it('should return all beastforms with features', async () => {
      const res = await request(app.getHttpServer()).get('/srd/beastforms').expect(200);

      expect(res.body.length).toBeGreaterThan(0);
      expect(res.body[0].name).toBeDefined();
      expect(res.body[0].traitBonus).toBeDefined();
      expect(res.body[0].features).toBeDefined();
    });

    it('should filter by tier', async () => {
      const res = await request(app.getHttpServer())
        .get('/srd/beastforms?tier=1')
        .expect(200);

      expect(res.body.length).toBeGreaterThan(0);
      expect(res.body.every((b: { tier: number }) => b.tier === 1)).toBe(true);
    });
  });

  describe('GET /srd/beastforms/:id', () => {
    it('should return a single beastform', async () => {
      const listRes = await request(app.getHttpServer()).get('/srd/beastforms');
      const id = listRes.body[0].id;

      const res = await request(app.getHttpServer()).get(`/srd/beastforms/${id}`).expect(200);

      expect(res.body.id).toBe(id);
      expect(res.body.features).toBeDefined();
    });

    it('should return 404 for unknown id', async () => {
      const res = await request(app.getHttpServer())
        .get('/srd/beastforms/00000000-0000-0000-0000-000000000000')
        .expect(404);

      expect(res.body.error).toBe('SRD_RESOURCE_NOT_FOUND');
    });
  });
```

- [ ] **Step 3: Add consumable tests**

```typescript
  describe('GET /srd/consumables', () => {
    it('should return all consumables ordered by roll', async () => {
      const res = await request(app.getHttpServer()).get('/srd/consumables').expect(200);

      expect(res.body.length).toBeGreaterThan(0);
      expect(res.body[0].name).toBeDefined();
      expect(res.body[0].roll).toBeDefined();
      expect(res.body[0].description).toBeDefined();
    });
  });

  describe('GET /srd/consumables/:id', () => {
    it('should return a single consumable', async () => {
      const listRes = await request(app.getHttpServer()).get('/srd/consumables');
      const id = listRes.body[0].id;

      const res = await request(app.getHttpServer()).get(`/srd/consumables/${id}`).expect(200);

      expect(res.body.id).toBe(id);
    });

    it('should return 404 for unknown id', async () => {
      const res = await request(app.getHttpServer())
        .get('/srd/consumables/00000000-0000-0000-0000-000000000000')
        .expect(404);

      expect(res.body.error).toBe('SRD_RESOURCE_NOT_FOUND');
    });
  });
```

- [ ] **Step 4: Add environment tests**

```typescript
  describe('GET /srd/environments', () => {
    it('should return all environments with features', async () => {
      const res = await request(app.getHttpServer()).get('/srd/environments').expect(200);

      expect(res.body.length).toBeGreaterThan(0);
      expect(res.body[0].name).toBeDefined();
      expect(res.body[0].impulses).toBeDefined();
      expect(res.body[0].features).toBeDefined();
    });

    it('should filter by tier', async () => {
      const res = await request(app.getHttpServer())
        .get('/srd/environments?tier=1')
        .expect(200);

      expect(res.body.length).toBeGreaterThan(0);
      expect(res.body.every((e: { tier: number }) => e.tier === 1)).toBe(true);
    });

    it('should filter by type', async () => {
      const res = await request(app.getHttpServer())
        .get('/srd/environments?type=Exploration')
        .expect(200);

      expect(res.body.length).toBeGreaterThan(0);
      expect(res.body.every((e: { type: string }) => e.type === 'Exploration')).toBe(true);
    });
  });

  describe('GET /srd/environments/:id', () => {
    it('should return a single environment with feature questions', async () => {
      const listRes = await request(app.getHttpServer()).get('/srd/environments');
      const id = listRes.body[0].id;

      const res = await request(app.getHttpServer()).get(`/srd/environments/${id}`).expect(200);

      expect(res.body.id).toBe(id);
      expect(res.body.features).toBeDefined();
    });

    it('should return 404 for unknown id', async () => {
      const res = await request(app.getHttpServer())
        .get('/srd/environments/00000000-0000-0000-0000-000000000000')
        .expect(404);

      expect(res.body.error).toBe('SRD_RESOURCE_NOT_FOUND');
    });
  });
```

- [ ] **Step 5: Add item tests**

```typescript
  describe('GET /srd/items', () => {
    it('should return all items ordered by roll', async () => {
      const res = await request(app.getHttpServer()).get('/srd/items').expect(200);

      expect(res.body.length).toBeGreaterThan(0);
      expect(res.body[0].name).toBeDefined();
      expect(res.body[0].roll).toBeDefined();
      expect(res.body[0].description).toBeDefined();
    });
  });

  describe('GET /srd/items/:id', () => {
    it('should return a single item', async () => {
      const listRes = await request(app.getHttpServer()).get('/srd/items');
      const id = listRes.body[0].id;

      const res = await request(app.getHttpServer()).get(`/srd/items/${id}`).expect(200);

      expect(res.body.id).toBe(id);
    });

    it('should return 404 for unknown id', async () => {
      const res = await request(app.getHttpServer())
        .get('/srd/items/00000000-0000-0000-0000-000000000000')
        .expect(404);

      expect(res.body.error).toBe('SRD_RESOURCE_NOT_FOUND');
    });
  });
```

- [ ] **Step 6: Run the E2E tests**

Run:
```bash
npm run test:e2e -- --testPathPattern=srd
```
Expected: All tests pass (existing + new).

- [ ] **Step 7: Commit**

```bash
git add test/srd.e2e-spec.ts
git commit -m "test: add E2E tests for adversaries, beastforms, consumables, environments, items"
```
