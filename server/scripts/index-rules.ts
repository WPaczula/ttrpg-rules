import { readdir, readFile } from 'fs/promises';
import { join, relative } from 'path';
import { VectorStore } from '../src/vector-store.js';
import { generateEmbedding } from '../src/embeddings.js';

const GAMES: Record<string, { srdPath: string; dbPath: string }> = {
  daggerheart: {
    srdPath: 'daggerheart-srd',
    dbPath: 'data/daggerheart-embeddings.db',
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
    const match = line.match(/^#{2,3}\s+(.+)/);
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

async function main() {
  const gameArg = process.argv.find(a => a.startsWith('--game='));
  const game = gameArg?.split('=')[1];

  if (!game || !GAMES[game]) {
    console.error('Usage: --game=daggerheart');
    process.exit(1);
  }

  console.log(`Indexing ${game} rules...`);
  const config = GAMES[game];
  await indexDaggerheart(config);
}

main().catch(console.error);
