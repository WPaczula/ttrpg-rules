# Multi-Game SRD Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add D&D Starter Set support alongside Daggerheart, with game-switching tabs in the web app and namespaced API routes.

**Architecture:** Two isolated SRD directories and embedding databases. Server API routes namespaced by game (`/api/daggerheart/...`, `/api/dnd/...`). Web app uses a tab bar to switch between games, each with its own chat history and system prompt.

**Tech Stack:** Node.js/Express (server), Next.js/React (web), SQLite (embeddings), OpenAI embeddings API, Vercel AI SDK.

---

### Task 1: Rename `server/srd/` to `server/daggerheart-srd/`

**Files:**
- Rename: `server/srd/` → `server/daggerheart-srd/`
- Modify: `server/src/services/documents.ts:6`
- Modify: `server/scripts/index-rules.ts:6`

**Step 1: Rename directory**

```bash
cd D:/AI/daggerheart-ai
git mv server/srd server/daggerheart-srd
```

**Step 2: Update documents.ts SRD_PATH**

In `server/src/services/documents.ts`, change line 6:

```typescript
// Before:
const SRD_PATH = join(__dirname, '..', '..', 'srd');
// After:
const SRD_PATH = join(__dirname, '..', '..', 'daggerheart-srd');
```

**Step 3: Update index-rules.ts SRD_PATH**

In `server/scripts/index-rules.ts`, change line 6:

```typescript
// Before:
const SRD_PATH = 'D:/AI/daggerheart/srd';
// After — we'll make this dynamic in Task 3, for now just fix the path:
const SRD_PATH = 'D:/AI/daggerheart/srd';
```

Note: This path points to the source SRD outside the repo. Leave it as-is for now; Task 3 will rework the indexing script entirely.

**Step 4: Commit**

```bash
git add -A && git commit -m "refactor: rename srd/ to daggerheart-srd/"
```

---

### Task 2: Rename embeddings DB

**Files:**
- Modify: `server/src/index.ts:21`
- Modify: `server/src/routes/api.ts` (receives dbPath from index.ts, no change needed)

**Step 1: Update DB_PATH in index.ts**

In `server/src/index.ts`, change line 21:

```typescript
// Before:
const DB_PATH = join(__dirname, '..', 'data', 'embeddings.db');
// After:
const DAGGERHEART_DB = join(__dirname, '..', 'data', 'daggerheart-embeddings.db');
```

Also update line 25 and 33 to use `DAGGERHEART_DB` instead of `DB_PATH`:

```typescript
const searchService = new SearchService(DAGGERHEART_DB);
// ...
app.use('/api', createApiRouter(DAGGERHEART_DB));
```

**Step 2: Rename the actual DB file**

```bash
cd D:/AI/daggerheart-ai/server
mv data/embeddings.db data/daggerheart-embeddings.db
```

**Step 3: Commit**

```bash
git add -A && git commit -m "refactor: rename embeddings.db to daggerheart-embeddings.db"
```

---

### Task 3: Add `--game` flag to indexing script with D&D chunking

**Files:**
- Modify: `server/scripts/index-rules.ts`

**Step 1: Rewrite index-rules.ts**

Replace the entire file with:

