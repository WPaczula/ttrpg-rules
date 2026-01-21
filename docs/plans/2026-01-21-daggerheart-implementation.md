# Daggerheart DM Assistant Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build an MCP server with semantic search over Daggerheart rules and 7 Claude Code skills for DM assistance.

**Architecture:** TypeScript MCP server using SQLite for vector storage, OpenAI embeddings for semantic search, and separate campaign state storage. Skills are markdown files that guide Claude through DM workflows.

**Tech Stack:** TypeScript, @modelcontextprotocol/sdk, better-sqlite3, openai (for embeddings), vitest (testing)

---

## Phase 1: Project Setup

### Task 1: Initialize Node.js project

**Files:**
- Create: `mcp-server/package.json`
- Create: `mcp-server/tsconfig.json`
- Create: `mcp-server/.gitignore`

**Step 1: Create package.json**

```bash
cd D:/AI/daggerheart-ai
mkdir -p mcp-server
cd mcp-server
```

```json
{
  "name": "daggerheart-mcp",
  "version": "0.1.0",
  "description": "MCP server for Daggerheart rules lookup and campaign management",
  "type": "module",
  "main": "dist/index.js",
  "scripts": {
    "build": "tsc",
    "dev": "tsc --watch",
    "test": "vitest",
    "test:run": "vitest run",
    "index-rules": "tsx scripts/index-rules.ts"
  },
  "dependencies": {
    "@modelcontextprotocol/sdk": "^1.0.0",
    "better-sqlite3": "^11.0.0",
    "openai": "^4.0.0"
  },
  "devDependencies": {
    "@types/better-sqlite3": "^7.6.0",
    "@types/node": "^20.0.0",
    "tsx": "^4.0.0",
    "typescript": "^5.0.0",
    "vitest": "^2.0.0"
  }
}
```

**Step 2: Create tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "esModuleInterop": true,
    "strict": true,
    "outDir": "dist",
    "rootDir": "src",
    "declaration": true,
    "skipLibCheck": true
  },
  "include": ["src/**/*", "scripts/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

**Step 3: Create .gitignore**

```
node_modules/
dist/
data/*.db
.env
```

**Step 4: Install dependencies**

```bash
npm install
```

**Step 5: Commit**

```bash
git add mcp-server/
git commit -m "feat: initialize mcp-server project structure"
```

---

## Phase 2: Embeddings Infrastructure

### Task 2: Create embedding utilities

**Files:**
- Create: `mcp-server/src/embeddings.ts`
- Create: `mcp-server/src/embeddings.test.ts`

**Step 1: Write the failing test**

Create `mcp-server/src/embeddings.test.ts`:

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { generateEmbedding, cosineSimilarity } from './embeddings.js';

describe('cosineSimilarity', () => {
  it('returns 1 for identical vectors', () => {
    const vec = [1, 0, 0];
    expect(cosineSimilarity(vec, vec)).toBeCloseTo(1);
  });

  it('returns 0 for orthogonal vectors', () => {
    const a = [1, 0, 0];
    const b = [0, 1, 0];
    expect(cosineSimilarity(a, b)).toBeCloseTo(0);
  });

  it('returns -1 for opposite vectors', () => {
    const a = [1, 0, 0];
    const b = [-1, 0, 0];
    expect(cosineSimilarity(a, b)).toBeCloseTo(-1);
  });
});
```

**Step 2: Run test to verify it fails**

```bash
cd D:/AI/daggerheart-ai/mcp-server
npm run test:run
```

Expected: FAIL with "Cannot find module './embeddings.js'"

**Step 3: Write minimal implementation**

Create `mcp-server/src/embeddings.ts`:

```typescript
import OpenAI from 'openai';

const openai = new OpenAI();

export async function generateEmbedding(text: string): Promise<number[]> {
  const response = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: text,
  });
  return response.data[0].embedding;
}

