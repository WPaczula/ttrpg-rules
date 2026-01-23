import { Router } from 'express';
import { listDocuments, getDocument } from '../services/documents.js';
import { SearchService } from '../services/search.js';

export function createApiRouter(dbPath: string): Router {
  const router = Router();
  const searchService = new SearchService(dbPath);

  // Generic document routes for each category
  const categories = [
    'classes', 'subclasses', 'ancestries', 'communities',
    'domains', 'armor', 'weapons', 'abilities', 'adversaries'
  ];

  categories.forEach(category => {
    // List all in category
    router.get(`/${category}`, (req, res) => {
      const docs = listDocuments(category);
      res.json(docs);
    });

    // Get specific document
    router.get(`/${category}/:name`, (req, res) => {
      const content = getDocument(category, req.params.name);
      if (!content) {
        return res.status(404).json({ error: `${category.slice(0, -1)} not found` });
      }
      res.json({ content });
    });
  });

  // Search endpoint
  router.post('/search', async (req, res) => {
    try {
      const { query, limit = 5, category } = req.body;
      if (!query) {
        return res.status(400).json({ error: 'query is required' });
      }
      const results = await searchService.search(query, limit, category);
      res.json(results);
    } catch (error) {
      res.status(500).json({ error: 'Search failed' });
    }
  });

  // Health check
  router.get('/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  return router;
}