```typescript
import { readdir, readFile } from 'fs/promises';
import { join, relative } from 'path';
import { VectorStore } from '../src/vector-store.js';
import { generateEmbedding } from '../src/embeddings.js';

const GAMES: Record<string, { srdPath: string; dbPath: string }> = {
  daggerheart: {
    srdPath: 'D:/AI/daggerheart/srd',
    dbPath: 'data/daggerheart-embeddings.db',
  },
  dnd: {
    srdPath: join('dnd-srd'),
    dbPath: 'data/dnd-embeddings.db',
  },
};

async function getAllMdFiles(dir: string): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...await getAllMdFiles(fullPath));
    } else if (entry.name.endsWith('.md')) {
      files.push(fullPath);
    }
  }

  return files;
}

function getCategoryFromPath(basePath: string, filePath: string): string {
  const rel = relative(basePath, filePath);
  const parts = rel.split(/[/\\]/);
  return parts.length > 1 ? parts[0] : 'rules';
}

function chunkByHeading(content: string): Array<{ id: string; text: string }> {
  const chunks: Array<{ id: string; text: string }> = [];
  const lines = content.split('\n');
  let currentHeading = 'introduction';
  let currentLines: string[] = [];

  for (const line of lines) {
    const match = line.match(/^##\s+(.+)/);
    if (match) {
      if (currentLines.length > 0) {
        const text = currentLines.join('\n').trim();
        if (text) {
          chunks.push({ id: currentHeading, text });
        }
      }
      currentHeading = match[1].toLowerCase().replace(/[^a-z0-9]+/g, '-');
      currentLines = [line];
    } else {
      currentLines.push(line);
    }
  }

  // Last chunk
  if (currentLines.length > 0) {
    const text = currentLines.join('\n').trim();
    if (text) {
      chunks.push({ id: currentHeading, text });
    }
  }

  return chunks;
}

async function indexDaggerheart(config: { srdPath: string; dbPath: string }) {
  const store = new VectorStore(config.dbPath);
  const files = await getAllMdFiles(config.srdPath);

  console.log(`Found ${files.length} markdown files`);

  let indexed = 0;
  for (const filePath of files) {
    const content = await readFile(filePath, 'utf-8');
    const category = getCategoryFromPath(config.srdPath, filePath);
    const id = relative(config.srdPath, filePath).replace(/\\/g, '/');

    try {
      const embedding = await generateEmbedding(content);
      store.upsert(id, content, category, embedding);
      indexed++;

      if (indexed % 50 === 0) {
        console.log(`Indexed ${indexed}/${files.length} files...`);
      }
    } catch (error) {
      console.error(`Failed to index ${id}:`, error);
    }
  }

  console.log(`Done! Indexed ${indexed} files.`);
  store.close();
}

async function indexDnd(config: { srdPath: string; dbPath: string }) {
  const store = new VectorStore(config.dbPath);
  const rulesPath = join(config.srdPath, 'rules.md');
  const content = await readFile(rulesPath, 'utf-8');
  const chunks = chunkByHeading(content);

  console.log(`Split rules.md into ${chunks.length} chunks`);

  let indexed = 0;
  for (const chunk of chunks) {
    try {
      const embedding = await generateEmbedding(chunk.text);
      store.upsert(chunk.id, chunk.text, 'rules', embedding);
      indexed++;
    } catch (error) {
      console.error(`Failed to index chunk ${chunk.id}:`, error);
    }
  }

  console.log(`Done! Indexed ${indexed} chunks.`);
  store.close();
}

async function main() {
  const gameArg = process.argv.find(a => a.startsWith('--game='));
  const game = gameArg?.split('=')[1];

  if (!game || !GAMES[game]) {
    console.error(`Usage: --game=daggerheart|dnd`);
    process.exit(1);
  }

  console.log(`Indexing ${game} rules...`);
  const config = GAMES[game];

  if (game === 'dnd') {
    await indexDnd(config);
  } else {
    await indexDaggerheart(config);
  }
}

main().catch(console.error);
```

**Step 2: Test the script compiles**

```bash
cd D:/AI/daggerheart-ai/server && npx tsc --noEmit
```

**Step 3: Commit**

```bash
git add -A && git commit -m "feat: add --game flag to index-rules script with D&D chunking support"
```

---

### Task 4: Namespace server API routes

**Files:**
- Modify: `server/src/routes/api.ts`
- Modify: `server/src/index.ts`

**Step 1: Refactor api.ts to support namespaced routes**

Replace the entire file with:

```typescript
import { Router } from 'express';
import { listDocuments, getDocument } from '../services/documents.js';
import { SearchService } from '../services/search.js';

interface GameDbPaths {
  daggerheart: string;
  dnd: string;
}

export function createApiRouter(dbPaths: GameDbPaths): Router {
  const router = Router();
  const daggerheartSearch = new SearchService(dbPaths.daggerheart);
  const dndSearch = new SearchService(dbPaths.dnd);

  // --- Daggerheart routes ---
  const categories = [
    'classes', 'subclasses', 'ancestries', 'communities',
    'domains', 'armor', 'weapons', 'abilities', 'adversaries'
  ];

  categories.forEach(category => {
    router.get(`/daggerheart/${category}`, (req, res) => {
      const docs = listDocuments(category);
      res.json(docs);
    });

    router.get(`/daggerheart/${category}/:name`, (req, res) => {
      const content = getDocument(category, req.params.name);
      if (!content) {
        return res.status(404).json({ error: `${category.slice(0, -1)} not found` });
      }
      res.json({ content });
    });
  });

  router.post('/daggerheart/search', async (req, res) => {
    try {
      const { query, limit = 5, category } = req.body;
      if (!query) {
        return res.status(400).json({ error: 'query is required' });
      }
      const results = await daggerheartSearch.search(query, limit, category);
      res.json(results);
    } catch (error) {
      console.error('Search error:', error);
      const message = error instanceof Error ? error.message : 'Search failed';
      res.status(500).json({ error: message });
    }
  });

  // --- D&D routes ---
  router.post('/dnd/search', async (req, res) => {
    try {
      const { query, limit = 5 } = req.body;
      if (!query) {
        return res.status(400).json({ error: 'query is required' });
      }
      const results = await dndSearch.search(query, limit);
      res.json(results);
    } catch (error) {
      console.error('Search error:', error);
      const message = error instanceof Error ? error.message : 'Search failed';
      res.status(500).json({ error: message });
    }
  });

  // Health check
  router.get('/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  return router;
}
```

