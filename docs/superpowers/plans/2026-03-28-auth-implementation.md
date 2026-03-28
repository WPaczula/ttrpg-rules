# Auth Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add Clerk-based authentication and role-based authorization (GM, PC, DEMO) to the Daggerheart API with per-endpoint access control and character ownership enforcement.

**Architecture:** `ClerkAuthGuard` validates the Clerk JWT and hydrates `request.user` from the DB via `UsersService`. `RolesGuard` reads `request.user.role` against `@Roles()` metadata applied by composed decorators (`@GM()`, `@PC()`, `@AnyRole()`). `CharacterOwnerGuard` (characters module only) enforces PC ownership — GM/DEMO bypass.

**Tech Stack:** `@clerk/nestjs` (JWT verification via `InjectClerkClient`), `@nestjs/config` (env vars), Prisma (`User` model + `Character.userId`), NestJS guards/decorators.

---

## File Map

**New files:**
- `src/config/config.module.ts`
- `src/users/users.repository.ts`
- `src/users/users.service.ts`
- `src/users/users.service.spec.ts`
- `src/users/users.module.ts`
- `src/auth/interfaces/request-with-user.interface.ts`
- `src/auth/guards/clerk-auth.guard.ts`
- `src/auth/guards/clerk-auth.guard.spec.ts`
- `src/auth/guards/roles.guard.ts`
- `src/auth/guards/roles.guard.spec.ts`
- `src/auth/decorators/roles.decorator.ts`
- `src/auth/decorators/gm.decorator.ts`
- `src/auth/decorators/pc.decorator.ts`
- `src/auth/decorators/any-role.decorator.ts`
- `src/auth/auth.module.ts`
- `src/characters/guards/character-owner.guard.ts`
- `src/characters/guards/character-owner.guard.spec.ts`
- `src/characters/decorators/owner-only.decorator.ts`

**Modified files:**
- `prisma/schema.prisma` — add `User` model + `Character.userId`
- `src/common/error-codes.ts` — add `UNAUTHORIZED`, `FORBIDDEN` codes and exception classes
- `src/characters/interfaces/character.interface.ts` — add `userId: string` to `ICharacter`
- `src/characters/repositories/character.repository.ts` — add `userId` to `create()`
- `src/characters/characters.service.ts` — accept `userId` in `create()`
- `src/characters/characters.controller.ts` — add decorators, inject `@Req()` on `create`
- `src/characters/characters.module.ts` — add `CharacterOwnerGuard`, import `AuthModule`
- `src/srd/srd.controller.ts` — add `@AnyRole()` at class level
- `src/app.module.ts` — import `ConfigModule`, `ClerkModule`, `AuthModule`, `UsersModule`
- `src/common/test/test-helpers.ts` — add auth test helpers
- `test/characters.e2e-spec.ts` — update for auth
- `test/srd.e2e-spec.ts` — update for auth
- `test/setup-env.ts` — add fake Clerk env vars

---

## Task 1: Install packages and set up environment

**Files:**
- Modify: `package.json` (via npm)
- Create: `.env` (if not present)
- Modify: `test/setup-env.ts`

- [ ] **Step 1: Install packages**

```bash
cd api && npm install @clerk/nestjs @nestjs/config
```

Expected: packages added to `node_modules`, `package.json` updated.

- [ ] **Step 2: Add env vars to `.env`**

