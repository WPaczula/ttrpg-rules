# Daggerheart API

NestJS backend for Daggerheart character sheet management.

## Prerequisites

- Node.js 20+
- PostgreSQL 15+ (or Docker)
- A [Clerk](https://clerk.com) account (free tier)

## Clerk Setup

1. Create a free account at [clerk.com](https://clerk.com) and create a new application
2. Copy **Publishable Key** and **Secret Key** from the dashboard (API Keys section)

## Environment Variables

Create `api/.env`:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/daggerheart
CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...
```

## Setup

```bash
docker compose up -d        # start Postgres
npm install
npx prisma migrate deploy   # run migrations
npx prisma db seed          # seed SRD data
npm run start:dev
```

The API runs on `http://localhost:3000`.

## Authentication

All endpoints require a Clerk JWT in the `Authorization` header:

```
Authorization: Bearer <clerk-session-token>
```

Your frontend gets this token from Clerk's client SDK after the user signs in.

## User Roles

Three roles are stored in the `users` table:

| Role | Access | Token limit |
|------|--------|-------------|
| `GM` | All endpoints, read all characters | Unlimited |
| `PC` | SRD + own characters only | Unlimited |
| `DEMO` | Full access (same as GM) | Set per user |

**Users are created automatically** on first API request (lazy creation, default role: `PC`).

**Changing roles:** use Prisma Studio (`npx prisma studio`) — find the user by `clerkId` (visible in the Clerk dashboard) and update their `role` field.

**DEMO token limits:** set `tokenLimit` (integer) in Prisma Studio for DEMO users. Leave `null` for unlimited.

### Endpoint access by role

| Endpoint | GM | PC | DEMO |
|----------|----|----|------|
| `GET /srd/*` | ✅ | ✅ | ✅ |
| `GET /characters` (all) | ✅ | ❌ | ✅ |
| `POST /characters` | ❌ | ✅ | ✅ |
| `GET/PATCH/DELETE /characters/:id` | ✅ any | ✅ own only | ✅ any |
| Sub-resources (`/experiences`, `/domain-cards`, etc.) | ✅ any | ✅ own only | ✅ any |

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
| UNAUTHORIZED | 401 | Missing or invalid Clerk JWT |
| FORBIDDEN | 403 | Role not permitted, or PC accessing another player's character |
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
