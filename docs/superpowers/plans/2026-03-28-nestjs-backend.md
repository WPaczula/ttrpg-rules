# Daggerheart NestJS Backend Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a NestJS backend with Prisma + Postgres that stores Daggerheart character sheet data and computes derived stats (tier, damage thresholds, equipment modifiers).

**Architecture:** Three NestJS modules — `PrismaModule` (DB client lifecycle), `SrdModule` (seeded read-only reference data), `CharactersModule` (character CRUD with computed stats), plus a `GameLogicModule` (pure calculation service). Repositories in each module map DB rows to domain interfaces. Global exception filter, logging interceptor, and validation pipe handle cross-cutting concerns.

**Tech Stack:** NestJS 11, Prisma ORM, PostgreSQL, class-validator, class-transformer, Jest, Supertest

**Spec:** `docs/superpowers/specs/2026-03-28-nestjs-backend-design.md`

**Existing codebase:** There is already a NestJS project at `api/` with an SRD module that serves static data from `lib/srd-data.ts` (auto-generated). SRD JSON source files live at `api/daggerheart-srd/.build/03_json/`. The existing SRD module has no database — it just returns in-memory arrays. We will replace this with a Prisma-backed implementation.

---

## File Structure

```
api/
├── docker-compose.yml                          — Postgres for local dev + test
├── prisma/
│   ├── schema.prisma                           — full database schema
│   └── seed.ts                                 — SRD seed script
├── src/
│   ├── main.ts                                 — bootstrap (existing, modify)
│   ├── app.module.ts                           — root module (existing, modify)
│   ├── prisma/
│   │   ├── prisma.module.ts                    — global PrismaClient provider
│   │   └── prisma.service.ts                   — extends PrismaClient
│   ├── common/
│   │   ├── error-codes.ts                      — error code enum + exception classes
│   │   ├── filters/
│   │   │   ├── app-exception.filter.ts         — global exception filter
│   │   │   └── app-exception.filter.spec.ts
│   │   ├── interceptors/
│   │   │   ├── logging.interceptor.ts          — request/response logging
│   │   │   └── logging.interceptor.spec.ts
│   │   └── test/
│   │       └── test-helpers.ts                 — shared test utilities (createTestApp, seedTestDb, cleanCharacterTables)
│   ├── srd/
│   │   ├── srd.module.ts                       — (replace existing)
│   │   ├── srd.controller.ts                   — (replace existing)
│   │   ├── srd.service.ts                      — (replace existing)
│   │   ├── interfaces/
│   │   │   ├── srd-class.interface.ts
│   │   │   ├── srd-subclass.interface.ts
│   │   │   ├── srd-ancestry.interface.ts
│   │   │   ├── srd-community.interface.ts
│   │   │   ├── srd-domain.interface.ts
│   │   │   ├── srd-domain-card.interface.ts
│   │   │   ├── srd-weapon.interface.ts
│   │   │   └── srd-armor.interface.ts
│   │   ├── dto/
│   │   │   ├── class-response.dto.ts
│   │   │   ├── subclass-response.dto.ts
│   │   │   ├── ancestry-response.dto.ts
│   │   │   ├── community-response.dto.ts
│   │   │   ├── domain-response.dto.ts
│   │   │   ├── domain-card-response.dto.ts
│   │   │   ├── domain-card-query.dto.ts
│   │   │   ├── weapon-response.dto.ts
│   │   │   ├── weapon-query.dto.ts
│   │   │   ├── armor-response.dto.ts
│   │   │   └── armor-query.dto.ts
│   │   └── repositories/
│   │       ├── class.repository.ts
│   │       ├── subclass.repository.ts
│   │       ├── ancestry.repository.ts
│   │       ├── community.repository.ts
│   │       ├── domain.repository.ts
│   │       ├── domain-card.repository.ts
│   │       ├── weapon.repository.ts
│   │       └── armor.repository.ts
│   ├── game-logic/
│   │   ├── game-logic.module.ts
│   │   ├── game-logic.service.ts
│   │   ├── game-logic.service.spec.ts
│   │   └── interfaces/
│   │       └── computed-stats.interface.ts
│   └── characters/
│       ├── characters.module.ts
│       ├── characters.controller.ts
│       ├── characters.service.ts
│       ├── characters.service.spec.ts
│       ├── interfaces/
│       │   ├── character.interface.ts
│       │   ├── character-experience.interface.ts
│       │   ├── character-domain-card.interface.ts
│       │   └── character-threshold-bonus.interface.ts
│       ├── dto/
│       │   ├── create-character.dto.ts
│       │   ├── update-character.dto.ts
│       │   ├── create-experience.dto.ts
│       │   ├── update-experience.dto.ts
│       │   ├── add-domain-card.dto.ts
│       │   └── toggle-threshold-bonus.dto.ts
│       └── repositories/
│           ├── character.repository.ts
│           ├── experience.repository.ts
│           ├── character-domain-card.repository.ts
│           └── threshold-bonus.repository.ts
├── test/
│   ├── srd.e2e-spec.ts
│   ├── characters.e2e-spec.ts
│   └── jest-e2e.json                           — (existing, modify)
```

---

## Task 1: Install Dependencies & Docker Setup

**Files:**
- Modify: `api/package.json`
- Create: `api/docker-compose.yml`
- Create: `api/.env`
- Create: `api/.env.test`

- [ ] **Step 1: Install Prisma and validation dependencies**

```bash
cd D:/AI/ttrpg-rules/api
npm install @prisma/client class-validator class-transformer
npm install -D prisma
```

- [ ] **Step 2: Initialize Prisma**

```bash
cd D:/AI/ttrpg-rules/api
npx prisma init
```

This creates `prisma/schema.prisma` and a `.env` file with `DATABASE_URL`.

- [ ] **Step 3: Create docker-compose.yml**

Create `api/docker-compose.yml`:

```yaml
services:
  postgres:
    image: postgres:16
    restart: unless-stopped
    environment:
      POSTGRES_USER: daggerheart
      POSTGRES_PASSWORD: daggerheart
      POSTGRES_DB: daggerheart
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data

  postgres-test:
    image: postgres:16
    restart: unless-stopped
    environment:
      POSTGRES_USER: daggerheart
      POSTGRES_PASSWORD: daggerheart
      POSTGRES_DB: daggerheart_test
    ports:
      - "5433:5432"
    volumes:
      - pgdata-test:/var/lib/postgresql/data

volumes:
  pgdata:
  pgdata-test:
```

- [ ] **Step 4: Create .env files**

Create `api/.env`:

```
DATABASE_URL="postgresql://daggerheart:daggerheart@localhost:5432/daggerheart"
```

Create `api/.env.test`:

```
DATABASE_URL="postgresql://daggerheart:daggerheart@localhost:5433/daggerheart_test"
```

- [ ] **Step 5: Add .env to .gitignore**

Ensure `api/.gitignore` contains:

```
.env
.env.test
```

- [ ] **Step 6: Start Docker and verify**

```bash
cd D:/AI/ttrpg-rules/api
docker compose up -d
```

Expected: Both postgres containers running on ports 5432 and 5433.

- [ ] **Step 7: Commit**

```bash
git add docker-compose.yml .gitignore package.json package-lock.json prisma/schema.prisma .env .env.test
git commit -m "feat: add Prisma, validation deps, and docker-compose for Postgres"
```

---

## Task 2: Prisma Schema

**Files:**
- Create: `api/prisma/schema.prisma`

- [ ] **Step 1: Write the full Prisma schema**

Replace `api/prisma/schema.prisma` with:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ── SRD Reference Tables ────────────────────────────────────────────────────

model Weapon {
  id         String  @id @default(uuid())
  name       String
  tier       Int
  type       String  // 'Primary' | 'Secondary'
  damageType String  @map("damage_type") // 'Physical' | 'Magical'
  trait      String
  range      String
  damage     String
  burden     String
  feature    String? // optional special feature text

  // Reverse relations
  charactersPrimary       Character[] @relation("PrimaryWeapon")
  charactersSecondary     Character[] @relation("SecondaryWeapon")
  classesSuggestedPrimary   SrdClass[] @relation("SuggestedPrimary")
  classesSuggestedSecondary SrdClass[] @relation("SuggestedSecondary")

  @@map("weapons")
}

model Armor {
  id              String  @id @default(uuid())
  name            String
  tier            Int
  baseScore       Int     @map("base_score")
  baseThresholds  String  @map("base_thresholds") // "major / severe" e.g. "6 / 13"
  evasionModifier Int?    @map("evasion_modifier")
  feature         String? // optional special feature text

  // Reverse relations
  characters          Character[]
  classesSuggestedArmor SrdClass[] @relation("SuggestedArmor")

  @@map("armor")
}

model SrdClass {
  id               String  @id @default(uuid())
  name             String  @unique
  description      String
  evasion          Int
  hp               Int
  items            String
  suggestedTraits  Int[]   @map("suggested_traits") // [agi, str, fin, ins, pre, kno]
  hopeFeatureName  String  @map("hope_feature_name")
  hopeFeatureText  String  @map("hope_feature_text")

  suggestedPrimaryId   String? @map("suggested_primary_id")
  suggestedSecondaryId String? @map("suggested_secondary_id")
  suggestedArmorId     String? @map("suggested_armor_id")

  suggestedPrimary   Weapon? @relation("SuggestedPrimary", fields: [suggestedPrimaryId], references: [id])
  suggestedSecondary Weapon? @relation("SuggestedSecondary", fields: [suggestedSecondaryId], references: [id])
  suggestedArmor     Armor?  @relation("SuggestedArmor", fields: [suggestedArmorId], references: [id])

  features   ClassFeature[]
  subclasses Subclass[]
  domains    ClassDomain[]
  characters Character[]

  @@map("classes")
}

model ClassFeature {
  id      String   @id @default(uuid())
  classId String   @map("class_id")
  name    String
  text    String

  class SrdClass @relation(fields: [classId], references: [id], onDelete: Cascade)

  @@map("class_features")
}

model Subclass {
  id            String @id @default(uuid())
  classId       String @map("class_id")
  name          String @unique
  description   String
  spellcastTrait String @map("spellcast_trait")

  class    SrdClass          @relation(fields: [classId], references: [id], onDelete: Cascade)
  features SubclassFeature[]
  characters Character[]

  @@map("subclasses")
}

model SubclassFeature {
  id         String @id @default(uuid())
  subclassId String @map("subclass_id")
  tier       String // 'foundation' | 'specialization' | 'mastery'
  name       String
  text       String

  subclass Subclass @relation(fields: [subclassId], references: [id], onDelete: Cascade)

  @@map("subclass_features")
}

model Ancestry {
  id          String @id @default(uuid())
  name        String @unique
  description String

  features   AncestryFeature[]
  characters Character[]       @relation("PrimaryAncestry")
  charactersSecondary Character[] @relation("SecondaryAncestry")

  @@map("ancestries")
}

model AncestryFeature {
  id         String @id @default(uuid())
  ancestryId String @map("ancestry_id")
  name       String
  text       String

  ancestry Ancestry @relation(fields: [ancestryId], references: [id], onDelete: Cascade)
  charactersPrimary   Character[] @relation("PrimaryAncestryFeature")
  charactersSecondary Character[] @relation("SecondaryAncestryFeature")

  @@map("ancestry_features")
}

model Community {
  id          String @id @default(uuid())
  name        String @unique
  description String
  note        String

  features   CommunityFeature[]
  characters Character[]

  @@map("communities")
}

model CommunityFeature {
  id          String @id @default(uuid())
  communityId String @map("community_id")
  name        String
  text        String

  community Community @relation(fields: [communityId], references: [id], onDelete: Cascade)

  @@map("community_features")
}

model Domain {
  id          String @id @default(uuid())
  name        String @unique
  description String

  cards   DomainCard[]
  classes ClassDomain[]

  @@map("domains")
}

model ClassDomain {
  classId  String @map("class_id")
  domainId String @map("domain_id")

  class  SrdClass @relation(fields: [classId], references: [id], onDelete: Cascade)
  domain Domain   @relation(fields: [domainId], references: [id], onDelete: Cascade)

  @@id([classId, domainId])
  @@map("class_domains")
}

model DomainCard {
  id          String @id @default(uuid())
  domainId    String @map("domain_id")
  name        String
  level       Int
  recallCost  Int    @map("recall_cost")
  description String

  domain     Domain               @relation(fields: [domainId], references: [id], onDelete: Cascade)
  characters CharacterDomainCard[]

  @@map("domain_cards")
}

// ── Character Tables ────────────────────────────────────────────────────────

model Character {
  id    String @id @default(uuid())
  name  String
  level Int    @default(1)

  classId    String @map("class_id")
  subclassId String @map("subclass_id")
  ancestryId String @map("ancestry_id")
  secondaryAncestryId        String? @map("secondary_ancestry_id")
  ancestryFeatureId          String  @map("ancestry_feature_id")
  secondaryAncestryFeatureId String? @map("secondary_ancestry_feature_id")
  communityId                String  @map("community_id")

  agility   Int @default(0)
  strength  Int @default(0)
  finesse   Int @default(0)
  instinct  Int @default(0)
  presence  Int @default(0)
  knowledge Int @default(0)

  hpTotal     Int @default(6) @map("hp_total")
  hpMarked    Int @default(0) @map("hp_marked")
  stressTotal Int @default(6) @map("stress_total")
  stressMarked Int @default(0) @map("stress_marked")

  armorId     String? @map("armor_id")
  armorMarked Int     @default(0) @map("armor_marked")
  evasion     Int     @default(10)
  proficiency Int     @default(1)

  hope         Int @default(2)
  goldHandfuls Int @default(0) @map("gold_handfuls")
  goldBags     Int @default(0) @map("gold_bags")
  goldChests   Int @default(0) @map("gold_chests")

  primaryWeaponId   String? @map("primary_weapon_id")
  secondaryWeaponId String? @map("secondary_weapon_id")

  notes String @default("")

  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  // Relations
  class                  SrdClass         @relation(fields: [classId], references: [id])
  subclass               Subclass         @relation(fields: [subclassId], references: [id])
  ancestry               Ancestry         @relation("PrimaryAncestry", fields: [ancestryId], references: [id])
  secondaryAncestry      Ancestry?        @relation("SecondaryAncestry", fields: [secondaryAncestryId], references: [id])
  ancestryFeature        AncestryFeature  @relation("PrimaryAncestryFeature", fields: [ancestryFeatureId], references: [id])
  secondaryAncestryFeature AncestryFeature? @relation("SecondaryAncestryFeature", fields: [secondaryAncestryFeatureId], references: [id])
  community              Community        @relation(fields: [communityId], references: [id])
  armor                  Armor?           @relation(fields: [armorId], references: [id])
  primaryWeapon          Weapon?          @relation("PrimaryWeapon", fields: [primaryWeaponId], references: [id])
  secondaryWeapon        Weapon?          @relation("SecondaryWeapon", fields: [secondaryWeaponId], references: [id])

  experiences      CharacterExperience[]
  domainCards      CharacterDomainCard[]
  thresholdBonuses CharacterThresholdBonus[]
  markedTraits     CharacterMarkedTrait[]

  @@map("characters")
}

