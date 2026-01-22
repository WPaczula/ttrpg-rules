# Character Creation Web App - Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a web app with AI-powered character creation chat, backed by a server that exposes both MCP (for Claude Desktop) and REST API (for the web app).

**Architecture:** Express server with Streamable HTTP MCP endpoint + REST API. Vercel-hosted Next.js web app calls Anthropic API with tools that proxy to the server's REST endpoints.

**Tech Stack:** Express, @modelcontextprotocol/sdk, better-sqlite3, OpenAI embeddings, Next.js 16, Anthropic SDK, TypeScript

---

## Phase 1: Server Restructure

### Task 1: Rename mcp-server to server

**Files:**
- Rename: `mcp-server/` → `server/`

**Step 1: Rename the directory**

```bash
cd D:/AI/daggerheart-ai
git mv mcp-server server
```

**Step 2: Update package.json name**

In `server/package.json`, change:
```json
"name": "ttrpg-rules-server"
```

**Step 3: Commit**

```bash
git add -A
git commit -m "refactor: rename mcp-server to server"
```

---

### Task 2: Create documents service for reading markdown files

**Files:**
- Create: `server/src/services/documents.ts`
- Test: `server/src/services/documents.test.ts`

**Step 1: Write the failing test**

```typescript
// server/src/services/documents.test.ts
import { describe, it, expect } from 'vitest';
import { listDocuments, getDocument } from './documents.js';

describe('documents service', () => {
  describe('listDocuments', () => {
    it('lists all classes', () => {
      const classes = listDocuments('classes');
      expect(classes).toContain('Bard');
      expect(classes).toContain('Warrior');
      expect(classes.length).toBe(9);
    });

    it('returns empty array for non-existent category', () => {
      const docs = listDocuments('nonexistent');
      expect(docs).toEqual([]);
    });
  });

  describe('getDocument', () => {
    it('returns content for existing document', () => {
      const content = getDocument('classes', 'Bard');
      expect(content).toContain('# BARD');
      expect(content).toContain('Grace');
    });

    it('returns null for non-existent document', () => {
      const content = getDocument('classes', 'NonExistent');
      expect(content).toBeNull();
    });
  });
});
```

**Step 2: Run test to verify it fails**

```bash
cd D:/AI/daggerheart-ai/server
npm test -- src/services/documents.test.ts
```

Expected: FAIL - module not found

**Step 3: Write minimal implementation**

```typescript
// server/src/services/documents.ts
import { readdirSync, readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SRD_PATH = join(__dirname, '..', '..', 'srd');

export function listDocuments(category: string): string[] {
  const categoryPath = join(SRD_PATH, category);

  if (!existsSync(categoryPath)) {
    return [];
  }

  return readdirSync(categoryPath)
    .filter(f => f.endsWith('.md'))
    .map(f => f.replace('.md', ''));
}

export function getDocument(category: string, name: string): string | null {
  const filePath = join(SRD_PATH, category, `${name}.md`);

  if (!existsSync(filePath)) {
    return null;
  }

  return readFileSync(filePath, 'utf-8');
}
```

**Step 4: Run test to verify it passes**

```bash
cd D:/AI/daggerheart-ai/server
npm test -- src/services/documents.test.ts
```

Expected: PASS

**Step 5: Commit**

```bash
git add server/src/services/documents.ts server/src/services/documents.test.ts
git commit -m "feat(server): add documents service for reading SRD markdown files"
```

---

### Task 3: Create search service (extract from index.ts)

**Files:**
- Create: `server/src/services/search.ts`
- Test: `server/src/services/search.test.ts`

**Step 1: Write the failing test**

```typescript
// server/src/services/search.test.ts
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { SearchService } from './search.js';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DB_PATH = join(__dirname, '..', '..', 'data', 'embeddings.db');

describe('SearchService', () => {
  let service: SearchService;

  beforeAll(() => {
    service = new SearchService(DB_PATH);
  });

  afterAll(() => {
    service.close();
  });

  it('searches rules and returns results', async () => {
    const results = await service.search('healing magic', 3);
    expect(results.length).toBeGreaterThan(0);
    expect(results.length).toBeLessThanOrEqual(3);
    expect(results[0]).toHaveProperty('id');
    expect(results[0]).toHaveProperty('content');
  });

  it('filters by category', async () => {
    const results = await service.search('attack', 5, 'abilities');
    results.forEach(r => {
      expect(r.category).toBe('abilities');
    });
  });
});
```

