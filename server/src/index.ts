import { config } from 'dotenv';
import express from 'express';
import cors from 'cors';
import { createApiRouter } from './routes/api.js';
import { createMcpRouter } from './routes/mcp.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Load .env from project root (one level up from dist/)
config({ path: join(__dirname, '..', '.env'), override: true });

const DAGGERHEART_DB = join(__dirname, '..', 'data', 'daggerheart-embeddings.db');
const PORT = process.env.PORT || 3001;

// Create Express app
const app = express();
app.use(cors());
app.use(express.json());

// REST API routes
app.use('/api', createApiRouter({ daggerheart: DAGGERHEART_DB }));

// MCP Server endpoint (HTTP with SSE)
app.use('/mcp', createMcpRouter({ daggerheartDb: DAGGERHEART_DB }));

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`REST API: http://localhost:${PORT}/api`);
  console.log(`MCP Server (SSE): http://localhost:${PORT}/mcp`);
  console.log(`MCP Health: http://localhost:${PORT}/mcp/health`);
});