Add these lines to `api/.env` (create the file if it doesn't exist):
```
CLERK_PUBLISHABLE_KEY=pk_test_placeholder
CLERK_SECRET_KEY=sk_test_placeholder
DATABASE_URL=postgresql://daggerheart:daggerheart@localhost:5432/daggerheart
```

- [ ] **Step 3: Add fake Clerk env vars to E2E test setup**

Edit `test/setup-env.ts`:
```typescript
process.env.DATABASE_URL = 'postgresql://daggerheart:daggerheart@localhost:5433/daggerheart_test';
process.env.CLERK_PUBLISHABLE_KEY = 'pk_test_fake';
process.env.CLERK_SECRET_KEY = 'sk_test_fake';
```

- [ ] **Step 4: Create ConfigModule**

Create `src/config/config.module.ts`:
```typescript
import { Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';

@Module({
  imports: [
    NestConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
})
export class ConfigModule {}
```

- [ ] **Step 5: Commit**

```bash
git add api/package.json api/package-lock.json api/src/config/config.module.ts api/test/setup-env.ts
git commit -m "feat: install @clerk/nestjs and @nestjs/config; add ConfigModule"
```

---

## Task 2: Prisma schema — User model and Character.userId

**Files:**
- Modify: `prisma/schema.prisma`

- [ ] **Step 1: Update schema**

In `prisma/schema.prisma`, add the `Role` enum and `User` model **before** the `// ── Character Tables` comment. Also add `userId` to the `Character` model.

Add after all SRD models, before `// ── Character Tables`:
```prisma
// ── User Tables ─────────────────────────────────────────────────────────────

enum Role {
  GM
  PC
  DEMO
}

model User {
  id         String      @id @default(uuid())
  clerkId    String      @unique @map("clerk_id")
  role       Role        @default(PC)
  tokenLimit Int?        @map("token_limit")
  tokensUsed Int         @default(0) @map("tokens_used")
  characters Character[]
  createdAt  DateTime    @default(now()) @map("created_at")
  updatedAt  DateTime    @updatedAt @map("updated_at")

  @@map("users")
}
```

In the `Character` model, add these two lines after `id String @id @default(uuid())`:
```prisma
  userId  String   @map("user_id")
```

And add this relation line after the existing relation block (after `secondaryWeapon Weapon?...`):
```prisma
  user    User     @relation(fields: [userId], references: [id])
```

- [ ] **Step 2: Run migration**

```bash
cd api && npx prisma migrate dev --name add-user-and-character-ownership
```

Expected output: migration created and applied, Prisma Client regenerated. If it fails due to existing character data, run `npx prisma migrate reset --force` (dev only — wipes data).

- [ ] **Step 3: Verify generated types**

```bash
npx prisma generate
```

Expected: `@prisma/client` now exports `User`, `Role` enum with `GM`, `PC`, `DEMO` values.

- [ ] **Step 4: Commit**

```bash
git add prisma/schema.prisma prisma/migrations/
git commit -m "feat: add User model and Character.userId to Prisma schema"
```

---

## Task 3: UsersModule

**Files:**
- Create: `src/users/users.repository.ts`
- Create: `src/users/users.service.ts`
- Create: `src/users/users.service.spec.ts`
- Create: `src/users/users.module.ts`

- [ ] **Step 1: Write failing tests for UsersService**

Create `src/users/users.service.spec.ts`:
```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { UsersRepository } from './users.repository';
import { Role, User } from '@prisma/client';

const mockUser: User = {
  id: 'user-1',
  clerkId: 'clerk-abc',
  role: Role.PC,
  tokenLimit: null,
  tokensUsed: 0,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockRepo = {
  findByClerkId: jest.fn(),
  create: jest.fn(),
};

describe('UsersService', () => {
  let service: UsersService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: UsersRepository, useValue: mockRepo },
      ],
    }).compile();
    service = module.get(UsersService);
  });

  describe('findOrCreate', () => {
    it('returns existing user if found', async () => {
      mockRepo.findByClerkId.mockResolvedValue(mockUser);
      const result = await service.findOrCreate('clerk-abc');
      expect(result).toEqual(mockUser);
      expect(mockRepo.create).not.toHaveBeenCalled();
    });

    it('creates and returns user if not found', async () => {
      mockRepo.findByClerkId.mockResolvedValue(null);
      mockRepo.create.mockResolvedValue(mockUser);
      const result = await service.findOrCreate('clerk-abc');
      expect(mockRepo.create).toHaveBeenCalledWith('clerk-abc');
      expect(result).toEqual(mockUser);
    });
  });
});
```

- [ ] **Step 2: Run tests to confirm they fail**

```bash
cd api && npx jest users.service.spec.ts --no-coverage
```

Expected: FAIL — `UsersService` not found.

- [ ] **Step 3: Create UsersRepository**

Create `src/users/users.repository.ts`:
```typescript
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { User } from '@prisma/client';

@Injectable()
export class UsersRepository {
  constructor(private readonly prisma: PrismaService) {}

  findByClerkId(clerkId: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { clerkId } });
  }

  create(clerkId: string): Promise<User> {
    return this.prisma.user.create({ data: { clerkId } });
  }
}
```

- [ ] **Step 4: Create UsersService**

Create `src/users/users.service.ts`:
```typescript
import { Injectable } from '@nestjs/common';
import { UsersRepository } from './users.repository';
import { User } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private readonly repository: UsersRepository) {}

  async findOrCreate(clerkId: string): Promise<User> {
    const existing = await this.repository.findByClerkId(clerkId);
    if (existing) return existing;
    return this.repository.create(clerkId);
  }
}
```

- [ ] **Step 5: Run tests to confirm they pass**

```bash
cd api && npx jest users.service.spec.ts --no-coverage
```

Expected: PASS.

- [ ] **Step 6: Create UsersModule**

Create `src/users/users.module.ts`:
```typescript
import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersRepository } from './users.repository';

@Module({
  providers: [UsersService, UsersRepository],
  exports: [UsersService],
})
export class UsersModule {}
```

- [ ] **Step 7: Commit**

```bash
git add src/users/
git commit -m "feat: add UsersModule with findOrCreate service"
```

---

## Task 4: Auth error codes and RequestWithUser interface

**Files:**
- Modify: `src/common/error-codes.ts`
- Create: `src/auth/interfaces/request-with-user.interface.ts`

- [ ] **Step 1: Add UNAUTHORIZED and FORBIDDEN to error codes**

Edit `src/common/error-codes.ts` — add two new enum values and two new exception classes:
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
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
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

export class UnauthorizedException extends AppException {
  constructor(message: string) {
    super(ErrorCode.UNAUTHORIZED, 401, message);
  }
}

export class ForbiddenException extends AppException {
  constructor(message: string) {
    super(ErrorCode.FORBIDDEN, 403, message);
  }
}
```

- [ ] **Step 2: Create RequestWithUser interface**

Create `src/auth/interfaces/request-with-user.interface.ts`:
```typescript
import { Request } from 'express';
import { User } from '@prisma/client';

export interface RequestWithUser extends Request {
  user: User;
}
```

- [ ] **Step 3: Commit**

```bash
git add src/common/error-codes.ts src/auth/interfaces/request-with-user.interface.ts
git commit -m "feat: add UNAUTHORIZED/FORBIDDEN error codes and RequestWithUser interface"
```

---

## Task 5: ClerkAuthGuard

**Files:**
- Create: `src/auth/guards/clerk-auth.guard.ts`
- Create: `src/auth/guards/clerk-auth.guard.spec.ts`

- [ ] **Step 1: Write failing tests**

Create `src/auth/guards/clerk-auth.guard.spec.ts`:
```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext } from '@nestjs/common';
import { ClerkAuthGuard } from './clerk-auth.guard';
import { UsersService } from '../../users/users.service';
import { Role, User } from '@prisma/client';

