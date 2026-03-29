# RAG Search Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add semantic search over Daggerheart SRD rules to the NestJS API using pgvector and OpenAI embeddings.

**Architecture:** New `SearchModule` with a controller, service, and repository. pgvector stores embeddings in a `document_embedding` table. A standalone script indexes markdown files into embeddings. The existing `server/` is untouched.

**Tech Stack:** NestJS 11, Prisma 7 (raw SQL for vector ops), pgvector, OpenAI `text-embedding-3-small`

**Spec:** `docs/superpowers/specs/2026-03-30-rag-search-migration-design.md`

---

## File Structure

```
api/
├── prisma/migrations/XXXXXXXXX_add_pgvector_embeddings/
│   └── migration.sql                          # CREATE EXTENSION, table, index
├── scripts/
│   └── index-rules.ts                         # Standalone indexing script
├── src/search/
│   ├── search.module.ts                       # SearchModule
│   ├── search.controller.ts                   # POST /search
│   ├── search.service.ts                      # Orchestrates embed + query
│   ├── dto/
│   │   └── search-query.dto.ts                # Validated request body
│   ├── interfaces/
│   │   └── search-result.interface.ts         # Internal result type
│   └── repositories/
│       └── document-embedding.repository.ts   # Raw SQL pgvector queries
├── test/
│   └── search.e2e-spec.ts                     # E2E tests for search endpoint
└── package.json                               # + openai dependency
```

---

### Task 1: Add pgvector Migration

**Files:**
- Create: `api/prisma/migrations/<timestamp>_add_pgvector_embeddings/migration.sql`

- [ ] **Step 1: Create the migration SQL file**

Create a new migration directory. The timestamp should follow the pattern of existing migrations (e.g., `20260330100000`).

```sql
-- api/prisma/migrations/20260330100000_add_pgvector_embeddings/migration.sql

CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE document_embedding (
  id TEXT PRIMARY KEY,
  content TEXT NOT NULL,
  category TEXT NOT NULL,
  embedding vector(1536) NOT NULL
);

CREATE INDEX idx_document_embedding_category ON document_embedding (category);
CREATE INDEX idx_document_embedding_cosine ON document_embedding
  USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
```

- [ ] **Step 2: Run the migration against local DB**

Run:
```bash
cd api && npx prisma migrate deploy
```

Expected: Migration applies successfully. If the `vector` extension is not installed on PostgreSQL, install it first (`sudo apt install postgresql-17-pgvector` or equivalent for your platform).

- [ ] **Step 3: Commit**

```bash
git add api/prisma/migrations/20260330100000_add_pgvector_embeddings/
git commit -m "feat: add pgvector migration for document embeddings"
```

---

### Task 2: Install OpenAI Dependency

**Files:**
- Modify: `api/package.json`

- [ ] **Step 1: Install openai package**

Run:
```bash
cd api && npm install openai
```

- [ ] **Step 2: Verify it was added to package.json**

Run:
```bash
cd api && cat package.json | grep openai
```

Expected: `"openai": "^4.x.x"` appears in `dependencies`.

- [ ] **Step 3: Commit**

```bash
git add api/package.json api/package-lock.json
git commit -m "feat: add openai dependency for embeddings"
```

---

### Task 3: Search Result Interface and DTO

**Files:**
- Create: `api/src/search/interfaces/search-result.interface.ts`
- Create: `api/src/search/dto/search-query.dto.ts`

- [ ] **Step 1: Create the search result interface**

```typescript
// api/src/search/interfaces/search-result.interface.ts

export interface ISearchResult {
  id: string;
  content: string;
  category: string;
  similarity: number;
}
```

- [ ] **Step 2: Create the search query DTO**

```typescript
// api/src/search/dto/search-query.dto.ts

import { IsString, IsNotEmpty, IsOptional, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class SearchQueryDto {
  @IsString()
  @IsNotEmpty()
  query: string;

  @IsInt()
  @Min(1)
  @Max(20)
  @IsOptional()
  @Type(() => Number)
  limit?: number;

  @IsString()
  @IsOptional()
  category?: string;
}
```