**Step 2: Run test to verify it fails**

```bash
cd D:/AI/daggerheart-ai/server
npm test -- src/services/search.test.ts
```

Expected: FAIL - module not found

**Step 3: Write minimal implementation**

```typescript
// server/src/services/search.ts
import { VectorStore, SearchResult } from '../vector-store.js';
import { generateEmbedding } from '../embeddings.js';

export class SearchService {
  private store: VectorStore;

  constructor(dbPath: string) {
    this.store = new VectorStore(dbPath);
  }

  async search(query: string, limit: number = 5, category?: string): Promise<SearchResult[]> {
    const embedding = await generateEmbedding(query);
    return this.store.search(embedding, limit, category);
  }

  getById(id: string) {
    return this.store.getById(id);
  }

  listByCategory(category: string) {
    return this.store.listByCategory(category);
  }

  close() {
    this.store.close();
  }
}
```

**Step 4: Run test to verify it passes**

```bash
cd D:/AI/daggerheart-ai/server
npm test -- src/services/search.test.ts
```

Expected: PASS (requires OPENAI_API_KEY env var)

**Step 5: Commit**

```bash
git add server/src/services/search.ts server/src/services/search.test.ts
git commit -m "feat(server): add search service wrapping vector store"
```

---

### Task 4: Add Express and create REST API routes

**Files:**
- Modify: `server/package.json` (add express, cors)
- Create: `server/src/routes/api.ts`
- Test: `server/src/routes/api.test.ts`

**Step 1: Install dependencies**

```bash
cd D:/AI/daggerheart-ai/server
npm install express cors
npm install -D @types/express @types/cors supertest @types/supertest
```

**Step 2: Write the failing test**

```typescript
// server/src/routes/api.test.ts
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import express from 'express';
import { createApiRouter } from './api.js';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DB_PATH = join(__dirname, '..', '..', 'data', 'embeddings.db');

describe('API routes', () => {
  let app: express.Express;

  beforeAll(() => {
    app = express();
    app.use('/api', createApiRouter(DB_PATH));
  });

  describe('GET /api/classes', () => {
    it('returns list of classes', async () => {
      const res = await request(app).get('/api/classes');
      expect(res.status).toBe(200);
      expect(res.body).toContain('Bard');
      expect(res.body.length).toBe(9);
    });
  });

  describe('GET /api/classes/:name', () => {
    it('returns class content', async () => {
      const res = await request(app).get('/api/classes/Bard');
      expect(res.status).toBe(200);
      expect(res.body.content).toContain('# BARD');
    });

    it('returns 404 for non-existent class', async () => {
      const res = await request(app).get('/api/classes/NonExistent');
      expect(res.status).toBe(404);
    });
  });

  describe('POST /api/search', () => {
    it('searches rules', async () => {
      const res = await request(app)
        .post('/api/search')
        .send({ query: 'healing', limit: 3 });
      expect(res.status).toBe(200);
      expect(res.body.length).toBeGreaterThan(0);
    });
  });
});
```

**Step 3: Run test to verify it fails**

```bash
cd D:/AI/daggerheart-ai/server
npm test -- src/routes/api.test.ts
```

Expected: FAIL - module not found

**Step 4: Write implementation**

```typescript
// server/src/routes/api.ts
import { Router } from 'express';
import { listDocuments, getDocument } from '../services/documents.js';
import { SearchService } from '../services/search.js';

export function createApiRouter(dbPath: string): Router {
  const router = Router();
  const searchService = new SearchService(dbPath);

  // Generic document routes for each category
  const categories = [
    'classes', 'subclasses', 'ancestries', 'communities',
    'domains', 'armor', 'weapons', 'abilities', 'adversaries'
  ];

  categories.forEach(category => {
    // List all in category
    router.get(`/${category}`, (req, res) => {
      const docs = listDocuments(category);
      res.json(docs);
    });

    // Get specific document
    router.get(`/${category}/:name`, (req, res) => {
      const content = getDocument(category, req.params.name);
      if (!content) {
        return res.status(404).json({ error: `${category.slice(0, -1)} not found` });
      }
      res.json({ content });
    });
  });

  // Search endpoint
  router.post('/search', async (req, res) => {
    try {
      const { query, limit = 5, category } = req.body;
      if (!query) {
        return res.status(400).json({ error: 'query is required' });
      }
      const results = await searchService.search(query, limit, category);
      res.json(results);
    } catch (error) {
      res.status(500).json({ error: 'Search failed' });
    }
  });

  // Health check
  router.get('/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  return router;
}
```

