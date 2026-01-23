import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { VectorStore } from './vector-store.js';
import { unlinkSync, existsSync } from 'fs';

const TEST_DB = 'data/test-vectors.db';

describe('VectorStore', () => {
  let store: VectorStore;

  beforeEach(() => {
    store = new VectorStore(TEST_DB);
  });

  afterEach(() => {
    store.close();
    if (existsSync(TEST_DB)) unlinkSync(TEST_DB);
  });

  it('stores and retrieves a document', () => {
    const embedding = [0.1, 0.2, 0.3];
    store.upsert('doc1', 'Test content', 'abilities', embedding);

    const results = store.search(embedding, 1);
    expect(results).toHaveLength(1);
    expect(results[0].id).toBe('doc1');
    expect(results[0].content).toBe('Test content');
  });

  it('returns similar documents first', () => {
    store.upsert('doc1', 'First', 'abilities', [1, 0, 0]);
    store.upsert('doc2', 'Second', 'abilities', [0, 1, 0]);
    store.upsert('doc3', 'Third', 'abilities', [0.9, 0.1, 0]);

    const results = store.search([1, 0, 0], 2);
    expect(results[0].id).toBe('doc1');
    expect(results[1].id).toBe('doc3');
  });
});
