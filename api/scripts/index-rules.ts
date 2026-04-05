import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import OpenAI from 'openai';
import { readdir, readFile } from 'fs/promises';
import { join, relative } from 'path';

const SRD_PATH = process.env.SRD_PATH as string;
if (!SRD_PATH) {
  console.error('Error: SRD_PATH environment variable is required.');
  console.error('Usage: SRD_PATH=../server/daggerheart-srd npx tsx scripts/index-rules.ts');
  process.exit(1);
}

const SRD_FULL_DOC = join(SRD_PATH, '.build/01_pdf/DH-SRD-2025-09-09.md');
const SKIP_DIRS = ['.build', '.github'];

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });
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

const MAX_CHUNK_CHARS = 24000; // ~6000 tokens, safely under the 8192 limit

function splitLargeChunk(chunk: SRDChunk): SRDChunk[] {
  if (chunk.content.length <= MAX_CHUNK_CHARS) return [chunk];

  // Split by paragraphs first, then fall back to lines, then hard-cut
  const segments = chunk.content.split(/\n\n+/).flatMap((para) => {
    if (para.length <= MAX_CHUNK_CHARS) return [para];
    // Paragraph too big — split by lines
    const lines = para.split('\n');
    const lineGroups: string[] = [];
    let group = '';
    for (const line of lines) {
      if (group.length + line.length + 1 > MAX_CHUNK_CHARS && group.length > 0) {
        lineGroups.push(group);
        group = line;
      } else {
        group = group ? `${group}\n${line}` : line;
      }
    }
    if (group) lineGroups.push(group);
    return lineGroups;
  });

  const subChunks: SRDChunk[] = [];
  let current = '';
  let part = 0;

  for (const seg of segments) {
    if (current.length + seg.length + 2 > MAX_CHUNK_CHARS && current.length > 0) {
      subChunks.push({ ...chunk, id: `${chunk.id}/part-${part}`, content: current.trim() });
      part++;
      current = seg;
    } else {
      current = current ? `${current}\n\n${seg}` : seg;
    }
  }

  if (current.trim().length > 50) {
    subChunks.push({
      ...chunk,
      id: part === 0 ? chunk.id : `${chunk.id}/part-${part}`,
      content: current.trim(),
    });
  }

  return subChunks;
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

  return chunks.flatMap(splitLargeChunk);
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
      console.log(
        `  ${i + 1}. ${chunk.parentHeading} >> ${chunk.heading} (${chunk.content.length} chars)`,
      );
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
