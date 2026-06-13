# Daggerheart AI

TTRPG assistant for Daggerheart — character management, GM tools, rules chat, and Claude Code integration.

## Stack

- **Frontend**: Next.js, React 19, TailwindCSS, Radix UI, Vercel AI SDK
- **Backend**: NestJS, Prisma, PostgreSQL
- **MCP Server**: Node.js with SQLite embeddings for semantic search
- **Auth**: Clerk
- **AI**: Anthropic Claude (Haiku for factual, Sonnet for creative)

## Setup

### API (NestJS backend)

```bash
cd api
cp .env.example .env    # add DATABASE_URL, CLERK_SECRET_KEY, etc.
npm install
npx prisma migrate deploy
npm run start:dev
```

### MCP Server

```bash
cd server
cp .env.example .env    # add OPENAI_API_KEY
npm install
npm run index-rules     # index Daggerheart SRD into SQLite
npm run build
```

### Web App

```bash
cd web
cp .env.example .env    # add ANTHROPIC_API_KEY, NEXT_PUBLIC_CLERK_*, API_URL
npm install
npm run dev
```

### Claude Code MCP

Add to your `.mcp.json`:

```json
{
  "mcpServers": {
    "daggerheart": {
      "command": "node",
      "args": ["<path-to>/ttrpg-rules/server/dist/index.js"],
      "env": {
        "OPENAI_API_KEY": "your-key-here"
      }
    }
  }
}
```

### Skills

```bash
cp -r skills/* ~/.claude/skills/
```

## Web App

### Player (PC) Routes

- `/sheet` - Interactive character sheet (stats, HP/Stress/Hope, traits, domain cards, equipment, experiences, gold)
- `/levelup` - Level-up with options selector
- `/chat` - AI chat for rules questions and character help

### GM Routes

- `/adversaries` - Adversary/NPC library
- `/encounters` - Encounter builder with adversary instances
- `/loot` - Gold and treasure distribution
- `/rules` - Rules reference and semantic search

## REST API (NestJS, port 3000)

### Characters `/api/characters`

| Method | Path | Description |
|--------|------|-------------|
| GET | `/me` | Get your character (PC) |
| POST | `/` | Create character (PC) |
| PATCH | `/:id` | Update character |
| DELETE | `/:id` | Delete character |
| GET | `/:id/computed-stats` | Derived stat calculations |
| GET | `/:id/level-up/options` | Available level-up choices |
| POST | `/:id/level-up` | Apply level-up |
| POST | `/:id/experiences` | Add experience |
| POST | `/:id/domain-cards` | Add domain card |

### Encounters `/api/encounters` (GM)

GM adversary library + encounters, synced per user across devices.

| Method | Path | Description |
|--------|------|-------------|
| GET | `/store` | Get your adversary library and encounters |
| PUT | `/store` | Replace your full library + encounters (sync) |

### SRD `/api/srd`

`GET /weapons`, `/armor`, `/classes`, `/subclasses`, `/ancestries`, `/communities`, `/domains`, `/domain-cards`, `/adversaries`, `/beastforms`, `/consumables`, `/environments`, `/items` — each supports `/:id` for detail.

### Search `/api/search`

- `POST /` - Semantic search with optional `category` and `limit` filters

### Chat (Next.js API routes)

- `POST /api/chat` - General Daggerheart chat
- `POST /api/rules-chat` - Rules-specific chat
- `POST /api/adversary-chat` - Adversary/encounter chat

## MCP Tools (Claude Code / Claude Desktop)

Category tools — dynamically registered for each: `classes`, `subclasses`, `ancestries`, `communities`, `domains`, `armor`, `weapons`, `adversaries`:

- `list_<category>` — list all items with summaries
- `get_<singular>` — get full detail for one item

Search:

- `search_rules` — semantic vector search across Daggerheart SRD (supports `category` and `limit`)

## Skills

- `/daggerheart-campaign` - Create campaign concept
- `/daggerheart-session-zero` - Run session zero
- `/daggerheart-arc` - Plan adventure arc
- `/daggerheart-session` - Prep individual session
- `/daggerheart-help` - Quick help during play
- `/daggerheart-character` - Character creation
- `/daggerheart-process-session` - Process session notes

## Project Structure

```
ttrpg-rules/
  api/                  # NestJS backend
    src/
      auth/             # Clerk auth + role guards
      characters/       # Character CRUD, level-up, domain cards
      game-logic/       # Stat calculations
      srd/              # SRD endpoints with caching
      search/           # Semantic search service
      users/            # User roles
    prisma/             # Schema and migrations
  server/               # MCP + Express server
    src/                # TypeScript source
    data/               # SQLite embedding databases
    daggerheart-srd/    # SRD markdown (git submodule)
  web/                  # Next.js frontend
    app/
      (pc)/             # Player routes
      (gm)/             # GM routes
      api/              # Streaming chat endpoints
    components/
      character-sheet/  # HP, stats, traits, gold, domain cards
      encounter/        # Encounter builder
  skills/               # Claude Code skills
  docs/plans/           # Design documents
```
