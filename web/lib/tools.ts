import { tool } from 'ai';
import { z } from 'zod';
import { ADVERSARY_TYPES } from '@/lib/adversary-types';

const serverUrl = process.env.SERVER_URL || 'http://localhost:3001';

const categories = [
  { plural: 'classes', singular: 'class' },
  { plural: 'subclasses', singular: 'subclass' },
  { plural: 'ancestries', singular: 'ancestry' },
  { plural: 'communities', singular: 'community' },
  { plural: 'domains', singular: 'domain' },
  { plural: 'armor', singular: 'armor' },
  { plural: 'weapons', singular: 'weapon' },
  { plural: 'adversaries', singular: 'adversary' },
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

// Tools for the adversary encounter builder chat
export const adversaryChatTools = {
  ...rulesTools,
  propose_encounter: tool({
    description: 'Propose a complete encounter with adversaries for the GM to review. Call this when you have built a balanced encounter and are ready to present it. The GM will see a preview and can accept or reject it.',
    inputSchema: z.object({
      name: z.string().describe('A descriptive name for this encounter'),
      adversaries: z.array(z.object({
        name: z.string().describe('Adversary name'),
        type: z.enum(ADVERSARY_TYPES).describe('Adversary role type'),
        tier: z.number().describe('Adversary tier (1-4)'),
        hp: z.number().describe('Hit points'),
        stress: z.number().describe('Stress points'),
        difficulty: z.number().describe('Difficulty / DC'),
        thresholds: z.string().describe('Major/severe thresholds e.g. "8/14"'),
        atk: z.string().describe('Attack modifier e.g. "+1"'),
        attack: z.string().describe('Attack/weapon name'),
        range: z.string().describe('Range: Melee, Very Close, Close, Far, Very Far'),
        damage: z.string().describe('Damage expression e.g. "1d8+1 phy"'),
        description: z.string().optional().describe('Brief description'),
        motives_and_tactics: z.string().optional().describe('Motives and tactics'),
        experience: z.string().optional().describe('Experience value'),
        features: z.array(z.object({
          name: z.string().describe('Feature name'),
          text: z.string().describe('Feature description'),
        })).optional().describe('Special features/abilities'),
      })).describe('Array of adversaries in this encounter'),
    }),
    execute: async (input) => {
      return JSON.stringify(input);
    },
  }),
};
