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

// Shared adversary input schema fields (reused by propose_encounter and create_adversary)
const adversaryFields = {
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
};

// Tool for the character creator chat
export const characterChatTools = {
  ...rulesTools,
  finalize_character: tool({
    description: 'Finalize a completed character and present it as a summary card for the player to apply to their character sheet. Call this once all character creation steps are done (class, subclass, ancestry, community, traits, equipment, experiences, domain cards).',
    inputSchema: z.object({
      name: z.string().describe('Character name'),
      class: z.string().describe('Character class'),
      subclass: z.string().describe('Character subclass'),
      ancestry: z.string().describe('Character ancestry'),
      secondaryAncestry: z.string().optional().describe('Secondary ancestry if the player chose the Mixed Ancestry option (leave empty for single ancestry)'),
      ancestryFeature: z.string().optional().describe('Selected feature from the primary ancestry (required for mixed ancestry)'),
      secondaryAncestryFeature: z.string().optional().describe('Selected feature from the secondary ancestry (required for mixed ancestry)'),
      community: z.string().describe('Character community'),
      level: z.number().optional().describe('Character level (default 1)'),
      agility: z.number().describe('Agility trait modifier'),
      strength: z.number().describe('Strength trait modifier'),
      finesse: z.number().describe('Finesse trait modifier'),
      instinct: z.number().describe('Instinct trait modifier'),
      presence: z.number().describe('Presence trait modifier'),
      knowledge: z.number().describe('Knowledge trait modifier'),
      hpTotal: z.number().describe('Total hit points'),
      stressTotal: z.number().optional().describe('Total stress (default 6)'),
      evasion: z.number().describe('Evasion score'),
      armorScore: z.number().optional().describe('Armor score from equipped armor'),
      minorThreshold: z.number().optional().describe('Minor damage threshold'),
      majorThreshold: z.number().optional().describe('Major damage threshold'),
      severeThreshold: z.number().optional().describe('Severe damage threshold'),
      primaryWeapon: z.string().optional().describe('Primary weapon name'),
      secondaryWeapon: z.string().optional().describe('Secondary weapon name'),
      armorName: z.string().optional().describe('Armor name'),
      experiences: z.array(z.object({
        name: z.string().describe('Experience phrase'),
        modifier: z.number().describe('Experience modifier (usually +2)'),
      })).optional().describe('Character experiences'),
      domainCards: z.array(z.object({
        name: z.string().describe('Domain card name'),
        level: z.number().describe('Card level'),
        domain: z.string().describe('Domain name'),
      })).optional().describe('Selected domain cards'),
      features: z.string().optional().describe('Class/ancestry/community features summary'),
      notes: z.string().optional().describe('Backstory or other notes'),
    }),
    execute: async (input) => {
      return JSON.stringify(input);
    },
  }),
};

// Tools for the adversary encounter builder chat
export const adversaryChatTools = {
  ...rulesTools,
  create_adversary: tool({
    description: 'Create a single custom adversary for the GM to review and add to the active encounter. Call this when the GM asks to design or add an individual adversary rather than a full encounter.',
    inputSchema: z.object(adversaryFields),
    execute: async (input) => {
      return JSON.stringify(input);
    },
  }),
  propose_encounter: tool({
    description: 'Propose a complete encounter with adversaries for the GM to review. Call this when you have built a balanced encounter and are ready to present it. The GM will see a preview and can accept or reject it.',
    inputSchema: z.object({
      name: z.string().describe('A descriptive name for this encounter'),
      adversaries: z.array(z.object(adversaryFields)).describe('Array of adversaries in this encounter'),
    }),
    execute: async (input) => {
      return JSON.stringify(input);
    },
  }),
};