**Step 5: Run test to verify it passes**

```bash
cd D:/AI/daggerheart-ai/server
npm test -- src/routes/api.test.ts
```

Expected: PASS

**Step 6: Commit**

```bash
git add server/package.json server/package-lock.json server/src/routes/api.ts server/src/routes/api.test.ts
git commit -m "feat(server): add REST API routes for SRD content"
```

---

### Task 5: Update server entry point with Express + MCP

**Files:**
- Modify: `server/package.json` (add @modelcontextprotocol/server)
- Rewrite: `server/src/index.ts`

**Step 1: Install MCP server packages**

```bash
cd D:/AI/daggerheart-ai/server
npm install @modelcontextprotocol/server
```

**Step 2: Rewrite index.ts**

```typescript
// server/src/index.ts
import express from 'express';
import cors from 'cors';
import { McpServer } from '@modelcontextprotocol/server';
import { createApiRouter } from './routes/api.js';
import { listDocuments, getDocument } from './services/documents.js';
import { SearchService } from './services/search.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { z } from 'zod';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DB_PATH = join(__dirname, '..', 'data', 'embeddings.db');
const PORT = process.env.PORT || 3001;

// Initialize services
const searchService = new SearchService(DB_PATH);

// Create Express app
const app = express();
app.use(cors());
app.use(express.json());

// REST API routes
app.use('/api', createApiRouter(DB_PATH));

// MCP Server setup
const mcpServer = new McpServer({
  name: 'ttrpg-rules',
  version: '1.0.0',
});

// Register MCP tools
const categories = [
  'classes', 'subclasses', 'ancestries', 'communities',
  'domains', 'armor', 'weapons'
];

categories.forEach(category => {
  const singular = category.endsWith('ies')
    ? category.slice(0, -3) + 'y'
    : category.endsWith('es')
      ? category.slice(0, -2)
      : category.slice(0, -1);

  // List tool
  mcpServer.tool(
    `list_${category}`,
    `List all ${category}`,
    {},
    async () => {
      const docs = listDocuments(category);
      return { content: [{ type: 'text', text: docs.join('\n') }] };
    }
  );

  // Get tool
  mcpServer.tool(
    `get_${singular}`,
    `Get details for a specific ${singular}`,
    { name: z.string().describe(`Name of the ${singular}`) },
    async ({ name }) => {
      const content = getDocument(category, name);
      if (!content) {
        return { content: [{ type: 'text', text: `${singular} "${name}" not found` }] };
      }
      return { content: [{ type: 'text', text: content }] };
    }
  );
});

// Search tool
mcpServer.tool(
  'search_rules',
  'Search rules by semantic meaning',
  {
    query: z.string().describe('What to search for'),
    limit: z.number().optional().describe('Max results (default 5)'),
    category: z.string().optional().describe('Filter by category'),
  },
  async ({ query, limit = 5, category }) => {
    const results = await searchService.search(query, limit, category);
    const text = results.map(r => `## ${r.id}\n\n${r.content}`).join('\n\n---\n\n');
    return { content: [{ type: 'text', text }] };
  }
);

