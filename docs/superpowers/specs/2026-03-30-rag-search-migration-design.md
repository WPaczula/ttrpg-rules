# RAG Search Migration to NestJS API

**Date:** 2026-03-30
**Status:** Approved

## Overview

Migrate the RAG-based semantic search system from the Express `server/` into the NestJS `api/`. The server is not modified — this is a parallel implementation for a future big-bang swap. The system enables semantic search over Daggerheart SRD rules using OpenAI embeddings and pgvector.

## Key Decisions

| Concern | Decision |
|---------|----------|
| Storage | pgvector extension in PostgreSQL |
| Embedding model | OpenAI `text-embedding-3-small` (1536 dimensions) |
| NestJS structure | New dedicated `SearchModule` |
| Indexing trigger | Standalone script (`api/scripts/index-rules.ts`) |
| SRD markdown source | Env var / CLI arg pointing to markdown files on disk |
| Auth | `@AnyRole()` (any authenticated user) |
| Response format | `string[]` — content chunks only |
| Server migration | Nothing removed from `server/`, swap later |

## Database

### pgvector Extension

Enable the `vector` extension and create a `document_embedding` table:

```sql
CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE document_embedding (
  id TEXT PRIMARY KEY,
  content TEXT NOT NULL,
  category TEXT NOT NULL,
  embedding vector(1536) NOT NULL
);

CREATE INDEX ON document_embedding
  USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
```

Managed via a raw SQL Prisma migration since Prisma does not natively support the `vector` type. The repository uses `prisma.$queryRaw` for all vector operations.

## NestJS Module Structure

```
api/src/search/
├── search.module.ts
├── search.controller.ts
├── search.service.ts
├── repositories/
│   └── document-embedding.repository.ts
├── interfaces/
│   └── search-result.interface.ts
└── dto/
    └── search-query.dto.ts
```

### SearchController

- `POST /search` with `@AnyRole()` guard
- Accepts `{ query: string, limit?: number, category?: string }`
- Returns `string[]` of content chunks ordered by relevance

### SearchService

Orchestrates the search flow:
1. Calls OpenAI to embed the query string into a 1536-dim vector
2. Passes the vector to `DocumentEmbeddingRepository.findNearest()`
3. Returns content strings

### DocumentEmbeddingRepository

Raw SQL queries against pgvector:
- `findNearest(embedding, limit, category?)` — cosine distance search via `<=>` operator
- `upsert(id, content, category, embedding)` — used by the indexing script

### DTO

```typescript
class SearchQueryDto {
  query: string;      // @IsString(), @IsNotEmpty()
  limit?: number;     // @IsOptional(), @IsInt(), @Min(1), @Max(20), default 5
  category?: string;  // @IsOptional(), @IsString()
}
```

## Search Flow

```
POST /search { query: "how does hope work?", limit: 5, category?: "srd" }
  → @AnyRole() guard (Clerk auth)
  → SearchController.search()
  → SearchService.search(query, limit, category)
    → OpenAI: embed query → 1536-dim vector
    → DocumentEmbeddingRepository.findNearest(vector, limit, category)
      → SELECT content FROM document_embedding
        ORDER BY embedding <=> $1::vector
        [WHERE category = $2]
        LIMIT $3
    → Return string[]
```

## Standalone Indexing Script

**Location:** `api/scripts/index-rules.ts`
**Run via:** `npx tsx api/scripts/index-rules.ts`
**Package.json script:** `"index-rules": "tsx scripts/index-rules.ts"`

### Behavior

1. Reads `DATABASE_URL` from environment (`.env` or exported) — targets local or Railway PostgreSQL
2. Reads `SRD_PATH` from environment or CLI arg — path to the `daggerheart-srd/` markdown files
3. Instantiates a raw `PrismaClient` (no NestJS bootstrap)
4. Reads all `.md` files from the SRD directory tree
5. Chunks the full SRD document by `##` headings (port of existing `chunkSRDDocument` logic)
6. Calls OpenAI `text-embedding-3-small` for each chunk
7. Upserts into `document_embedding` table via raw SQL
8. Logs progress and exits

### Ported Logic

The following logic is ported directly from `server/scripts/index-rules.ts`:
- `getAllMdFiles()` — recursive markdown file discovery
- `getCategoryFromPath()` — derive category from directory structure
- `chunkSRDDocument()` — split full SRD by `##` headings, skip chunks < 50 chars
- `slugify()` — generate chunk IDs

## Dependencies

Added to `api/package.json`:
- `openai` — OpenAI SDK for embedding generation

No `better-sqlite3` needed — pgvector replaces the SQLite vector store.

## What Stays in `server/`

Everything. The Express server continues to work with its SQLite-backed vector store unchanged. The NestJS implementation is a parallel copy. When ready, the swap is: point consumers at the NestJS API, retire `server/`.

## Environment Variables

New variables for the NestJS API:
- `OPENAI_API_KEY` — required for embedding generation (both search and indexing)
- `SRD_PATH` — path to `daggerheart-srd/` markdown files (indexing script only)

`DATABASE_URL` is already configured and used by both the API and the indexing script.
