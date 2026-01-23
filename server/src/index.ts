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
const DB_PATH = join(__dirname, '..', 'data', 'embeddings.db');
const PORT = process.env.PORT || 3001;

// Initialize services
const searchService = new SearchService(DB_PATH);

// Create Express app
const app = express();
app.use(cors());
app.use(express.json());

// REST API routes
app.use('/api', createApiRouter(DB_PATH));

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
  mcpServer.tool(
    `list_${category}`,
    `List all ${category}`,
    {},
    async () => {
      const docs = listDocuments(category);
      return { content: [{ type: 'text', text: docs.join('\n') }] };
    }
  );

  // Get tool
  mcpServer.tool(
    `get_${singular}`,
    `Get details for a specific ${singular}`,
    { name: z.string().describe(`Name of the ${singular}`) },
    async ({ name }) => {
      const content = getDocument(category, name);
      if (!content) {
        return { content: [{ type: 'text', text: `${singular} "${name}" not found` }] };
      }
      return { content: [{ type: 'text', text: content }] };
    }
  );
});

// Search tool
mcpServer.tool(
  'search_rules',
  'Search rules by semantic meaning',
  {
    query: z.string().describe('What to search for'),
    limit: z.number().optional().describe('Max results (default 5)'),
    category: z.string().optional().describe('Filter by category'),
  },
  async ({ query, limit = 5, category }) => {
    const results = await searchService.search(query, limit, category);
    const text = results.map(r => `## ${r.id}\n\n${r.content}`).join('\n\n---\n\n');
    return { content: [{ type: 'text', text }] };
  }
);

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