**Step 2: Update index.ts to pass both DB paths**

In `server/src/index.ts`, update the DB path and router setup:

```typescript
// Replace the single DB_PATH with:
const DAGGERHEART_DB = join(__dirname, '..', 'data', 'daggerheart-embeddings.db');
const DND_DB = join(__dirname, '..', 'data', 'dnd-embeddings.db');

// Update searchService (used by MCP tools):
const searchService = new SearchService(DAGGERHEART_DB);

// Update router:
app.use('/api', createApiRouter({ daggerheart: DAGGERHEART_DB, dnd: DND_DB }));
```

**Step 3: Verify compilation**

```bash
cd D:/AI/daggerheart-ai/server && npx tsc --noEmit
```

**Step 4: Commit**

```bash
git add -A && git commit -m "feat: namespace API routes under /api/daggerheart and /api/dnd"
```

---

### Task 5: Update web app tools to use namespaced routes

**Files:**
- Modify: `web/lib/tools.ts`

**Step 1: Update tool URLs to use /api/daggerheart/ prefix**

In `web/lib/tools.ts`:

- Change `createListTool` fetch URL from `` `${serverUrl}/api/${plural}` `` to `` `${serverUrl}/api/daggerheart/${plural}` ``
- Change `createGetTool` fetch URL from `` `${serverUrl}/api/${plural}/${name}` `` to `` `${serverUrl}/api/daggerheart/${plural}/${name}` ``
- Change `search_rules` fetch URL from `` `${serverUrl}/api/search` `` to `` `${serverUrl}/api/daggerheart/search` ``

Also add a D&D search tool:

```typescript
export const dndTools = {
  search_dnd_rules: tool({
    description: 'Search D&D Starter Set rules by semantic meaning.',
    inputSchema: z.object({
      query: z.string().describe('What to search for'),
      limit: z.number().optional().describe('Max results (default 5)'),
    }),
    execute: async ({ query, limit }: { query: string; limit?: number }) => {
      const res = await fetch(`${serverUrl}/api/dnd/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, limit }),
      });
      const data = await res.json();

      if (!res.ok || !Array.isArray(data)) {
        return data.error || 'Search failed';
      }

      return data.map((r: { id: string; content: string }) =>
        `## ${r.id}\n\n${r.content}`
      ).join('\n\n---\n\n');
    },
  }),
};
```

**Step 2: Commit**

```bash
git add -A && git commit -m "feat: update tools to use namespaced API routes, add D&D search tool"
```

---

### Task 6: Add D&D system prompt

**Files:**
- Modify: `web/lib/prompts.ts`

**Step 1: Add DND_PROMPT**

Add to `web/lib/prompts.ts`:

```typescript
export const DND_PROMPT = `You are a friendly D&D Starter Set rules assistant. Help players understand the rules, look up information, and answer questions about D&D.

## Guidelines
- Use the search_dnd_rules tool to find relevant rules before answering
- Be accurate — only reference rules from the Starter Set
- Format responses with markdown for readability
- If you're unsure about something, say so rather than guessing
- Keep responses concise but informative`;
```

**Step 2: Commit**

```bash
git add -A && git commit -m "feat: add D&D system prompt"
```

---

### Task 7: Add game parameter to chat route

**Files:**
- Modify: `web/app/api/chat/route.ts`

**Step 1: Accept game parameter and select tools/prompt accordingly**

Update `web/app/api/chat/route.ts`:

- Import `dndTools` and `DND_PROMPT`
- Extract `game` from request body alongside `messages` and `password`
- Select tools and prompt based on game:

```typescript
import { rulesTools, dndTools } from '@/lib/tools';
import { CHARACTER_CREATION_PROMPT, ROUTING_INSTRUCTIONS, DND_PROMPT } from '@/lib/prompts';

// In POST handler, after parsing body:
const { messages, password, game = 'daggerheart' } = await req.json();