const mockUser: User = {
  id: 'user-1',
  clerkId: 'clerk-abc',
  role: Role.PC,
  tokenLimit: null,
  tokensUsed: 0,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockClerkClient = {
  verifyToken: jest.fn(),
};

const mockUsersService = {
  findOrCreate: jest.fn(),
};

function createContext(headers: Record<string, string> = {}): ExecutionContext {
  const request = { headers, user: undefined };
  return {
    switchToHttp: () => ({ getRequest: () => request }),
  } as unknown as ExecutionContext;
}

describe('ClerkAuthGuard', () => {
  let guard: ClerkAuthGuard;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ClerkAuthGuard,
        { provide: UsersService, useValue: mockUsersService },
        { provide: 'ClerkClient', useValue: mockClerkClient },
      ],
    }).compile();
    guard = module.get(ClerkAuthGuard);
  });

  it('sets request.user and returns true for valid token', async () => {
    mockClerkClient.verifyToken.mockResolvedValue({ sub: 'clerk-abc' });
    mockUsersService.findOrCreate.mockResolvedValue(mockUser);

    const ctx = createContext({ authorization: 'Bearer valid-token' });
    const result = await guard.canActivate(ctx);

    expect(result).toBe(true);
    expect(ctx.switchToHttp().getRequest().user).toEqual(mockUser);
    expect(mockUsersService.findOrCreate).toHaveBeenCalledWith('clerk-abc');
  });

  it('throws UnauthorizedException when Authorization header is missing', async () => {
    const ctx = createContext({});
    await expect(guard.canActivate(ctx)).rejects.toThrow('Authentication required');
  });

  it('throws UnauthorizedException when token is invalid', async () => {
    mockClerkClient.verifyToken.mockRejectedValue(new Error('bad token'));
    const ctx = createContext({ authorization: 'Bearer bad-token' });
    await expect(guard.canActivate(ctx)).rejects.toThrow('Invalid or expired token');
  });
});
```

- [ ] **Step 2: Run tests to confirm they fail**

```bash
cd api && npx jest clerk-auth.guard.spec.ts --no-coverage
```

Expected: FAIL — `ClerkAuthGuard` not found.

- [ ] **Step 3: Implement ClerkAuthGuard**

Create `src/auth/guards/clerk-auth.guard.ts`:
```typescript
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { InjectClerkClient } from '@clerk/nestjs';
import { ClerkClient } from '@clerk/backend';
import { UsersService } from '../../users/users.service';
import { UnauthorizedException } from '../../common/error-codes';
import { RequestWithUser } from '../interfaces/request-with-user.interface';

@Injectable()
export class ClerkAuthGuard implements CanActivate {
  constructor(
    @InjectClerkClient() private readonly clerk: ClerkClient,
    private readonly users: UsersService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const token = request.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      throw new UnauthorizedException('Authentication required');
    }

