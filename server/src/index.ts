import { config } from 'dotenv';
import express from 'express';
import cors from 'cors';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { createApiRouter } from './routes/api.js';
import { listDocuments, getDocument } from './services/documents.js';
import { SearchService } from './services/search.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { z } from 'zod';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Load .env from project root (one level up from dist/)
const envPath = join(__dirname, '..', '.env');
console.log(`Loading .env from: ${envPath}`);
console.log(`Before dotenv - OPENAI_API_KEY: ${process.env.OPENAI_API_KEY?.slice(0, 7)}...`);

const result = config({ path: envPath, override: true });
console.log(`Dotenv result:`, result.error ? result.error.message : 'OK');
console.log(`After dotenv - OPENAI_API_KEY: ${process.env.OPENAI_API_KEY?.slice(0, 7)}...`);
const DAGGERHEART_DB = join(__dirname, '..', 'data', 'daggerheart-embeddings.db');
const PORT = process.env.PORT || 3001;

// Initialize services
const searchService = new SearchService(DAGGERHEART_DB);

// Create Express app
const app = express();
app.use(cors());
app.use(express.json());

// REST API routes
app.use('/api', createApiRouter(DAGGERHEART_DB));

// MCP Server setup
const mcpServer = new McpServer({
  name: 'ttrpg-rules',
  version: '1.0.0',
});

// Register MCP tools
const categories = [
  'classes', 'subclasses', 'ancestries', 'communities',
  'domains', 'armor', 'weapons'
];

categories.forEach(category => {
  const singular = category.endsWith('ies')
    ? category.slice(0, -3) + 'y'
    : category.endsWith('es')
      ? category.slice(0, -2)
      : category.slice(0, -1);

  // List tool
  mcpServer.registerTool(`list_${category}`, {
    description: `List all ${category}`,
    inputSchema: {}
  }, async () => {
    const docs = listDocuments(category);
    return { content: [{ type: 'text', text: docs.join('\n') }] };
  });

  // Get tool
  mcpServer.registerTool(`get_${singular}`, {
    description: `Get details for a specific ${singular}`,
    inputSchema: {
      name: z.string().describe(`Name of the ${singular}`)
    }
  }, async ({ name }) => {
    const content = getDocument(category, name);
    if (!content) {
      return { content: [{ type: 'text', text: `${singular} "${name}" not found` }] };
    }
    return { content: [{ type: 'text', text: content }] };
  });
});

// Search tool
mcpServer.registerTool('search_rules', {
  description: 'Search rules by semantic meaning',
  inputSchema: {
    query: z.string().describe('What to search for'),
    limit: z.number().optional().describe('Max results (default 5)'),
    category: z.string().optional().describe('Filter by category'),
  }
}, async ({ query, limit = 5, category }) => {
  const results = await searchService.search(query, limit, category);
  const text = results.map(r => `## ${r.id}\n\n${r.content}`).join('\n\n---\n\n');
  return { content: [{ type: 'text', text }] };
});

// MCP endpoint (Streamable HTTP) - placeholder until SDK supports it
// For now, keep stdio support for local development
app.get('/mcp', (req, res) => {
  res.json({
    message: 'MCP endpoint - use Claude Desktop with stdio transport for now',
    tools: categories.flatMap(c => [`list_${c}`, `get_${c.slice(0, -1)}`]).concat(['search_rules'])
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`REST API: http://localhost:${PORT}/api`);
});

// Also support stdio for local MCP
if (process.argv.includes('--stdio')) {
  import('@modelcontextprotocol/sdk/server/stdio.js').then(({ StdioServerTransport }) => {
    const transport = new StdioServerTransport();
    mcpServer.connect(transport);
    console.error('MCP server running on stdio');
  });
}