model CharacterExperience {
  id          String @id @default(uuid())
  characterId String @map("character_id")
  name        String
  modifier    Int

  character Character @relation(fields: [characterId], references: [id], onDelete: Cascade)

  @@map("character_experiences")
}

model CharacterDomainCard {
  id           String @id @default(uuid())
  characterId  String @map("character_id")
  domainCardId String @map("domain_card_id")

  character  Character  @relation(fields: [characterId], references: [id], onDelete: Cascade)
  domainCard DomainCard @relation(fields: [domainCardId], references: [id])

  @@unique([characterId, domainCardId])
  @@map("character_domain_cards")
}

model CharacterThresholdBonus {
  id          String  @id @default(uuid())
  characterId String  @map("character_id")
  sourceType  String  @map("source_type") // 'domainCard' | 'subclassFeature' | 'classFeature'
  sourceId    String  @map("source_id")   // e.g. "Fortified Armor" or "Stalwart:Unwavering"
  majorBonus  Int     @map("major_bonus")
  severeBonus Int     @map("severe_bonus")
  active      Boolean @default(false)

  character Character @relation(fields: [characterId], references: [id], onDelete: Cascade)

  @@map("character_threshold_bonuses")
}

model CharacterMarkedTrait {
  id          String @id @default(uuid())
  characterId String @map("character_id")
  trait       String

  character Character @relation(fields: [characterId], references: [id], onDelete: Cascade)

  @@map("character_marked_traits")
}
```

- [ ] **Step 2: Run migration**

```bash
cd D:/AI/ttrpg-rules/api
npx prisma migrate dev --name init
```

Expected: Migration succeeds, all tables created.

- [ ] **Step 3: Verify with Prisma Studio**

```bash
npx prisma studio
```

Expected: Opens browser showing all tables with correct columns.

- [ ] **Step 4: Commit**

```bash
git add prisma/
git commit -m "feat: add full Prisma schema with SRD and character tables"
```

---

## Task 3: PrismaModule & PrismaService

**Files:**
- Create: `api/src/prisma/prisma.module.ts`
- Create: `api/src/prisma/prisma.service.ts`
- Modify: `api/src/app.module.ts`

- [ ] **Step 1: Create PrismaService**

Create `api/src/prisma/prisma.service.ts`:

```typescript
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
```

- [ ] **Step 2: Create PrismaModule**

Create `api/src/prisma/prisma.module.ts`:

```typescript
import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
```

- [ ] **Step 3: Register PrismaModule in AppModule**

Modify `api/src/app.module.ts` — add `PrismaModule` to imports:

```typescript
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SrdModule } from './srd/srd.module';
import { PrismaModule } from './prisma/prisma.module';
import { LoggerMiddleware } from './logger.middleware';

@Module({
  imports: [PrismaModule, SrdModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
```

- [ ] **Step 4: Verify app starts**

```bash
cd D:/AI/ttrpg-rules/api
npm run start:dev
```

Expected: App starts, Prisma connects to DB.

- [ ] **Step 5: Commit**

```bash
git add src/prisma/ src/app.module.ts
git commit -m "feat: add PrismaModule with global PrismaService"
```

---

## Task 4: Error Codes, Exception Filter & Logging Interceptor

**Files:**
- Create: `api/src/common/error-codes.ts`
- Create: `api/src/common/filters/app-exception.filter.ts`
- Create: `api/src/common/filters/app-exception.filter.spec.ts`
- Create: `api/src/common/interceptors/logging.interceptor.ts`
- Create: `api/src/common/interceptors/logging.interceptor.spec.ts`
- Modify: `api/src/main.ts`

- [ ] **Step 1: Write the error codes and exception classes**

Create `api/src/common/error-codes.ts`:

```typescript
export enum ErrorCode {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  CHARACTER_NOT_FOUND = 'CHARACTER_NOT_FOUND',
  SRD_RESOURCE_NOT_FOUND = 'SRD_RESOURCE_NOT_FOUND',
  INVALID_SRD_REFERENCE = 'INVALID_SRD_REFERENCE',
  DOMAIN_CARD_NOT_AVAILABLE = 'DOMAIN_CARD_NOT_AVAILABLE',
  DUPLICATE_DOMAIN_CARD = 'DUPLICATE_DOMAIN_CARD',
  EXPERIENCE_NOT_FOUND = 'EXPERIENCE_NOT_FOUND',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
}

export class AppException extends Error {
  constructor(
    public readonly errorCode: ErrorCode,
    public readonly statusCode: number,
    message: string,
  ) {
    super(message);
  }
}

export class NotFoundException extends AppException {
  constructor(errorCode: ErrorCode, message: string) {
    super(errorCode, 404, message);
  }
}

export class BadRequestException extends AppException {
  constructor(errorCode: ErrorCode, message: string) {
    super(errorCode, 400, message);
  }
}

export class ConflictException extends AppException {
  constructor(errorCode: ErrorCode, message: string) {
    super(errorCode, 409, message);
  }
}
```

- [ ] **Step 2: Write the failing test for the exception filter**

Create `api/src/common/filters/app-exception.filter.spec.ts`:

```typescript
import { AppExceptionFilter } from './app-exception.filter';
import { AppException, ErrorCode } from '../error-codes';
import { ArgumentsHost, HttpException, Logger } from '@nestjs/common';

function createMockHost(responseBody: { json: jest.Mock; status: jest.Mock }) {
  return {
    switchToHttp: () => ({
      getResponse: () => responseBody,
      getRequest: () => ({ url: '/test', method: 'GET' }),
    }),
  } as unknown as ArgumentsHost;
}

describe('AppExceptionFilter', () => {
  let filter: AppExceptionFilter;
  let json: jest.Mock;
  let status: jest.Mock;
  let host: ArgumentsHost;

  beforeEach(() => {
    filter = new AppExceptionFilter();
    json = jest.fn();
    status = jest.fn().mockReturnValue({ json });
    host = createMockHost({ json, status });
    jest.spyOn(Logger.prototype, 'error').mockImplementation();
    jest.spyOn(Logger.prototype, 'warn').mockImplementation();
  });

  it('should handle AppException with correct error code and status', () => {
    const exception = new AppException(
      ErrorCode.CHARACTER_NOT_FOUND,
      404,
      'Character not found',
    );

    filter.catch(exception, host);

    expect(status).toHaveBeenCalledWith(404);
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: 'CHARACTER_NOT_FOUND',
        message: 'Character not found',
        timestamp: expect.any(String),
      }),
    );
  });

  it('should handle HttpException (e.g. validation errors)', () => {
    const exception = new HttpException(
      {
        message: ['name must be a string'],
        error: 'Bad Request',
        statusCode: 400,
      },
      400,
    );

    filter.catch(exception, host);

    expect(status).toHaveBeenCalledWith(400);
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: 'VALIDATION_ERROR',
        message: ['name must be a string'],
        timestamp: expect.any(String),
      }),
    );
  });

  it('should handle unknown errors as INTERNAL_ERROR', () => {
    const exception = new Error('something broke');

    filter.catch(exception, host);

    expect(status).toHaveBeenCalledWith(500);
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: 'INTERNAL_ERROR',
        message: 'Internal server error',
        timestamp: expect.any(String),
      }),
    );
  });
});
```

- [ ] **Step 3: Run test to verify it fails**

```bash
cd D:/AI/ttrpg-rules/api
npx jest src/common/filters/app-exception.filter.spec.ts --no-coverage
```

Expected: FAIL — cannot find module `./app-exception.filter`.

- [ ] **Step 4: Implement the exception filter**

Create `api/src/common/filters/app-exception.filter.ts`:

```typescript
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  Logger,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { AppException, ErrorCode } from '../error-codes';

@Catch()
export class AppExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(AppExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let statusCode: number;
    let errorCode: string;
    let message: string | string[];

    if (exception instanceof AppException) {
      statusCode = exception.statusCode;
      errorCode = exception.errorCode;
      message = exception.message;
      this.logger.warn(
        `${request.method} ${request.url} → ${statusCode} ${errorCode}: ${message}`,
      );
    } else if (exception instanceof HttpException) {
      statusCode = exception.getStatus();
      const body = exception.getResponse();
      if (statusCode === 400 && typeof body === 'object' && body !== null && 'message' in body) {
        errorCode = ErrorCode.VALIDATION_ERROR;
        message = (body as { message: string | string[] }).message;
      } else {
        errorCode = ErrorCode.INTERNAL_ERROR;
        message = typeof body === 'string' ? body : (body as { message?: string }).message ?? 'Unknown error';
      }
      this.logger.warn(
        `${request.method} ${request.url} → ${statusCode} ${errorCode}: ${JSON.stringify(message)}`,
      );
    } else {
      statusCode = 500;
      errorCode = ErrorCode.INTERNAL_ERROR;
      message = 'Internal server error';
      this.logger.error(
        `${request.method} ${request.url} → 500 unhandled exception`,
        exception instanceof Error ? exception.stack : String(exception),
      );
    }

    response.status(statusCode).json({
      error: errorCode,
      message,
      timestamp: new Date().toISOString(),
    });
  }
}
```

- [ ] **Step 5: Run test to verify it passes**

```bash
cd D:/AI/ttrpg-rules/api
npx jest src/common/filters/app-exception.filter.spec.ts --no-coverage
```

Expected: 3 tests pass.

- [ ] **Step 6: Write the failing test for the logging interceptor**

Create `api/src/common/interceptors/logging.interceptor.spec.ts`:

```typescript
import { LoggingInterceptor } from './logging.interceptor';
import { ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { of } from 'rxjs';

describe('LoggingInterceptor', () => {
  let interceptor: LoggingInterceptor;
  let logSpy: jest.SpyInstance;

  beforeEach(() => {
    interceptor = new LoggingInterceptor();
    logSpy = jest.spyOn(Logger.prototype, 'log').mockImplementation();
  });

  it('should log the request method, url, status, and duration', (done) => {
    const mockContext = {
      switchToHttp: () => ({
        getRequest: () => ({ method: 'GET', url: '/srd/classes' }),
        getResponse: () => ({ statusCode: 200 }),
      }),
    } as unknown as ExecutionContext;

    const mockHandler: CallHandler = {
      handle: () => of({ data: 'test' }),
    };

    interceptor.intercept(mockContext, mockHandler).subscribe({
      complete: () => {
        expect(logSpy).toHaveBeenCalledWith(
          expect.stringMatching(/GET \/srd\/classes 200 \d+ms/),
        );
        done();
      },
    });
  });
});
```

- [ ] **Step 7: Run test to verify it fails**

```bash
cd D:/AI/ttrpg-rules/api
npx jest src/common/interceptors/logging.interceptor.spec.ts --no-coverage
```

Expected: FAIL — cannot find module.

- [ ] **Step 8: Implement the logging interceptor**

Create `api/src/common/interceptors/logging.interceptor.ts`:

```typescript
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { Request, Response } from 'express';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<Request>();
    const { method, url } = request;
    const start = Date.now();

    return next.handle().pipe(
      tap(() => {
        const response = context.switchToHttp().getResponse<Response>();
        const duration = Date.now() - start;
        this.logger.log(`${method} ${url} ${response.statusCode} ${duration}ms`);
      }),
    );
  }
}
```

- [ ] **Step 9: Run test to verify it passes**

```bash
cd D:/AI/ttrpg-rules/api
npx jest src/common/interceptors/logging.interceptor.spec.ts --no-coverage
```

Expected: PASS.

- [ ] **Step 10: Wire up in main.ts**

Replace `api/src/main.ts`:

```typescript
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { AppExceptionFilter } from './common/filters/app-exception.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(helmet());
  app.enableCors();
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.useGlobalFilters(new AppExceptionFilter());
  app.useGlobalInterceptors(new LoggingInterceptor());
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
```

- [ ] **Step 11: Remove old LoggerMiddleware**

Delete `api/src/logger.middleware.ts` and remove it from `app.module.ts`. The `LoggingInterceptor` replaces it.

Update `api/src/app.module.ts`:

```typescript
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SrdModule } from './srd/srd.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [PrismaModule, SrdModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
```

- [ ] **Step 12: Verify app starts and existing tests pass**

```bash
cd D:/AI/ttrpg-rules/api
npm run start:dev
# In another terminal:
npx jest --no-coverage
```

Expected: App starts. All tests pass (some old SRD tests may need updating if they depend on LoggerMiddleware — fix as needed).

- [ ] **Step 13: Commit**

```bash
git add src/common/ src/main.ts src/app.module.ts
git rm src/logger.middleware.ts
git commit -m "feat: add global exception filter with error codes and logging interceptor"
```

---

## Task 5: SRD Seed Script

**Files:**
- Create: `api/prisma/seed.ts`
- Modify: `api/package.json` (add prisma seed config)

The seed script reads the JSON files from `daggerheart-srd/.build/03_json/` and populates all SRD tables. The `evasionModifier` on armor is parsed from the feature text during seeding.

- [ ] **Step 1: Write the seed script**

Create `api/prisma/seed.ts`:

```typescript
import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

const JSON_DIR = path.join(__dirname, '..', 'daggerheart-srd', '.build', '03_json');

function readJson<T>(filename: string): T {
  const content = fs.readFileSync(path.join(JSON_DIR, filename), 'utf-8');
  return JSON.parse(content);
}

function parseEvasionModifier(feature: string | undefined): number | null {
  if (!feature) return null;
  // Match patterns like "+1 to Evasion", "-2 to Evasion"
  const match = feature.match(/([+-]\d+)\s+to\s+Evasion/i);
  return match ? parseInt(match[1], 10) : null;
}

interface RawWeapon {
  name: string;
  tier: string;
  primary_or_secondary: string;
  physical_or_magical: string;
  trait: string;
  range: string;
  damage: string;
  burden: string;
  feature?: { name: string; text: string }[];
}

interface RawArmor {
  name: string;
  tier: string;
  base_score: string;
  base_thresholds: string;
  feature?: { name: string; text: string }[];
}

interface RawClass {
  name: string;
  description: string;
  evasion: string;
  hp: string;
  items: string;
  suggested_traits: string;
  suggested_primary: string;
  suggested_secondary: string;
  suggested_armor: string;
  hope_feature_name: string;
  hope_feature_text: string;
  domain_1: string;
  domain_2: string;
  subclass_1: string;
  subclass_2: string;
  feature: { name: string; text: string }[];
}

interface RawSubclass {
  name: string;
  description: string;
  spellcast_trait: string;
  foundation: { name: string; text: string }[];
  specialization: { name: string; text: string }[];
  mastery: { name: string; text: string }[];
}

interface RawAncestry {
  name: string;
  description: string;
  feature: { name: string; text: string }[];
}

interface RawCommunity {
  name: string;
  description: string;
  note: string;
  feature: { name: string; text: string }[];
}