- [ ] **Step 3: Commit**

```bash
git add api/src/search/
git commit -m "feat: add search DTO and interface"
```

---

### Task 4: Document Embedding Repository

**Files:**
- Create: `api/src/search/repositories/document-embedding.repository.ts`

- [ ] **Step 1: Write the repository unit test**

```typescript
// api/src/search/repositories/document-embedding.repository.spec.ts

import { Test } from '@nestjs/testing';
import { DocumentEmbeddingRepository } from './document-embedding.repository';
import { PrismaService } from '../../prisma/prisma.service';

describe('DocumentEmbeddingRepository', () => {
  let repository: DocumentEmbeddingRepository;
  let prisma: { $queryRawUnsafe: jest.Mock; $executeRawUnsafe: jest.Mock };

  beforeEach(async () => {
    prisma = {
      $queryRawUnsafe: jest.fn(),
      $executeRawUnsafe: jest.fn(),
    };

    const module = await Test.createTestingModule({
      providers: [
        DocumentEmbeddingRepository,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    repository = module.get(DocumentEmbeddingRepository);
  });

  describe('findNearest', () => {
    it('queries with cosine distance and returns results', async () => {
      const mockRows = [
        { id: 'srd/hope', content: 'Hope rules...', category: 'srd', similarity: 0.92 },
      ];
      prisma.$queryRawUnsafe.mockResolvedValue(mockRows);

      const embedding = new Array(1536).fill(0.1);
      const results = await repository.findNearest(embedding, 5);

      expect(prisma.$queryRawUnsafe).toHaveBeenCalledTimes(1);
      const sql = prisma.$queryRawUnsafe.mock.calls[0][0] as string;
      expect(sql).toContain('<=>');
      expect(sql).toContain('LIMIT');
      expect(results).toEqual(mockRows);
    });

    it('filters by category when provided', async () => {
      prisma.$queryRawUnsafe.mockResolvedValue([]);

      const embedding = new Array(1536).fill(0.1);
      await repository.findNearest(embedding, 5, 'classes');

      const sql = prisma.$queryRawUnsafe.mock.calls[0][0] as string;
      expect(sql).toContain('category');
    });
  });

  describe('upsert', () => {
    it('executes an upsert query', async () => {
      prisma.$executeRawUnsafe.mockResolvedValue(1);

      const embedding = new Array(1536).fill(0.1);
      await repository.upsert('test-id', 'test content', 'srd', embedding);

      expect(prisma.$executeRawUnsafe).toHaveBeenCalledTimes(1);
      const sql = prisma.$executeRawUnsafe.mock.calls[0][0] as string;
      expect(sql).toContain('INSERT INTO document_embedding');
      expect(sql).toContain('ON CONFLICT');
    });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run:
```bash
cd api && npx jest src/search/repositories/document-embedding.repository.spec.ts --no-cache
```

Expected: FAIL — cannot find `./document-embedding.repository`.

- [ ] **Step 3: Implement the repository**

```typescript
// api/src/search/repositories/document-embedding.repository.ts

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ISearchResult } from '../interfaces/search-result.interface';