export function cosineSimilarity(a: number[], b: number[]): number {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}
```

**Step 4: Run test to verify it passes**

```bash
npm run test:run
```

Expected: PASS

**Step 5: Commit**

```bash
git add mcp-server/src/embeddings.ts mcp-server/src/embeddings.test.ts
git commit -m "feat: add embedding utilities with cosine similarity"
```

---

### Task 3: Create SQLite vector store

**Files:**
- Create: `mcp-server/src/vector-store.ts`
- Create: `mcp-server/src/vector-store.test.ts`

**Step 1: Write the failing test**

Create `mcp-server/src/vector-store.test.ts`:

```typescript
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { VectorStore } from './vector-store.js';
import { unlinkSync, existsSync } from 'fs';

const TEST_DB = 'data/test-vectors.db';

describe('VectorStore', () => {
  let store: VectorStore;

  beforeEach(() => {
    store = new VectorStore(TEST_DB);
  });

  afterEach(() => {
    store.close();
    if (existsSync(TEST_DB)) unlinkSync(TEST_DB);
  });

  it('stores and retrieves a document', () => {
    const embedding = [0.1, 0.2, 0.3];
    store.upsert('doc1', 'Test content', 'abilities', embedding);

    const results = store.search(embedding, 1);
    expect(results).toHaveLength(1);
    expect(results[0].id).toBe('doc1');
    expect(results[0].content).toBe('Test content');
  });

  it('returns similar documents first', () => {
    store.upsert('doc1', 'First', 'abilities', [1, 0, 0]);
    store.upsert('doc2', 'Second', 'abilities', [0, 1, 0]);
    store.upsert('doc3', 'Third', 'abilities', [0.9, 0.1, 0]);

    const results = store.search([1, 0, 0], 2);
    expect(results[0].id).toBe('doc1');
    expect(results[1].id).toBe('doc3');
  });
});
```

**Step 2: Run test to verify it fails**

```bash
npm run test:run
```

Expected: FAIL with "Cannot find module './vector-store.js'"

**Step 3: Write minimal implementation**

Create `mcp-server/src/vector-store.ts`:

```typescript
import Database from 'better-sqlite3';
import { cosineSimilarity } from './embeddings.js';
import { mkdirSync } from 'fs';
import { dirname } from 'path';

export interface SearchResult {
  id: string;
  content: string;
  category: string;
  similarity: number;
}

export class VectorStore {
  private db: Database.Database;

  constructor(dbPath: string) {
    mkdirSync(dirname(dbPath), { recursive: true });
    this.db = new Database(dbPath);
    this.init();
  }

  private init() {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS documents (
        id TEXT PRIMARY KEY,
        content TEXT NOT NULL,
        category TEXT NOT NULL,
        embedding BLOB NOT NULL
      )
    `);
  }

  upsert(id: string, content: string, category: string, embedding: number[]) {
    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO documents (id, content, category, embedding)
      VALUES (?, ?, ?, ?)
    `);
    stmt.run(id, content, category, Buffer.from(new Float32Array(embedding).buffer));
  }

  search(queryEmbedding: number[], limit: number, category?: string): SearchResult[] {
    let query = 'SELECT id, content, category, embedding FROM documents';
    const params: unknown[] = [];

    if (category) {
      query += ' WHERE category = ?';
      params.push(category);
    }

    const rows = this.db.prepare(query).all(...params) as Array<{
      id: string;
      content: string;
      category: string;
      embedding: Buffer;
    }>;

    const results = rows.map(row => {
      const embedding = Array.from(new Float32Array(row.embedding.buffer, row.embedding.byteOffset, row.embedding.length / 4));
      return {
        id: row.id,
        content: row.content,
        category: row.category,
        similarity: cosineSimilarity(queryEmbedding, embedding),
      };
    });

    return results
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit);
  }

  getById(id: string): { content: string; category: string } | null {
    const row = this.db.prepare('SELECT content, category FROM documents WHERE id = ?').get(id) as { content: string; category: string } | undefined;
    return row ?? null;
  }

  listByCategory(category: string): Array<{ id: string; content: string }> {
    return this.db.prepare('SELECT id, content FROM documents WHERE category = ?').all(category) as Array<{ id: string; content: string }>;
  }

  close() {
    this.db.close();
  }
}
```

**Step 4: Run test to verify it passes**

```bash
npm run test:run
```

Expected: PASS

**Step 5: Commit**

```bash
git add mcp-server/src/vector-store.ts mcp-server/src/vector-store.test.ts
git commit -m "feat: add SQLite vector store for document storage and search"
```

---

### Task 4: Create rules indexing script

**Files:**
- Create: `mcp-server/scripts/index-rules.ts`

**Step 1: Write the indexing script**

Create `mcp-server/scripts/index-rules.ts`:

```typescript
import { readdir, readFile } from 'fs/promises';
import { join, relative } from 'path';
import { VectorStore } from '../src/vector-store.js';
import { generateEmbedding } from '../src/embeddings.js';

