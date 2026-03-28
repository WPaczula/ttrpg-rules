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
