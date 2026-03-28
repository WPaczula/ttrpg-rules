# Auth Design — Role-Based Access with Clerk

**Date:** 2026-03-28
**Status:** Approved

## Overview

Add authentication and authorization to the Daggerheart campaign API using Clerk for identity and a custom role system stored in our database. Three roles control access: GM (full, unlimited), PC (own characters only, unlimited), and DEMO (full access, limited LLM tokens).

---

## Roles

| Role | Access | Token Limit |
|------|--------|-------------|
| `GM` | All endpoints, all characters | Unlimited |
| `PC` | SRD + own characters only | Unlimited |
| `DEMO` | All endpoints (same as GM) | Limited (set per user) |

Roles are stored in the `User` table in our database. Clerk handles authentication only (who you are); our DB handles authorization (what you can do). Role changes take effect immediately without waiting for JWT expiry.

---

## Prisma Schema Changes

### New `User` model

```prisma
enum Role {
  GM
  PC
  DEMO
}

model User {
  id         String      @id @default(uuid())
  clerkId    String      @unique
  role       Role        @default(PC)
  tokenLimit Int?        // null = unlimited; set manually for DEMO users
  tokensUsed Int         @default(0)
  characters Character[]
  createdAt  DateTime    @default(now())
  updatedAt  DateTime    @updatedAt
}
```

### Updated `Character` model

Add ownership link:

```prisma
model Character {
  // ...existing fields
  userId  String
  user    User   @relation(fields: [userId], references: [id])
}
```

### User creation

Lazy — a `User` record is auto-created on first authenticated request with `role: PC`. Role and `tokenLimit` are updated manually via Prisma Studio or a future admin endpoint.

---

## New Modules

### `ConfigModule` (`src/config/`)

Global module using `@nestjs/config`. Loads environment variables used across the app.

**Required env vars:**
```
CLERK_SECRET_KEY=
CLERK_PUBLISHABLE_KEY=
DATABASE_URL=
```

### `AuthModule` (`src/auth/`)

Global module. Exports guards and decorators used by all other modules.

**Contents:**

```
src/auth/
  auth.module.ts
  guards/
    clerk-auth.guard.ts    ← extends ClerkGuard from @clerk/nestjs; validates JWT
    roles.guard.ts         ← fetches User from DB by clerkId; checks role metadata
  decorators/
    roles.decorator.ts     ← SetMetadata(ROLES_KEY, roles[])
    gm.decorator.ts        ← @GM() = UseGuards + Roles([GM, DEMO])
    pc.decorator.ts        ← @PC() = UseGuards + Roles([PC, DEMO])
    any-role.decorator.ts  ← @AnyRole() = UseGuards + Roles([GM, PC, DEMO])
```

### `UsersModule` (`src/users/`)

Provides `UsersService` used by `RolesGuard` to look up or lazy-create users.

**Contents:**

```
src/users/
  users.module.ts
  users.service.ts     ← findByClerkId(), findOrCreate()
  users.repository.ts
```

---

## Guard Chain

Every authenticated request passes through guards in this order:

```
ClerkAuthGuard → RolesGuard → [CharacterOwnerGuard if @OwnerOnly()]
```

1. **`ClerkAuthGuard`** — validates Clerk JWT using `@clerk/nestjs`. Extracts `clerkId` from token. Returns `401` if token is missing or invalid.
2. **`RolesGuard`** — fetches `User` from DB by `clerkId` (lazy-creates with `role: PC` if first visit). Checks `user.role` against `@Roles()` metadata. Returns `403` if role not allowed.
3. **`CharacterOwnerGuard`** — only runs when `@OwnerOnly()` is applied. Fetches character by `:id` route param. GM and DEMO bypass ownership check. Returns `403` if PC does not own the character, `404` if character not found.

---

## Decorators

### Auth module decorators (generic, reusable)

| Decorator | Allowed Roles | Lives in |
|-----------|--------------|----------|
| `@GM()` | GM, DEMO | `auth` module |
| `@PC()` | PC, DEMO | `auth` module |
| `@AnyRole()` | GM, PC, DEMO | `auth` module |

Each is a composed decorator: `applyDecorators(UseGuards(ClerkAuthGuard, RolesGuard), SetMetadata(ROLES_KEY, [...]))`.

### Characters module decorator

| Decorator | Allowed Roles | Ownership enforced | Lives in |
|-----------|--------------|-------------------|----------|
| `@OwnerOnly()` | GM, PC, DEMO | Yes (GM/DEMO bypass ownership check) | `characters` module |

`@OwnerOnly()` = `applyDecorators(SetMetadata(ROLES_KEY, [GM, PC, DEMO]), UseGuards(ClerkAuthGuard, RolesGuard, CharacterOwnerGuard))`.

All roles pass `RolesGuard`. `CharacterOwnerGuard` then skips the ownership check for GM and DEMO — only PC must own the character.

---

## Controller Access Map

### `SrdController`

```typescript
@AnyRole()
@Controller('srd')
export class SrdController { ... }
```

All SRD endpoints accessible to all authenticated roles.

### `CharactersController`

```typescript
@GM()     @Get()              findAll()          // GM + DEMO see all characters
@PC()     @Post()             create()           // PC + DEMO; userId set from request.user.id
@OwnerOnly() @Get(':id')      findOne()          // PC + DEMO must own; GM bypasses
@OwnerOnly() @Patch(':id')    update()
@OwnerOnly() @Delete(':id')   remove()
@OwnerOnly() @Get(':id/computed-stats')          getComputedStats()
@OwnerOnly() @Post(':id/experiences')            addExperience()
@OwnerOnly() @Patch(':id/experiences/:expId')    updateExperience()
@OwnerOnly() @Delete(':id/experiences/:expId')   removeExperience()
@OwnerOnly() @Post(':id/domain-cards')           addDomainCard()
@OwnerOnly() @Delete(':id/domain-cards/:cardId') removeDomainCard()
@OwnerOnly() @Patch(':id/threshold-bonuses/:bonusId') toggleThresholdBonus()
```

`POST /characters` — `userId` is always set from `request.user.id` in the controller, never from the request body.

---

## Error Responses

| Condition | Status |
|-----------|--------|
| Missing or invalid JWT | `401 Unauthorized` |
| Role not permitted | `403 Forbidden` |
| PC accessing another user's character | `403 Forbidden` (not 404, avoids leaking existence) |
| Character not found during owner check | `404 Not Found` |

---

## Token Tracking (DEMO users)

Token limits are not enforced by a guard. The LLM chat service checks `tokensUsed >= tokenLimit` at call time and throws `403` if exceeded. `tokensUsed` is incremented after each successful LLM call. This keeps token logic out of the auth layer since it only applies to the chat feature.

---

## New Packages

```bash
npm install @clerk/nestjs @nestjs/config
```

---

## Out of Scope

- Admin endpoint for updating user roles/limits (manual via Prisma Studio for now)
- Token reset mechanism for DEMO users
- LLM chat feature implementation (token tracking schema is ready; enforcement is future work)
