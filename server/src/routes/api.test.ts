import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import express from 'express';
import { createApiRouter } from './api.js';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DB_PATH = join(__dirname, '..', '..', 'data', 'embeddings.db');

describe('API routes', () => {
  let app: express.Express;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/api', createApiRouter(DB_PATH));
  });

  describe('GET /api/classes', () => {
    it('returns list of classes', async () => {
      const res = await request(app).get('/api/classes');
      expect(res.status).toBe(200);
      expect(res.body).toContain('Bard');
      expect(res.body.length).toBe(9);
    });
  });

  describe('GET /api/classes/:name', () => {
    it('returns class content', async () => {
      const res = await request(app).get('/api/classes/Bard');
      expect(res.status).toBe(200);
      expect(res.body.content).toContain('# BARD');
    });

    it('returns 404 for non-existent class', async () => {
      const res = await request(app).get('/api/classes/NonExistent');
      expect(res.status).toBe(404);
    });
  });

  // Integration test - requires valid OPENAI_API_KEY
  describe.skip('POST /api/search', () => {
    it('searches rules', async () => {
      const res = await request(app)
        .post('/api/search')
        .send({ query: 'healing', limit: 3 });
      expect(res.status).toBe(200);
      expect(res.body.length).toBeGreaterThan(0);
    });
  });
});