const SRD_PATH = 'D:/AI/daggerheart/srd';
const DB_PATH = 'data/embeddings.db';

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

function getCategoryFromPath(filePath: string): string {
  const rel = relative(SRD_PATH, filePath);
  const parts = rel.split(/[/\\]/);
  return parts[0]; // First directory is the category
}

async function main() {
  console.log('Starting rules indexing...');

  const store = new VectorStore(DB_PATH);
  const files = await getAllMdFiles(SRD_PATH);

  console.log(`Found ${files.length} markdown files`);

  let indexed = 0;
  for (const filePath of files) {
    const content = await readFile(filePath, 'utf-8');
    const category = getCategoryFromPath(filePath);
    const id = relative(SRD_PATH, filePath).replace(/\\/g, '/');

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

main().catch(console.error);
```

**Step 2: Create data directory**

```bash
mkdir -p mcp-server/data
```

**Step 3: Commit**

```bash
git add mcp-server/scripts/index-rules.ts
git commit -m "feat: add rules indexing script for embedding generation"
```

---

## Phase 3: MCP Server

### Task 5: Create MCP server entry point

**Files:**
- Create: `mcp-server/src/index.ts`

**Step 1: Write the MCP server**

Create `mcp-server/src/index.ts`:

```typescript
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { VectorStore } from './vector-store.js';
import { generateEmbedding } from './embeddings.js';

const DB_PATH = 'data/embeddings.db';

const server = new Server(
  { name: 'daggerheart-mcp', version: '0.1.0' },
  { capabilities: { tools: {} } }
);

let store: VectorStore;

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: 'search_rules',
      description: 'Search Daggerheart rules by semantic meaning. Use this to find rules about combat, abilities, character creation, etc.',
      inputSchema: {
        type: 'object',
        properties: {
          query: { type: 'string', description: 'What to search for' },
          limit: { type: 'number', description: 'Max results (default 5)' },
          category: { type: 'string', description: 'Filter by category: abilities, adversaries, ancestries, armor, classes, communities, consumables, contents, domains, environments, frames, items, subclasses, weapons' },
        },
        required: ['query'],
      },
    },
    {
      name: 'get_adversary',
      description: 'Get a specific adversary/monster by name',
      inputSchema: {
        type: 'object',
        properties: {
          name: { type: 'string', description: 'Adversary name' },
        },
        required: ['name'],
      },
    },
    {
      name: 'get_ability',
      description: 'Get a specific ability by name',
      inputSchema: {
        type: 'object',
        properties: {
          name: { type: 'string', description: 'Ability name' },
        },
        required: ['name'],
      },
    },
    {
      name: 'list_adversaries',
      description: 'List all adversaries, optionally filtered by tier',
      inputSchema: {
        type: 'object',
        properties: {
          tier: { type: 'string', description: 'Filter by tier (e.g., "Tier 1", "Tier 2")' },
        },
      },
    },
    {
      name: 'list_abilities',
      description: 'List all abilities, optionally filtered by class or domain',
      inputSchema: {
        type: 'object',
        properties: {
          filter: { type: 'string', description: 'Filter text to match in ability content' },
        },
      },
    },
  ],
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  switch (name) {
    case 'search_rules': {
      const { query, limit = 5, category } = args as { query: string; limit?: number; category?: string };
      const embedding = await generateEmbedding(query);
      const results = store.search(embedding, limit, category);
      return {
        content: [{ type: 'text', text: results.map(r => `## ${r.id}\n\n${r.content}`).join('\n\n---\n\n') }],
      };
    }

    case 'get_adversary': {
      const { name: advName } = args as { name: string };
      const fileName = `adversaries/${advName}.md`;
      const doc = store.getById(fileName);
      if (!doc) {
        return { content: [{ type: 'text', text: `Adversary "${advName}" not found. Try search_rules to find it.` }] };
      }
      return { content: [{ type: 'text', text: doc.content }] };
    }

    case 'get_ability': {
      const { name: abilityName } = args as { name: string };
      const fileName = `abilities/${abilityName}.md`;
      const doc = store.getById(fileName);
      if (!doc) {
        return { content: [{ type: 'text', text: `Ability "${abilityName}" not found. Try search_rules to find it.` }] };
      }
      return { content: [{ type: 'text', text: doc.content }] };
    }

    case 'list_adversaries': {
      const { tier } = args as { tier?: string };
      const adversaries = store.listByCategory('adversaries');
      let filtered = adversaries;
      if (tier) {
        filtered = adversaries.filter(a => a.content.includes(tier));
      }
      const names = filtered.map(a => {
        const match = a.content.match(/^#\s*(.+)/m);
        return match ? match[1] : a.id;
      });
      return { content: [{ type: 'text', text: names.join('\n') }] };
    }

    case 'list_abilities': {
      const { filter } = args as { filter?: string };
      const abilities = store.listByCategory('abilities');
      let filtered = abilities;
      if (filter) {
        filtered = abilities.filter(a => a.content.toLowerCase().includes(filter.toLowerCase()));
      }
      const names = filtered.map(a => {
        const match = a.content.match(/^#\s*(.+)/m);
        return match ? match[1] : a.id;
      });
      return { content: [{ type: 'text', text: names.join('\n') }] };
    }

    default:
      throw new Error(`Unknown tool: ${name}`);
  }
});