    try {
      const payload = await this.clerk.verifyToken(token);
      request.user = await this.users.findOrCreate(payload.sub);
      return true;
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
```

- [ ] **Step 4: Run tests to confirm they pass**

```bash
cd api && npx jest clerk-auth.guard.spec.ts --no-coverage
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/auth/guards/clerk-auth.guard.ts src/auth/guards/clerk-auth.guard.spec.ts
git commit -m "feat: add ClerkAuthGuard with JWT verification and user hydration"
```

---

## Task 6: RolesGuard, decorators, and AuthModule

**Files:**
- Create: `src/auth/decorators/roles.decorator.ts`
- Create: `src/auth/guards/roles.guard.ts`
- Create: `src/auth/guards/roles.guard.spec.ts`
- Create: `src/auth/decorators/gm.decorator.ts`
- Create: `src/auth/decorators/pc.decorator.ts`
- Create: `src/auth/decorators/any-role.decorator.ts`
- Create: `src/auth/auth.module.ts`

- [ ] **Step 1: Create roles.decorator.ts**

Create `src/auth/decorators/roles.decorator.ts`:
```typescript
import { SetMetadata } from '@nestjs/common';
import { Role } from '@prisma/client';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
```

- [ ] **Step 2: Write failing tests for RolesGuard**

Create `src/auth/guards/roles.guard.spec.ts`:
```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, Reflector } from '@nestjs/common';
import { RolesGuard } from './roles.guard';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { Role, User } from '@prisma/client';

function makeUser(role: Role): User {
  return { id: 'u1', clerkId: 'c1', role, tokenLimit: null, tokensUsed: 0, createdAt: new Date(), updatedAt: new Date() };
}

function createContext(user: User, handler = {}): ExecutionContext {
  return {
    switchToHttp: () => ({ getRequest: () => ({ user }) }),
    getHandler: () => handler,
    getClass: () => ({}),
  } as unknown as ExecutionContext;
}

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: Reflector;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RolesGuard, Reflector],
    }).compile();
    guard = module.get(RolesGuard);
    reflector = module.get(Reflector);
  });

  it('allows access when user has a required role', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([Role.GM, Role.DEMO]);
    const ctx = createContext(makeUser(Role.GM));
    expect(guard.canActivate(ctx)).toBe(true);
  });

  it('throws ForbiddenException when user lacks required role', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([Role.GM, Role.DEMO]);
    const ctx = createContext(makeUser(Role.PC));
    expect(() => guard.canActivate(ctx)).toThrow('Insufficient permissions');
  });

  it('allows DEMO when GM and DEMO are required', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([Role.GM, Role.DEMO]);
    const ctx = createContext(makeUser(Role.DEMO));
    expect(guard.canActivate(ctx)).toBe(true);
  });

  it('denies when no roles metadata is set', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined);
    const ctx = createContext(makeUser(Role.GM));
    expect(() => guard.canActivate(ctx)).toThrow('Insufficient permissions');
  });
});
```

- [ ] **Step 3: Run tests to confirm they fail**

```bash
cd api && npx jest roles.guard.spec.ts --no-coverage
```

Expected: FAIL — `RolesGuard` not found.

- [ ] **Step 4: Implement RolesGuard**

Create `src/auth/guards/roles.guard.ts`:
```typescript
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '@prisma/client';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { ForbiddenException } from '../../common/error-codes';
import { RequestWithUser } from '../interfaces/request-with-user.interface';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      throw new ForbiddenException('Insufficient permissions');
    }

    const request = context.switchToHttp().getRequest<RequestWithUser>();
    if (!requiredRoles.includes(request.user.role)) {
      throw new ForbiddenException('Insufficient permissions');
    }

    return true;
  }
}
```

- [ ] **Step 5: Run tests to confirm they pass**

```bash
cd api && npx jest roles.guard.spec.ts --no-coverage
```

Expected: PASS.

- [ ] **Step 6: Create role decorators**

Create `src/auth/decorators/gm.decorator.ts`:
```typescript
import { applyDecorators, UseGuards } from '@nestjs/common';
import { SetMetadata } from '@nestjs/common';
import { Role } from '@prisma/client';
import { ROLES_KEY } from './roles.decorator';
import { ClerkAuthGuard } from '../guards/clerk-auth.guard';
import { RolesGuard } from '../guards/roles.guard';

export const GM = () =>
  applyDecorators(
    SetMetadata(ROLES_KEY, [Role.GM, Role.DEMO]),
    UseGuards(ClerkAuthGuard, RolesGuard),
  );
```

Create `src/auth/decorators/pc.decorator.ts`:
```typescript
import { applyDecorators, UseGuards } from '@nestjs/common';
import { SetMetadata } from '@nestjs/common';
import { Role } from '@prisma/client';
import { ROLES_KEY } from './roles.decorator';
import { ClerkAuthGuard } from '../guards/clerk-auth.guard';
import { RolesGuard } from '../guards/roles.guard';

export const PC = () =>
  applyDecorators(
    SetMetadata(ROLES_KEY, [Role.PC, Role.DEMO]),
    UseGuards(ClerkAuthGuard, RolesGuard),
  );
```

Create `src/auth/decorators/any-role.decorator.ts`:
```typescript
import { applyDecorators, UseGuards } from '@nestjs/common';
import { SetMetadata } from '@nestjs/common';
import { Role } from '@prisma/client';
import { ROLES_KEY } from './roles.decorator';
import { ClerkAuthGuard } from '../guards/clerk-auth.guard';
import { RolesGuard } from '../guards/roles.guard';

export const AnyRole = () =>
  applyDecorators(
    SetMetadata(ROLES_KEY, [Role.GM, Role.PC, Role.DEMO]),
    UseGuards(ClerkAuthGuard, RolesGuard),
  );
```

- [ ] **Step 7: Create AuthModule**

Create `src/auth/auth.module.ts`:
```typescript
import { Module } from '@nestjs/common';
import { ClerkAuthGuard } from './guards/clerk-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [UsersModule],
  providers: [ClerkAuthGuard, RolesGuard],
  exports: [ClerkAuthGuard, RolesGuard],
})
export class AuthModule {}
```

- [ ] **Step 8: Commit**

```bash
git add src/auth/
git commit -m "feat: add RolesGuard, role decorators (@GM, @PC, @AnyRole), and AuthModule"
```

---

## Task 7: CharacterOwnerGuard and @OwnerOnly

**Files:**
- Create: `src/characters/guards/character-owner.guard.ts`
- Create: `src/characters/guards/character-owner.guard.spec.ts`
- Create: `src/characters/decorators/owner-only.decorator.ts`

- [ ] **Step 1: Write failing tests for CharacterOwnerGuard**

Create `src/characters/guards/character-owner.guard.spec.ts`:
```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext } from '@nestjs/common';
import { CharacterOwnerGuard } from './character-owner.guard';
import { CharacterRepository } from '../repositories/character.repository';
import { Role, User } from '@prisma/client';
import { ICharacterWithRelations } from '../interfaces/character.interface';

