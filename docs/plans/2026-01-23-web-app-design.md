# Character Creation Web App

## Overview

A web app that helps players create characters for a certain TTRPG through a guided chat interface powered by Claude Haiku. The server also exposes an MCP endpoint for Claude Desktop integration.

## Naming & Branding

Per the Darrington Press Community Gaming License (DPCGL):
- **Do NOT use "Daggerheart" in:** app name, URL, logos, page titles, or branding
- **Allowed:** "Daggerheart Compatible" in descriptive text only
- Use a generic name like "Character Forge", "Hero Builder", or similar

## License Attribution

The app must include this attribution (in footer or About section):

```
This project includes material from the Daggerheart System Reference
Document 1.0, © Critical Role, LLC, under the terms of the Darrington
Press Community Gaming License (DPCGL).

More information: https://www.daggerheart.com/

Daggerheart and all related marks are trademarks of Critical Role, LLC.
This project is not affiliated with, endorsed, or sponsored by
Critical Role or Darrington Press.
```

**Also required:**
- Darrington Press Community Content Logo (download from darringtonpress.com)
- Link to the DPCGL license page

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    Server (Railway/Fly.io)                      │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Express + @modelcontextprotocol/server                 │   │
│  ├─────────────────────────────────────────────────────────┤   │
│  │  /mcp              → Streamable HTTP for Claude Desktop │   │
│  │  /api/search       → Vector search (embeddings)         │   │
│  │  /api/classes      → List/get classes                   │   │
│  │  /api/ancestries   → List/get ancestries                │   │
│  │  /api/...          → Other REST endpoints               │   │
│  └─────────────────────────────────────────────────────────┘   │
│                              ↑                                  │
│                    SQLite + Markdown files                      │
└─────────────────────────────────────────────────────────────────┘
           ↑                              ↑
           │                              │
┌──────────┴───────────┐      ┌──────────┴───────────┐
│   Claude Desktop     │      │   Web App (Vercel)   │
│   connects via /mcp  │      │   Next.js + Haiku    │
└──────────────────────┘      └──────────────────────┘
```

## Folder Structure

```
daggerheart-ai/
├── server/                    # Renamed from mcp-server
│   ├── src/
│   │   ├── index.ts          # Express + MCP setup
│   │   ├── mcp.ts            # MCP tool registrations
│   │   ├── routes/
│   │   │   └── api.ts        # REST endpoints
│   │   ├── services/
│   │   │   ├── documents.ts  # Read markdown files
│   │   │   └── search.ts     # Vector search logic
│   │   ├── embeddings.ts     # Existing
│   │   └── vector-store.ts   # Existing
│   ├── srd/                   # Moved from mcp-server
│   │   ├── abilities/
│   │   ├── adversaries/
│   │   ├── ancestries/
│   │   ├── armor/
│   │   ├── classes/
│   │   ├── communities/
│   │   ├── domains/
│   │   ├── subclasses/
│   │   └── weapons/
│   ├── data/
│   │   └── embeddings.db
│   └── package.json
│
├── web/                       # Vercel deployment
│   ├── app/
│   │   ├── api/
│   │   │   └── chat/route.ts # Anthropic + tool handling
│   │   ├── page.tsx
│   │   └── layout.tsx
│   ├── lib/
│   │   ├── anthropic.ts      # Anthropic client setup
│   │   ├── auth.ts           # Password validation
│   │   └── prompts.ts        # System prompt
│   └── components/           # Existing UI components
│
└── skills/                    # Keep for Claude Code usage
```

## Server Tools (MCP + REST)

### Direct Lookup Tools (read markdown files)

| Tool | REST Endpoint | Description |
|------|---------------|-------------|
| `list_classes` | `GET /api/classes` | List all 9 classes |
| `get_class` | `GET /api/classes/:name` | Get class details |
| `list_subclasses` | `GET /api/subclasses` | List all subclasses |
| `get_subclass` | `GET /api/subclasses/:name` | Get subclass features |
| `list_ancestries` | `GET /api/ancestries` | List all ancestries |
| `get_ancestry` | `GET /api/ancestries/:name` | Get ancestry features |
| `list_communities` | `GET /api/communities` | List all communities |
| `get_community` | `GET /api/communities/:name` | Get community feature |
| `list_domains` | `GET /api/domains` | List all domains |
| `get_domain` | `GET /api/domains/:name` | Get domain details |
| `list_armor` | `GET /api/armor` | List all armor |
| `get_armor` | `GET /api/armor/:name` | Get armor stats |
| `list_weapons` | `GET /api/weapons` | List all weapons |
| `get_weapon` | `GET /api/weapons/:name` | Get weapon stats |

### Search Tool (uses SQLite embeddings)

| Tool | REST Endpoint | Description |
|------|---------------|-------------|
| `search_rules` | `POST /api/search` | Semantic search across all rules |

## Authentication

Simple URL password approach:

- URL: `yoursite.com?password=veryCOMPLEXpA55W0Rd123`
- Password stored in `ACCESS_PASSWORD` env var
- Client stores password in sessionStorage after access gate
- Sent with each chat API request

```typescript
// web/lib/auth.ts
export function validatePassword(password: string): boolean {
  return password === process.env.ACCESS_PASSWORD;
}
```

## Web App Chat Flow

```typescript
// app/api/chat/route.ts
export async function POST(req: Request) {
  const { messages, password } = await req.json();

  // 1. Validate password
  if (!validatePassword(password)) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // 2. Call Anthropic with tools
  const response = await anthropic.messages.create({
    model: 'claude-3-5-haiku-latest',
    system: CHARACTER_CREATION_PROMPT,
    messages,
    tools: RULES_TOOLS
  });

  // 3. Handle tool use
  while (response.stop_reason === 'tool_use') {
    const toolUse = response.content.find(c => c.type === 'tool_use');
    const toolResult = await executeToolViaServer(toolUse);
    // Continue conversation with tool result
  }

  return Response.json(response);
}
```

## System Prompt

```
You are a Daggerheart character creation assistant. Guide players step-by-step through creating their character.

