import { tool } from 'ai';
import { z } from 'zod';

const serverUrl = process.env.SERVER_URL || 'http://localhost:3001';

const categories = [
  { plural: 'classes', singular: 'class' },
  { plural: 'subclasses', singular: 'subclass' },
  { plural: 'ancestries', singular: 'ancestry' },
  { plural: 'communities', singular: 'community' },
  { plural: 'domains', singular: 'domain' },
  { plural: 'armor', singular: 'armor' },
  { plural: 'weapons', singular: 'weapon' },
];

// Helper to create list tools
function createListTool(plural: string) {
  return tool({
    description: `List all ${plural}`,
    inputSchema: z.object({}),
    execute: async () => {
      const res = await fetch(`${serverUrl}/api/daggerheart/${plural}`);
      const data = await res.json();
      return Array.isArray(data) ? data.join('\n') : JSON.stringify(data);
    },
  });
}

// Helper to create get tools
function createGetTool(plural: string, singular: string) {
  return tool({
    description: `Get details for a specific ${singular}`,
    inputSchema: z.object({
      name: z.string().describe(`Name of the ${singular}`),
    }),
    execute: async ({ name }: { name: string }) => {
      const res = await fetch(`${serverUrl}/api/daggerheart/${plural}/${name}`);
      if (!res.ok) return `${singular} not found`;
      const data = await res.json();
      return data.content as string;
    },
  });
}

// Build tools object
export const rulesTools = {
  // List tools
  ...Object.fromEntries(
    categories.map(({ plural }) => [`list_${plural}`, createListTool(plural)])
  ),
  // Get tools
  ...Object.fromEntries(
    categories.map(({ plural, singular }) => [`get_${singular}`, createGetTool(plural, singular)])
  ),
  // Search tool
  search_rules: tool({
    description: 'Search rules by semantic meaning. Use for open-ended questions.',
    inputSchema: z.object({
      query: z.string().describe('What to search for'),
      limit: z.number().optional().describe('Max results (default 5)'),
      category: z.string().optional().describe('Filter by category'),
    }),
    execute: async ({ query, limit, category }: { query: string; limit?: number; category?: string }) => {
      const res = await fetch(`${serverUrl}/api/daggerheart/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, limit, category }),
      });
      const data = await res.json();

      if (!res.ok || !Array.isArray(data)) {
        return data.error || 'Search failed';
      }

      return data.map((r: { id: string; content: string }) =>
        `## ${r.id}\n\n${r.content}`
      ).join('\n\n---\n\n');
    },
  }),
};