interface RawDomain {
  name: string;
  description: string;
  card: string[][];
}

interface RawAbility {
  name: string;
  level: string;
  domain: string;
  recall: string;
  text: string;
  type: string;
}

async function seed() {
  console.log('Seeding SRD data...');

  // Clear existing SRD data (in dependency order)
  await prisma.characterMarkedTrait.deleteMany();
  await prisma.characterThresholdBonus.deleteMany();
  await prisma.characterDomainCard.deleteMany();
  await prisma.characterExperience.deleteMany();
  await prisma.character.deleteMany();
  await prisma.domainCard.deleteMany();
  await prisma.classDomain.deleteMany();
  await prisma.classFeature.deleteMany();
  await prisma.subclassFeature.deleteMany();
  await prisma.subclass.deleteMany();
  await prisma.srdClass.deleteMany();
  await prisma.communityFeature.deleteMany();
  await prisma.community.deleteMany();
  await prisma.ancestryFeature.deleteMany();
  await prisma.ancestry.deleteMany();
  await prisma.domain.deleteMany();
  await prisma.weapon.deleteMany();
  await prisma.armor.deleteMany();

  // 1. Seed weapons
  const rawWeapons = readJson<RawWeapon[]>('weapons.json');
  for (const w of rawWeapons) {
    const featureText = w.feature?.map(f => `${f.name}: ${f.text}`).join('; ') || null;
    await prisma.weapon.create({
      data: {
        name: w.name,
        tier: parseInt(w.tier, 10),
        type: w.primary_or_secondary,
        damageType: w.physical_or_magical,
        trait: w.trait,
        range: w.range,
        damage: w.damage,
        burden: w.burden,
        feature: featureText,
      },
    });
  }
  console.log(`  Seeded ${rawWeapons.length} weapons`);

  // 2. Seed armor
  const rawArmor = readJson<RawArmor[]>('armor.json');
  for (const a of rawArmor) {
    const featureText = a.feature?.map(f => `${f.name}: ${f.text}`).join('; ') || null;
    const evasionModifier = parseEvasionModifier(featureText);
    await prisma.armor.create({
      data: {
        name: a.name,
        tier: parseInt(a.tier, 10),
        baseScore: parseInt(a.base_score, 10),
        baseThresholds: a.base_thresholds,
        evasionModifier,
        feature: featureText,
      },
    });
  }
  console.log(`  Seeded ${rawArmor.length} armor`);

  // 3. Seed ancestries
  const rawAncestries = readJson<RawAncestry[]>('ancestries.json');
  for (const a of rawAncestries) {
    await prisma.ancestry.create({
      data: {
        name: a.name,
        description: a.description,
        features: {
          create: a.feature.map(f => ({ name: f.name, text: f.text })),
        },
      },
    });
  }
  console.log(`  Seeded ${rawAncestries.length} ancestries`);

  // 4. Seed communities
  const rawCommunities = readJson<RawCommunity[]>('communities.json');
  for (const c of rawCommunities) {
    await prisma.community.create({
      data: {
        name: c.name,
        description: c.description,
        note: c.note,
        features: {
          create: c.feature.map(f => ({ name: f.name, text: f.text })),
        },
      },
    });
  }
  console.log(`  Seeded ${rawCommunities.length} communities`);

  // 5. Seed domains
  const rawDomains = readJson<RawDomain[]>('domains.json');
  for (const d of rawDomains) {
    await prisma.domain.create({
      data: {
        name: d.name,
        description: d.description,
      },
    });
  }
  console.log(`  Seeded ${rawDomains.length} domains`);

  // 6. Seed domain cards from abilities.json
  const rawAbilities = readJson<RawAbility[]>('abilities.json');
  for (const a of rawAbilities) {
    const domain = await prisma.domain.findFirst({ where: { name: a.domain } });
    if (!domain) {
      console.warn(`  Warning: domain "${a.domain}" not found for ability "${a.name}"`);
      continue;
    }
    await prisma.domainCard.create({
      data: {
        domainId: domain.id,
        name: a.name,
        level: parseInt(a.level, 10),
        recallCost: parseInt(a.recall, 10),
        description: a.text,
      },
    });
  }
  console.log(`  Seeded ${rawAbilities.length} domain cards`);

  // 7. Seed classes with subclasses, features, and domain links
  const rawSubclasses = readJson<RawSubclass[]>('subclasses.json');
  const rawClasses = readJson<RawClass[]>('classes.json');
  for (const c of rawClasses) {
    // Find suggested equipment by name
    const suggestedPrimary = await prisma.weapon.findFirst({ where: { name: c.suggested_primary } });
    const suggestedSecondary = await prisma.weapon.findFirst({ where: { name: c.suggested_secondary } });
    const suggestedArmor = await prisma.armor.findFirst({ where: { name: c.suggested_armor } });

    // Parse suggested traits: "0, -1, +1, 0, +2, +1" → [0, -1, 1, 0, 2, 1]
    const suggestedTraits = c.suggested_traits
      .split(',')
      .map(s => parseInt(s.trim(), 10));

    // Find domains
    const domain1 = await prisma.domain.findFirst({ where: { name: c.domain_1 } });
    const domain2 = await prisma.domain.findFirst({ where: { name: c.domain_2 } });

    // Find subclass data
    const sub1Data = rawSubclasses.find(s => s.name === c.subclass_1);
    const sub2Data = rawSubclasses.find(s => s.name === c.subclass_2);

    const createdClass = await prisma.srdClass.create({
      data: {
        name: c.name,
        description: c.description,
        evasion: parseInt(c.evasion, 10),
        hp: parseInt(c.hp, 10),
        items: c.items,
        suggestedTraits,
        hopeFeatureName: c.hope_feature_name,
        hopeFeatureText: c.hope_feature_text,
        suggestedPrimaryId: suggestedPrimary?.id ?? null,
        suggestedSecondaryId: suggestedSecondary?.id ?? null,
        suggestedArmorId: suggestedArmor?.id ?? null,
        features: {
          create: c.feature.map(f => ({ name: f.name, text: f.text })),
        },
        domains: {
          create: [
            ...(domain1 ? [{ domainId: domain1.id }] : []),
            ...(domain2 ? [{ domainId: domain2.id }] : []),
          ],
        },
      },
    });

    // Create subclasses for this class
    for (const subData of [sub1Data, sub2Data]) {
      if (!subData) continue;
      const features = [
        ...subData.foundation.map(f => ({ ...f, tier: 'foundation' })),
        ...subData.specialization.map(f => ({ ...f, tier: 'specialization' })),
        ...subData.mastery.map(f => ({ ...f, tier: 'mastery' })),
      ];
      await prisma.subclass.create({
        data: {
          classId: createdClass.id,
          name: subData.name,
          description: subData.description,
          spellcastTrait: subData.spellcast_trait,
          features: {
            create: features.map(f => ({ tier: f.tier, name: f.name, text: f.text })),
          },
        },
      });
    }
  }
  console.log(`  Seeded ${rawClasses.length} classes with subclasses and features`);

  console.log('Seeding complete!');
}

seed()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

- [ ] **Step 2: Add seed config to package.json**

Add to `api/package.json`:

```json
{
  "prisma": {
    "seed": "ts-node prisma/seed.ts"
  }
}
```

- [ ] **Step 3: Run the seed**

```bash
cd D:/AI/ttrpg-rules/api
npx prisma db seed
```

Expected: All SRD data seeded. Output shows counts for each entity type.

- [ ] **Step 4: Verify in Prisma Studio**

```bash
npx prisma studio
```

Expected: All tables populated with correct data. Classes have features, subclasses, and domain links.

- [ ] **Step 5: Commit**

```bash
git add prisma/seed.ts package.json
git commit -m "feat: add SRD seed script loading from JSON files"
```

---

## Task 6: SRD Domain Interfaces & Repositories

**Files:**
- Create: `api/src/srd/interfaces/srd-class.interface.ts`
- Create: `api/src/srd/interfaces/srd-subclass.interface.ts`
- Create: `api/src/srd/interfaces/srd-ancestry.interface.ts`
- Create: `api/src/srd/interfaces/srd-community.interface.ts`
- Create: `api/src/srd/interfaces/srd-domain.interface.ts`
- Create: `api/src/srd/interfaces/srd-domain-card.interface.ts`
- Create: `api/src/srd/interfaces/srd-weapon.interface.ts`
- Create: `api/src/srd/interfaces/srd-armor.interface.ts`
- Create: `api/src/srd/repositories/class.repository.ts`
- Create: `api/src/srd/repositories/subclass.repository.ts`
- Create: `api/src/srd/repositories/ancestry.repository.ts`
- Create: `api/src/srd/repositories/community.repository.ts`
- Create: `api/src/srd/repositories/domain.repository.ts`
- Create: `api/src/srd/repositories/domain-card.repository.ts`
- Create: `api/src/srd/repositories/weapon.repository.ts`
- Create: `api/src/srd/repositories/armor.repository.ts`

- [ ] **Step 1: Create all SRD domain interfaces**

Create `api/src/srd/interfaces/srd-weapon.interface.ts`:

```typescript
export interface ISrdWeapon {
  id: string;
  name: string;
  tier: number;
  type: string;
  damageType: string;
  trait: string;
  range: string;
  damage: string;
  burden: string;
  feature: string | null;
}
```

Create `api/src/srd/interfaces/srd-armor.interface.ts`:

```typescript
export interface ISrdArmor {
  id: string;
  name: string;
  tier: number;
  baseScore: number;
  baseThresholds: string;
  evasionModifier: number | null;
  feature: string | null;
}
```

Create `api/src/srd/interfaces/srd-class.interface.ts`:

```typescript
export interface ISrdFeature {
  id: string;
  name: string;
  text: string;
}

export interface ISrdClass {
  id: string;
  name: string;
  description: string;
  evasion: number;
  hp: number;
  items: string;
  suggestedTraits: number[];
  hopeFeatureName: string;
  hopeFeatureText: string;
  suggestedPrimary: { id: string; name: string } | null;
  suggestedSecondary: { id: string; name: string } | null;
  suggestedArmor: { id: string; name: string } | null;
  features: ISrdFeature[];
  subclasses: { id: string; name: string }[];
  domains: { id: string; name: string }[];
}
```

Create `api/src/srd/interfaces/srd-subclass.interface.ts`:

```typescript
import { ISrdFeature } from './srd-class.interface';

export interface ISrdSubclassFeature extends ISrdFeature {
  tier: string;
}

export interface ISrdSubclass {
  id: string;
  name: string;
  description: string;
  spellcastTrait: string;
  className: string;
  features: ISrdSubclassFeature[];
}
```

Create `api/src/srd/interfaces/srd-ancestry.interface.ts`:

```typescript
import { ISrdFeature } from './srd-class.interface';

export interface ISrdAncestry {
  id: string;
  name: string;
  description: string;
  features: ISrdFeature[];
}
```

Create `api/src/srd/interfaces/srd-community.interface.ts`:

```typescript
import { ISrdFeature } from './srd-class.interface';

export interface ISrdCommunity {
  id: string;
  name: string;
  description: string;
  note: string;
  features: ISrdFeature[];
}
```

Create `api/src/srd/interfaces/srd-domain.interface.ts`:

```typescript
export interface ISrdDomain {
  id: string;
  name: string;
  description: string;
  classes: string[];
  cards: { id: string; name: string; level: number }[];
}
```

Create `api/src/srd/interfaces/srd-domain-card.interface.ts`:

```typescript
export interface ISrdDomainCard {
  id: string;
  name: string;
  level: number;
  recallCost: number;
  description: string;
  domainName: string;
}
```

- [ ] **Step 2: Create all SRD repositories**

Create `api/src/srd/repositories/weapon.repository.ts`:

```typescript
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ISrdWeapon } from '../interfaces/srd-weapon.interface';

@Injectable()
export class WeaponRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(filters?: { tier?: number; type?: string }): Promise<ISrdWeapon[]> {
    const where: Record<string, unknown> = {};
    if (filters?.tier !== undefined) where.tier = filters.tier;
    if (filters?.type !== undefined) where.type = filters.type;

    return this.prisma.weapon.findMany({ where, orderBy: [{ tier: 'asc' }, { name: 'asc' }] });
  }

  async findById(id: string): Promise<ISrdWeapon | null> {
    return this.prisma.weapon.findUnique({ where: { id } });
  }
}
```

Create `api/src/srd/repositories/armor.repository.ts`:

```typescript
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ISrdArmor } from '../interfaces/srd-armor.interface';

@Injectable()
export class ArmorRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(filters?: { tier?: number }): Promise<ISrdArmor[]> {
    const where: Record<string, unknown> = {};
    if (filters?.tier !== undefined) where.tier = filters.tier;

    return this.prisma.armor.findMany({ where, orderBy: [{ tier: 'asc' }, { name: 'asc' }] });
  }

  async findById(id: string): Promise<ISrdArmor | null> {
    return this.prisma.armor.findUnique({ where: { id } });
  }
}
```

Create `api/src/srd/repositories/class.repository.ts`:

```typescript
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ISrdClass } from '../interfaces/srd-class.interface';

@Injectable()
export class ClassRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<ISrdClass[]> {
    const classes = await this.prisma.srdClass.findMany({
      include: {
        features: true,
        subclasses: { select: { id: true, name: true } },
        domains: { include: { domain: { select: { id: true, name: true } } } },
        suggestedPrimary: { select: { id: true, name: true } },
        suggestedSecondary: { select: { id: true, name: true } },
        suggestedArmor: { select: { id: true, name: true } },
      },
      orderBy: { name: 'asc' },
    });

    return classes.map(c => ({
      id: c.id,
      name: c.name,
      description: c.description,
      evasion: c.evasion,
      hp: c.hp,
      items: c.items,
      suggestedTraits: c.suggestedTraits,
      hopeFeatureName: c.hopeFeatureName,
      hopeFeatureText: c.hopeFeatureText,
      suggestedPrimary: c.suggestedPrimary,
      suggestedSecondary: c.suggestedSecondary,
      suggestedArmor: c.suggestedArmor,
      features: c.features,
      subclasses: c.subclasses,
      domains: c.domains.map(cd => cd.domain),
    }));
  }

  async findById(id: string): Promise<ISrdClass | null> {
    const c = await this.prisma.srdClass.findUnique({
      where: { id },
      include: {
        features: true,
        subclasses: { select: { id: true, name: true } },
        domains: { include: { domain: { select: { id: true, name: true } } } },
        suggestedPrimary: { select: { id: true, name: true } },
        suggestedSecondary: { select: { id: true, name: true } },
        suggestedArmor: { select: { id: true, name: true } },
      },
    });

    if (!c) return null;

    return {
      id: c.id,
      name: c.name,
      description: c.description,
      evasion: c.evasion,
      hp: c.hp,
      items: c.items,
      suggestedTraits: c.suggestedTraits,
      hopeFeatureName: c.hopeFeatureName,
      hopeFeatureText: c.hopeFeatureText,
      suggestedPrimary: c.suggestedPrimary,
      suggestedSecondary: c.suggestedSecondary,
      suggestedArmor: c.suggestedArmor,
      features: c.features,
      subclasses: c.subclasses,
      domains: c.domains.map(cd => cd.domain),
    };
  }
}
```