async function main() {
  store = new VectorStore(DB_PATH);
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Daggerheart MCP server running');
}

main().catch(console.error);
```

**Step 2: Build and verify**

```bash
npm run build
```

Expected: Compiles without errors

**Step 3: Commit**

```bash
git add mcp-server/src/index.ts
git commit -m "feat: add MCP server with rules search tools"
```

---

## Phase 4: Skills

### Task 6: Create campaign concept skill

**Files:**
- Create: `skills/daggerheart-campaign.md`

**Step 1: Write the skill**

Create `skills/daggerheart-campaign.md`:

```markdown
# Daggerheart Campaign Creation

Help a DM create a campaign concept for Daggerheart.

## Process

Work through these steps one at a time, asking questions and brainstorming collaboratively.

### Step 1: Tone and Theme

Ask the DM about the desired tone:
- **Heroic** - Players are clear heroes fighting evil
- **Gritty** - Morally grey, survival-focused
- **Whimsical** - Lighthearted, comedic moments welcome
- **Dark** - Horror elements, high stakes, loss is real

Also ask about themes they want to explore (revenge, redemption, found family, power, etc.)

### Step 2: Setting

Ask about the world:
- **Classic fantasy** - Medieval kingdoms, magic is known
- **Urban** - City-focused, intrigue and factions
- **Wilderness** - Exploration, survival, frontier
- **Unique twist** - What makes this world different?

Use `search_rules` to pull relevant environment types from the Daggerheart SRD.

### Step 3: Central Conflict

Brainstorm 2-3 central conflict ideas based on their tone and setting choices. For each:
- Who or what is the threat?
- What do they want?
- Why now?
- What happens if the heroes fail?

Let the DM choose or combine elements.

### Step 4: Main Villain

Develop the main antagonist:
- Name and title
- Motivation (not just "evil")
- Methods and resources
- Connection to the world
- Potential for the players to understand (even if not agree with)

Use `list_adversaries` to suggest creature types that could serve the villain.

### Step 5: Factions and Locations

Identify 3-5 key factions or locations:
- Who are the major players?
- Where are the important places?
- How do they connect to the conflict?

### Output

