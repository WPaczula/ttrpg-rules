import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { VectorStore } from './vector-store.js';
import { generateEmbedding } from './embeddings.js';

const DB_PATH = 'data/embeddings.db';

const server = new Server(
  { name: 'daggerheart-mcp', version: '0.1.0' },
  { capabilities: { tools: {} } }
);

let store: VectorStore;

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: 'search_rules',
      description: 'Search Daggerheart rules by semantic meaning. Use this to find rules about combat, abilities, character creation, etc.',
      inputSchema: {
        type: 'object',
        properties: {
          query: { type: 'string', description: 'What to search for' },
          limit: { type: 'number', description: 'Max results (default 5)' },
          category: { type: 'string', description: 'Filter by category: abilities, adversaries, ancestries, armor, classes, communities, consumables, contents, domains, environments, frames, items, subclasses, weapons' },
        },
        required: ['query'],
      },
    },
    {
      name: 'get_adversary',
      description: 'Get a specific adversary/monster by name',
      inputSchema: {
        type: 'object',
        properties: {
          name: { type: 'string', description: 'Adversary name' },
        },
        required: ['name'],
      },
    },
    {
      name: 'get_ability',
      description: 'Get a specific ability by name',
      inputSchema: {
        type: 'object',
        properties: {
          name: { type: 'string', description: 'Ability name' },
        },
        required: ['name'],
      },
    },
    {
      name: 'list_adversaries',
      description: 'List all adversaries, optionally filtered by tier',
      inputSchema: {
        type: 'object',
        properties: {
          tier: { type: 'string', description: 'Filter by tier (e.g., "Tier 1", "Tier 2")' },
        },
      },
    },
    {
      name: 'list_abilities',
      description: 'List all abilities, optionally filtered by class or domain',
      inputSchema: {
        type: 'object',
        properties: {
          filter: { type: 'string', description: 'Filter text to match in ability content' },
        },
      },
    },
  ],
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  switch (name) {
    case 'search_rules': {
      const { query, limit = 5, category } = args as { query: string; limit?: number; category?: string };
      const embedding = await generateEmbedding(query);
      const results = store.search(embedding, limit, category);
      return {
        content: [{ type: 'text', text: results.map(r => `## ${r.id}\n\n${r.content}`).join('\n\n---\n\n') }],
      };
    }

    case 'get_adversary': {
      const { name: advName } = args as { name: string };
      const fileName = `adversaries/${advName}.md`;
      const doc = store.getById(fileName);
      if (!doc) {
        return { content: [{ type: 'text', text: `Adversary "${advName}" not found. Try search_rules to find it.` }] };
      }
      return { content: [{ type: 'text', text: doc.content }] };
    }

    case 'get_ability': {
      const { name: abilityName } = args as { name: string };
      const fileName = `abilities/${abilityName}.md`;
      const doc = store.getById(fileName);
      if (!doc) {
        return { content: [{ type: 'text', text: `Ability "${abilityName}" not found. Try search_rules to find it.` }] };
      }
      return { content: [{ type: 'text', text: doc.content }] };
    }

    case 'list_adversaries': {
      const { tier } = args as { tier?: string };
      const adversaries = store.listByCategory('adversaries');
      let filtered = adversaries;
      if (tier) {
        filtered = adversaries.filter(a => a.content.includes(tier));
      }
      const names = filtered.map(a => {
        const match = a.content.match(/^#\s*(.+)/m);
        return match ? match[1] : a.id;
      });
      return { content: [{ type: 'text', text: names.join('\n') }] };
    }

    case 'list_abilities': {
      const { filter } = args as { filter?: string };
      const abilities = store.listByCategory('abilities');
      let filtered = abilities;
      if (filter) {
        filtered = abilities.filter(a => a.content.toLowerCase().includes(filter.toLowerCase()));
      }
      const names = filtered.map(a => {
        const match = a.content.match(/^#\s*(.+)/m);
        return match ? match[1] : a.id;
      });
      return { content: [{ type: 'text', text: names.join('\n') }] };
    }

    default:
      throw new Error(`Unknown tool: ${name}`);
  }
});

async function main() {
  store = new VectorStore(DB_PATH);
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Daggerheart MCP server running');
}

main().catch(console.error);