function makeUser(role: Role, id = 'user-1'): User {
  return { id, clerkId: 'c1', role, tokenLimit: null, tokensUsed: 0, createdAt: new Date(), updatedAt: new Date() };
}

function makeCharacter(userId: string): Partial<ICharacterWithRelations> {
  return { id: 'char-1', userId };
}

function createContext(user: User, params: Record<string, string> = {}): ExecutionContext {
  return {
    switchToHttp: () => ({ getRequest: () => ({ user, params }) }),
  } as unknown as ExecutionContext;
}

const mockCharacters = { findById: jest.fn() };

describe('CharacterOwnerGuard', () => {
  let guard: CharacterOwnerGuard;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CharacterOwnerGuard,
        { provide: CharacterRepository, useValue: mockCharacters },
      ],
    }).compile();
    guard = module.get(CharacterOwnerGuard);
  });

  it('allows GM to access any character without ownership check', async () => {
    const ctx = createContext(makeUser(Role.GM), { id: 'char-1' });
    expect(await guard.canActivate(ctx)).toBe(true);
    expect(mockCharacters.findById).not.toHaveBeenCalled();
  });

  it('allows DEMO to access any character without ownership check', async () => {
    const ctx = createContext(makeUser(Role.DEMO), { id: 'char-1' });
    expect(await guard.canActivate(ctx)).toBe(true);
    expect(mockCharacters.findById).not.toHaveBeenCalled();
  });

  it('allows PC to access their own character', async () => {
    mockCharacters.findById.mockResolvedValue(makeCharacter('user-1'));
    const ctx = createContext(makeUser(Role.PC, 'user-1'), { id: 'char-1' });
    expect(await guard.canActivate(ctx)).toBe(true);
  });

  it("throws ForbiddenException when PC tries to access another user's character", async () => {
    mockCharacters.findById.mockResolvedValue(makeCharacter('other-user'));
    const ctx = createContext(makeUser(Role.PC, 'user-1'), { id: 'char-1' });
    await expect(guard.canActivate(ctx)).rejects.toThrow('You do not own this character');
  });

  it('throws NotFoundException when character does not exist', async () => {
    mockCharacters.findById.mockResolvedValue(null);
    const ctx = createContext(makeUser(Role.PC, 'user-1'), { id: 'nonexistent' });
    await expect(guard.canActivate(ctx)).rejects.toThrow('Character nonexistent not found');
  });
});
```

- [ ] **Step 2: Run tests to confirm they fail**

```bash
cd api && npx jest character-owner.guard.spec.ts --no-coverage
```

Expected: FAIL — `CharacterOwnerGuard` not found.

- [ ] **Step 3: Implement CharacterOwnerGuard**

Create `src/characters/guards/character-owner.guard.ts`:
```typescript
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Role } from '@prisma/client';
import { CharacterRepository } from '../repositories/character.repository';
import { ForbiddenException, NotFoundException } from '../../common/error-codes';
import { ErrorCode } from '../../common/error-codes';
import { RequestWithUser } from '../../auth/interfaces/request-with-user.interface';

@Injectable()
export class CharacterOwnerGuard implements CanActivate {
  constructor(private readonly characters: CharacterRepository) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<RequestWithUser & { params: { id: string } }>();
    const user = request.user;

    if (user.role === Role.GM || user.role === Role.DEMO) return true;

    const characterId = request.params.id;
    const character = await this.characters.findById(characterId);

    if (!character) {
      throw new NotFoundException(ErrorCode.CHARACTER_NOT_FOUND, `Character ${characterId} not found`);
    }
    if (character.userId !== user.id) {
      throw new ForbiddenException('You do not own this character');
    }
    return true;
  }
}
```

- [ ] **Step 4: Run tests to confirm they pass**

```bash
cd api && npx jest character-owner.guard.spec.ts --no-coverage
```

Expected: PASS.

- [ ] **Step 5: Create @OwnerOnly decorator**

Create `src/characters/decorators/owner-only.decorator.ts`:
```typescript
import { applyDecorators, UseGuards } from '@nestjs/common';
import { SetMetadata } from '@nestjs/common';
import { Role } from '@prisma/client';
import { ROLES_KEY } from '../../auth/decorators/roles.decorator';
import { ClerkAuthGuard } from '../../auth/guards/clerk-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { CharacterOwnerGuard } from '../guards/character-owner.guard';

export const OwnerOnly = () =>
  applyDecorators(
    SetMetadata(ROLES_KEY, [Role.GM, Role.PC, Role.DEMO]),
    UseGuards(ClerkAuthGuard, RolesGuard, CharacterOwnerGuard),
  );