Create a campaign pitch document with:
- **Title**: Campaign name
- **Tone**: 1-2 words
- **Setting**: Brief world description
- **The Threat**: Central conflict summary
- **The Villain**: Antagonist overview
- **Key Factions**: Bullet list
- **Key Locations**: Bullet list
- **Campaign Hook**: How the players get involved

Save to `campaign/concept.md` in the project directory.
```

**Step 2: Commit**

```bash
git add skills/daggerheart-campaign.md
git commit -m "feat: add campaign creation skill"
```

---

### Task 7: Create session zero skill

**Files:**
- Create: `skills/daggerheart-session-zero.md`

**Step 1: Write the skill**

Create `skills/daggerheart-session-zero.md`:

```markdown
# Daggerheart Session Zero

Guide a DM through running session zero with their players.

## Prerequisites

Read `campaign/concept.md` to understand the campaign setup.

## Process

### Step 1: Safety Tools

Remind the DM to establish:
- **Lines** - Topics completely off the table
- **Veils** - Topics that happen "off-screen"
- **X-Card** - Anyone can pause play if uncomfortable
- **Open Door** - Players can step away anytime

Ask if they want help explaining these to players.

### Step 2: Table Expectations

Discuss and document:
- Session frequency and length
- Attendance expectations
- Communication preferences
- PvP rules (allowed? With consent?)
- Character death handling
- Tone reinforcement (reference campaign concept)

### Step 3: Character Creation Coordination

Guide the group through:
1. Share the campaign pitch
2. Discuss what roles the party might need
3. Have players make characters (use `/daggerheart-character` skill)
4. Ensure mechanical variety (not all same class)

Use `search_rules` for "Character Creation" to reference the process.

### Step 4: Weaving Backstories

For each character's background:
- How do they connect to the setting?
- Do they have ties to any factions?
- What brings them into the story?
- How do they know other PCs?

Look for opportunities to tie backstories to the campaign conflict.

### Step 5: Starting Situation

Help the DM establish:
- Where do the characters meet?
- What brings them together?
- What's the first hook?

### Output

Create a session zero summary with:
- **Safety Tools Established**: List
- **Table Expectations**: Key agreements
- **Party Composition**: Characters and players
- **Backstory Connections**: How each character ties in
- **Starting Situation**: Where session 1 begins

Save to `campaign/session-zero.md`.
```

**Step 2: Commit**

```bash
git add skills/daggerheart-session-zero.md
git commit -m "feat: add session zero skill"
```

---

### Task 8: Create adventure arc skill

**Files:**
- Create: `skills/daggerheart-arc.md`

**Step 1: Write the skill**

Create `skills/daggerheart-arc.md`:

```markdown
# Daggerheart Adventure Arc

Help a DM plan a story arc within their campaign.

## Prerequisites

Read `campaign/concept.md` for campaign context.
Read any existing arc files in `campaign/arcs/`.

## Process

### Step 1: Arc Goal

Ask what this arc should accomplish:
- Introduce a new threat or faction
- Advance the main villain's plan
- Resolve a character's backstory thread
- Explore a new location
- Acquire something important
- Build relationships with NPCs

### Step 2: Arc Structure

Plan 3-5 sessions worth of content:
- **Opening Hook**: What draws players in?
- **Rising Action**: 2-3 challenges or discoveries
- **Climax**: The big confrontation or choice
- **Resolution**: Consequences and setup for next arc

### Step 3: Key Scenes

For each major scene:
- What happens?
- What's the conflict?
- What can players learn or gain?
- What are the stakes?

### Step 4: Adversaries

Use `search_rules` and `list_adversaries` to find appropriate enemies.

For each encounter:
- Which adversaries fit thematically?
- What tier is appropriate for the party level?
- What makes this fight interesting (terrain, objectives, time pressure)?

### Step 5: Decision Points

Identify 2-3 moments where player choice matters:
- What are the options?
- What are consequences of each path?
- How do choices affect the larger campaign?

### Output

Create an arc document with:
- **Arc Title**: Name
- **Goal**: What this arc accomplishes
- **Sessions**: Estimated count
- **Opening**: How it begins
- **Key Scenes**: Bullet list with brief descriptions
- **Adversaries**: Which monsters/enemies appear
- **Decision Points**: Major choices and consequences
- **Resolution Options**: How it might end

