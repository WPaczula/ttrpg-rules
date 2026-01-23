import Anthropic from '@anthropic-ai/sdk';

type Tool = Anthropic.Messages.Tool;

const categories = [
  { plural: 'classes', singular: 'class' },
  { plural: 'subclasses', singular: 'subclass' },
  { plural: 'ancestries', singular: 'ancestry' },
  { plural: 'communities', singular: 'community' },
  { plural: 'domains', singular: 'domain' },
  { plural: 'armor', singular: 'armor' },
  { plural: 'weapons', singular: 'weapon' },
];

export const RULES_TOOLS: Tool[] = [
  // List tools
  ...categories.map(({ plural }) => ({
    name: `list_${plural}`,
    description: `List all ${plural}`,
    input_schema: {
      type: 'object' as const,
      properties: {},
      required: [],
    },
  })),
  // Get tools
  ...categories.map(({ plural, singular }) => ({
    name: `get_${singular}`,
    description: `Get details for a specific ${singular}`,
    input_schema: {
      type: 'object' as const,
      properties: {
        name: { type: 'string', description: `Name of the ${singular}` },
      },
      required: ['name'],
    },
  })),
  // Search tool
  {
    name: 'search_rules',
    description: 'Search rules by semantic meaning. Use for open-ended questions.',
    input_schema: {
      type: 'object' as const,
      properties: {
        query: { type: 'string', description: 'What to search for' },
        limit: { type: 'number', description: 'Max results (default 5)' },
        category: { type: 'string', description: 'Filter by category' },
      },
      required: ['query'],
    },
  },
];

export async function executeTool(
  name: string,
  input: Record<string, unknown>
): Promise<string> {
  const serverUrl = process.env.SERVER_URL || 'http://localhost:3001';

  // Handle list tools
  if (name.startsWith('list_')) {
    const category = name.replace('list_', '');
    const res = await fetch(`${serverUrl}/api/${category}`);
    const data = await res.json();
    return Array.isArray(data) ? data.join('\n') : JSON.stringify(data);
  }

  // Handle get tools
  if (name.startsWith('get_')) {
    const singular = name.replace('get_', '');
    const plural = singular === 'class' ? 'classes'
      : singular === 'ancestry' ? 'ancestries'
      : singular === 'community' ? 'communities'
      : `${singular}s`;
    const res = await fetch(`${serverUrl}/api/${plural}/${input.name}`);
    if (!res.ok) return `${singular} not found`;
    const data = await res.json();
    return data.content;
  }

  // Handle search
  if (name === 'search_rules') {
    const res = await fetch(`${serverUrl}/api/search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });
    const data = await res.json();
    return data.map((r: { id: string; content: string }) =>
      `## ${r.id}\n\n${r.content}`
    ).join('\n\n---\n\n');
  }

  return `Unknown tool: ${name}`;
}
