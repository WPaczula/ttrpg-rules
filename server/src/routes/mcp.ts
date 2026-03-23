import { Router, Request, Response } from 'express';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { listDocumentsWithSummary, getDocument } from '../services/documents.js';
import { SearchService } from '../services/search.js';
import { randomUUID } from 'node:crypto';
import { z } from 'zod';

interface McpRouterOptions {
  daggerheartDb: string;
}

export function createMcpRouter(options: McpRouterOptions): Router {
  const router = Router();
  const searchService = new SearchService(options.daggerheartDb);

  // Store active transports by session ID
  const transports: Record<string, StreamableHTTPServerTransport> = {};

  // Helper to create and configure MCP server instance
  function createMcpServer(): McpServer {
    const mcpServer = new McpServer({
      name: 'daggerheart',
      version: '1.0.0',
    }, {
      capabilities: {
        tools: {},
      },
    });

    // Register all Daggerheart tools
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

    return mcpServer;
  }

  // Unified /mcp endpoint - handles GET (SSE) and POST (messages)
  router.all('/', async (req: Request, res: Response) => {
    try {
      const method = req.method;
      const sessionId = (req.headers['x-session-id'] as string);

      console.log(`MCP: ${method} request${sessionId ? `, session ${sessionId}` : ''}`);

      // Get existing transport or create new one
      let transport = sessionId ? transports[sessionId] : null;

      if (!transport) {
        // Create new transport
        transport = new StreamableHTTPServerTransport({
          sessionIdGenerator: () => randomUUID(),
          onsessioninitialized: (sid) => {
            console.log(`MCP: Session initialized with ID: ${sid}`);
            transports[sid] = transport!;
          }
        });

        // Set up onclose handler
        transport.onclose = () => {
          const sid = transport!.sessionId;
          if (sid && transports[sid]) {
            console.log(`MCP: Transport closed for session ${sid}`);
            delete transports[sid];
          }
        };

        // Create and connect MCP server
        const mcpServer = createMcpServer();
        await mcpServer.connect(transport);

        console.log(`MCP: New session created`);
      }

      // Handle request based on method
      if (method === 'GET' || method === 'POST') {
        // Both GET (SSE) and POST (messages) use handleRequest
        await transport.handleRequest(req, res);

      } else if (method === 'DELETE') {
        // DELETE = close session
        if (sessionId && transports[sessionId]) {
          transports[sessionId].close();
          delete transports[sessionId];
        }
        res.json({ success: true });

      } else {
        res.status(405).json({ error: 'Method not allowed' });
      }

    } catch (error) {
      console.error('MCP error:', error);
      if (!res.headersSent) {
        res.status(500).json({
          error: 'MCP server error',
          details: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
  });

  // Health check endpoint
  router.get('/health', (req: Request, res: Response) => {
    res.json({
      status: 'ok',
      activeSessions: Object.keys(transports).length,
      transport: 'streamable-http',
      mcpVersion: '2025-03-26'
    });
  });

  return router;
}