Save to `campaign/arcs/arc-N-title.md`.
```

**Step 2: Commit**

```bash
git add skills/daggerheart-arc.md
git commit -m "feat: add adventure arc planning skill"
```

---

### Task 9: Create session prep skill

**Files:**
- Create: `skills/daggerheart-session.md`

**Step 1: Write the skill**

Create `skills/daggerheart-session.md`:

```markdown
# Daggerheart Session Prep

Help a DM prepare for an individual session.

## Prerequisites

Read `campaign/concept.md` for context.
Read the current arc file if one exists.
Read `campaign/sessions/` for previous session notes.

## Process

### Step 1: Recap

Summarize where last session ended:
- What happened?
- What threads are open?
- What did players say they wanted to do?

### Step 2: Expected Player Actions

Ask the DM:
- Where do you think players will go?
- What do you think they'll try?
- Any character moments likely to come up?

### Step 3: Scene Planning

Plan 2-4 scenes for the session:
- **Scene 1**: Opening - pick up from last session
- **Scene 2-3**: Main content - exploration, roleplay, combat
- **Scene 4**: Closing hook - end on something compelling

For each scene:
- Location
- NPCs present
- Potential conflicts
- Information players might learn

### Step 4: Encounters

For any combat encounters:
- Use `get_adversary` to pull stat blocks
- Note terrain features
- Identify adversary tactics
- Set difficulty appropriate to drama (not every fight is deadly)

### Step 5: Contingencies

Plan for likely deviations:
- "If they ignore the hook..."
- "If they go to the other location..."
- "If they try to fight the NPC..."

### Output

Create a session prep document with:
- **Session Number**: N
- **Date**: When you're playing
- **Recap**: Last session summary
- **Planned Scenes**: Brief descriptions
- **Stat Blocks**: Any needed adversary stats
- **NPCs**: Names, brief descriptions, voices/mannerisms
- **Contingencies**: If-then plans
- **Closing Hook Ideas**: Ways to end on a cliffhanger

Save to `campaign/sessions/session-N-prep.md`.
```

**Step 2: Commit**

```bash
git add skills/daggerheart-session.md
git commit -m "feat: add session prep skill"
```

---

### Task 10: Create quick help skill

**Files:**
- Create: `skills/daggerheart-help.md`

**Step 1: Write the skill**

Create `skills/daggerheart-help.md`:

```markdown
# Daggerheart Quick Help

Provide immediate assistance during play. Give short, actionable answers.

## Usage

The DM describes a situation they need help with. Respond concisely.

## Common Situations

### Rule Questions

Use `search_rules` to find the relevant rule. Quote the specific text, then explain briefly.

### Monster Tactics

When asked "what should this monster do?":
1. Read the adversary's Motives & Tactics line
2. Consider the battlefield situation
3. Suggest a specific action that's tactically interesting

Example response:
> "The Acid Burrower's tactics are 'burrow, drag away, feed, reposition.' It should use Earth Eruption to knock players prone, then drag the most isolated target underground. Next turn it bursts up somewhere unexpected."

### Improvised NPCs

When asked for a quick NPC:
- Give a name
- One physical trait
- One personality trait
- One want or need

Example:
> "Mira Thornwood - weathered hands, speaks too fast, desperately needs the party to deliver a package before sunset."

### Unexpected Player Actions

When players do something unexpected:
1. Don't say no
2. Determine what roll (if any) makes sense
3. Suggest interesting consequences for success and failure

Example:
> "They want to intimidate the dragon? Bold. Have them roll Presence. On success, the dragon is amused and grants them one question. On failure with Fear, the dragon decides they're worth toying with first."

### Pacing Help

If the DM says things feel slow:
- Suggest a complication (someone arrives, something breaks, time runs out)
- Skip to the next interesting moment
- Have an NPC push the action forward

## Response Format