// MCP endpoint (Streamable HTTP) - placeholder until SDK supports it
// For now, keep stdio support for local development
app.get('/mcp', (req, res) => {
  res.json({
    message: 'MCP endpoint - use Claude Desktop with stdio transport for now',
    tools: categories.flatMap(c => [`list_${c}`, `get_${c.slice(0, -1)}`]).concat(['search_rules'])
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`REST API: http://localhost:${PORT}/api`);
});

// Also support stdio for local MCP
if (process.argv.includes('--stdio')) {
  import('@modelcontextprotocol/sdk/server/stdio.js').then(({ StdioServerTransport }) => {
    const transport = new StdioServerTransport();
    // Note: This needs the old Server class for stdio
    console.error('Stdio mode - use REST API server instead');
  });
}
```

**Step 3: Add zod dependency**

```bash
npm install zod
```

**Step 4: Run the server to test**

```bash
cd D:/AI/daggerheart-ai/server
npm run build
node dist/index.js
```

Test in another terminal:
```bash
curl http://localhost:3001/api/classes
curl http://localhost:3001/api/classes/Bard
```

**Step 5: Commit**

```bash
git add server/package.json server/package-lock.json server/src/index.ts
git commit -m "feat(server): add Express server with REST API and MCP tools"
```

---

## Phase 2: Web App Backend

### Task 6: Create auth utility

**Files:**
- Create: `web/lib/auth.ts`

**Step 1: Create the auth module**

```typescript
// web/lib/auth.ts
export function validatePassword(password: string | null): boolean {
  if (!password) return false;
  return password === process.env.ACCESS_PASSWORD;
}
```

**Step 2: Add environment variable**

Create `web/.env.local`:
```
ACCESS_PASSWORD=yourSecretPassword123
ANTHROPIC_API_KEY=your-anthropic-key
SERVER_URL=http://localhost:3001
```

**Step 3: Commit**

```bash
git add web/lib/auth.ts
git commit -m "feat(web): add password auth utility"
```

---

### Task 7: Create Anthropic client and tools definition

**Files:**
- Create: `web/lib/anthropic.ts`
- Create: `web/lib/tools.ts`

**Step 1: Install Anthropic SDK**

```bash
cd D:/AI/daggerheart-ai/web
npm install @anthropic-ai/sdk
```

**Step 2: Create Anthropic client**

```typescript
// web/lib/anthropic.ts
import Anthropic from '@anthropic-ai/sdk';

export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});
```

**Step 3: Create tools definition**

```typescript
// web/lib/tools.ts
import Anthropic from '@anthropic-ai/sdk';

type Tool = Anthropic.Messages.Tool;

const categories = [
  { plural: 'classes', singular: 'class' },
  { plural: 'subclasses', singular: 'subclass' },
  { plural: 'ancestries', singular: 'ancestry' },
  { plural: 'communities', singular: 'community' },
  { plural: 'domains', singular: 'domain' },
  { plural: 'armor', singular: 'armor' },
  { plural: 'weapons', singular: 'weapon' },
];

export const RULES_TOOLS: Tool[] = [
  // List tools
  ...categories.map(({ plural }) => ({
    name: `list_${plural}`,
    description: `List all ${plural}`,
    input_schema: {
      type: 'object' as const,
      properties: {},
      required: [],
    },
  })),
  // Get tools
  ...categories.map(({ plural, singular }) => ({
    name: `get_${singular}`,
    description: `Get details for a specific ${singular}`,
    input_schema: {
      type: 'object' as const,
      properties: {
        name: { type: 'string', description: `Name of the ${singular}` },
      },
      required: ['name'],
    },
  })),
  // Search tool
  {
    name: 'search_rules',
    description: 'Search rules by semantic meaning. Use for open-ended questions.',
    input_schema: {
      type: 'object' as const,
      properties: {
        query: { type: 'string', description: 'What to search for' },
        limit: { type: 'number', description: 'Max results (default 5)' },
        category: { type: 'string', description: 'Filter by category' },
      },
      required: ['query'],
    },
  },
];

