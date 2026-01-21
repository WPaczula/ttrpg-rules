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
