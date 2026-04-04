import { tool } from 'ai';
import { z } from 'zod';
import { ADVERSARY_TYPES } from '@/lib/adversary-types';
import { apiFetch } from '@/lib/srd/api-client';

const serverUrl = process.env.SERVER_URL || 'http://localhost:5000';

const categories = [
  { plural: 'classes', singular: 'class' },
  { plural: 'subclasses', singular: 'subclass' },
  { plural: 'ancestries', singular: 'ancestry' },
  { plural: 'communities', singular: 'community' },
  { plural: 'domains', singular: 'domain' },
  { plural: 'armor', singular: 'armor' },
  { plural: 'weapons', singular: 'weapon' },
  { plural: 'adversaries', singular: 'adversary' },
  { plural: 'items', singular: 'item' },
  { plural: 'consumables', singular: 'consumable' },
];

function authHeaders(token: string | null): Record<string, string> {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// Helper to create list tools
function createListTool(plural: string, token: string | null) {
  return tool({
    description: `List all ${plural}`,
    inputSchema: z.object({}),
    execute: async () => {
      const res = await fetch(`${serverUrl}/srd/${plural}`, {
        headers: authHeaders(token),
      });
      const data = await res.json();
      return Array.isArray(data) ? data.map(item => JSON.stringify(item)).join('\n') : JSON.stringify(data);
    },
  });
}

// Helper to create get tools
function createGetTool(plural: string, singular: string, token: string | null) {
  return tool({
    description: `Get details for a specific ${singular}`,
    inputSchema: z.object({
      id: z.string().uuid().describe(`UUID of the ${singular}`),
    }),
    execute: async ({ id }: { id: string }) => {
      const res = await fetch(`${serverUrl}/srd/${plural}/${id}`, {
        headers: authHeaders(token),
      });
      if (!res.ok) return `${singular} not found`;
      const data = await res.json();
      return data.content as string;
    },
  });
}

// Build tools object
export function createRulesTools(token: string | null) {
  return {
    // List tools
    ...Object.fromEntries(
      categories.map(({ plural }) => [`list_${plural}`, createListTool(plural, token)])
    ),
    // Get tools
    ...Object.fromEntries(
      categories.map(({ plural, singular }) => [`get_${singular}`, createGetTool(plural, singular, token)])
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
        const res = await fetch(`${serverUrl}/search`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...authHeaders(token) },
          body: JSON.stringify({ query, limit, category }),
        });
        const data = await res.json();

        if (!res.ok || !Array.isArray(data)) {
          return data.error || 'Search failed';
        }

        return (data as string[]).join('\n\n---\n\n');
      },
    }),
  };
}


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

type CharacterApiResponse = {
  character: {
    id: string;
    name: string;
    class: { name: string };
    subclass: { name: string };
    ancestry: { name: string };
    secondaryAncestry: { name: string } | null;
    community: { name: string };
    agility: number;
    strength: number;
    finesse: number;
    instinct: number;
    presence: number;
    knowledge: number;
    primaryWeapon: { name: string } | null;
    secondaryWeapon: { name: string } | null;
    armor: { name: string } | null;
    notes: string;
    experiences: { id: string; name: string; modifier: number }[];
    domainCards: { domainCard: { name: string; level: number; domainName: string } }[];
  };
};

// Tool for the character creator chat
export function createCharacterChatTools(token: string | null) {
  return {
    ...createRulesTools(token),
    finalize_character: tool({
    description: 'Finalize a completed character by saving it to the server. Call this once all character creation steps are done (class, subclass, ancestry, community, traits, equipment, experiences, domain cards). All relational fields must be UUIDs obtained from the list/get tools.',
    inputSchema: z.object({
      name: z.string().describe('Character name'),
      classId: z.string().uuid().describe('UUID of the character class'),
      subclassId: z.string().uuid().describe('UUID of the subclass'),
      ancestryId: z.string().uuid().describe('UUID of the primary ancestry'),
      secondaryAncestryId: z.string().uuid().optional().describe('UUID of the secondary ancestry (Mixed Ancestry only)'),
      ancestryFeatureId: z.string().uuid().describe('UUID of the selected primary ancestry feature'),
      secondaryAncestryFeatureId: z.string().uuid().optional().describe('UUID of the selected secondary ancestry feature (Mixed Ancestry only)'),
      communityId: z.string().uuid().describe('UUID of the community'),
      agility: z.number().int().min(-3).max(5).describe('Agility trait modifier'),
      strength: z.number().int().min(-3).max(5).describe('Strength trait modifier'),
      finesse: z.number().int().min(-3).max(5).describe('Finesse trait modifier'),
      instinct: z.number().int().min(-3).max(5).describe('Instinct trait modifier'),
      presence: z.number().int().min(-3).max(5).describe('Presence trait modifier'),
      knowledge: z.number().int().min(-3).max(5).describe('Knowledge trait modifier'),
      primaryWeaponId: z.string().uuid().optional().describe('UUID of the primary weapon'),
      secondaryWeaponId: z.string().uuid().optional().describe('UUID of the secondary weapon'),
      armorId: z.string().uuid().optional().describe('UUID of the armor'),
      notes: z.string().optional().describe('Backstory or other notes'),
      experiences: z.array(z.object({
        name: z.string().describe('Experience phrase'),
        modifier: z.number().int().min(1).max(6).describe('Experience modifier (usually 2)'),
      })).optional().describe('Character experiences'),
      domainCardIds: z.array(z.string().uuid()).optional().describe('UUIDs of selected domain cards'),
    }),
    execute: async (dto) => {
      try {
        const { character: createdCharacter } = await apiFetch<CharacterApiResponse>('/characters', token, {
          method: 'POST',
          body: JSON.stringify(dto),
        });
        return JSON.stringify({
          name: createdCharacter.name,
          class: createdCharacter.class.name,
          subclass: createdCharacter.subclass.name,
          ancestry: createdCharacter.ancestry.name,
          secondaryAncestry: createdCharacter.secondaryAncestry?.name,
          community: createdCharacter.community.name,
          agility: createdCharacter.agility,
          strength: createdCharacter.strength,
          finesse: createdCharacter.finesse,
          instinct: createdCharacter.instinct,
          presence: createdCharacter.presence,
          knowledge: createdCharacter.knowledge,
          primaryWeapon: createdCharacter.primaryWeapon?.name,
          secondaryWeapon: createdCharacter.secondaryWeapon?.name,
          armorName: createdCharacter.armor?.name,
          notes: createdCharacter.notes,
          experiences: createdCharacter.experiences,
          domainCards: createdCharacter.domainCards.map((dc) => ({
            name: dc.domainCard.name,
            level: dc.domainCard.level,
            domain: dc.domainCard.domainName,
          })),
        });
      } catch (err: unknown) {
        return `Failed to create character: ${err instanceof Error ? err.message : String(err)}`;
      }
    },
  }),
  };
}


// Tools for the adversary encounter builder chat
export function createAdversaryChatTools(token: string | null) {
  return {
    ...createRulesTools(token),
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
}