export async function executeTool(
  name: string,
  input: Record<string, unknown>
): Promise<string> {
  const serverUrl = process.env.SERVER_URL || 'http://localhost:3001';

  // Handle list tools
  if (name.startsWith('list_')) {
    const category = name.replace('list_', '');
    const res = await fetch(`${serverUrl}/api/${category}`);
    const data = await res.json();
    return Array.isArray(data) ? data.join('\n') : JSON.stringify(data);
  }

  // Handle get tools
  if (name.startsWith('get_')) {
    const singular = name.replace('get_', '');
    const plural = singular === 'class' ? 'classes'
      : singular === 'ancestry' ? 'ancestries'
      : singular === 'community' ? 'communities'
      : `${singular}s`;
    const res = await fetch(`${serverUrl}/api/${plural}/${input.name}`);
    if (!res.ok) return `${singular} not found`;
    const data = await res.json();
    return data.content;
  }

  // Handle search
  if (name === 'search_rules') {
    const res = await fetch(`${serverUrl}/api/search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });
    const data = await res.json();
    return data.map((r: { id: string; content: string }) =>
      `## ${r.id}\n\n${r.content}`
    ).join('\n\n---\n\n');
  }

  return `Unknown tool: ${name}`;
}
```

**Step 4: Commit**

```bash
git add web/lib/anthropic.ts web/lib/tools.ts web/package.json web/package-lock.json
git commit -m "feat(web): add Anthropic client and tools definition"
```

---

### Task 8: Create system prompt

**Files:**
- Create: `web/lib/prompts.ts`

**Step 1: Create prompts file**

```typescript
// web/lib/prompts.ts
export const CHARACTER_CREATION_PROMPT = `You are a friendly character creation assistant for a tabletop RPG. Guide players step-by-step through creating their character.

## Process
1. **Class** - Present the 9 classes (Bard, Druid, Guardian, Ranger, Rogue, Seraph, Sorcerer, Warrior, Wizard). Use list_classes first, then get_class for details when they show interest.
2. **Subclass** - Once class is chosen, show subclass options using get_class (it includes subclass links) or list_subclasses + get_subclass.
3. **Ancestry** - Use list_ancestries and get_ancestry. Mention Mixed Ancestry option.
4. **Community** - Use list_communities and get_community.
5. **Traits** - Help assign +2, +1, +1, +0, +0, -1 across Agility, Strength, Finesse, Instinct, Presence, Knowledge. Suggest based on class.
6. **Equipment** - Use list_weapons and list_armor to show Tier 1 options.
7. **Experiences** - Create 2 phrases (+2 each) representing skills based on their backstory.
8. **Domain Cards** - Use get_domain to show options from their class domains. Help pick 2 cards.

## Guidelines
- One step at a time - don't overwhelm with choices
- Use tools to get accurate, up-to-date information
- Be encouraging and help with decisions
- Suggest options but let them choose
- Format responses with markdown for readability
- When presenting options, use numbered lists
- Keep responses concise but informative

## Output Format
At the end, provide a summary of all choices in a structured format.
`;
```

**Step 2: Commit**

```bash
git add web/lib/prompts.ts
git commit -m "feat(web): add character creation system prompt"
```

---

### Task 9: Create chat API route

**Files:**
- Create: `web/app/api/chat/route.ts`

**Step 1: Create the API route**

```typescript
// web/app/api/chat/route.ts
import { anthropic } from '@/lib/anthropic';
import { validatePassword } from '@/lib/auth';
import { CHARACTER_CREATION_PROMPT } from '@/lib/prompts';
import { RULES_TOOLS, executeTool } from '@/lib/tools';
import Anthropic from '@anthropic-ai/sdk';

export async function POST(req: Request) {
  try {
    const { messages, password } = await req.json();

    // Validate password
    if (!validatePassword(password)) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Convert messages to Anthropic format
    const anthropicMessages: Anthropic.Messages.MessageParam[] = messages.map(
      (m: { role: string; content: string }) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })
    );

    // Call Anthropic
    let response = await anthropic.messages.create({
      model: 'claude-3-5-haiku-latest',
      max_tokens: 4096,
      system: CHARACTER_CREATION_PROMPT,
      messages: anthropicMessages,
      tools: RULES_TOOLS,
    });

    // Handle tool use loop
    while (response.stop_reason === 'tool_use') {
      const toolUseBlocks = response.content.filter(
        (block): block is Anthropic.Messages.ToolUseBlock => block.type === 'tool_use'
      );

      const toolResults: Anthropic.Messages.ToolResultBlockParam[] = await Promise.all(
        toolUseBlocks.map(async (toolUse) => ({
          type: 'tool_result' as const,
          tool_use_id: toolUse.id,
          content: await executeTool(toolUse.name, toolUse.input as Record<string, unknown>),
        }))
      );

      // Continue conversation with tool results
      response = await anthropic.messages.create({
        model: 'claude-3-5-haiku-latest',
        max_tokens: 4096,
        system: CHARACTER_CREATION_PROMPT,
        messages: [
          ...anthropicMessages,
          { role: 'assistant', content: response.content },
          { role: 'user', content: toolResults },
        ],
        tools: RULES_TOOLS,
      });
    }

    // Extract text response
    const textContent = response.content.find(
      (block): block is Anthropic.Messages.TextBlock => block.type === 'text'
    );

    return Response.json({
      content: textContent?.text || '',
      usage: response.usage,
    });
  } catch (error) {
    console.error('Chat API error:', error);
    return Response.json(
      { error: 'Failed to process chat' },
      { status: 500 }
    );
  }
}
```

**Step 2: Commit**

```bash
git add web/app/api/chat/route.ts
git commit -m "feat(web): add chat API route with tool handling"
```

---

## Phase 3: Web App Frontend

### Task 10: Update access gate for URL password

**Files:**
- Modify: `web/app/page.tsx`
- Modify: `web/components/access-gate.tsx`

**Step 1: Update page.tsx**

```typescript
// web/app/page.tsx
"use client"