Create `api/src/srd/repositories/subclass.repository.ts`:

```typescript
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ISrdSubclass } from '../interfaces/srd-subclass.interface';

@Injectable()
export class SubclassRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<ISrdSubclass[]> {
    const subclasses = await this.prisma.subclass.findMany({
      include: {
        features: true,
        class: { select: { name: true } },
      },
      orderBy: { name: 'asc' },
    });

    return subclasses.map(s => ({
      id: s.id,
      name: s.name,
      description: s.description,
      spellcastTrait: s.spellcastTrait,
      className: s.class.name,
      features: s.features,
    }));
  }

  async findById(id: string): Promise<ISrdSubclass | null> {
    const s = await this.prisma.subclass.findUnique({
      where: { id },
      include: {
        features: true,
        class: { select: { name: true } },
      },
    });

    if (!s) return null;

    return {
      id: s.id,
      name: s.name,
      description: s.description,
      spellcastTrait: s.spellcastTrait,
      className: s.class.name,
      features: s.features,
    };
  }
}
```

Create `api/src/srd/repositories/ancestry.repository.ts`:

```typescript
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ISrdAncestry } from '../interfaces/srd-ancestry.interface';

@Injectable()
export class AncestryRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<ISrdAncestry[]> {
    return this.prisma.ancestry.findMany({
      include: { features: true },
      orderBy: { name: 'asc' },
    });
  }

  async findById(id: string): Promise<ISrdAncestry | null> {
    return this.prisma.ancestry.findUnique({
      where: { id },
      include: { features: true },
    });
  }
}
```

Create `api/src/srd/repositories/community.repository.ts`:

```typescript
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ISrdCommunity } from '../interfaces/srd-community.interface';

@Injectable()
export class CommunityRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<ISrdCommunity[]> {
    return this.prisma.community.findMany({
      include: { features: true },
      orderBy: { name: 'asc' },
    });
  }

  async findById(id: string): Promise<ISrdCommunity | null> {
    return this.prisma.community.findUnique({
      where: { id },
      include: { features: true },
    });
  }
}
```

Create `api/src/srd/repositories/domain.repository.ts`:

```typescript
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ISrdDomain } from '../interfaces/srd-domain.interface';

@Injectable()
export class DomainRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<ISrdDomain[]> {
    const domains = await this.prisma.domain.findMany({
      include: {
        cards: { select: { id: true, name: true, level: true }, orderBy: { level: 'asc' } },
        classes: { include: { class: { select: { name: true } } } },
      },
      orderBy: { name: 'asc' },
    });

    return domains.map(d => ({
      id: d.id,
      name: d.name,
      description: d.description,
      classes: d.classes.map(cd => cd.class.name),
      cards: d.cards,
    }));
  }

  async findById(id: string): Promise<ISrdDomain | null> {
    const d = await this.prisma.domain.findUnique({
      where: { id },
      include: {
        cards: { select: { id: true, name: true, level: true }, orderBy: { level: 'asc' } },
        classes: { include: { class: { select: { name: true } } } },
      },
    });

    if (!d) return null;

    return {
      id: d.id,
      name: d.name,
      description: d.description,
      classes: d.classes.map(cd => cd.class.name),
      cards: d.cards,
    };
  }
}
```

Create `api/src/srd/repositories/domain-card.repository.ts`:

```typescript
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ISrdDomainCard } from '../interfaces/srd-domain-card.interface';

@Injectable()
export class DomainCardRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(filters?: { domain?: string; level?: number }): Promise<ISrdDomainCard[]> {
    const where: Record<string, unknown> = {};
    if (filters?.level !== undefined) where.level = filters.level;
    if (filters?.domain !== undefined) {
      where.domain = { name: filters.domain };
    }

    const cards = await this.prisma.domainCard.findMany({
      where,
      include: { domain: { select: { name: true } } },
      orderBy: [{ level: 'asc' }, { name: 'asc' }],
    });

    return cards.map(c => ({
      id: c.id,
      name: c.name,
      level: c.level,
      recallCost: c.recallCost,
      description: c.description,
      domainName: c.domain.name,
    }));
  }

  async findById(id: string): Promise<ISrdDomainCard | null> {
    const c = await this.prisma.domainCard.findUnique({
      where: { id },
      include: { domain: { select: { name: true } } },
    });

    if (!c) return null;

    return {
      id: c.id,
      name: c.name,
      level: c.level,
      recallCost: c.recallCost,
      description: c.description,
      domainName: c.domain.name,
    };
  }
}
```

- [ ] **Step 3: Commit**

```bash
git add src/srd/interfaces/ src/srd/repositories/
git commit -m "feat: add SRD domain interfaces and Prisma-backed repositories"
```

---

## Task 7: SRD DTOs, Service, Controller & Module Wiring

**Files:**
- Replace: `api/src/srd/dto/` (new response and query DTOs)
- Replace: `api/src/srd/srd.service.ts`
- Replace: `api/src/srd/srd.controller.ts`
- Replace: `api/src/srd/srd.module.ts`
- Delete: `api/src/srd/interfaces/` (old class-based "interfaces")
- Delete: `api/src/srd/testing/` (old mocks)

This task replaces the static in-memory SRD module with the Prisma-backed version. The old DTOs, interfaces (classes), and testing mocks in the existing `srd/` directory are replaced.

- [ ] **Step 1: Create query DTOs for filterable endpoints**

Create `api/src/srd/dto/weapon-query.dto.ts`:

```typescript
import { IsOptional, IsInt, IsIn, Min, Max } from 'class-validator';
import { Transform } from 'class-transformer';

export class WeaponQueryDto {
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsInt()
  @Min(1)
  @Max(4)
  tier?: number;

  @IsOptional()
  @IsIn(['Primary', 'Secondary'])
  type?: string;
}
```

Create `api/src/srd/dto/armor-query.dto.ts`:

```typescript
import { IsOptional, IsInt, Min, Max } from 'class-validator';
import { Transform } from 'class-transformer';

export class ArmorQueryDto {
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsInt()
  @Min(1)
  @Max(4)
  tier?: number;
}
```

Create `api/src/srd/dto/domain-card-query.dto.ts`:

```typescript
import { IsOptional, IsInt, IsString, Min, Max } from 'class-validator';
import { Transform } from 'class-transformer';

export class DomainCardQueryDto {
  @IsOptional()
  @IsString()
  domain?: string;

  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsInt()
  @Min(1)
  @Max(10)
  level?: number;
}
```

- [ ] **Step 2: Replace SRD service**

Replace `api/src/srd/srd.service.ts`:

```typescript
import { Injectable } from '@nestjs/common';
import { ErrorCode, NotFoundException } from '../common/error-codes';
import { WeaponRepository } from './repositories/weapon.repository';
import { ArmorRepository } from './repositories/armor.repository';
import { ClassRepository } from './repositories/class.repository';
import { SubclassRepository } from './repositories/subclass.repository';
import { AncestryRepository } from './repositories/ancestry.repository';
import { CommunityRepository } from './repositories/community.repository';
import { DomainRepository } from './repositories/domain.repository';
import { DomainCardRepository } from './repositories/domain-card.repository';

@Injectable()
export class SrdService {
  constructor(
    private readonly weaponRepo: WeaponRepository,
    private readonly armorRepo: ArmorRepository,
    private readonly classRepo: ClassRepository,
    private readonly subclassRepo: SubclassRepository,
    private readonly ancestryRepo: AncestryRepository,
    private readonly communityRepo: CommunityRepository,
    private readonly domainRepo: DomainRepository,
    private readonly domainCardRepo: DomainCardRepository,
  ) {}

  findAllWeapons(filters?: { tier?: number; type?: string }) {
    return this.weaponRepo.findAll(filters);
  }

  async findWeaponById(id: string) {
    const weapon = await this.weaponRepo.findById(id);
    if (!weapon) throw new NotFoundException(ErrorCode.SRD_RESOURCE_NOT_FOUND, `Weapon with id '${id}' not found`);
    return weapon;
  }

  findAllArmor(filters?: { tier?: number }) {
    return this.armorRepo.findAll(filters);
  }

  async findArmorById(id: string) {
    const armor = await this.armorRepo.findById(id);
    if (!armor) throw new NotFoundException(ErrorCode.SRD_RESOURCE_NOT_FOUND, `Armor with id '${id}' not found`);
    return armor;
  }

  findAllClasses() {
    return this.classRepo.findAll();
  }

  async findClassById(id: string) {
    const cls = await this.classRepo.findById(id);
    if (!cls) throw new NotFoundException(ErrorCode.SRD_RESOURCE_NOT_FOUND, `Class with id '${id}' not found`);
    return cls;
  }

  findAllSubclasses() {
    return this.subclassRepo.findAll();
  }

  async findSubclassById(id: string) {
    const sub = await this.subclassRepo.findById(id);
    if (!sub) throw new NotFoundException(ErrorCode.SRD_RESOURCE_NOT_FOUND, `Subclass with id '${id}' not found`);
    return sub;
  }

  findAllAncestries() {
    return this.ancestryRepo.findAll();
  }

  async findAncestryById(id: string) {
    const ancestry = await this.ancestryRepo.findById(id);
    if (!ancestry) throw new NotFoundException(ErrorCode.SRD_RESOURCE_NOT_FOUND, `Ancestry with id '${id}' not found`);
    return ancestry;
  }

  findAllCommunities() {
    return this.communityRepo.findAll();
  }

  async findCommunityById(id: string) {
    const community = await this.communityRepo.findById(id);
    if (!community) throw new NotFoundException(ErrorCode.SRD_RESOURCE_NOT_FOUND, `Community with id '${id}' not found`);
    return community;
  }

  findAllDomains() {
    return this.domainRepo.findAll();
  }

  async findDomainById(id: string) {
    const domain = await this.domainRepo.findById(id);
    if (!domain) throw new NotFoundException(ErrorCode.SRD_RESOURCE_NOT_FOUND, `Domain with id '${id}' not found`);
    return domain;
  }

  findAllDomainCards(filters?: { domain?: string; level?: number }) {
    return this.domainCardRepo.findAll(filters);
  }
}
```

- [ ] **Step 3: Replace SRD controller**

Replace `api/src/srd/srd.controller.ts`:

```typescript
import { Controller, Get, Param, Query } from '@nestjs/common';
import { SrdService } from './srd.service';
import { WeaponQueryDto } from './dto/weapon-query.dto';
import { ArmorQueryDto } from './dto/armor-query.dto';
import { DomainCardQueryDto } from './dto/domain-card-query.dto';

@Controller('srd')
export class SrdController {
  constructor(private readonly srdService: SrdService) {}

  @Get('weapons')
  findAllWeapons(@Query() query: WeaponQueryDto) {
    return this.srdService.findAllWeapons(query);
  }

  @Get('armor')
  findAllArmor(@Query() query: ArmorQueryDto) {
    return this.srdService.findAllArmor(query);
  }

  @Get('classes')
  findAllClasses() {
    return this.srdService.findAllClasses();
  }

  @Get('classes/:id')
  findClassById(@Param('id') id: string) {
    return this.srdService.findClassById(id);
  }

  @Get('subclasses')
  findAllSubclasses() {
    return this.srdService.findAllSubclasses();
  }

  @Get('subclasses/:id')
  findSubclassById(@Param('id') id: string) {
    return this.srdService.findSubclassById(id);
  }

  @Get('ancestries')
  findAllAncestries() {
    return this.srdService.findAllAncestries();
  }

  @Get('ancestries/:id')
  findAncestryById(@Param('id') id: string) {
    return this.srdService.findAncestryById(id);
  }

  @Get('communities')
  findAllCommunities() {
    return this.srdService.findAllCommunities();
  }

  @Get('communities/:id')
  findCommunityById(@Param('id') id: string) {
    return this.srdService.findCommunityById(id);
  }

  @Get('domains')
  findAllDomains() {
    return this.srdService.findAllDomains();
  }

  @Get('domains/:id')
  findDomainById(@Param('id') id: string) {
    return this.srdService.findDomainById(id);
  }

  @Get('domain-cards')
  findAllDomainCards(@Query() query: DomainCardQueryDto) {
    return this.srdService.findAllDomainCards(query);
  }
}
```

- [ ] **Step 4: Update SRD module**

Replace `api/src/srd/srd.module.ts`:

```typescript
import { Module } from '@nestjs/common';
import { SrdController } from './srd.controller';
import { SrdService } from './srd.service';
import { WeaponRepository } from './repositories/weapon.repository';
import { ArmorRepository } from './repositories/armor.repository';
import { ClassRepository } from './repositories/class.repository';
import { SubclassRepository } from './repositories/subclass.repository';
import { AncestryRepository } from './repositories/ancestry.repository';
import { CommunityRepository } from './repositories/community.repository';
import { DomainRepository } from './repositories/domain.repository';
import { DomainCardRepository } from './repositories/domain-card.repository';

@Module({
  controllers: [SrdController],
  providers: [
    SrdService,
    WeaponRepository,
    ArmorRepository,
    ClassRepository,
    SubclassRepository,
    AncestryRepository,
    CommunityRepository,
    DomainRepository,
    DomainCardRepository,
  ],
  exports: [SrdService],
})
export class SrdModule {}
```

- [ ] **Step 5: Remove old SRD files**

Delete:
- `api/src/srd/interfaces/` (old class-based interfaces — NOT the new ones we just created in the previous task)
- `api/src/srd/testing/mocks.ts`
- `api/src/srd/dtos/` (old DTOs — replaced by new `dto/` directory)
- `api/src/srd/srd.controller.spec.ts` (old unit test — will be replaced by E2E)
- `api/src/srd/srd.service.spec.ts` (old unit test — will be replaced by E2E)

**Note:** Be careful — the old `interfaces/` directory contains class-based "interfaces" (weapon.interface.ts, etc.). The NEW `interfaces/` directory created in Task 6 contains TypeScript interfaces (srd-weapon.interface.ts, etc.). If they're in the same directory, remove only the old files.

- [ ] **Step 6: Verify app starts and endpoints work**

```bash
cd D:/AI/ttrpg-rules/api
npm run start:dev
# Test a few endpoints:
curl http://localhost:3000/srd/classes
curl http://localhost:3000/srd/weapons?tier=1&type=Primary
curl http://localhost:3000/srd/domain-cards?domain=Arcana&level=1
```

Expected: Endpoints return SRD data from the database.

- [ ] **Step 7: Commit**

```bash
git add src/srd/
git commit -m "feat: replace static SRD module with Prisma-backed repositories and query filtering"
```

---

## Task 8: SRD E2E Tests

**Files:**
- Create: `api/src/common/test/test-helpers.ts`
- Create: `api/test/srd.e2e-spec.ts`
- Modify: `api/test/jest-e2e.json`