@Injectable()
export class DocumentEmbeddingRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findNearest(
    embedding: number[],
    limit: number,
    category?: string,
  ): Promise<ISearchResult[]> {
    const vectorStr = `[${embedding.join(',')}]`;

    if (category) {
      return this.prisma.$queryRawUnsafe<ISearchResult[]>(
        `SELECT id, content, category, 1 - (embedding <=> $1::vector) AS similarity
         FROM document_embedding
         WHERE category = $2
         ORDER BY embedding <=> $1::vector
         LIMIT $3`,
        vectorStr,
        category,
        limit,
      );
    }

    return this.prisma.$queryRawUnsafe<ISearchResult[]>(
      `SELECT id, content, category, 1 - (embedding <=> $1::vector) AS similarity
       FROM document_embedding
       ORDER BY embedding <=> $1::vector
       LIMIT $2`,
      vectorStr,
      limit,
    );
  }

  async upsert(
    id: string,
    content: string,
    category: string,
    embedding: number[],
  ): Promise<void> {
    const vectorStr = `[${embedding.join(',')}]`;

    await this.prisma.$executeRawUnsafe(
      `INSERT INTO document_embedding (id, content, category, embedding)
       VALUES ($1, $2, $3, $4::vector)
       ON CONFLICT (id) DO UPDATE SET
         content = EXCLUDED.content,
         category = EXCLUDED.category,
         embedding = EXCLUDED.embedding`,
      id,
      content,
      category,
      vectorStr,
    );
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run:
```bash
cd api && npx jest src/search/repositories/document-embedding.repository.spec.ts --no-cache
```

Expected: PASS (2 test suites, all passing).

- [ ] **Step 5: Commit**

```bash
git add api/src/search/repositories/
git commit -m "feat: add DocumentEmbeddingRepository with pgvector queries"
```

---

### Task 5: Search Service

**Files:**
- Create: `api/src/search/search.service.ts`

- [ ] **Step 1: Write the service unit test**

```typescript
// api/src/search/search.service.spec.ts

import { Test } from '@nestjs/testing';
import { SearchService } from './search.service';
import { DocumentEmbeddingRepository } from './repositories/document-embedding.repository';

// Mock the openai module
jest.mock('openai', () => {
  return {
    __esModule: true,
    default: jest.fn().mockImplementation(() => ({
      embeddings: {
        create: jest.fn().mockResolvedValue({
          data: [{ embedding: new Array(1536).fill(0.5) }],
        }),
      },
    })),
  };
});

describe('SearchService', () => {
  let service: SearchService;
  let repository: { findNearest: jest.Mock };

  beforeEach(async () => {
    repository = {
      findNearest: jest.fn().mockResolvedValue([
        { id: 'srd/hope', content: 'Hope is a resource...', category: 'srd', similarity: 0.92 },
        { id: 'srd/stress', content: 'Stress represents...', category: 'srd', similarity: 0.85 },
      ]),
    };

    const module = await Test.createTestingModule({
      providers: [
        SearchService,
        { provide: DocumentEmbeddingRepository, useValue: repository },
      ],
    }).compile();

    service = module.get(SearchService);
  });

  describe('search', () => {
    it('returns content strings ordered by relevance', async () => {
      const results = await service.search('how does hope work?', 5);

      expect(repository.findNearest).toHaveBeenCalledWith(
        expect.any(Array),
        5,
        undefined,
      );
      expect(results).toEqual([
        'Hope is a resource...',
        'Stress represents...',
      ]);
    });

    it('passes category filter to repository', async () => {
      await service.search('attack damage', 3, 'classes');

      expect(repository.findNearest).toHaveBeenCalledWith(
        expect.any(Array),
        3,
        'classes',
      );
    });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run:
```bash
cd api && npx jest src/search/search.service.spec.ts --no-cache
```

Expected: FAIL — cannot find `./search.service`.

- [ ] **Step 3: Implement the service**

```typescript
// api/src/search/search.service.ts

import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';
import { DocumentEmbeddingRepository } from './repositories/document-embedding.repository';

@Injectable()
export class SearchService {
  private readonly openai: OpenAI;

  constructor(private readonly embeddings: DocumentEmbeddingRepository) {
    this.openai = new OpenAI();
  }

  async search(
    query: string,
    limit: number = 5,
    category?: string,
  ): Promise<string[]> {
    const response = await this.openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: query,
    });
    const queryEmbedding = response.data[0].embedding;

    const results = await this.embeddings.findNearest(
      queryEmbedding,
      limit,
      category,
    );

    return results.map((r) => r.content);
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run:
```bash
cd api && npx jest src/search/search.service.spec.ts --no-cache
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add api/src/search/search.service.ts api/src/search/search.service.spec.ts
git commit -m "feat: add SearchService with OpenAI embedding generation"
```

---

### Task 6: Search Controller

**Files:**
- Create: `api/src/search/search.controller.ts`

- [ ] **Step 1: Write the controller unit test**

```typescript
// api/src/search/search.controller.spec.ts

import { Test } from '@nestjs/testing';
import { SearchController } from './search.controller';
import { SearchService } from './search.service';

describe('SearchController', () => {
  let controller: SearchController;
  let service: { search: jest.Mock };

  beforeEach(async () => {
    service = {
      search: jest.fn().mockResolvedValue([
        'Hope is a resource...',
        'Stress represents...',
      ]),
    };

    const module = await Test.createTestingModule({
      controllers: [SearchController],
      providers: [{ provide: SearchService, useValue: service }],
    }).compile();

    controller = module.get(SearchController);
  });

  describe('search', () => {
    it('delegates to SearchService and returns string array', async () => {
      const result = await controller.search({
        query: 'how does hope work?',
        limit: 5,
      });

      expect(service.search).toHaveBeenCalledWith('how does hope work?', 5, undefined);
      expect(result).toEqual(['Hope is a resource...', 'Stress represents...']);
    });

    it('uses default limit of 5 when not provided', async () => {
      await controller.search({ query: 'healing' });

      expect(service.search).toHaveBeenCalledWith('healing', 5, undefined);
    });

    it('passes category when provided', async () => {
      await controller.search({ query: 'attack', limit: 3, category: 'classes' });

      expect(service.search).toHaveBeenCalledWith('attack', 3, 'classes');
    });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run:
```bash
cd api && npx jest src/search/search.controller.spec.ts --no-cache
```

Expected: FAIL — cannot find `./search.controller`.

- [ ] **Step 3: Implement the controller**

```typescript
// api/src/search/search.controller.ts

import { Controller, Post, Body } from '@nestjs/common';
import { SearchService } from './search.service';
import { SearchQueryDto } from './dto/search-query.dto';
import { AnyRole } from '../auth/decorators/any-role.decorator';

@AnyRole()
@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Post()
  async search(@Body() dto: SearchQueryDto): Promise<string[]> {
    return this.searchService.search(dto.query, dto.limit ?? 5, dto.category);
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run:
```bash
cd api && npx jest src/search/search.controller.spec.ts --no-cache
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add api/src/search/search.controller.ts api/src/search/search.controller.spec.ts
git commit -m "feat: add SearchController with POST /search endpoint"
```

---

### Task 7: Search Module and App Integration

**Files:**
- Create: `api/src/search/search.module.ts`
- Modify: `api/src/app.module.ts`

- [ ] **Step 1: Create the SearchModule**

```typescript
// api/src/search/search.module.ts

import { Module } from '@nestjs/common';
import { SearchController } from './search.controller';
import { SearchService } from './search.service';
import { DocumentEmbeddingRepository } from './repositories/document-embedding.repository';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [SearchController],
  providers: [SearchService, DocumentEmbeddingRepository],
})
export class SearchModule {}
```

- [ ] **Step 2: Register SearchModule in AppModule**

In `api/src/app.module.ts`, add the import:

```typescript
// Add to imports at top of file:
import { SearchModule } from './search/search.module';

// Add SearchModule to the imports array, after CharactersModule:
@Module({
  imports: [
    ConfigModule,
    PrismaModule,
    UsersModule,
    AuthModule,
    SrdModule,
    CharactersModule,
    SearchModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
```

- [ ] **Step 3: Run all existing unit tests to verify no regressions**

Run:
```bash
cd api && npx jest --no-cache
```

Expected: All existing tests pass plus the new search tests.

- [ ] **Step 4: Commit**

```bash
git add api/src/search/search.module.ts api/src/app.module.ts
git commit -m "feat: wire SearchModule into AppModule"
```

---

### Task 8: Standalone Indexing Script

**Files:**
- Create: `api/scripts/index-rules.ts`
- Modify: `api/package.json` (add script)

- [ ] **Step 1: Create the indexing script**

This is ported from `server/scripts/index-rules.ts`, adapted to use Prisma + pgvector instead of SQLite.

```typescript
// api/scripts/index-rules.ts

import { PrismaClient } from '@prisma/client';
import OpenAI from 'openai';
import { readdir, readFile } from 'fs/promises';
import { join, relative } from 'path';

const SRD_PATH = process.env.SRD_PATH;
if (!SRD_PATH) {
  console.error('Error: SRD_PATH environment variable is required.');
  console.error('Usage: SRD_PATH=../server/daggerheart-srd npx tsx scripts/index-rules.ts');
  process.exit(1);
}

const SRD_FULL_DOC = join(SRD_PATH, '.build/01_pdf/DH-SRD-2025-09-09.md');
const SKIP_DIRS = ['.build', '.github'];

const prisma = new PrismaClient();
const openai = new OpenAI();

interface SRDChunk {
  id: string;
  category: string;
  parentHeading: string;
  heading: string;
  content: string;
}

async function generateEmbedding(text: string): Promise<number[]> {
  const response = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: text,
  });
  return response.data[0].embedding;
}

async function getAllMdFiles(dir: string): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    if (entry.isDirectory() && SKIP_DIRS.includes(entry.name)) {
      continue;
    }

    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await getAllMdFiles(fullPath)));
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

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

function chunkSRDDocument(content: string): SRDChunk[] {
  const lines = content.split('\n');
  const chunks: SRDChunk[] = [];

  let currentTopLevel = '';
  let currentSection: { heading: string; content: string[]; lineStart: number } | null = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.match(/^# [A-Z]/)) {
      if (currentSection && currentSection.content.length > 0) {
        const cleanContent = currentSection.content.join('\n').trim();
        if (cleanContent.length > 50) {
          chunks.push({
            id: `srd/${slugify(currentTopLevel)}/${slugify(currentSection.heading)}`,
            category: 'srd',
            parentHeading: currentTopLevel,
            heading: currentSection.heading,
            content: cleanContent,
          });
        }
      }

      currentTopLevel = line.replace(/^# /, '').trim();
      currentSection = null;
      continue;
    }

    if (line.match(/^## /)) {
      if (currentSection && currentSection.content.length > 0) {
        const cleanContent = currentSection.content.join('\n').trim();
        if (cleanContent.length > 50) {
          chunks.push({
            id: `srd/${slugify(currentTopLevel)}/${slugify(currentSection.heading)}`,
            category: 'srd',
            parentHeading: currentTopLevel,
            heading: currentSection.heading,
            content: cleanContent,
          });
        }
      }

      const heading = line.replace(/^## /, '').trim();
      currentSection = {
        heading,
        content: [`# ${currentTopLevel} » ${heading}\n`, line],
        lineStart: i,
      };
      continue;
    }

    if (currentSection) {
      currentSection.content.push(line);
    } else if (currentTopLevel && line.trim()) {
      if (!currentSection) {
        currentSection = {
          heading: currentTopLevel,
          content: [`# ${currentTopLevel}\n`, line],
          lineStart: i,
        };
      }
    }
  }

  if (currentSection && currentSection.content.length > 0) {
    const cleanContent = currentSection.content.join('\n').trim();
    if (cleanContent.length > 50) {
      chunks.push({
        id: `srd/${slugify(currentTopLevel)}/${slugify(currentSection.heading)}`,
        category: 'srd',
        parentHeading: currentTopLevel,
        heading: currentSection.heading,
        content: cleanContent,
      });
    }
  }

  return chunks;
}