Keep answers under 100 words when possible. This is mid-game help, not planning.
```

**Step 2: Commit**

```bash
git add skills/daggerheart-help.md
git commit -m "feat: add quick help skill for mid-session assistance"
```

---

### Task 11: Create character creation skill

**Files:**
- Create: `skills/daggerheart-character.md`

**Step 1: Write the skill**

Create `skills/daggerheart-character.md`:

```markdown
# Daggerheart Character Creation

Walk a player through creating a Daggerheart character.

## Process

Use `search_rules` with "Character Creation" to reference the official steps.

### Step 1: Class and Subclass

Present the 9 classes with brief descriptions:
- **Bard** - Charismatic performer, support and social
- **Druid** - Nature magic, shapeshifting
- **Guardian** - Armored protector, defensive
- **Ranger** - Wilderness expert, ranged combat
- **Rogue** - Stealthy, cunning, precision
- **Seraph** - Divine warrior, healing and smiting
- **Sorcerer** - Raw arcane power, elemental magic
- **Warrior** - Martial combat, straightforward damage
- **Wizard** - Studied magic, versatile spells

When they choose, use `search_rules` to get that class's details and explain:
- Starting Evasion and HP
- Class feature
- Domain access
- Subclass options

### Step 2: Ancestry

Present ancestry options using `search_rules` for "ancestries".

Explain that each ancestry gives:
- Physical traits
- Two ancestry features

Mention Mixed Ancestry option.

### Step 3: Community

Present community options using `search_rules` for "communities".

Each community represents cultural background and grants one feature.

### Step 4: Traits

Explain the six traits:
- Agility, Strength, Finesse, Instinct, Presence, Knowledge

Have them assign: +2, +1, +1, +0, +0, -1

Suggest trait assignments based on their class.

### Step 5: Equipment

Use `search_rules` for "Weapons" and "Armor" to show Tier 1 options.

Help them choose:
- Two-handed primary OR one-handed primary + secondary
- One set of armor
- Starting items

### Step 6: Background and Experiences

Use their class's background questions as prompts.

Help them create two Experiences (+2 each) - words or phrases representing skills/traits.

### Step 7: Domain Cards

Explain their class's two domains.

Use `search_rules` to find domain card options.

Help them pick 2 cards (can be from same domain or split).

### Output

Create a character summary with all mechanical details and background notes.

Save to `campaign/characters/character-name.md`.
```

**Step 2: Commit**

```bash
git add skills/daggerheart-character.md
git commit -m "feat: add character creation skill"
```

---

### Task 12: Create process session skill

**Files:**
- Create: `skills/daggerheart-process-session.md`

**Step 1: Write the skill**

Create `skills/daggerheart-process-session.md`:

```markdown
# Daggerheart Process Session

Process session notes or transcripts into structured campaign data.

## Input

The DM provides either:
- A transcript of the session
- Their own notes about what happened

## Process

### Step 1: Extract Events

Identify key events:
- Major story beats
- Combat encounters and outcomes
- Important NPC interactions
- Player decisions and their consequences
- Items acquired or lost
- Locations visited

### Step 2: Identify Entities

Find new or updated entities:
- **NPCs**: Name, description, relationship to party
- **Locations**: Name, description, significance
- **Items**: Name, properties, who has it
- **Plot Threads**: Open questions, unresolved conflicts

### Step 3: Track Character Changes

Note any changes to PCs:
- HP/Stress changes that carried over
- New abilities or items
- Relationship changes
- Character development moments

### Step 4: Generate Summaries

Create three levels of summary:

**One-liner** (for campaign overview):
> "The party discovered the temple and learned the villain's true identity."

**Paragraph** (for arc summary):
> "Session 3 saw the party navigate the Thornwood ruins, defeating a pack of shadow wolves before discovering the hidden temple entrance. Inside, they found evidence linking Lord Vance to the disappearances. Mira was captured but the party rescued her, earning her loyalty."

**Detailed notes** (for recent history):
Full event-by-event breakdown with NPC names, specific locations, exact items, and quotes worth remembering.

### Output