- [ ] **Step 1: Create test helpers**

Create `api/src/common/test/test-helpers.ts`:

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AppModule } from '../../app.module';
import { AppExceptionFilter } from '../filters/app-exception.filter';
import { PrismaService } from '../../prisma/prisma.service';
import { execSync } from 'child_process';

export async function createTestApp(): Promise<INestApplication> {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app = moduleFixture.createNestApplication();
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.useGlobalFilters(new AppExceptionFilter());
  await app.init();
  return app;
}

export async function seedTestDatabase(): Promise<void> {
  execSync('npx prisma db seed', {
    env: { ...process.env, DATABASE_URL: process.env.DATABASE_URL },
    stdio: 'pipe',
  });
}

export async function cleanCharacterTables(prisma: PrismaService): Promise<void> {
  await prisma.characterMarkedTrait.deleteMany();
  await prisma.characterThresholdBonus.deleteMany();
  await prisma.characterDomainCard.deleteMany();
  await prisma.characterExperience.deleteMany();
  await prisma.character.deleteMany();
}
```

- [ ] **Step 2: Update jest-e2e.json for test DB**

Replace `api/test/jest-e2e.json`:

```json
{
  "moduleFileExtensions": ["js", "json", "ts"],
  "rootDir": ".",
  "testEnvironment": "node",
  "testRegex": ".e2e-spec.ts$",
  "transform": {
    "^.+\\.(t|j)s$": "ts-jest"
  },
  "moduleNameMapper": {
    "^lib/(.*)$": "<rootDir>/../lib/$1"
  },
  "setupFiles": ["./setup-env.ts"]
}
```

Create `api/test/setup-env.ts`:

```typescript
process.env.DATABASE_URL = 'postgresql://daggerheart:daggerheart@localhost:5433/daggerheart_test';
```

- [ ] **Step 3: Write SRD E2E tests**

Create `api/test/srd.e2e-spec.ts`:

```typescript
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { createTestApp, seedTestDatabase } from '../src/common/test/test-helpers';
import { PrismaService } from '../src/prisma/prisma.service';
import { execSync } from 'child_process';

describe('SRD Endpoints (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    // Apply migrations and seed test DB
    execSync('npx prisma migrate deploy', {
      env: { ...process.env, DATABASE_URL: process.env.DATABASE_URL },
      stdio: 'pipe',
    });
    await seedTestDatabase();
    app = await createTestApp();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /srd/classes', () => {
    it('should return all classes', async () => {
      const res = await request(app.getHttpServer()).get('/srd/classes').expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);

      const warrior = res.body.find((c: { name: string }) => c.name === 'Warrior');
      expect(warrior).toBeDefined();
      expect(warrior.evasion).toBeDefined();
      expect(warrior.hp).toBeDefined();
      expect(warrior.features).toBeDefined();
      expect(warrior.domains).toBeDefined();
      expect(warrior.subclasses).toBeDefined();
    });
  });

  describe('GET /srd/classes/:id', () => {
    it('should return a single class', async () => {
      const listRes = await request(app.getHttpServer()).get('/srd/classes');
      const classId = listRes.body[0].id;

      const res = await request(app.getHttpServer()).get(`/srd/classes/${classId}`).expect(200);

      expect(res.body.id).toBe(classId);
      expect(res.body.name).toBeDefined();
      expect(res.body.features).toBeDefined();
    });

    it('should return 404 for unknown id', async () => {
      const res = await request(app.getHttpServer())
        .get('/srd/classes/00000000-0000-0000-0000-000000000000')
        .expect(404);

      expect(res.body.error).toBe('SRD_RESOURCE_NOT_FOUND');
    });
  });

  describe('GET /srd/subclasses', () => {
    it('should return all subclasses with features', async () => {
      const res = await request(app.getHttpServer()).get('/srd/subclasses').expect(200);

      expect(res.body.length).toBeGreaterThan(0);
      expect(res.body[0].features).toBeDefined();
      expect(res.body[0].className).toBeDefined();
    });
  });

  describe('GET /srd/ancestries', () => {
    it('should return all ancestries with features', async () => {
      const res = await request(app.getHttpServer()).get('/srd/ancestries').expect(200);

      expect(res.body.length).toBeGreaterThan(0);
      expect(res.body[0].features).toBeDefined();
    });
  });

  describe('GET /srd/communities', () => {
    it('should return all communities with features', async () => {
      const res = await request(app.getHttpServer()).get('/srd/communities').expect(200);

      expect(res.body.length).toBeGreaterThan(0);
      expect(res.body[0].note).toBeDefined();
    });
  });

  describe('GET /srd/domains', () => {
    it('should return all domains with cards and classes', async () => {
      const res = await request(app.getHttpServer()).get('/srd/domains').expect(200);

      expect(res.body.length).toBeGreaterThan(0);
      expect(res.body[0].cards).toBeDefined();
      expect(res.body[0].classes).toBeDefined();
    });
  });

  describe('GET /srd/domain-cards', () => {
    it('should return all domain cards', async () => {
      const res = await request(app.getHttpServer()).get('/srd/domain-cards').expect(200);

      expect(res.body.length).toBeGreaterThan(0);
      expect(res.body[0].domainName).toBeDefined();
    });

    it('should filter by domain name', async () => {
      const res = await request(app.getHttpServer())
        .get('/srd/domain-cards?domain=Arcana')
        .expect(200);

      expect(res.body.length).toBeGreaterThan(0);
      expect(res.body.every((c: { domainName: string }) => c.domainName === 'Arcana')).toBe(true);
    });

    it('should filter by level', async () => {
      const res = await request(app.getHttpServer())
        .get('/srd/domain-cards?level=1')
        .expect(200);

      expect(res.body.length).toBeGreaterThan(0);
      expect(res.body.every((c: { level: number }) => c.level === 1)).toBe(true);
    });
  });

  describe('GET /srd/weapons', () => {
    it('should return all weapons', async () => {
      const res = await request(app.getHttpServer()).get('/srd/weapons').expect(200);

      expect(res.body.length).toBeGreaterThan(0);
    });

    it('should filter by tier', async () => {
      const res = await request(app.getHttpServer())
        .get('/srd/weapons?tier=1')
        .expect(200);

      expect(res.body.every((w: { tier: number }) => w.tier === 1)).toBe(true);
    });

    it('should filter by type', async () => {
      const res = await request(app.getHttpServer())
        .get('/srd/weapons?type=Primary')
        .expect(200);

      expect(res.body.every((w: { type: string }) => w.type === 'Primary')).toBe(true);
    });

    it('should reject invalid tier', async () => {
      const res = await request(app.getHttpServer())
        .get('/srd/weapons?tier=99')
        .expect(400);

      expect(res.body.error).toBe('VALIDATION_ERROR');
    });
  });

  describe('GET /srd/armor', () => {
    it('should return all armor', async () => {
      const res = await request(app.getHttpServer()).get('/srd/armor').expect(200);

      expect(res.body.length).toBeGreaterThan(0);
    });

    it('should filter by tier', async () => {
      const res = await request(app.getHttpServer())
        .get('/srd/armor?tier=1')
        .expect(200);

      expect(res.body.every((a: { tier: number }) => a.tier === 1)).toBe(true);
    });
  });
});
```

- [ ] **Step 4: Run E2E tests**

```bash
cd D:/AI/ttrpg-rules/api
npx jest --config test/jest-e2e.json --no-coverage
```

Expected: All SRD E2E tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/common/test/ test/
git commit -m "test: add SRD E2E tests with test database setup"
```

---

## Task 9: Game Logic Service

**Files:**
- Create: `api/src/game-logic/interfaces/computed-stats.interface.ts`
- Create: `api/src/game-logic/game-logic.service.ts`
- Create: `api/src/game-logic/game-logic.service.spec.ts`
- Create: `api/src/game-logic/game-logic.module.ts`

- [ ] **Step 1: Create computed stats interface**

Create `api/src/game-logic/interfaces/computed-stats.interface.ts`:

```typescript
export interface ThresholdBreakdown {
  armorBaseMajor: number;
  armorBaseSevere: number;
  levelBonus: number;
  bonuses: { label: string; major: number; severe: number }[];
  totalMajor: number;
  totalSevere: number;
}

export interface TraitModifiers {
  agility: number;
  strength: number;
  finesse: number;
  instinct: number;
  presence: number;
  knowledge: number;
}

export interface ComputedStats {
  tier: number;
  thresholds: ThresholdBreakdown | null;
  effectiveEvasion: number;
  traitModifiers: TraitModifiers;
}
```

- [ ] **Step 2: Write comprehensive failing tests**

Create `api/src/game-logic/game-logic.service.spec.ts`:

```typescript
import { GameLogicService } from './game-logic.service';

describe('GameLogicService', () => {
  let service: GameLogicService;

  beforeEach(() => {
    service = new GameLogicService();
  });

  describe('computeTier', () => {
    it('should return 1 for level 1', () => {
      expect(service.computeTier(1)).toBe(1);
    });

    it('should return 2 for levels 2-4', () => {
      expect(service.computeTier(2)).toBe(2);
      expect(service.computeTier(3)).toBe(2);
      expect(service.computeTier(4)).toBe(2);
    });

    it('should return 3 for levels 5-7', () => {
      expect(service.computeTier(5)).toBe(3);
      expect(service.computeTier(7)).toBe(3);
    });

    it('should return 4 for levels 8-10', () => {
      expect(service.computeTier(8)).toBe(4);
      expect(service.computeTier(10)).toBe(4);
    });
  });

  describe('computeThresholds', () => {
    it('should return null when no armor base thresholds provided', () => {
      expect(service.computeThresholds(null, 1, 1, [])).toBeNull();
    });

    it('should parse armor base thresholds correctly', () => {
      const result = service.computeThresholds('6 / 13', 1, 1, []);
      expect(result!.armorBaseMajor).toBe(6);
      expect(result!.armorBaseSevere).toBe(13);
    });

    it('should add level - 1 as bonus', () => {
      const result = service.computeThresholds('6 / 13', 5, 1, []);
      expect(result!.levelBonus).toBe(4);
      expect(result!.totalMajor).toBe(10);
      expect(result!.totalSevere).toBe(17);
    });

    it('should add level bonus of 0 at level 1', () => {
      const result = service.computeThresholds('6 / 13', 1, 1, []);
      expect(result!.levelBonus).toBe(0);
      expect(result!.totalMajor).toBe(6);
      expect(result!.totalSevere).toBe(13);
    });

    it('should sum active threshold bonuses', () => {
      const bonuses = [
        { sourceId: 'Fortified Armor', sourceType: 'domainCard' as const, majorBonus: 2, severeBonus: 2, active: true },
        { sourceId: 'Vitality', sourceType: 'domainCard' as const, majorBonus: 2, severeBonus: 2, active: true },
      ];
      const result = service.computeThresholds('6 / 13', 1, 1, bonuses);
      expect(result!.totalMajor).toBe(10);
      expect(result!.totalSevere).toBe(17);
    });

    it('should ignore inactive bonuses', () => {
      const bonuses = [
        { sourceId: 'Fortified Armor', sourceType: 'domainCard' as const, majorBonus: 2, severeBonus: 2, active: false },
      ];
      const result = service.computeThresholds('6 / 13', 1, 1, bonuses);
      expect(result!.totalMajor).toBe(6);
      expect(result!.totalSevere).toBe(13);
    });

    it('should handle all bonuses active at max level', () => {
      const bonuses = [
        { sourceId: 'Fortified Armor', sourceType: 'domainCard' as const, majorBonus: 2, severeBonus: 2, active: true },
        { sourceId: 'Frenzy', sourceType: 'domainCard' as const, majorBonus: 0, severeBonus: 8, active: true },
        { sourceId: 'Stalwart:Undaunted', sourceType: 'subclassFeature' as const, majorBonus: 3, severeBonus: 3, active: true },
      ];
      const result = service.computeThresholds('8 / 17', 10, 1, bonuses);
      // base 8/17 + level 9 + bonuses (5/13) = 22/39
      expect(result!.totalMajor).toBe(22);
      expect(result!.totalSevere).toBe(39);
    });
  });

  describe('computeEffectiveEvasion', () => {
    it('should return base evasion when no armor modifier', () => {
      expect(service.computeEffectiveEvasion(10, null)).toBe(10);
    });

    it('should add positive armor evasion modifier', () => {
      expect(service.computeEffectiveEvasion(10, 1)).toBe(11);
    });

    it('should subtract negative armor evasion modifier', () => {
      expect(service.computeEffectiveEvasion(10, -2)).toBe(8);
    });
  });

  describe('parseTraitModifiers', () => {
    it('should return all zeros when no equipment features', () => {
      const result = service.parseTraitModifiers(null, null, null);
      expect(result).toEqual({
        agility: 0, strength: 0, finesse: 0,
        instinct: 0, presence: 0, knowledge: 0,
      });
    });

    it('should parse "+N to Trait" from armor feature', () => {
      const result = service.parseTraitModifiers(null, null, 'Very Heavy: -2 to Evasion; -1 to Agility');
      expect(result.agility).toBe(-1);
    });

    it('should parse "+N to Trait" from weapon feature', () => {
      const result = service.parseTraitModifiers('+1 to Strength', null, null);
      expect(result.strength).toBe(1);
    });

    it('should combine modifiers from multiple equipment', () => {
      const result = service.parseTraitModifiers(
        '+1 to Presence',
        '+1 to Finesse',
        '-1 to Agility',
      );
      expect(result.presence).toBe(1);
      expect(result.finesse).toBe(1);
      expect(result.agility).toBe(-1);
    });

    it('should parse "increase Trait by N"', () => {
      const result = service.parseTraitModifiers('increase Strength by 2', null, null);
      expect(result.strength).toBe(2);
    });

    it('should parse "decrease Trait by N"', () => {
      const result = service.parseTraitModifiers('decrease Agility by 1', null, null);
      expect(result.agility).toBe(-1);
    });
  });
});
```

- [ ] **Step 3: Run tests to verify they fail**

```bash
cd D:/AI/ttrpg-rules/api
npx jest src/game-logic/game-logic.service.spec.ts --no-coverage
```

Expected: FAIL — cannot find module.

- [ ] **Step 4: Implement GameLogicService**

Create `api/src/game-logic/game-logic.service.ts`:

```typescript
import { Injectable } from '@nestjs/common';
import {
  ThresholdBreakdown,
  TraitModifiers,
  ComputedStats,
} from './interfaces/computed-stats.interface';

interface ThresholdBonusInput {
  sourceId: string;
  sourceType: string;
  majorBonus: number;
  severeBonus: number;
  active: boolean;
}

const TRAIT_NAMES = ['agility', 'strength', 'finesse', 'instinct', 'presence', 'knowledge'] as const;

@Injectable()
export class GameLogicService {
  computeTier(level: number): number {
    if (level >= 8) return 4;
    if (level >= 5) return 3;
    if (level >= 2) return 2;
    return 1;
  }

  computeThresholds(
    armorBaseThresholds: string | null,
    level: number,
    proficiency: number,
    bonuses: ThresholdBonusInput[],
  ): ThresholdBreakdown | null {
    if (!armorBaseThresholds) return null;

    const parts = armorBaseThresholds.split('/').map(s => parseInt(s.trim(), 10));
    if (parts.length < 2 || isNaN(parts[0]) || isNaN(parts[1])) return null;

    const armorBaseMajor = parts[0];
    const armorBaseSevere = parts[1];
    const levelBonus = level - 1;

    const activeBonuses = bonuses
      .filter(b => b.active)
      .map(b => ({
        label: b.sourceId,
        major: b.majorBonus,
        severe: b.severeBonus,
      }));

    const totalMajor = armorBaseMajor + levelBonus + activeBonuses.reduce((sum, b) => sum + b.major, 0);
    const totalSevere = armorBaseSevere + levelBonus + activeBonuses.reduce((sum, b) => sum + b.severe, 0);

    return {
      armorBaseMajor,
      armorBaseSevere,
      levelBonus,
      bonuses: activeBonuses,
      totalMajor,
      totalSevere,
    };
  }

  computeEffectiveEvasion(baseEvasion: number, armorEvasionModifier: number | null): number {
    return baseEvasion + (armorEvasionModifier ?? 0);
  }

  parseTraitModifiers(
    primaryWeaponFeature: string | null,
    secondaryWeaponFeature: string | null,
    armorFeature: string | null,
  ): TraitModifiers {
    const modifiers: TraitModifiers = {
      agility: 0, strength: 0, finesse: 0,
      instinct: 0, presence: 0, knowledge: 0,
    };

    const sources = [primaryWeaponFeature, secondaryWeaponFeature, armorFeature];

    for (const source of sources) {
      if (!source) continue;
      this.extractModifiers(source, modifiers);
    }

    return modifiers;
  }

  private extractModifiers(text: string, modifiers: TraitModifiers): void {
    // Match: "+N to Trait", "-N to Trait", "+N bonus to Trait"
    const signedPattern = /([+-]\d+)\s+(?:bonus\s+)?to\s+(\w+)/gi;
    let match: RegExpExecArray | null;

    while ((match = signedPattern.exec(text)) !== null) {
      const value = parseInt(match[1], 10);
      const trait = match[2].toLowerCase();
      if (trait in modifiers) {
        modifiers[trait as keyof TraitModifiers] += value;
      }
    }

    // Match: "increase Trait by N"
    const increasePattern = /increase\s+(\w+)\s+by\s+(\d+)/gi;
    while ((match = increasePattern.exec(text)) !== null) {
      const trait = match[1].toLowerCase();
      const value = parseInt(match[2], 10);
      if (trait in modifiers) {
        modifiers[trait as keyof TraitModifiers] += value;
      }
    }

    // Match: "decrease Trait by N"
    const decreasePattern = /decrease\s+(\w+)\s+by\s+(\d+)/gi;
    while ((match = decreasePattern.exec(text)) !== null) {
      const trait = match[1].toLowerCase();
      const value = parseInt(match[2], 10);
      if (trait in modifiers) {
        modifiers[trait as keyof TraitModifiers] -= value;
      }
    }
  }

  computeAll(params: {
    level: number;
    proficiency: number;
    baseEvasion: number;
    armorBaseThresholds: string | null;
    armorEvasionModifier: number | null;
    primaryWeaponFeature: string | null;
    secondaryWeaponFeature: string | null;
    armorFeature: string | null;
    thresholdBonuses: ThresholdBonusInput[];
  }): ComputedStats {
    return {
      tier: this.computeTier(params.level),
      thresholds: this.computeThresholds(
        params.armorBaseThresholds,
        params.level,
        params.proficiency,
        params.thresholdBonuses,
      ),
      effectiveEvasion: this.computeEffectiveEvasion(
        params.baseEvasion,
        params.armorEvasionModifier,
      ),
      traitModifiers: this.parseTraitModifiers(
        params.primaryWeaponFeature,
        params.secondaryWeaponFeature,
        params.armorFeature,
      ),
    };
  }
}
```

- [ ] **Step 5: Run tests to verify they pass**

```bash
cd D:/AI/ttrpg-rules/api
npx jest src/game-logic/game-logic.service.spec.ts --no-coverage
```

Expected: All tests pass.

- [ ] **Step 6: Create GameLogicModule**

Create `api/src/game-logic/game-logic.module.ts`:

```typescript
import { Module } from '@nestjs/common';
import { GameLogicService } from './game-logic.service';

@Module({
  providers: [GameLogicService],
  exports: [GameLogicService],
})
export class GameLogicModule {}
```

- [ ] **Step 7: Commit**

```bash
git add src/game-logic/
git commit -m "feat: add GameLogicService with tier, threshold, evasion, and trait modifier calculations"
```

---

## Task 10: Character Domain Interfaces, Repositories & DTOs

**Files:**
- Create: `api/src/characters/interfaces/character.interface.ts`
- Create: `api/src/characters/interfaces/character-experience.interface.ts`
- Create: `api/src/characters/interfaces/character-domain-card.interface.ts`
- Create: `api/src/characters/interfaces/character-threshold-bonus.interface.ts`
- Create: `api/src/characters/repositories/character.repository.ts`
- Create: `api/src/characters/repositories/experience.repository.ts`
- Create: `api/src/characters/repositories/character-domain-card.repository.ts`
- Create: `api/src/characters/repositories/threshold-bonus.repository.ts`
- Create: `api/src/characters/dto/create-character.dto.ts`
- Create: `api/src/characters/dto/update-character.dto.ts`
- Create: `api/src/characters/dto/create-experience.dto.ts`
- Create: `api/src/characters/dto/update-experience.dto.ts`
- Create: `api/src/characters/dto/add-domain-card.dto.ts`
- Create: `api/src/characters/dto/toggle-threshold-bonus.dto.ts`

This is a large task that creates all character-related types. The interfaces, repositories, and DTOs are all interdependent, so they're grouped together.

- [ ] **Step 1: Create character domain interfaces**

Create `api/src/characters/interfaces/character.interface.ts`:

```typescript
export interface ICharacter {
  id: string;
  name: string;
  level: number;
  classId: string;
  subclassId: string;
  ancestryId: string;
  secondaryAncestryId: string | null;
  ancestryFeatureId: string;
  secondaryAncestryFeatureId: string | null;
  communityId: string;
  agility: number;
  strength: number;
  finesse: number;
  instinct: number;
  presence: number;
  knowledge: number;
  hpTotal: number;
  hpMarked: number;
  stressTotal: number;
  stressMarked: number;
  armorId: string | null;
  armorMarked: number;
  evasion: number;
  proficiency: number;
  hope: number;
  goldHandfuls: number;
  goldBags: number;
  goldChests: number;
  primaryWeaponId: string | null;
  secondaryWeaponId: string | null;
  notes: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICharacterWithRelations extends ICharacter {
  class: { id: string; name: string };
  subclass: { id: string; name: string };
  ancestry: { id: string; name: string };
  secondaryAncestry: { id: string; name: string } | null;
  ancestryFeature: { id: string; name: string; text: string };
  secondaryAncestryFeature: { id: string; name: string; text: string } | null;
  community: { id: string; name: string };
  armor: { id: string; name: string; baseThresholds: string; evasionModifier: number | null; feature: string | null } | null;
  primaryWeapon: { id: string; name: string; feature: string | null } | null;
  secondaryWeapon: { id: string; name: string; feature: string | null } | null;
  experiences: { id: string; name: string; modifier: number }[];
  domainCards: { id: string; domainCard: { id: string; name: string; level: number; domainName: string } }[];
  thresholdBonuses: { id: string; sourceType: string; sourceId: string; majorBonus: number; severeBonus: number; active: boolean }[];
  markedTraits: { id: string; trait: string }[];
}
```

Create `api/src/characters/interfaces/character-experience.interface.ts`:

```typescript
export interface ICharacterExperience {
  id: string;
  characterId: string;
  name: string;
  modifier: number;
}
```

Create `api/src/characters/interfaces/character-domain-card.interface.ts`:

```typescript
export interface ICharacterDomainCard {
  id: string;
  characterId: string;
  domainCardId: string;
}
```

Create `api/src/characters/interfaces/character-threshold-bonus.interface.ts`:

```typescript
export interface ICharacterThresholdBonus {
  id: string;
  characterId: string;
  sourceType: string;
  sourceId: string;
  majorBonus: number;
  severeBonus: number;
  active: boolean;
}
```

- [ ] **Step 2: Create DTOs with validation**

Create `api/src/characters/dto/create-character.dto.ts`:

```typescript
import {
  IsString, IsInt, IsUUID, IsOptional, Min, Max, IsNotEmpty,
} from 'class-validator';

export class CreateCharacterDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsUUID()
  classId: string;

  @IsUUID()
  subclassId: string;

  @IsUUID()
  ancestryId: string;

  @IsUUID()
  @IsOptional()
  secondaryAncestryId?: string;

  @IsUUID()
  ancestryFeatureId: string;

  @IsUUID()
  @IsOptional()
  secondaryAncestryFeatureId?: string;

  @IsUUID()
  communityId: string;

  @IsInt()
  @Min(-3)
  @Max(5)
  agility: number;

  @IsInt()
  @Min(-3)
  @Max(5)
  strength: number;

  @IsInt()
  @Min(-3)
  @Max(5)
  finesse: number;

  @IsInt()
  @Min(-3)
  @Max(5)
  instinct: number;

  @IsInt()
  @Min(-3)
  @Max(5)
  presence: number;

  @IsInt()
  @Min(-3)
  @Max(5)
  knowledge: number;

  @IsUUID()
  @IsOptional()
  primaryWeaponId?: string;

  @IsUUID()
  @IsOptional()
  secondaryWeaponId?: string;

  @IsUUID()
  @IsOptional()
  armorId?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}
```

Create `api/src/characters/dto/update-character.dto.ts`:

```typescript
import {
  IsString, IsInt, IsUUID, IsOptional, Min, Max,
} from 'class-validator';

export class UpdateCharacterDto {
  @IsInt()
  @Min(0)
  @IsOptional()
  hpMarked?: number;

  @IsInt()
  @Min(0)
  @IsOptional()
  stressMarked?: number;

  @IsInt()
  @Min(0)
  @Max(12)
  @IsOptional()
  hope?: number;

  @IsInt()
  @Min(0)
  @Max(9)
  @IsOptional()
  goldHandfuls?: number;

  @IsInt()
  @Min(0)
  @Max(9)
  @IsOptional()
  goldBags?: number;

  @IsInt()
  @Min(0)
  @Max(99)
  @IsOptional()
  goldChests?: number;

  @IsInt()
  @Min(0)
  @IsOptional()
  armorMarked?: number;

  @IsInt()
  @Min(-3)
  @Max(5)
  @IsOptional()
  agility?: number;

  @IsInt()
  @Min(-3)
  @Max(5)
  @IsOptional()
  strength?: number;

  @IsInt()
  @Min(-3)
  @Max(5)
  @IsOptional()
  finesse?: number;

  @IsInt()
  @Min(-3)
  @Max(5)
  @IsOptional()
  instinct?: number;

  @IsInt()
  @Min(-3)
  @Max(5)
  @IsOptional()
  presence?: number;

  @IsInt()
  @Min(-3)
  @Max(5)
  @IsOptional()
  knowledge?: number;

  @IsUUID()
  @IsOptional()
  primaryWeaponId?: string;

  @IsUUID()
  @IsOptional()
  secondaryWeaponId?: string;

  @IsUUID()
  @IsOptional()
  armorId?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}
```

Create `api/src/characters/dto/create-experience.dto.ts`:

```typescript
import { IsString, IsInt, IsNotEmpty, Min, Max } from 'class-validator';

export class CreateExperienceDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsInt()
  @Min(1)
  @Max(6)
  modifier: number;
}
```

Create `api/src/characters/dto/update-experience.dto.ts`:

```typescript
import { IsString, IsInt, IsOptional, IsNotEmpty, Min, Max } from 'class-validator';

export class UpdateExperienceDto {
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  name?: string;

  @IsInt()
  @Min(1)
  @Max(6)
  @IsOptional()
  modifier?: number;
}
```

Create `api/src/characters/dto/add-domain-card.dto.ts`:

```typescript
import { IsUUID } from 'class-validator';

export class AddDomainCardDto {
  @IsUUID()
  domainCardId: string;
}
```

Create `api/src/characters/dto/toggle-threshold-bonus.dto.ts`:

```typescript
import { IsBoolean } from 'class-validator';

export class ToggleThresholdBonusDto {
  @IsBoolean()
  active: boolean;
}
```

- [ ] **Step 3: Create character repository**

Create `api/src/characters/repositories/character.repository.ts`:

```typescript
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ICharacterWithRelations } from '../interfaces/character.interface';

const CHARACTER_INCLUDE = {
  class: { select: { id: true, name: true } },
  subclass: { select: { id: true, name: true } },
  ancestry: { select: { id: true, name: true } },
  secondaryAncestry: { select: { id: true, name: true } },
  ancestryFeature: { select: { id: true, name: true, text: true } },
  secondaryAncestryFeature: { select: { id: true, name: true, text: true } },
  community: { select: { id: true, name: true } },
  armor: { select: { id: true, name: true, baseThresholds: true, evasionModifier: true, feature: true } },
  primaryWeapon: { select: { id: true, name: true, feature: true } },
  secondaryWeapon: { select: { id: true, name: true, feature: true } },
  experiences: { select: { id: true, name: true, modifier: true } },
  domainCards: {
    select: {
      id: true,
      domainCard: {
        select: {
          id: true,
          name: true,
          level: true,
          domain: { select: { name: true } },
        },
      },
    },
  },
  thresholdBonuses: {
    select: {
      id: true,
      sourceType: true,
      sourceId: true,
      majorBonus: true,
      severeBonus: true,
      active: true,
    },
  },
  markedTraits: { select: { id: true, trait: true } },
} as const;

@Injectable()
export class CharacterRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: {
    name: string;
    classId: string;
    subclassId: string;
    ancestryId: string;
    secondaryAncestryId?: string;
    ancestryFeatureId: string;
    secondaryAncestryFeatureId?: string;
    communityId: string;
    agility: number;
    strength: number;
    finesse: number;
    instinct: number;
    presence: number;
    knowledge: number;
    primaryWeaponId?: string;
    secondaryWeaponId?: string;
    armorId?: string;
    notes?: string;
    hpTotal: number;
    evasion: number;
  }): Promise<ICharacterWithRelations> {
    const character = await this.prisma.character.create({
      data: {
        name: data.name,
        classId: data.classId,
        subclassId: data.subclassId,
        ancestryId: data.ancestryId,
        secondaryAncestryId: data.secondaryAncestryId ?? null,
        ancestryFeatureId: data.ancestryFeatureId,
        secondaryAncestryFeatureId: data.secondaryAncestryFeatureId ?? null,
        communityId: data.communityId,
        agility: data.agility,
        strength: data.strength,
        finesse: data.finesse,
        instinct: data.instinct,
        presence: data.presence,
        knowledge: data.knowledge,
        primaryWeaponId: data.primaryWeaponId ?? null,
        secondaryWeaponId: data.secondaryWeaponId ?? null,
        armorId: data.armorId ?? null,
        notes: data.notes ?? '',
        hpTotal: data.hpTotal,
        evasion: data.evasion,
      },
      include: CHARACTER_INCLUDE,
    });
    return this.mapCharacter(character);
  }

  async findAll(): Promise<ICharacterWithRelations[]> {
    const characters = await this.prisma.character.findMany({
      include: CHARACTER_INCLUDE,
      orderBy: { createdAt: 'desc' },
    });
    return characters.map(c => this.mapCharacter(c));
  }

  async findById(id: string): Promise<ICharacterWithRelations | null> {
    const character = await this.prisma.character.findUnique({
      where: { id },
      include: CHARACTER_INCLUDE,
    });
    if (!character) return null;
    return this.mapCharacter(character);
  }

  async update(id: string, data: Record<string, unknown>): Promise<ICharacterWithRelations> {
    const character = await this.prisma.character.update({
      where: { id },
      data,
      include: CHARACTER_INCLUDE,
    });
    return this.mapCharacter(character);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.character.delete({ where: { id } });
  }

  private mapCharacter(c: any): ICharacterWithRelations {
    return {
      ...c,
      domainCards: c.domainCards.map((dc: any) => ({
        id: dc.id,
        domainCard: {
          id: dc.domainCard.id,
          name: dc.domainCard.name,
          level: dc.domainCard.level,
          domainName: dc.domainCard.domain.name,
        },
      })),
    };
  }
}
```