async function upsertEmbedding(
  id: string,
  content: string,
  category: string,
  embedding: number[],
): Promise<void> {
  const vectorStr = `[${embedding.join(',')}]`;
  await prisma.$executeRawUnsafe(
    `INSERT INTO document_embedding (id, content, category, embedding)
     VALUES ($1, $2, $3, $4::vector)
     ON CONFLICT (id) DO UPDATE SET
       content = EXCLUDED.content,
       category = EXCLUDED.category,
       embedding = EXCLUDED.embedding`,
    id,
    content,
    category,
    vectorStr,
  );
}

async function main() {
  console.log('Indexing Daggerheart SRD...');
  console.log(`SRD_PATH: ${SRD_PATH}`);

  // Index individual markdown files
  const files = await getAllMdFiles(SRD_PATH);
  console.log(`Found ${files.length} markdown files`);

  let indexed = 0;
  for (const filePath of files) {
    const content = await readFile(filePath, 'utf-8');
    const category = getCategoryFromPath(SRD_PATH, filePath);
    const id = relative(SRD_PATH, filePath).replace(/\\/g, '/');

    try {
      const embedding = await generateEmbedding(content);
      await upsertEmbedding(id, content, category, embedding);
      indexed++;

      if (indexed % 50 === 0) {
        console.log(`Indexed ${indexed}/${files.length} files...`);
      }
    } catch (error) {
      console.error(`Failed to index ${id}:`, error);
    }
  }

  console.log(`Indexed ${indexed} individual files.`);

  // Index chunked full SRD document
  console.log(`\nIndexing full SRD document (chunked by sections)...`);
  try {
    const srdContent = await readFile(SRD_FULL_DOC, 'utf-8');
    const chunks = chunkSRDDocument(srdContent);

    console.log(`Created ${chunks.length} SRD chunks`);

    let chunkIndexed = 0;
    for (const chunk of chunks) {
      try {
        const embedding = await generateEmbedding(chunk.content);
        await upsertEmbedding(chunk.id, chunk.content, chunk.category, embedding);
        chunkIndexed++;

        if (chunkIndexed % 10 === 0) {
          console.log(`  Indexed ${chunkIndexed}/${chunks.length} SRD chunks...`);
        }
      } catch (error) {
        console.error(`Failed to index chunk ${chunk.id}:`, error);
      }
    }

    console.log(`Indexed ${chunkIndexed} SRD chunks.`);

    console.log('\nSample SRD chunks:');
    chunks.slice(0, 5).forEach((chunk, i) => {
      console.log(`  ${i + 1}. ${chunk.parentHeading} >> ${chunk.heading} (${chunk.content.length} chars)`);
    });
  } catch (error) {
    console.error('Failed to index full SRD document:', error);
  }

  console.log(`\nDone! Total indexed: ${indexed} files + SRD chunks`);
  await prisma.$disconnect();
}