```

- [ ] **Step 6: Commit**

```bash
git add src/characters/guards/ src/characters/decorators/
git commit -m "feat: add CharacterOwnerGuard and @OwnerOnly decorator"
```

---

## Task 8: Update Character schema for userId

**Files:**
- Modify: `src/characters/interfaces/character.interface.ts`
- Modify: `src/characters/repositories/character.repository.ts`
- Modify: `src/characters/characters.service.ts`

- [ ] **Step 1: Add userId to ICharacter interface**

Edit `src/characters/interfaces/character.interface.ts`. Add `userId: string;` after `id: string;`:
```typescript
export interface ICharacter {
  id: string;
  userId: string;
  name: string;
  // ... rest unchanged
```

- [ ] **Step 2: Add userId to CharacterRepository.create()**

Edit `src/characters/repositories/character.repository.ts`.

In the `create()` method signature, add `userId: string;` to the data parameter type:
```typescript
async create(data: {
  userId: string;
  name: string;
  classId: string;
  // ... rest of existing fields
```

In the `prisma.character.create({ data: { ... } })` call, add `userId: data.userId,` after `name: data.name,`:
```typescript
const character = await this.prisma.character.create({
  data: {
    userId: data.userId,
    name: data.name,
    // ... rest unchanged
```

- [ ] **Step 3: Update CharactersService.create() to accept userId**

Edit `src/characters/characters.service.ts`.

Change the `create` method signature to accept `userId`:
```typescript
async create(dto: CreateCharacterDto, userId: string): Promise<CharacterResponse> {
```

Pass `userId` into the repository call:
```typescript
const character = await this.characters.create({
  ...dto,
  userId,
  hpTotal: cls.hp,
  evasion: cls.evasion + (armorData?.evasionModifier ?? 0),
});
```

- [ ] **Step 4: Run unit tests to verify no regressions**

```bash
cd api && npx jest --no-coverage
```

Expected: all existing tests pass (E2E tests excluded — run separately).

- [ ] **Step 5: Commit**

```bash
git add src/characters/interfaces/character.interface.ts src/characters/repositories/character.repository.ts src/characters/characters.service.ts
git commit -m "feat: add userId to Character interface, repository, and service"
```

---

## Task 9: Wire auth onto controllers and update AppModule

**Files:**
- Modify: `src/characters/characters.controller.ts`
- Modify: `src/characters/characters.module.ts`
- Modify: `src/srd/srd.controller.ts`
- Modify: `src/app.module.ts`

- [ ] **Step 1: Update CharactersController**

Replace `src/characters/characters.controller.ts` entirely:
```typescript
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Req,
} from '@nestjs/common';
import { CharactersService } from './characters.service';
import { CreateCharacterDto } from './dto/create-character.dto';
import { UpdateCharacterDto } from './dto/update-character.dto';
import { CreateExperienceDto } from './dto/create-experience.dto';
import { UpdateExperienceDto } from './dto/update-experience.dto';
import { AddDomainCardDto } from './dto/add-domain-card.dto';
import { ToggleThresholdBonusDto } from './dto/toggle-threshold-bonus.dto';
import { GM } from '../auth/decorators/gm.decorator';
import { PC } from '../auth/decorators/pc.decorator';
import { OwnerOnly } from './decorators/owner-only.decorator';
import { RequestWithUser } from '../auth/interfaces/request-with-user.interface';

@Controller('characters')
export class CharactersController {
  constructor(private readonly service: CharactersService) {}

  @GM()
  @Get()
  findAll() {
    return this.service.findAll();
  }

  @PC()
  @Post()
  create(@Body() dto: CreateCharacterDto, @Req() req: RequestWithUser) {
    return this.service.create(dto, req.user.id);
  }

  @OwnerOnly()
  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.findOne(id);
  }

  @OwnerOnly()
  @Patch(':id')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateCharacterDto) {
    return this.service.update(id, dto);
  }

  @OwnerOnly()
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.remove(id);
  }

  @OwnerOnly()
  @Get(':id/computed-stats')
  getComputedStats(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.getComputedStats(id);
  }

  @OwnerOnly()
  @Post(':id/experiences')
  addExperience(@Param('id', ParseUUIDPipe) id: string, @Body() dto: CreateExperienceDto) {
    return this.service.addExperience(id, dto);
  }

  @OwnerOnly()
  @Patch(':id/experiences/:expId')
  updateExperience(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('expId', ParseUUIDPipe) expId: string,
    @Body() dto: UpdateExperienceDto,
  ) {
    return this.service.updateExperience(id, expId, dto);
  }

  @OwnerOnly()
  @Delete(':id/experiences/:expId')
  @HttpCode(HttpStatus.NO_CONTENT)
  removeExperience(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('expId', ParseUUIDPipe) expId: string,
  ) {
    return this.service.removeExperience(id, expId);
  }

  @OwnerOnly()
  @Post(':id/domain-cards')
  addDomainCard(@Param('id', ParseUUIDPipe) id: string, @Body() dto: AddDomainCardDto) {
    return this.service.addDomainCard(id, dto);
  }

  @OwnerOnly()
  @Delete(':id/domain-cards/:cardId')
  @HttpCode(HttpStatus.NO_CONTENT)
  removeDomainCard(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('cardId', ParseUUIDPipe) cardId: string,
  ) {
    return this.service.removeDomainCard(id, cardId);
  }

  @OwnerOnly()
  @Patch(':id/threshold-bonuses/:bonusId')
  toggleThresholdBonus(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('bonusId', ParseUUIDPipe) bonusId: string,
    @Body() dto: ToggleThresholdBonusDto,
  ) {
    return this.service.toggleThresholdBonus(id, bonusId, dto);
  }
}
```

- [ ] **Step 2: Update CharactersModule to provide CharacterOwnerGuard and import AuthModule**

Edit `src/characters/characters.module.ts`:
```typescript
import { Module } from '@nestjs/common';
import { CharactersController } from './characters.controller';
import { CharactersService } from './characters.service';
import { CharacterRepository } from './repositories/character.repository';
import { ExperienceRepository } from './repositories/experience.repository';
import { CharacterDomainCardRepository } from './repositories/character-domain-card.repository';
import { ThresholdBonusRepository } from './repositories/threshold-bonus.repository';
import { GameLogicModule } from '../game-logic/game-logic.module';
import { SrdModule } from '../srd/srd.module';
import { ClassRepository } from '../srd/repositories/class.repository';
import { ArmorRepository } from '../srd/repositories/armor.repository';
import { DomainCardRepository } from '../srd/repositories/domain-card.repository';
import { AuthModule } from '../auth/auth.module';
import { CharacterOwnerGuard } from './guards/character-owner.guard';

@Module({
  imports: [GameLogicModule, SrdModule, AuthModule],
  controllers: [CharactersController],
  providers: [
    CharactersService,
    CharacterRepository,
    ExperienceRepository,
    CharacterDomainCardRepository,
    ThresholdBonusRepository,
    ClassRepository,
    ArmorRepository,
    DomainCardRepository,
    CharacterOwnerGuard,
  ],
})
export class CharactersModule {}
```

- [ ] **Step 3: Update SrdController**

Edit `src/srd/srd.controller.ts`. Add the import and class decorator:

Add import after existing imports:
```typescript
import { AnyRole } from '../auth/decorators/any-role.decorator';
```

Add `@AnyRole()` decorator above `@Controller('srd')`:
```typescript
@AnyRole()
@Controller('srd')
@UseInterceptors(SrdCacheInterceptor)
export class SrdController {
```

- [ ] **Step 4: Update SrdModule to import AuthModule**

Edit `src/srd/srd.module.ts`. Add `AuthModule` to imports:
```typescript
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    CacheModule.register({ ttl: 3600 * 1000 }),
    AuthModule,
  ],
  // ... rest unchanged
```

- [ ] **Step 5: Update AppModule**

Replace `src/app.module.ts` entirely:
```typescript
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SrdModule } from './srd/srd.module';
import { PrismaModule } from './prisma/prisma.module';
import { CharactersModule } from './characters/characters.module';
import { ConfigModule } from './config/config.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ClerkModule } from '@clerk/nestjs';

@Module({
  imports: [
    ConfigModule,
    ClerkModule.forRoot({
      publishableKey: process.env.CLERK_PUBLISHABLE_KEY,
      secretKey: process.env.CLERK_SECRET_KEY,
    }),
    PrismaModule,
    UsersModule,
    AuthModule,
    SrdModule,
    CharactersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
```

- [ ] **Step 6: Build to verify no TypeScript errors**

```bash
cd api && npx nest build
```

Expected: build succeeds with no errors. Fix any TypeScript errors before continuing.

- [ ] **Step 7: Commit**

```bash
git add src/characters/characters.controller.ts src/characters/characters.module.ts src/srd/srd.controller.ts src/srd/srd.module.ts src/app.module.ts
git commit -m "feat: apply auth decorators to CharactersController and SrdController; wire AppModule"
```

---

## Task 10: Update E2E tests

**Files:**
- Modify: `src/common/test/test-helpers.ts`
- Modify: `test/characters.e2e-spec.ts`
- Modify: `test/srd.e2e-spec.ts`

- [ ] **Step 1: Update test-helpers to support auth mocking**

Replace `src/common/test/test-helpers.ts` entirely:
```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe, CanActivate, ExecutionContext } from '@nestjs/common';
import { AppModule } from '../../app.module';
import { AppExceptionFilter } from '../filters/app-exception.filter';
import { PrismaService } from '../../prisma/prisma.service';
import { execSync } from 'child_process';
import { ClerkAuthGuard } from '../../auth/guards/clerk-auth.guard';
import { Role, User } from '@prisma/client';

export async function createTestApp(activeUser?: User): Promise<INestApplication> {
  const mockGuard: CanActivate = {
    canActivate: (context: ExecutionContext) => {
      if (activeUser) {
        context.switchToHttp().getRequest().user = activeUser;
      }
      return !!activeUser;
    },
  };

  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  })
    .overrideGuard(ClerkAuthGuard)
    .useValue(mockGuard)
    .compile();

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

export async function cleanUserTables(prisma: PrismaService): Promise<void> {
  await cleanCharacterTables(prisma);
  await prisma.user.deleteMany();
}

export function makeTestUser(prisma: PrismaService, role: Role, clerkId: string): Promise<User> {
  return prisma.user.create({ data: { clerkId, role } });
}
```

- [ ] **Step 2: Update SRD E2E tests**

Edit `test/srd.e2e-spec.ts`. The SRD tests need a user with any role. Find the `createTestApp()` call and update it to pass a user:

In `beforeAll`, after `app = await createTestApp(...)`:

First, look up what the current `createTestApp()` call looks like in `test/srd.e2e-spec.ts` and add user setup. Replace the `beforeAll`/`afterAll` blocks to create a test user:

```typescript
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createTestApp, seedTestDatabase, cleanUserTables, makeTestUser } from '../src/common/test/test-helpers';
import { PrismaService } from '../src/prisma/prisma.service';
import { Role, User } from '@prisma/client';

describe('SRD Endpoints (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let testUser: User;

  beforeAll(async () => {
    // Create app without user first to get prisma, then recreate with user
    const tempApp = await createTestApp(undefined);
    prisma = tempApp.get(PrismaService);
    await seedTestDatabase();
    await prisma.user.deleteMany();
    testUser = await makeTestUser(prisma, Role.PC, 'srd-test-user');
    await tempApp.close();

    app = await createTestApp(testUser);
  });

  afterAll(async () => {
    await cleanUserTables(prisma);
    await app.close();
  });

  // ... rest of the test file stays the same (all GET requests)
```

**Note:** Only update the imports, `beforeAll`, and `afterAll`. Leave all test cases unchanged.

- [ ] **Step 3: Update Characters E2E tests**

Replace the top of `test/characters.e2e-spec.ts` (imports and describe block setup) to add user management. Keep all test cases but update setup and teardown:

```typescript
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import {
  createTestApp,
  cleanCharacterTables,
  cleanUserTables,
  makeTestUser,
} from '../src/common/test/test-helpers';
import { PrismaService } from '../src/prisma/prisma.service';
import { Role, User } from '@prisma/client';

describe('Characters Endpoints (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let pcUser: User;
  let gmUser: User;

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
    // Bootstrap with no user to get prisma and seed data
    const tempApp = await createTestApp(undefined);
    prisma = tempApp.get(PrismaService);
    await cleanUserTables(prisma);

    // Create test users
    pcUser = await makeTestUser(prisma, Role.PC, 'test-pc-user');
    gmUser = await makeTestUser(prisma, Role.GM, 'test-gm-user');

    // Fetch SRD IDs for test data
    const srdClass = await prisma.srdClass.findFirst({
      include: { subclasses: true, domains: { include: { domain: { include: { cards: true } } } } },
    });
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

    await tempApp.close();
    app = await createTestApp(pcUser);
  });

  beforeEach(async () => {
    await cleanCharacterTables(prisma);
  });

  afterAll(async () => {
    await cleanUserTables(prisma);
    await app.close();
  });
```

Also update the `validCreateBody()` function and any `POST /characters` calls to ensure `userId` is NOT in the body (it comes from the JWT now, not the request body).

Add a test for GM seeing all characters. At the end of the describe block, add:

```typescript
  describe('GM access', () => {
    it('GM can list all characters', async () => {
      // Create a character as pcUser first
      await request(app.getHttpServer()).post('/characters').send(validCreateBody()).expect(201);

      // Switch to GM app
      const gmApp = await createTestApp(gmUser);
      const res = await request(gmApp.getHttpServer()).get('/characters').expect(200);
      expect(res.body.length).toBeGreaterThan(0);
      await gmApp.close();
    });

    it('PC cannot list all characters (403)', async () => {
      await request(app.getHttpServer()).get('/characters').expect(403);
    });
  });
```

- [ ] **Step 4: Run E2E tests**

```bash
cd api && npx jest --config ./test/jest-e2e.json --no-coverage
```

Expected: all tests pass. Fix any failures before continuing.

- [ ] **Step 5: Run all tests to verify no unit test regressions**

```bash
cd api && npx jest --no-coverage
```

Expected: all unit tests pass.

- [ ] **Step 6: Commit**

```bash
git add src/common/test/test-helpers.ts test/characters.e2e-spec.ts test/srd.e2e-spec.ts
git commit -m "test: update E2E tests to use auth mocking with role-based test users"
```

---

## Notes for the implementer

- **`ClerkModule` in tests**: `AppModule` imports `ClerkModule.forRoot()` with fake keys from `setup-env.ts`. The module initializes but JWT verification is bypassed because `ClerkAuthGuard` is overridden. This is intentional.
- **`ClerkClient` token**: The guard uses `@Inject('ClerkClient')`. The `ClerkModule.forRoot()` registers the client under this token. In unit tests, provide it manually as shown in the guard spec.
- **Migration reset**: If `npx prisma migrate dev` fails because existing characters lack `userId`, run `npx prisma migrate reset --force` (dev only — wipes data and re-seeds).
- **`@prisma/client` Role enum**: After running `npx prisma generate`, `Role` is importable from `@prisma/client`. Do not define a local Role enum.
