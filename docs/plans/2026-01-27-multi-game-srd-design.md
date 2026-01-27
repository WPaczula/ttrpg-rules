# Multi-Game SRD Support Design

## Goal

Add D&D Starter Set rules alongside existing Daggerheart SRD. Users switch between games via a tab bar in the web app. Each game has its own embeddings database, search endpoint, conversation history, and system prompt.

## Data & Embeddings Layer

### SRD Storage

- Daggerheart: `server/daggerheart-srd/` (renamed from `server/srd/`, 767 files)
- D&D: `server/dnd-srd/rules.md` (single file)

### Embedding Databases

- `server/data/daggerheart-embeddings.db` (renamed from `embeddings.db`)
- `server/data/dnd-embeddings.db`

### Indexing Script

- `scripts/index-rules.ts` accepts a `--game` flag: `--game daggerheart` or `--game dnd`
- Daggerheart mode: works as today (one document per markdown file)
- D&D mode: reads `rules.md`, splits into chunks at `## ` heading boundaries, each chunk becomes a document
- Each mode writes to its respective DB file

### Vector Store

- `VectorStore` constructor takes a DB path parameter instead of hardcoded path
- `SearchService` becomes game-aware: instantiates two vector stores, routes queries by `game` parameter

## API Layer

### Namespaced Routes

- `POST /api/daggerheart/search` - semantic search in Daggerheart rules
- `GET /api/daggerheart/{category}` - list items in a Daggerheart category
- `GET /api/daggerheart/{category}/:name` - get a specific Daggerheart item
- `POST /api/dnd/search` - semantic search in D&D rules

No browsing endpoints for D&D (search only).

## Web App

### Tab Bar

- Two tabs above the chat area: "Daggerheart" and "D&D"
- Switching tabs swaps the active conversation
- Each tab has its own message history in localStorage:
  - `daggerheart-chat-messages`
  - `dnd-chat-messages`

### Chat Behavior Per Game

- Daggerheart: current system prompt and behavior, unchanged
- D&D: simple generic prompt ("You are a D&D Starter Set rules assistant. Use search to answer questions about D&D Starter Set rules.")

### API Integration

- Chat sends the active game identifier to the backend AI route
- AI route calls the correct `/api/{game}/search` endpoint

## Out of Scope

- MCP tools (stay Daggerheart-only)
- D&D category browsing
- Skills/Claude Code skill updates