Create/update:
- `campaign/sessions/session-N-summary.md` - Detailed notes
- Update `campaign/overview.md` - Add one-liner
- Update relevant arc file - Add paragraph
- Update `campaign/entities/npcs.md` - New/changed NPCs
- Update `campaign/entities/locations.md` - New/changed locations
- Update `campaign/entities/threads.md` - Plot threads
```

**Step 2: Commit**

```bash
git add skills/daggerheart-process-session.md
git commit -m "feat: add process session skill for post-game summarization"
```

---

## Phase 5: Integration and Testing

### Task 13: Create Claude Code MCP configuration

**Files:**
- Create: `README.md`

**Step 1: Write README with setup instructions**

Create `README.md` in project root:

```markdown
# Daggerheart AI

DM assistant for Daggerheart TTRPG, built as a Claude Code MCP server with skills.

## Setup

### 1. Install dependencies

```bash
cd mcp-server
npm install
```

### 2. Set OpenAI API key

```bash
export OPENAI_API_KEY=your-key-here
```

### 3. Index the rules

Point the indexer at your Daggerheart SRD files:

```bash
npm run index-rules
```

This creates `data/embeddings.db` with searchable rules content.

### 4. Build the server

```bash
npm run build
```

### 5. Configure Claude Code

Add to your Claude Code MCP settings:

```json
{
  "mcpServers": {
    "daggerheart": {
      "command": "node",
      "args": ["D:/AI/daggerheart-ai/mcp-server/dist/index.js"],
      "env": {
        "OPENAI_API_KEY": "your-key-here"
      }
    }
  }
}
```

### 6. Install skills

Copy the skills to your Claude Code skills directory:

```bash
cp -r skills/* ~/.claude/skills/
```

## Usage

### MCP Tools

- `search_rules` - Semantic search across all Daggerheart content
- `get_adversary` - Get a specific monster
- `get_ability` - Get a specific ability
- `list_adversaries` - List monsters by tier
- `list_abilities` - List abilities by class/domain

### Skills

- `/daggerheart-campaign` - Create campaign concept
- `/daggerheart-session-zero` - Run session zero
- `/daggerheart-arc` - Plan adventure arc
- `/daggerheart-session` - Prep individual session
- `/daggerheart-help` - Quick help during play
- `/daggerheart-character` - Character creation
- `/daggerheart-process-session` - Process session notes

## Project Structure

```
daggerheart-ai/
  mcp-server/         # MCP server code
    src/              # TypeScript source
    data/             # SQLite databases
    scripts/          # Indexing scripts
  skills/             # Claude Code skills
  campaign/           # Your campaign data (created by skills)
  docs/               # Documentation
```
```

**Step 2: Commit**

```bash
git add README.md
git commit -m "docs: add README with setup and usage instructions"
```

---

### Task 14: Test end-to-end

**Step 1: Build and index**

```bash
cd D:/AI/daggerheart-ai/mcp-server
npm run build
npm run index-rules
```

**Step 2: Verify database created**

```bash
ls -la data/
```

Expected: `embeddings.db` file exists

**Step 3: Test MCP server starts**

```bash
echo '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"capabilities":{}}}' | node dist/index.js
```

Expected: JSON response with server capabilities

**Step 4: Commit any fixes**

If any issues found, fix and commit.

---

## Summary

**Total Tasks:** 14

**Phase 1 (Setup):** 1 task
**Phase 2 (Embeddings):** 3 tasks
**Phase 3 (MCP Server):** 1 task
**Phase 4 (Skills):** 7 tasks
**Phase 5 (Integration):** 2 tasks

**Files Created:**
- `mcp-server/package.json`
- `mcp-server/tsconfig.json`
- `mcp-server/.gitignore`
- `mcp-server/src/embeddings.ts`
- `mcp-server/src/embeddings.test.ts`
- `mcp-server/src/vector-store.ts`
- `mcp-server/src/vector-store.test.ts`
- `mcp-server/src/index.ts`
- `mcp-server/scripts/index-rules.ts`
- `skills/daggerheart-campaign.md`
- `skills/daggerheart-session-zero.md`
- `skills/daggerheart-arc.md`
- `skills/daggerheart-session.md`
- `skills/daggerheart-help.md`
- `skills/daggerheart-character.md`
- `skills/daggerheart-process-session.md`
- `README.md`
