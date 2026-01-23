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
