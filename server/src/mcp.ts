import { config } from 'dotenv';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { listDocumentsWithSummary, getDocument } from './services/documents.js';
import { SearchService } from './services/search.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { z } from 'zod';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Load .env only if not already set (Claude Desktop provides env vars)
// Suppress stderr to avoid dotenv banner interfering with JSON-RPC
if (!process.env.OPENAI_API_KEY) {
  const originalStderr = process.stderr.write;
  process.stderr.write = () => true;
  config({ path: join(__dirname, '..', '.env'), override: true });
  process.stderr.write = originalStderr;
}

const DAGGERHEART_DB = join(__dirname, '..', 'data', 'daggerheart-embeddings.db');

// Initialize services
const searchService = new SearchService(DAGGERHEART_DB);

// MCP Server setup
const mcpServer = new McpServer({
  name: 'daggerheart',
  version: '1.0.0',
});

// Register MCP tools
const categories = [
  'classes', 'subclasses', 'ancestries', 'communities',
  'domains', 'armor', 'weapons', 'adversaries'
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
    const docs = listDocumentsWithSummary(category);
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

// Graceful shutdown
function setupShutdown() {
  const shutdown = async () => {
    console.error('Shutting down...');
    process.exit(0);
  };
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

// Start the server
async function main() {
  setupShutdown();

  const transport = new StdioServerTransport();
  await mcpServer.connect(transport);
  console.error('Daggerheart MCP server running on stdio');
}

main().catch(err => {
  console.error('Fatal error starting MCP server:', err);
  process.exit(1);
});