import { useState, useEffect } from "react"
import { AccessGate } from "@/components/access-gate"
import { ChatInterface } from "@/components/chat-interface"

export default function Home() {
  const [password, setPassword] = useState<string | null>(null)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    const url = new URL(window.location.href)
    const pw = url.searchParams.get("password")

    if (pw) {
      setPassword(pw)
      // Store in sessionStorage for subsequent requests
      sessionStorage.setItem("password", pw)
    } else {
      // Check sessionStorage
      const stored = sessionStorage.getItem("password")
      if (stored) {
        setPassword(stored)
      }
    }
    setChecking(false)
  }, [])

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!password) {
    return <AccessGate onValidPassword={(pw) => {
      setPassword(pw)
      sessionStorage.setItem("password", pw)
      // Update URL
      const url = new URL(window.location.href)
      url.searchParams.set("password", pw)
      window.history.replaceState({}, "", url.toString())
    }} />
  }

  return <ChatInterface password={password} />
}
```

**Step 2: Update access-gate.tsx**

```typescript
// web/components/access-gate.tsx
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Swords, Lock } from "lucide-react"

interface AccessGateProps {
  onValidPassword: (password: string) => void
}

export function AccessGate({ onValidPassword }: AccessGateProps) {
  const [code, setCode] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    // Validate against backend
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [], password: code }),
      })

      if (res.ok) {
        onValidPassword(code)
      } else {
        setError("Invalid access code. Please try again.")
      }
    } catch {
      setError("Connection error. Please try again.")
    }

    setIsLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md bg-card border-border shadow-[0_0_30px_rgba(139,92,246,0.15)]">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-purple-glow/20 flex items-center justify-center border border-purple-glow/30">
            <Swords className="w-8 h-8 text-gold" />
          </div>
          <CardTitle className="text-2xl font-sans text-gold">Character Creator</CardTitle>
          <CardDescription className="text-muted-foreground">
            This tool is invite-only
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="code" className="text-sm text-muted-foreground flex items-center gap-2">
                <Lock className="w-4 h-4" />
                Enter your access code
              </label>
              <Input
                id="code"
                type="password"
                placeholder="Enter code..."
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="bg-input border-border text-foreground placeholder:text-muted-foreground focus:border-gold focus:ring-gold/20"
              />
              {error && <p className="text-destructive text-sm">{error}</p>}
            </div>
            <Button
              type="submit"
              disabled={isLoading || !code}
              className="w-full bg-gold text-background hover:bg-gold/90 disabled:opacity-50"
            >
              {isLoading ? "Verifying..." : "Enter"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
```

**Step 3: Commit**

```bash
git add web/app/page.tsx web/components/access-gate.tsx
git commit -m "feat(web): update auth flow to use URL password"
```

---

### Task 11: Update chat interface to use real API

**Files:**
- Modify: `web/components/chat-interface.tsx`

**Step 1: Update ChatInterface**

Replace the simulated bot responses with real API calls:

```typescript
// web/components/chat-interface.tsx
"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ChatMessage } from "@/components/chat-message"
import { TypingIndicator } from "@/components/typing-indicator"
import { Send, Swords } from "lucide-react"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
}

interface ChatInterfaceProps {
  password: string
}

const INITIAL_MESSAGE: Message = {
  id: "1",
  role: "assistant",
  content: `# Welcome, Adventurer!

I'm here to help you create your character. Together, we'll craft a hero with a compelling story and abilities that match your vision.

**What kind of character would you like to play?** Tell me about the concept you have in mind, or I can show you the available classes to help you decide!`,
}

