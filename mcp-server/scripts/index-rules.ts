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