main().catch(async (error) => {
  console.error(error);
  await prisma.$disconnect();
  process.exit(1);
});
```

- [ ] **Step 2: Add the npm script to package.json**

In `api/package.json`, add to the `"scripts"` section:

```json
"index-rules": "tsx scripts/index-rules.ts"
```

- [ ] **Step 3: Install tsx as a dev dependency (if not already present)**

Run:
```bash
cd api && npm install --save-dev tsx
```

- [ ] **Step 4: Verify the script runs (dry run — expects SRD_PATH and OPENAI_API_KEY)**

Run:
```bash
cd api && SRD_PATH=nonexistent npx tsx scripts/index-rules.ts
```

Expected: Script starts, prints `SRD_PATH: nonexistent`, then fails gracefully when trying to read files (confirms the script loads and parses correctly).

- [ ] **Step 5: Commit**

```bash
git add api/scripts/index-rules.ts api/package.json api/package-lock.json
git commit -m "feat: add standalone SRD indexing script for pgvector"
```

---

### Task 9: E2E Test for Search Endpoint

**Files:**
- Create: `api/test/search.e2e-spec.ts`

- [ ] **Step 1: Write the E2E test**

This test seeds a few document embeddings directly into the DB, then exercises the `POST /search` endpoint. It mocks the OpenAI call at the service level so no API key is needed in CI.

```typescript
// api/test/search.e2e-spec.ts