## Process
1. **Class** - Present the 9 classes (Bard, Druid, Guardian, Ranger, Rogue, Seraph, Sorcerer, Warrior, Wizard). Use get_class to show details of ones they're interested in.
2. **Subclass** - Once class is chosen, show subclass options using list_subclasses and get_subclass.
3. **Ancestry** - Use list_ancestries and get_ancestry. Mention Mixed Ancestry option.
4. **Community** - Use list_communities and get_community.
5. **Traits** - Help assign +2, +1, +1, +0, +0, -1 across Agility, Strength, Finesse, Instinct, Presence, Knowledge. Suggest based on class.
6. **Equipment** - Use list_weapons, list_armor to show Tier 1 options.
7. **Experiences** - Create 2 phrases (+2 each) representing skills based on their backstory.
8. **Domain Cards** - Use get_domain to show options from their class domains. Pick 2 cards.

## Guidelines
- One step at a time - don't overwhelm
- Use tools to get accurate information
- Be encouraging and help with decisions
- Suggest options but let them choose
- Format responses with markdown for readability
- When presenting options, use numbered lists
```

## Environment Variables

### Server (Railway)
```
OPENAI_API_KEY=...        # For embeddings
PORT=3001
```

### Web (Vercel)
```
ANTHROPIC_API_KEY=...     # For Haiku
ACCESS_PASSWORD=...       # URL password
SERVER_URL=...            # Railway server URL
```

## Claude Desktop Config

```json
{
  "mcpServers": {
    "ttrpg-rules": {
      "url": "https://your-server.railway.app/mcp"
    }
  }
}
```

## Implementation Steps

1. Rename `mcp-server/` to `server/`
2. Refactor server:
   - Extract document reading into `services/documents.ts`
   - Keep search logic in `services/search.ts`
   - Create Express routes in `routes/api.ts`
3. Add MCP Streamable HTTP endpoint using `@modelcontextprotocol/express`
4. Register all tools for both MCP and REST
5. Web app: create `/api/chat` route with Anthropic client
6. Web app: implement tool execution loop (call server REST API)
7. Web app: update access gate to use URL password
8. Web app: add system prompt
9. Web app: wire up chat interface to new API
10. Web app: add attribution footer with DPCGL notice and logo
11. Web app: remove "Daggerheart" from any UI text, titles, headers
12. Deploy server to Railway
13. Deploy web to Vercel
14. Test Claude Desktop MCP connection