Create `api/src/characters/repositories/experience.repository.ts`:

```typescript
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ICharacterExperience } from '../interfaces/character-experience.interface';

@Injectable()
export class ExperienceRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(characterId: string, name: string, modifier: number): Promise<ICharacterExperience> {
    return this.prisma.characterExperience.create({
      data: { characterId, name, modifier },
    });
  }

  async update(id: string, data: { name?: string; modifier?: number }): Promise<ICharacterExperience> {
    return this.prisma.characterExperience.update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.characterExperience.delete({ where: { id } });
  }

  async findById(id: string): Promise<ICharacterExperience | null> {
    return this.prisma.characterExperience.findUnique({ where: { id } });
  }
}
```

Create `api/src/characters/repositories/character-domain-card.repository.ts`:

```typescript
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class CharacterDomainCardRepository {
  constructor(private readonly prisma: PrismaService) {}

  async add(characterId: string, domainCardId: string): Promise<{ id: string }> {
    return this.prisma.characterDomainCard.create({
      data: { characterId, domainCardId },
      select: { id: true },
    });
  }

  async remove(id: string): Promise<void> {
    await this.prisma.characterDomainCard.delete({ where: { id } });
  }

  async exists(characterId: string, domainCardId: string): Promise<boolean> {
    const record = await this.prisma.characterDomainCard.findUnique({
      where: { characterId_domainCardId: { characterId, domainCardId } },
    });
    return !!record;
  }
}
```

Create `api/src/characters/repositories/threshold-bonus.repository.ts`:

```typescript
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ICharacterThresholdBonus } from '../interfaces/character-threshold-bonus.interface';

@Injectable()
export class ThresholdBonusRepository {
  constructor(private readonly prisma: PrismaService) {}

  async toggleActive(id: string, active: boolean): Promise<ICharacterThresholdBonus> {
    return this.prisma.characterThresholdBonus.update({
      where: { id },
      data: { active },
    });
  }

  async findById(id: string): Promise<ICharacterThresholdBonus | null> {
    return this.prisma.characterThresholdBonus.findUnique({ where: { id } });
  }
}
```

- [ ] **Step 4: Commit**

```bash
git add src/characters/
git commit -m "feat: add character domain interfaces, DTOs with validation, and repositories"
```

---

## Task 11: Character Service, Controller & Module

**Files:**
- Create: `api/src/characters/characters.service.ts`
- Create: `api/src/characters/characters.controller.ts`
- Create: `api/src/characters/characters.module.ts`
- Modify: `api/src/app.module.ts`

- [ ] **Step 1: Create CharactersService**

Create `api/src/characters/characters.service.ts`:

```typescript
import { Injectable, Logger } from '@nestjs/common';
import { CharacterRepository } from './repositories/character.repository';
import { ExperienceRepository } from './repositories/experience.repository';
import { CharacterDomainCardRepository } from './repositories/character-domain-card.repository';
import { ThresholdBonusRepository } from './repositories/threshold-bonus.repository';
import { GameLogicService } from '../game-logic/game-logic.service';
import { CreateCharacterDto } from './dto/create-character.dto';
import { UpdateCharacterDto } from './dto/update-character.dto';
import { PrismaService } from '../prisma/prisma.service';
import {
  ErrorCode,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '../common/error-codes';

@Injectable()
export class CharactersService {
  private readonly logger = new Logger(CharactersService.name);

  constructor(
    private readonly characterRepo: CharacterRepository,
    private readonly experienceRepo: ExperienceRepository,
    private readonly domainCardRepo: CharacterDomainCardRepository,
    private readonly thresholdBonusRepo: ThresholdBonusRepository,
    private readonly gameLogic: GameLogicService,
    private readonly prisma: PrismaService,
  ) {}

  async create(dto: CreateCharacterDto) {
    // Validate SRD references exist
    const srdClass = await this.prisma.srdClass.findUnique({ where: { id: dto.classId } });
    if (!srdClass) throw new BadRequestException(ErrorCode.INVALID_SRD_REFERENCE, `Class '${dto.classId}' not found`);

    const subclass = await this.prisma.subclass.findUnique({ where: { id: dto.subclassId } });
    if (!subclass) throw new BadRequestException(ErrorCode.INVALID_SRD_REFERENCE, `Subclass '${dto.subclassId}' not found`);
    if (subclass.classId !== dto.classId) {
      throw new BadRequestException(ErrorCode.INVALID_SRD_REFERENCE, `Subclass '${dto.subclassId}' does not belong to class '${dto.classId}'`);
    }

    const ancestry = await this.prisma.ancestry.findUnique({ where: { id: dto.ancestryId } });
    if (!ancestry) throw new BadRequestException(ErrorCode.INVALID_SRD_REFERENCE, `Ancestry '${dto.ancestryId}' not found`);

    if (dto.secondaryAncestryId) {
      const secondaryAncestry = await this.prisma.ancestry.findUnique({ where: { id: dto.secondaryAncestryId } });
      if (!secondaryAncestry) throw new BadRequestException(ErrorCode.INVALID_SRD_REFERENCE, `Secondary ancestry '${dto.secondaryAncestryId}' not found`);
    }

    const ancestryFeature = await this.prisma.ancestryFeature.findUnique({ where: { id: dto.ancestryFeatureId } });
    if (!ancestryFeature) throw new BadRequestException(ErrorCode.INVALID_SRD_REFERENCE, `Ancestry feature '${dto.ancestryFeatureId}' not found`);

    if (dto.secondaryAncestryFeatureId) {
      const secondaryFeature = await this.prisma.ancestryFeature.findUnique({ where: { id: dto.secondaryAncestryFeatureId } });
      if (!secondaryFeature) throw new BadRequestException(ErrorCode.INVALID_SRD_REFERENCE, `Secondary ancestry feature '${dto.secondaryAncestryFeatureId}' not found`);
    }

    const community = await this.prisma.community.findUnique({ where: { id: dto.communityId } });
    if (!community) throw new BadRequestException(ErrorCode.INVALID_SRD_REFERENCE, `Community '${dto.communityId}' not found`);

    const character = await this.characterRepo.create({
      ...dto,
      hpTotal: srdClass.hp,
      evasion: srdClass.evasion,
    });

    this.logger.log(`Character created: ${character.id} (${character.name})`);
    return this.buildResponse(character);
  }

  async findAll() {
    const characters = await this.characterRepo.findAll();
    return characters.map(c => this.buildResponse(c));
  }

  async findById(id: string) {
    const character = await this.characterRepo.findById(id);
    if (!character) throw new NotFoundException(ErrorCode.CHARACTER_NOT_FOUND, `Character with id '${id}' not found`);
    return this.buildResponse(character);
  }

  async update(id: string, dto: UpdateCharacterDto) {
    const existing = await this.characterRepo.findById(id);
    if (!existing) throw new NotFoundException(ErrorCode.CHARACTER_NOT_FOUND, `Character with id '${id}' not found`);

    const character = await this.characterRepo.update(id, dto);
    this.logger.log(`Character updated: ${id}`);
    return this.buildResponse(character);
  }

  async delete(id: string) {
    const existing = await this.characterRepo.findById(id);
    if (!existing) throw new NotFoundException(ErrorCode.CHARACTER_NOT_FOUND, `Character with id '${id}' not found`);

    await this.characterRepo.delete(id);
    this.logger.log(`Character deleted: ${id}`);
  }

  // ── Sub-resources ──

  async addExperience(characterId: string, name: string, modifier: number) {
    await this.ensureCharacterExists(characterId);
    const experience = await this.experienceRepo.create(characterId, name, modifier);
    this.logger.log(`Experience added to character ${characterId}: ${name}`);
    return experience;
  }

  async updateExperience(characterId: string, expId: string, data: { name?: string; modifier?: number }) {
    await this.ensureCharacterExists(characterId);
    const existing = await this.experienceRepo.findById(expId);
    if (!existing || existing.characterId !== characterId) {
      throw new NotFoundException(ErrorCode.EXPERIENCE_NOT_FOUND, `Experience '${expId}' not found on character '${characterId}'`);
    }
    return this.experienceRepo.update(expId, data);
  }

  async removeExperience(characterId: string, expId: string) {
    await this.ensureCharacterExists(characterId);
    const existing = await this.experienceRepo.findById(expId);
    if (!existing || existing.characterId !== characterId) {
      throw new NotFoundException(ErrorCode.EXPERIENCE_NOT_FOUND, `Experience '${expId}' not found on character '${characterId}'`);
    }
    await this.experienceRepo.delete(expId);
    this.logger.log(`Experience removed from character ${characterId}: ${expId}`);
  }

  async addDomainCard(characterId: string, domainCardId: string) {
    const character = await this.characterRepo.findById(characterId);
    if (!character) throw new NotFoundException(ErrorCode.CHARACTER_NOT_FOUND, `Character '${characterId}' not found`);

    // Check if card exists
    const card = await this.prisma.domainCard.findUnique({
      where: { id: domainCardId },
      include: { domain: { include: { classes: true } } },
    });
    if (!card) throw new BadRequestException(ErrorCode.INVALID_SRD_REFERENCE, `Domain card '${domainCardId}' not found`);

    // Check card level doesn't exceed character level
    if (card.level > character.level) {
      throw new BadRequestException(ErrorCode.DOMAIN_CARD_NOT_AVAILABLE, `Domain card level ${card.level} exceeds character level ${character.level}`);
    }

    // Check card's domain belongs to character's class
    const classDomains = card.domain.classes.map(cd => cd.classId);
    if (!classDomains.includes(character.classId)) {
      throw new BadRequestException(ErrorCode.DOMAIN_CARD_NOT_AVAILABLE, `Domain card's domain is not available to character's class`);
    }

    // Check for duplicates
    const exists = await this.domainCardRepo.exists(characterId, domainCardId);
    if (exists) {
      throw new ConflictException(ErrorCode.DUPLICATE_DOMAIN_CARD, `Character already has this domain card`);
    }

    const result = await this.domainCardRepo.add(characterId, domainCardId);
    this.logger.log(`Domain card added to character ${characterId}: ${domainCardId}`);
    return result;
  }

  async removeDomainCard(characterId: string, cardId: string) {
    await this.ensureCharacterExists(characterId);
    await this.domainCardRepo.remove(cardId);
    this.logger.log(`Domain card removed from character ${characterId}: ${cardId}`);
  }

  async toggleThresholdBonus(characterId: string, bonusId: string, active: boolean) {
    await this.ensureCharacterExists(characterId);
    const existing = await this.thresholdBonusRepo.findById(bonusId);
    if (!existing || existing.characterId !== characterId) {
      throw new NotFoundException(ErrorCode.CHARACTER_NOT_FOUND, `Threshold bonus '${bonusId}' not found on character '${characterId}'`);
    }
    return this.thresholdBonusRepo.toggleActive(bonusId, active);
  }

  // ── Helpers ──

  private async ensureCharacterExists(id: string) {
    const exists = await this.characterRepo.findById(id);
    if (!exists) throw new NotFoundException(ErrorCode.CHARACTER_NOT_FOUND, `Character '${id}' not found`);
  }

  private buildResponse(character: any) {
    const computed = this.gameLogic.computeAll({
      level: character.level,
      proficiency: character.proficiency,
      baseEvasion: character.evasion,
      armorBaseThresholds: character.armor?.baseThresholds ?? null,
      armorEvasionModifier: character.armor?.evasionModifier ?? null,
      primaryWeaponFeature: character.primaryWeapon?.feature ?? null,
      secondaryWeaponFeature: character.secondaryWeapon?.feature ?? null,
      armorFeature: character.armor?.feature ?? null,
      thresholdBonuses: character.thresholdBonuses,
    });

    return { character, computed };
  }
}
```

- [ ] **Step 2: Create CharactersController**

Create `api/src/characters/characters.controller.ts`:

```typescript
import {
  Controller, Get, Post, Patch, Delete, Body, Param, HttpCode,
} from '@nestjs/common';
import { CharactersService } from './characters.service';
import { CreateCharacterDto } from './dto/create-character.dto';
import { UpdateCharacterDto } from './dto/update-character.dto';
import { CreateExperienceDto } from './dto/create-experience.dto';
import { UpdateExperienceDto } from './dto/update-experience.dto';
import { AddDomainCardDto } from './dto/add-domain-card.dto';
import { ToggleThresholdBonusDto } from './dto/toggle-threshold-bonus.dto';

@Controller('characters')
export class CharactersController {
  constructor(private readonly charactersService: CharactersService) {}

  @Post()
  create(@Body() dto: CreateCharacterDto) {
    return this.charactersService.create(dto);
  }

  @Get()
  findAll() {
    return this.charactersService.findAll();
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.charactersService.findById(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateCharacterDto) {
    return this.charactersService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  delete(@Param('id') id: string) {
    return this.charactersService.delete(id);
  }

  // ── Experiences ──

  @Post(':id/experiences')
  addExperience(@Param('id') id: string, @Body() dto: CreateExperienceDto) {
    return this.charactersService.addExperience(id, dto.name, dto.modifier);
  }

  @Patch(':id/experiences/:expId')
  updateExperience(
    @Param('id') id: string,
    @Param('expId') expId: string,
    @Body() dto: UpdateExperienceDto,
  ) {
    return this.charactersService.updateExperience(id, expId, dto);
  }

  @Delete(':id/experiences/:expId')
  @HttpCode(204)
  removeExperience(@Param('id') id: string, @Param('expId') expId: string) {
    return this.charactersService.removeExperience(id, expId);
  }

  // ── Domain Cards ──

  @Post(':id/domain-cards')
  addDomainCard(@Param('id') id: string, @Body() dto: AddDomainCardDto) {
    return this.charactersService.addDomainCard(id, dto.domainCardId);
  }

  @Delete(':id/domain-cards/:cardId')
  @HttpCode(204)
  removeDomainCard(@Param('id') id: string, @Param('cardId') cardId: string) {
    return this.charactersService.removeDomainCard(id, cardId);
  }

  // ── Threshold Bonuses ──

  @Patch(':id/threshold-bonuses/:bonusId')
  toggleThresholdBonus(
    @Param('id') id: string,
    @Param('bonusId') bonusId: string,
    @Body() dto: ToggleThresholdBonusDto,
  ) {
    return this.charactersService.toggleThresholdBonus(id, bonusId, dto.active);
  }
}
```