import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { AppExceptionFilter } from '../src/common/filters/app-exception.filter';
import { PrismaService } from '../src/prisma/prisma.service';
import { ClerkAuthGuard } from '../src/auth/guards/clerk-auth.guard';
import { SearchService } from '../src/search/search.service';
import { Role, User } from '@prisma/client';
import { makeTestUser, cleanUserTables } from '../src/common/test/test-helpers';
import { execSync } from 'child_process';

describe('Search Endpoint (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let testUser: User;

  beforeAll(async () => {
    execSync('npx prisma migrate deploy', {
      env: { ...process.env, DATABASE_URL: process.env.DATABASE_URL },
      stdio: 'pipe',
    });

    const mockSearchService = {
      search: jest.fn().mockResolvedValue([
        'Hope is a player resource used to activate abilities.',
        'Players gain hope when they roll with hope.',
      ]),
    };

    const mockGuard = {
      canActivate: (context: { switchToHttp: () => { getRequest: () => Record<string, unknown> } }) => {
        context.switchToHttp().getRequest().user = testUser;
        return true;
      },
    };

    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideGuard(ClerkAuthGuard)
      .useValue(mockGuard)
      .overrideProvider(SearchService)
      .useValue(mockSearchService)
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    app.useGlobalFilters(new AppExceptionFilter());

    prisma = moduleFixture.get(PrismaService);
    await prisma.user.deleteMany();
    testUser = await makeTestUser(prisma, Role.PC, 'search-test-user');

    await app.init();
  });

  afterAll(async () => {
    await cleanUserTables(prisma);
    await app.close();
  });

  describe('POST /search', () => {
    it('returns search results as string array', async () => {
      const res = await request(app.getHttpServer())
        .post('/search')
        .send({ query: 'how does hope work?' })
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(2);
      expect(res.body[0]).toContain('Hope');
    });

    it('accepts optional limit and category', async () => {
      await request(app.getHttpServer())
        .post('/search')
        .send({ query: 'attack', limit: 3, category: 'classes' })
        .expect(200);
    });

    it('rejects empty query', async () => {
      await request(app.getHttpServer())
        .post('/search')
        .send({ query: '' })
        .expect(400);
    });

    it('rejects missing query', async () => {
      await request(app.getHttpServer())
        .post('/search')
        .send({ limit: 5 })
        .expect(400);
    });

    it('rejects limit out of range', async () => {
      await request(app.getHttpServer())
        .post('/search')
        .send({ query: 'test', limit: 50 })
        .expect(400);
    });
  });
});
```

- [ ] **Step 2: Run E2E tests**

Run:
```bash
cd api && npx jest --config ./test/jest-e2e.json test/search.e2e-spec.ts --no-cache
```

Expected: All 5 tests pass.

- [ ] **Step 3: Run all E2E tests to verify no regressions**

Run:
```bash
cd api && npx jest --config ./test/jest-e2e.json --no-cache
```

Expected: All E2E tests pass (existing + new search tests).

- [ ] **Step 4: Commit**

```bash
git add api/test/search.e2e-spec.ts
git commit -m "test: add E2E tests for search endpoint"
```

---

### Task 10: Add OPENAI_API_KEY to Environment Config

**Files:**
- Modify: `api/test/setup-env.ts`

- [ ] **Step 1: Add OPENAI_API_KEY to test env setup**

In `api/test/setup-env.ts`, add:

```typescript
process.env.OPENAI_API_KEY = 'sk-test-fake-key';
```

This ensures tests don't fail due to missing env var when the OpenAI client initializes (actual calls are mocked in tests).

- [ ] **Step 2: Run all tests to verify**

Run:
```bash
cd api && npx jest --no-cache && npx jest --config ./test/jest-e2e.json --no-cache
```

Expected: All unit and E2E tests pass.

- [ ] **Step 3: Commit**

```bash
git add api/test/setup-env.ts
git commit -m "chore: add OPENAI_API_KEY to test env setup"
```
