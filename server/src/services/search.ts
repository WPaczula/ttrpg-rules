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