- [ ] **Step 3: Create CharactersModule and register in AppModule**

Create `api/src/characters/characters.module.ts`:

```typescript
import { Module } from '@nestjs/common';
import { CharactersController } from './characters.controller';
import { CharactersService } from './characters.service';
import { CharacterRepository } from './repositories/character.repository';
import { ExperienceRepository } from './repositories/experience.repository';
import { CharacterDomainCardRepository } from './repositories/character-domain-card.repository';
import { ThresholdBonusRepository } from './repositories/threshold-bonus.repository';
import { GameLogicModule } from '../game-logic/game-logic.module';

@Module({
  imports: [GameLogicModule],
  controllers: [CharactersController],
  providers: [
    CharactersService,
    CharacterRepository,
    ExperienceRepository,
    CharacterDomainCardRepository,
    ThresholdBonusRepository,
  ],
})
export class CharactersModule {}
```

Update `api/src/app.module.ts`:

```typescript
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SrdModule } from './srd/srd.module';
import { PrismaModule } from './prisma/prisma.module';
import { CharactersModule } from './characters/characters.module';

@Module({
  imports: [PrismaModule, SrdModule, CharactersModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
```

- [ ] **Step 4: Verify app starts**

```bash
cd D:/AI/ttrpg-rules/api
npm run start:dev
```

Expected: App starts without errors.

- [ ] **Step 5: Commit**

```bash
git add src/characters/ src/app.module.ts
git commit -m "feat: add CharactersModule with full CRUD, sub-resources, and computed stats"
```

---

## Task 12: Character E2E Tests

**Files:**
- Create: `api/test/characters.e2e-spec.ts`

- [ ] **Step 1: Write character E2E tests**

Create `api/test/characters.e2e-spec.ts`:

```typescript
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { createTestApp, cleanCharacterTables } from '../src/common/test/test-helpers';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Characters Endpoints (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  // SRD IDs populated in beforeAll
  let classId: string;
  let subclassId: string;
  let ancestryId: string;
  let ancestryFeatureId: string;
  let communityId: string;
  let weaponId: string;
  let armorId: string;
  let domainCardId: string;

  beforeAll(async () => {
    app = await createTestApp();
    prisma = app.get(PrismaService);

    // Fetch SRD IDs for test data
    const srdClass = await prisma.srdClass.findFirst({ include: { subclasses: true, domains: { include: { domain: { include: { cards: true } } } } } });
    classId = srdClass!.id;
    subclassId = srdClass!.subclasses[0].id;

    const ancestry = await prisma.ancestry.findFirst({ include: { features: true } });
    ancestryId = ancestry!.id;
    ancestryFeatureId = ancestry!.features[0].id;

    const community = await prisma.community.findFirst();
    communityId = community!.id;

    const weapon = await prisma.weapon.findFirst({ where: { type: 'Primary' } });
    weaponId = weapon!.id;

    const armor = await prisma.armor.findFirst();
    armorId = armor!.id;

    const domainCard = srdClass!.domains[0].domain.cards[0];
    domainCardId = domainCard!.id;
  });

  beforeEach(async () => {
    await cleanCharacterTables(prisma);
  });

  afterAll(async () => {
    await cleanCharacterTables(prisma);
    await app.close();
  });

  function validCreateBody() {
    return {
      name: 'Test Character',
      classId,
      subclassId,
      ancestryId,
      ancestryFeatureId,
      communityId,
      agility: 0,
      strength: 2,
      finesse: 1,
      instinct: 1,
      presence: 0,
      knowledge: -1,
    };
  }

  describe('POST /characters', () => {
    it('should create a character and return computed stats', async () => {
      const res = await request(app.getHttpServer())
        .post('/characters')
        .send(validCreateBody())
        .expect(201);

      expect(res.body.character.name).toBe('Test Character');
      expect(res.body.character.id).toBeDefined();
      expect(res.body.computed).toBeDefined();
      expect(res.body.computed.tier).toBe(1);
    });

    it('should reject invalid SRD classId', async () => {
      const res = await request(app.getHttpServer())
        .post('/characters')
        .send({ ...validCreateBody(), classId: '00000000-0000-0000-0000-000000000000' })
        .expect(400);

      expect(res.body.error).toBe('INVALID_SRD_REFERENCE');
    });

    it('should reject missing required fields', async () => {
      const res = await request(app.getHttpServer())
        .post('/characters')
        .send({ name: 'Incomplete' })
        .expect(400);

      expect(res.body.error).toBe('VALIDATION_ERROR');
    });

    it('should set hpTotal and evasion from class defaults', async () => {
      const res = await request(app.getHttpServer())
        .post('/characters')
        .send(validCreateBody())
        .expect(201);

      expect(res.body.character.hpTotal).toBeGreaterThan(0);
      expect(res.body.character.evasion).toBeGreaterThan(0);
    });
  });

  describe('GET /characters', () => {
    it('should return empty array when no characters', async () => {
      const res = await request(app.getHttpServer()).get('/characters').expect(200);
      expect(res.body).toEqual([]);
    });

    it('should return all characters', async () => {
      await request(app.getHttpServer()).post('/characters').send(validCreateBody());
      await request(app.getHttpServer()).post('/characters').send({ ...validCreateBody(), name: 'Second' });

      const res = await request(app.getHttpServer()).get('/characters').expect(200);
      expect(res.body.length).toBe(2);
    });
  });

  describe('GET /characters/:id', () => {
    it('should return character with computed stats', async () => {
      const createRes = await request(app.getHttpServer()).post('/characters').send({
        ...validCreateBody(),
        armorId,
        primaryWeaponId: weaponId,
      });
      const id = createRes.body.character.id;

      const res = await request(app.getHttpServer()).get(`/characters/${id}`).expect(200);

      expect(res.body.character.id).toBe(id);
      expect(res.body.computed.tier).toBe(1);
      expect(res.body.computed.thresholds).toBeDefined();
    });

    it('should return 404 for unknown id', async () => {
      const res = await request(app.getHttpServer())
        .get('/characters/00000000-0000-0000-0000-000000000000')
        .expect(404);

      expect(res.body.error).toBe('CHARACTER_NOT_FOUND');
    });
  });

  describe('PATCH /characters/:id', () => {
    it('should update mutable state', async () => {
      const createRes = await request(app.getHttpServer()).post('/characters').send(validCreateBody());
      const id = createRes.body.character.id;

      const res = await request(app.getHttpServer())
        .patch(`/characters/${id}`)
        .send({ hpMarked: 3, hope: 5, goldHandfuls: 2 })
        .expect(200);

      expect(res.body.character.hpMarked).toBe(3);
      expect(res.body.character.hope).toBe(5);
      expect(res.body.character.goldHandfuls).toBe(2);
    });

    it('should reject unknown fields', async () => {
      const createRes = await request(app.getHttpServer()).post('/characters').send(validCreateBody());
      const id = createRes.body.character.id;

      await request(app.getHttpServer())
        .patch(`/characters/${id}`)
        .send({ invalidField: 99 })
        .expect(400);
    });
  });

  describe('DELETE /characters/:id', () => {
    it('should delete character', async () => {
      const createRes = await request(app.getHttpServer()).post('/characters').send(validCreateBody());
      const id = createRes.body.character.id;

      await request(app.getHttpServer()).delete(`/characters/${id}`).expect(204);
      await request(app.getHttpServer()).get(`/characters/${id}`).expect(404);
    });
  });

  describe('Experiences sub-resource', () => {
    it('should add, update, and remove experiences', async () => {
      const createRes = await request(app.getHttpServer()).post('/characters').send(validCreateBody());
      const charId = createRes.body.character.id;

      // Add
      const addRes = await request(app.getHttpServer())
        .post(`/characters/${charId}/experiences`)
        .send({ name: 'Lore Scholar', modifier: 3 })
        .expect(201);
      const expId = addRes.body.id;

      // Update
      const updateRes = await request(app.getHttpServer())
        .patch(`/characters/${charId}/experiences/${expId}`)
        .send({ modifier: 4 })
        .expect(200);
      expect(updateRes.body.modifier).toBe(4);

      // Remove
      await request(app.getHttpServer())
        .delete(`/characters/${charId}/experiences/${expId}`)
        .expect(204);

      // Verify removed
      const charRes = await request(app.getHttpServer()).get(`/characters/${charId}`).expect(200);
      expect(charRes.body.character.experiences).toHaveLength(0);
    });
  });

  describe('Domain cards sub-resource', () => {
    it('should add and remove domain cards', async () => {
      const createRes = await request(app.getHttpServer()).post('/characters').send(validCreateBody());
      const charId = createRes.body.character.id;

      // Add
      const addRes = await request(app.getHttpServer())
        .post(`/characters/${charId}/domain-cards`)
        .send({ domainCardId })
        .expect(201);

      // Verify in character
      const charRes = await request(app.getHttpServer()).get(`/characters/${charId}`).expect(200);
      expect(charRes.body.character.domainCards).toHaveLength(1);

      // Remove
      const cardRelationId = charRes.body.character.domainCards[0].id;
      await request(app.getHttpServer())
        .delete(`/characters/${charId}/domain-cards/${cardRelationId}`)
        .expect(204);
    });

    it('should reject duplicate domain card', async () => {
      const createRes = await request(app.getHttpServer()).post('/characters').send(validCreateBody());
      const charId = createRes.body.character.id;

      await request(app.getHttpServer())
        .post(`/characters/${charId}/domain-cards`)
        .send({ domainCardId })
        .expect(201);

      const res = await request(app.getHttpServer())
        .post(`/characters/${charId}/domain-cards`)
        .send({ domainCardId })
        .expect(409);

      expect(res.body.error).toBe('DUPLICATE_DOMAIN_CARD');
    });
  });
});
```

- [ ] **Step 2: Run E2E tests**

```bash
cd D:/AI/ttrpg-rules/api
npx jest --config test/jest-e2e.json --no-coverage
```

Expected: All character E2E tests pass.

- [ ] **Step 3: Commit**

```bash
git add test/characters.e2e-spec.ts
git commit -m "test: add character E2E tests covering CRUD, sub-resources, and error codes"
```

---

## Task 13: Polish & Documentation

**Files:**
- Modify: `api/README.md` (or create)

- [ ] **Step 1: Add error codes table to README**

Create or update `api/README.md` with the error codes table:

```markdown
# Daggerheart API

NestJS backend for Daggerheart character sheet management.

## Setup

```bash
docker compose up -d
npm install
npx prisma migrate dev
npx prisma db seed
npm run start:dev
```

## API Endpoints

### SRD (read-only reference data)

| Method | Path | Description |
|--------|------|-------------|
| GET | /srd/classes | List all classes |
| GET | /srd/classes/:id | Single class detail |
| GET | /srd/subclasses | List all subclasses |
| GET | /srd/subclasses/:id | Single subclass detail |
| GET | /srd/ancestries | List all ancestries |
| GET | /srd/ancestries/:id | Single ancestry detail |
| GET | /srd/communities | List all communities |
| GET | /srd/communities/:id | Single community detail |
| GET | /srd/domains | List all domains |
| GET | /srd/domains/:id | Single domain detail |
| GET | /srd/domain-cards | List domain cards (filter: ?domain=X&level=N) |
| GET | /srd/weapons | List weapons (filter: ?tier=N&type=Primary) |
| GET | /srd/armor | List armor (filter: ?tier=N) |

### Characters

| Method | Path | Description |
|--------|------|-------------|
| POST | /characters | Create character |
| GET | /characters | List all characters |
| GET | /characters/:id | Get character with computed stats |
| PATCH | /characters/:id | Update mutable state |
| DELETE | /characters/:id | Delete character |
| POST | /characters/:id/experiences | Add experience |
| PATCH | /characters/:id/experiences/:expId | Update experience |
| DELETE | /characters/:id/experiences/:expId | Remove experience |
| POST | /characters/:id/domain-cards | Add domain card |
| DELETE | /characters/:id/domain-cards/:cardId | Remove domain card |
| PATCH | /characters/:id/threshold-bonuses/:bonusId | Toggle bonus active/inactive |

## Error Codes

All errors follow this shape:

```json
{
  "error": "ERROR_CODE",
  "message": "Human-readable description",
  "timestamp": "2026-03-28T12:00:00.000Z"
}
```

| Code | HTTP Status | Description |
|------|-------------|-------------|
| VALIDATION_ERROR | 400 | Request body/params failed validation |
| CHARACTER_NOT_FOUND | 404 | Character ID doesn't exist |
| SRD_RESOURCE_NOT_FOUND | 404 | SRD reference (class, weapon, etc.) not found |
| INVALID_SRD_REFERENCE | 400 | FK reference to SRD doesn't exist (e.g. invalid classId) |
| DOMAIN_CARD_NOT_AVAILABLE | 400 | Card not in character's class domains or exceeds level |
| DUPLICATE_DOMAIN_CARD | 409 | Character already has this domain card |
| EXPERIENCE_NOT_FOUND | 404 | Experience doesn't exist on character |
| INTERNAL_ERROR | 500 | Unexpected server error |

## Testing

```bash
# Unit tests
npm test

# E2E tests (requires test DB running)
npm run test:e2e
```
```

- [ ] **Step 2: Run full test suite**

```bash
cd D:/AI/ttrpg-rules/api
npm test -- --no-coverage && npx jest --config test/jest-e2e.json --no-coverage
```

Expected: All tests pass.

- [ ] **Step 3: Clean up any remaining old files**

Remove any old files that are no longer needed:
- `api/src/srd/dtos/` (old directory if still present)
- `api/src/srd/testing/` (old mocks if still present)
- `api/src/app.controller.spec.ts` (old test referencing "Hello World" — update or keep as-is)

- [ ] **Step 4: Commit**

```bash
git add README.md
git commit -m "docs: add API documentation with endpoints and error codes"
```