export function ChatInterface({ password }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE])
  const [input, setInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, isTyping])

  const sendMessage = async (content: string) => {
    if (!content.trim() || isTyping) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: content.trim(),
    }

    const newMessages = [...messages, userMessage]
    setMessages(newMessages)
    setInput("")
    setIsTyping(true)

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages.map(m => ({ role: m.role, content: m.content })),
          password,
        }),
      })

      if (!res.ok) {
        throw new Error("Chat request failed")
      }

      const data = await res.json()

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.content,
      }

      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      console.error("Chat error:", error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Sorry, I encountered an error. Please try again.",
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsTyping(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    sendMessage(input)
  }

  return (
    <div className="flex h-screen bg-background">
      <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full">
        {/* Header */}
        <header className="flex items-center justify-between px-4 py-3 border-b border-border bg-card/50 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-glow/20 flex items-center justify-center border border-purple-glow/30">
              <Swords className="w-5 h-5 text-gold" />
            </div>
            <div>
              <h1 className="font-sans font-semibold text-gold text-lg">Character Creator</h1>
              <p className="text-xs text-muted-foreground">TTRPG Compatible</p>
            </div>
          </div>
        </header>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4" ref={scrollRef}>
          <div className="space-y-4 max-w-3xl mx-auto">
            {messages.map((message) => (
              <ChatMessage
                key={message.id}
                role={message.role === "assistant" ? "bot" : "user"}
                content={message.content}
              />
            ))}
            {isTyping && <TypingIndicator />}
          </div>
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-border bg-card/50 backdrop-blur-sm">
          <form onSubmit={handleSubmit} className="flex gap-2 max-w-3xl mx-auto">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={isTyping ? "Thinking..." : "Type your message..."}
              disabled={isTyping}
              className="flex-1 bg-input border-border text-foreground placeholder:text-muted-foreground focus:border-gold focus:ring-gold/20"
            />
            <Button
              type="submit"
              disabled={isTyping || !input.trim()}
              className="bg-gold text-background hover:bg-gold/90 disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </div>

        {/* Attribution Footer */}
        <footer className="px-4 py-2 text-center text-xs text-muted-foreground border-t border-border">
          <p>
            Uses material from the Daggerheart SRD 1.0, © Critical Role, LLC under the{" "}
            <a href="https://darringtonpress.com/license/" className="underline hover:text-gold">
              DPCGL
            </a>
            . Not affiliated with Critical Role or Darrington Press.
          </p>
        </footer>
      </div>
    </div>
  )
}
```

**Step 2: Commit**

```bash
git add web/components/chat-interface.tsx
git commit -m "feat(web): connect chat interface to real API"
```

---

## Phase 4: Testing & Deployment

### Task 12: Test locally

**Step 1: Start the server**

```bash
cd D:/AI/daggerheart-ai/server
npm run build
OPENAI_API_KEY=your-key node dist/index.js
```

**Step 2: Start the web app**

```bash
cd D:/AI/daggerheart-ai/web
npm run dev
```

**Step 3: Test the flow**

1. Open http://localhost:3000?password=yourSecretPassword123
2. Chat with the assistant
3. Verify it fetches real data from the server

---

### Task 13: Deploy server to Railway

**Step 1: Create Railway project**

1. Go to railway.app and create new project
2. Connect to GitHub repo or deploy from CLI
3. Set environment variables:
   - `OPENAI_API_KEY`
   - `PORT=3001`

**Step 2: Update server for Railway**

Add to `server/package.json`:
```json
"scripts": {
  "start": "node dist/index.js"
}
```

**Step 3: Deploy**

```bash
cd D:/AI/daggerheart-ai/server
railway up
```

---

### Task 14: Deploy web to Vercel

**Step 1: Set environment variables in Vercel**

- `ANTHROPIC_API_KEY`
- `ACCESS_PASSWORD`
- `SERVER_URL` (Railway URL)

**Step 2: Deploy**

```bash
cd D:/AI/daggerheart-ai/web
vercel
```

---

## Summary

| Task | Description |
|------|-------------|
| 1 | Rename mcp-server to server |
| 2 | Create documents service |
| 3 | Create search service |
| 4 | Add Express REST API routes |
| 5 | Update server entry point |
| 6 | Create auth utility |
| 7 | Create Anthropic client + tools |
| 8 | Create system prompt |
| 9 | Create chat API route |
| 10 | Update access gate for URL password |
| 11 | Update chat interface to use real API |
| 12 | Test locally |
| 13 | Deploy server to Railway |
| 14 | Deploy web to Vercel |
