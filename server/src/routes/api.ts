import { Router } from 'express';
import { listDocuments, getDocument } from '../services/documents.js';
import { SearchService } from '../services/search.js';

interface GameDbPaths {
  daggerheart: string;
}

export function createApiRouter(dbPaths: GameDbPaths): Router {
  const router = Router();
  const daggerheartSearch = new SearchService(dbPaths.daggerheart);

  // --- Daggerheart routes ---
  const categories = [
    'classes', 'subclasses', 'ancestries', 'communities',
    'domains', 'armor', 'weapons', 'abilities', 'adversaries'
  ];

  categories.forEach(category => {
    router.get(`/daggerheart/${category}`, (req, res) => {
      const docs = listDocuments(category);
      res.json(docs);
    });

    router.get(`/daggerheart/${category}/:name`, (req, res) => {
      const content = getDocument(category, req.params.name);
      if (!content) {
        return res.status(404).json({ error: `${category.slice(0, -1)} not found` });
      }
      res.json({ content });
    });
  });

  router.post('/daggerheart/search', async (req, res) => {
    try {
      const { query, limit = 5, category } = req.body;
      if (!query) {
        return res.status(400).json({ error: 'query is required' });
      }
      const results = await daggerheartSearch.search(query, limit, category);
      res.json(results);
    } catch (error) {
      console.error('Search error:', error);
      const message = error instanceof Error ? error.message : 'Search failed';
      res.status(500).json({ error: message });
    }
  });

  // Health check
  router.get('/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  return router;
}
