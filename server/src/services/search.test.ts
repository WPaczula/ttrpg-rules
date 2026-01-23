import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { SearchService } from './search.js';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DB_PATH = join(__dirname, '..', '..', 'data', 'embeddings.db');

// Integration tests - require valid OPENAI_API_KEY environment variable
// Run with: OPENAI_API_KEY=your-key npm test -- src/services/search.test.ts
describe.skip('SearchService (integration)', () => {
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