// Select tools and prompt:
const tools = game === 'dnd' ? dndTools : rulesTools;
const systemPrompt = game === 'dnd' ? DND_PROMPT : CHARACTER_CREATION_PROMPT;

// Use in streamText:
const result = streamText({
  model: selectModel(isCreative),
  system: systemPrompt,
  messages: modelMessages,
  tools,
  stopWhen: stepCountIs(5),
});
```

**Step 2: Commit**

```bash
git add -A && git commit -m "feat: chat route selects tools and prompt based on game parameter"
```

---

### Task 8: Add tab bar and game switching to web app

**Files:**
- Modify: `web/components/chat-interface.tsx`
- Modify: `web/app/page.tsx`

**Step 1: Add game state to page.tsx**

Update `web/app/page.tsx`:

```typescript
"use client"

import { useState } from "react"
import { AccessGate } from "@/components/access-gate"
import { ChatInterface } from "@/components/chat-interface"

export type Game = "daggerheart" | "dnd"

export default function Home() {
  const [password, setPassword] = useState<string | null>(null)
  const [game, setGame] = useState<Game>("daggerheart")

  if (!password) {
    return <AccessGate onValidPassword={setPassword} />
  }

  return <ChatInterface password={password} game={game} onGameChange={setGame} />
}
```

**Step 2: Update ChatInterface to support game switching**

Update `web/components/chat-interface.tsx`:

- Add `game` and `onGameChange` props
- Use game-specific storage keys (`daggerheart-chat-messages`, `dnd-chat-messages`)
- Add game-specific welcome messages
- Add tab bar in header
- Pass `game` in the transport body
- Re-initialize chat when game changes

Key changes to `ChatInterface`:

```typescript
import { Game } from "@/app/page"

interface ChatInterfaceProps {
  password: string
  game: Game
  onGameChange: (game: Game) => void
}

const STORAGE_KEYS: Record<Game, string> = {
  daggerheart: "daggerheart-chat-messages",
  dnd: "dnd-chat-messages",
}

const WELCOME_MESSAGES: Record<Game, string> = {
  daggerheart: `# Welcome, Adventurer!

I'm here to help you create your character. Together, we'll craft a hero with a compelling story and abilities that match your vision.

**What kind of character would you like to play?** Tell me about the concept you have in mind, or I can show you the available classes to help you decide!

*Your conversation is saved automatically. Type /clear to start fresh.*`,
  dnd: `# Welcome to D&D!

I'm your D&D Starter Set rules assistant. Ask me anything about the rules, character creation, combat, spells, or any other aspect of the game.

**What would you like to know?**

*Your conversation is saved automatically. Type /clear to start fresh.*`,
}
```

The transport must include `game`:

```typescript
const transport = useMemo(
  () =>
    new DefaultChatTransport({
      api: "/api/chat",
      body: { password, game },
    }),
  [password, game]
)
```

Add tab bar above the messages area (inside the header or just below it):

```tsx
{/* Game Tabs */}
<div className="flex border-b border-border">
  <button
    onClick={() => onGameChange("daggerheart")}
    className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
      game === "daggerheart"
        ? "text-gold border-b-2 border-gold"
        : "text-muted-foreground hover:text-foreground"
    }`}
  >
    Daggerheart
  </button>
  <button
    onClick={() => onGameChange("dnd")}
    className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
      game === "dnd"
        ? "text-gold border-b-2 border-gold"
        : "text-muted-foreground hover:text-foreground"
    }`}
  >
    D&D
  </button>
</div>
```

The `loadMessages` and `saveMessages` functions need to use the game-specific storage key. Since `useChat` takes `messages` as initial value, the component should use `key={game}` to force remount on game change, which re-runs `loadMessages` with the new storage key.

Add `key={game}` on the ChatInterface usage in page.tsx:

```tsx
return <ChatInterface key={game} password={password} game={game} onGameChange={setGame} />
```

Update `loadMessages`, `saveMessages`, `clearMessages` to accept the storage key as parameter.

Update footer to conditionally show D&D or Daggerheart attribution.

**Step 3: Commit**

```bash
git add -A && git commit -m "feat: add game tab bar with per-game chat history and system prompts"
```

---

### Task 9: Build and smoke test

**Step 1: Build server**

```bash
cd D:/AI/daggerheart-ai/server && npx tsc
```

**Step 2: Build web app**

```bash
cd D:/AI/daggerheart-ai/web && npm run build
```

**Step 3: Fix any build errors**

Address compiler/build errors if any.

**Step 4: Commit any fixes**

```bash
git add -A && git commit -m "fix: resolve build errors from multi-game implementation"
```
