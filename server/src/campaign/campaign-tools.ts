import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { Driver, Record as Neo4jRecord, Integer } from 'neo4j-driver';
import neo4j from 'neo4j-driver';
import { z } from 'zod';

const VALID_ENTITY_TYPES = [
  'Campaign', 'Arc', 'Session', 'NPC', 'Location',
  'Faction', 'PlotThread', 'Item', 'PC',
] as const;

const VALID_REL_TYPES = [
  'BELONGS_TO', 'LOCATED_AT', 'PART_OF', 'INVOLVES',
  'KNOWS_ABOUT', 'POSSESSES', 'ALLIED_WITH', 'HOSTILE_TO',
  'APPEARED_IN',
] as const;

// Entity types that default to revealed=true
const REVEALED_BY_DEFAULT = new Set(['Campaign', 'Arc', 'Session', 'PC']);

function textResponse(text: string) {
  return { content: [{ type: 'text' as const, text }] };
}

function formatNodeProperties(props: Record<string, unknown>): string {
  return Object.entries(props)
    .filter(([_, v]) => v !== null && v !== undefined)
    .map(([k, v]) => {
      const display = Integer.isInteger(v) ? (v as Integer).toNumber() : v;
      return `- **${k}:** ${display}`;
    })
    .join('\n');
}

function recordToProps(record: Neo4jRecord, alias: string): Record<string, unknown> {
  const node = record.get(alias);
  return node.properties;
}

function toInt(n: number): Integer {
  return neo4j.int(n);
}

export function registerCampaignTools(mcpServer: McpServer, driver: Driver): void {

  // ──────────────────────────────────────
  // QUERY TOOLS
  // ──────────────────────────────────────

  mcpServer.registerTool('get_campaign_overview', {
    description: 'Returns the Campaign node properties (name, tone, setting, overview)',
    inputSchema: {},
  }, async () => {
    const session = driver.session();
    try {
      const result = await session.run('MATCH (c:Campaign) RETURN c LIMIT 1');
      if (result.records.length === 0) {
        return textResponse('No campaign found. Create one with create_entity(type: "Campaign", properties: { name, tone, setting, overview }).');
      }
      const props = recordToProps(result.records[0], 'c');
      return textResponse(`# Campaign: ${props.name}\n\n${formatNodeProperties(props)}`);
    } finally {
      await session.close();
    }
  });

  mcpServer.registerTool('get_current_arc', {
    description: 'Returns the currently active Arc node',
    inputSchema: {},
  }, async () => {
    const session = driver.session();
    try {
      const result = await session.run(
        `MATCH (a:Arc {status: 'active'}) RETURN a LIMIT 1`
      );
      if (result.records.length === 0) {
        return textResponse('No active arc found. Create one with create_arc.');
      }
      const props = recordToProps(result.records[0], 'a');
      return textResponse(`# Current Arc: ${props.name || props.title}\n\n${formatNodeProperties(props)}`);
    } finally {
      await session.close();
    }
  });

  mcpServer.registerTool('get_recent_sessions', {
    description: 'Get summaries of the most recent sessions',
    inputSchema: {
      count: z.number().optional().describe('Number of recent sessions to return (default 2)'),
    },
  }, async ({ count = 2 }) => {
    const session = driver.session();
    try {
      const result = await session.run(
        'MATCH (s:Session) RETURN s ORDER BY s.number DESC LIMIT $count',
        { count: toInt(count) }
      );
      if (result.records.length === 0) {
        return textResponse('No sessions found yet.');
      }
      const text = result.records.map(r => {
        const props = r.get('s').properties;
        const num = Integer.isInteger(props.number) ? (props.number as Integer).toNumber() : props.number;
        return `## Session ${num}\n**Date:** ${props.date || 'N/A'}\n**One-liner:** ${props.one_liner || 'N/A'}\n\n${props.summary || 'No summary'}`;
      }).join('\n\n---\n\n');
      return textResponse(text);
    } finally {
      await session.close();
    }
  });

  mcpServer.registerTool('query_entities', {
    description: 'Search entities by label type. Optional filter matched against name and description.',
    inputSchema: {
      type: z.string().describe('Entity type (Campaign, Arc, Session, NPC, Location, Faction, PlotThread, Item, PC)'),
      filter: z.string().optional().describe('Optional text to filter by name or description'),
    },
  }, async ({ type, filter }) => {
    validateEntityType(type);
    const session = driver.session();
    try {
      let cypher: string;
      let params: Record<string, unknown> = {};

      if (filter) {
        cypher = `MATCH (n:${type}) WHERE toLower(n.name) CONTAINS toLower($filter) OR toLower(n.description) CONTAINS toLower($filter) RETURN n`;
        params = { filter };
      } else {
        cypher = `MATCH (n:${type}) RETURN n`;
      }

      const result = await session.run(cypher, params);
      if (result.records.length === 0) {
        return textResponse(`No ${type} entities found${filter ? ` matching "${filter}"` : ''}.`);
      }

      const text = result.records.map(r => {
        const props = r.get('n').properties;
        const desc = props.description ? ` - ${truncate(String(props.description), 100)}` : '';
        return `- **${props.name || props.title}**${desc}`;
      }).join('\n');

      return textResponse(`# ${type} Entities\n\n${text}`);
    } finally {
      await session.close();
    }
  });

  mcpServer.registerTool('get_entity', {
    description: 'Get full details on a specific entity plus all its relationships',
    inputSchema: {
      type: z.string().describe('Entity type'),
      name: z.string().describe('Entity name'),
    },
  }, async ({ type, name }) => {
    validateEntityType(type);
    const session = driver.session();
    try {
      // Get the node
      const nodeResult = await session.run(
        `MATCH (n:${type} {name: $name}) RETURN n`,
        { name }
      );
      if (nodeResult.records.length === 0) {
        return textResponse(`${type} "${name}" not found.`);
      }
      const props = recordToProps(nodeResult.records[0], 'n');

      // Get all relationships (outgoing)
      const outResult = await session.run(
        `MATCH (n:${type} {name: $name})-[r]->(m) RETURN type(r) as relType, labels(m) as targetLabels, m.name as targetName`,
        { name }
      );

      // Get all relationships (incoming)
      const inResult = await session.run(
        `MATCH (n:${type} {name: $name})<-[r]-(m) RETURN type(r) as relType, labels(m) as sourceLabels, m.name as sourceName`,
        { name }
      );

      let text = `# ${type}: ${name}\n\n## Properties\n${formatNodeProperties(props)}`;

      if (outResult.records.length > 0) {
        text += '\n\n## Outgoing Relationships\n';
        text += outResult.records.map(r => {
          const relType = r.get('relType');
          const labels = r.get('targetLabels');
          const targetName = r.get('targetName');
          return `- --[${relType}]--> ${labels.join(':')} "${targetName}"`;
        }).join('\n');
      }

      if (inResult.records.length > 0) {
        text += '\n\n## Incoming Relationships\n';
        text += inResult.records.map(r => {
          const relType = r.get('relType');
          const labels = r.get('sourceLabels');
          const sourceName = r.get('sourceName');
          return `- <--[${relType}]-- ${labels.join(':')} "${sourceName}"`;
        }).join('\n');
      }

      return textResponse(text);
    } finally {
      await session.close();
    }
  });

  mcpServer.registerTool('get_unrevealed', {
    description: 'Get all entities where revealed=false, optionally filtered by type',
    inputSchema: {
      type: z.string().optional().describe('Optional entity type to filter by'),
    },
  }, async ({ type }) => {
    if (type) validateEntityType(type);
    const session = driver.session();
    try {
      const label = type || '';
      const cypher = label
        ? `MATCH (n:${label} {revealed: false}) RETURN n, labels(n) as labels`
        : `MATCH (n {revealed: false}) RETURN n, labels(n) as labels`;

      const result = await session.run(cypher);
      if (result.records.length === 0) {
        return textResponse('No unrevealed entities found.');
      }

      const text = result.records.map(r => {
        const props = r.get('n').properties;
        const labels = r.get('labels');
        const plannedReveal = props.planned_reveal ? ` (planned: ${props.planned_reveal})` : '';
        return `- **[${labels.join(', ')}]** ${props.name || props.title}${plannedReveal}`;
      }).join('\n');

      return textResponse(`# Unrevealed Entities\n\n${text}`);
    } finally {
      await session.close();
    }
  });

  mcpServer.registerTool('get_connections', {
    description: 'Get all relationships for a node by name',
    inputSchema: {
      name: z.string().describe('Entity name'),
    },
  }, async ({ name }) => {
    const session = driver.session();
    try {
      const result = await session.run(
        `MATCH (n {name: $name})-[r]-(m)
         RETURN type(r) as relType,
                labels(n) as sourceLabels,
                labels(m) as targetLabels,
                m.name as connectedName,
                startNode(r) = n as isOutgoing`,
        { name }
      );

      if (result.records.length === 0) {
        // Check if node even exists
        const exists = await session.run(
          'MATCH (n {name: $name}) RETURN n LIMIT 1',
          { name }
        );
        if (exists.records.length === 0) {
          return textResponse(`No entity found with name "${name}".`);
        }
        return textResponse(`"${name}" has no connections.`);
      }

      const text = result.records.map(r => {
        const relType = r.get('relType');
        const connectedName = r.get('connectedName');
        const targetLabels = r.get('targetLabels');
        const isOutgoing = r.get('isOutgoing');
        const arrow = isOutgoing
          ? `--[${relType}]--> ${targetLabels.join(':')} "${connectedName}"`
          : `<--[${relType}]-- ${targetLabels.join(':')} "${connectedName}"`;
        return `- ${arrow}`;
      }).join('\n');

      return textResponse(`# Connections for "${name}"\n\n${text}`);
    } finally {
      await session.close();
    }
  });

  mcpServer.registerTool('get_open_threads', {
    description: 'Get all open plot threads',
    inputSchema: {},
  }, async () => {
    const session = driver.session();
    try {
      const result = await session.run(
        `MATCH (p:PlotThread {status: 'open'}) RETURN p`
      );
      if (result.records.length === 0) {
        return textResponse('No open plot threads.');
      }

      const text = result.records.map(r => {
        const props = r.get('p').properties;
        return `## ${props.name || props.title}\n${props.description || 'No description'}`;
      }).join('\n\n---\n\n');

      return textResponse(`# Open Plot Threads\n\n${text}`);
    } finally {
      await session.close();
    }
  });

  // ──────────────────────────────────────
  // MUTATION TOOLS
  // ──────────────────────────────────────

  mcpServer.registerTool('create_entity', {
    description: 'Create a node with the given type and properties. Must include a name property.',
    inputSchema: {
      type: z.string().describe('Entity type (Campaign, Arc, Session, NPC, Location, Faction, PlotThread, Item, PC)'),
      properties: z.record(z.unknown()).describe('Properties for the entity. Must include "name".'),
    },
  }, async ({ type, properties }) => {
    validateEntityType(type);
    if (!properties.name) {
      return textResponse('Error: properties must include a "name" field.');
    }

    const defaults: Record<string, unknown> = {
      revealed: REVEALED_BY_DEFAULT.has(type),
      revealed_in_session: null,
      planned_reveal: null,
      created_in_session: null,
    };

    const merged = { ...defaults, ...properties };

    const session = driver.session();
    try {
      const result = await session.run(
        `CREATE (n:${type} $props) RETURN n`,
        { props: merged }
      );
      const props = recordToProps(result.records[0], 'n');
      return textResponse(`Created ${type}: "${props.name}"\n\n${formatNodeProperties(props)}`);
    } finally {
      await session.close();
    }
  });

  mcpServer.registerTool('update_entity', {
    description: 'Update properties on an existing entity matched by type and name',
    inputSchema: {
      type: z.string().describe('Entity type'),
      name: z.string().describe('Entity name'),
      properties: z.record(z.unknown()).describe('Properties to update'),
    },
  }, async ({ type, name, properties }) => {
    validateEntityType(type);
    const session = driver.session();
    try {
      const result = await session.run(
        `MATCH (n:${type} {name: $name}) SET n += $props RETURN n`,
        { name, props: properties }
      );
      if (result.records.length === 0) {
        return textResponse(`${type} "${name}" not found.`);
      }
      const props = recordToProps(result.records[0], 'n');
      return textResponse(`Updated ${type}: "${name}"\n\n${formatNodeProperties(props)}`);
    } finally {
      await session.close();
    }
  });

  mcpServer.registerTool('create_relationship', {
    description: 'Create a relationship between two entities matched by name',
    inputSchema: {
      from_name: z.string().describe('Name of the source entity'),
      to_name: z.string().describe('Name of the target entity'),
      rel_type: z.string().describe('Relationship type (BELONGS_TO, LOCATED_AT, PART_OF, INVOLVES, KNOWS_ABOUT, POSSESSES, ALLIED_WITH, HOSTILE_TO, APPEARED_IN)'),
      properties: z.record(z.unknown()).optional().describe('Optional properties for the relationship'),
    },
  }, async ({ from_name, to_name, rel_type, properties }) => {
    validateRelType(rel_type);
    const session = driver.session();
    try {
      const propsClause = properties ? ' SET r += $props' : '';
      const result = await session.run(
        `MATCH (a {name: $from}), (b {name: $to})
         CREATE (a)-[r:${rel_type}]->(b)${propsClause}
         RETURN a.name as from, type(r) as rel, b.name as to`,
        { from: from_name, to: to_name, props: properties || {} }
      );
      if (result.records.length === 0) {
        return textResponse(`Could not create relationship. Check that both "${from_name}" and "${to_name}" exist.`);
      }
      const r = result.records[0];
      return textResponse(`Created relationship: "${r.get('from')}" --[${r.get('rel')}]--> "${r.get('to')}"`);
    } finally {
      await session.close();
    }
  });

  mcpServer.registerTool('save_session', {
    description: 'Create a Session node and link it to the active Arc',
    inputSchema: {
      number: z.number().describe('Session number'),
      summary: z.string().describe('Session summary'),
      one_liner: z.string().describe('One-line session summary'),
    },
  }, async ({ number, summary, one_liner }) => {
    const session = driver.session();
    try {
      const result = await session.run(
        `MATCH (a:Arc {status: 'active'})
         CREATE (s:Session {
           name: $name,
           number: $number,
           summary: $summary,
           one_liner: $one_liner,
           date: $date,
           revealed: true,
           revealed_in_session: null,
           planned_reveal: null,
           created_in_session: $number
         })
         CREATE (s)-[:PART_OF]->(a)
         RETURN s, a.name as arcName`,
        { name: `Session ${number}`, number: toInt(number), summary, one_liner, date: new Date().toISOString().split('T')[0] }
      );
      if (result.records.length === 0) {
        // No active arc - create session without arc link
        const fallback = await session.run(
          `CREATE (s:Session {
             name: $name,
             number: $number,
             summary: $summary,
             one_liner: $one_liner,
             date: $date,
             revealed: true,
             revealed_in_session: null,
             planned_reveal: null,
             created_in_session: $number
           })
           RETURN s`,
          { name: `Session ${number}`, number: toInt(number), summary, one_liner, date: new Date().toISOString().split('T')[0] }
        );
        const props = recordToProps(fallback.records[0], 's');
        return textResponse(`Saved Session ${number} (no active arc to link to)\n\n${formatNodeProperties(props)}`);
      }
      const props = recordToProps(result.records[0], 's');
      const arcName = result.records[0].get('arcName');
      return textResponse(`Saved Session ${number} (linked to arc: "${arcName}")\n\n${formatNodeProperties(props)}`);
    } finally {
      await session.close();
    }
  });

  mcpServer.registerTool('create_arc', {
    description: 'Create a new Arc with status active. Completes any previously active arc.',
    inputSchema: {
      title: z.string().describe('Arc title'),
      goal: z.string().describe('Arc goal'),
      sessions_estimate: z.number().optional().describe('Estimated number of sessions'),
    },
  }, async ({ title, goal, sessions_estimate }) => {
    const session = driver.session();
    try {
      // Complete any previously active arcs
      await session.run(
        `MATCH (a:Arc {status: 'active'}) SET a.status = 'complete'`
      );

      // Create the new arc
      const props: Record<string, unknown> = {
        name: title,
        title,
        goal,
        status: 'active',
        summary: null,
        sessions_estimate: sessions_estimate != null ? toInt(sessions_estimate) : null,
        revealed: true,
        revealed_in_session: null,
        planned_reveal: null,
        created_in_session: null,
      };

      const result = await session.run(
        `CREATE (a:Arc $props) RETURN a`,
        { props }
      );

      // Link to campaign if one exists
      await session.run(
        `MATCH (a:Arc {name: $title}), (c:Campaign)
         CREATE (a)-[:PART_OF]->(c)`,
        { title }
      );

      const arcProps = recordToProps(result.records[0], 'a');
      return textResponse(`Created Arc: "${title}"\n\n${formatNodeProperties(arcProps)}`);
    } finally {
      await session.close();
    }
  });

  mcpServer.registerTool('reveal_entity', {
    description: 'Mark an entity as revealed in a specific session',
    inputSchema: {
      name: z.string().describe('Entity name'),
      session_number: z.number().describe('Session number where entity was revealed'),
    },
  }, async ({ name, session_number }) => {
    const session = driver.session();
    try {
      const result = await session.run(
        `MATCH (n {name: $name})
         SET n.revealed = true, n.revealed_in_session = $session
         RETURN n, labels(n) as labels`,
        { name, session: toInt(session_number) }
      );
      if (result.records.length === 0) {
        return textResponse(`Entity "${name}" not found.`);
      }
      const labels = result.records[0].get('labels');
      return textResponse(`Revealed "${name}" (${labels.join(', ')}) in session ${session_number}.`);
    } finally {
      await session.close();
    }
  });

  mcpServer.registerTool('resolve_thread', {
    description: 'Resolve a plot thread',
    inputSchema: {
      title: z.string().describe('Plot thread title (name)'),
      resolution: z.string().describe('How the thread was resolved'),
    },
  }, async ({ title, resolution }) => {
    const session = driver.session();
    try {
      const result = await session.run(
        `MATCH (p:PlotThread {name: $title})
         SET p.status = 'resolved', p.resolution = $resolution
         RETURN p`,
        { title, resolution }
      );
      if (result.records.length === 0) {
        return textResponse(`PlotThread "${title}" not found.`);
      }
      return textResponse(`Resolved plot thread: "${title}"\n**Resolution:** ${resolution}`);
    } finally {
      await session.close();
    }
  });

  // ──────────────────────────────────────
  // CONTEXT TOOL
  // ──────────────────────────────────────

  mcpServer.registerTool('generate_session_context', {
    description: 'Build a focused context document with campaign overview, current arc, recent sessions, open threads, recent NPCs, and unrevealed entity counts',
    inputSchema: {},
  }, async () => {
    const session = driver.session();
    try {
      const sections: string[] = [];

      // 1. Campaign overview
      const campaignResult = await session.run('MATCH (c:Campaign) RETURN c LIMIT 1');
      if (campaignResult.records.length > 0) {
        const props = campaignResult.records[0].get('c').properties;
        sections.push(`# Campaign: ${props.name}\n\n- **Tone:** ${props.tone || 'N/A'}\n- **Setting:** ${props.setting || 'N/A'}\n- **Overview:** ${props.overview || 'N/A'}`);
      } else {
        sections.push('# Campaign\n\nNo campaign has been created yet.');
      }

      // 2. Current arc
      const arcResult = await session.run(
        `MATCH (a:Arc {status: 'active'}) RETURN a LIMIT 1`
      );
      if (arcResult.records.length > 0) {
        const props = arcResult.records[0].get('a').properties;
        sections.push(`## Current Arc: ${props.title || props.name}\n\n- **Goal:** ${props.goal || 'N/A'}\n- **Summary:** ${props.summary || 'N/A'}\n- **Estimated Sessions:** ${props.sessions_estimate || 'N/A'}`);
      } else {
        sections.push('## Current Arc\n\nNo active arc.');
      }

      // 3. Last 2 sessions
      const sessionsResult = await session.run(
        'MATCH (s:Session) RETURN s ORDER BY s.number DESC LIMIT 2'
      );
      if (sessionsResult.records.length > 0) {
        const sessionTexts = sessionsResult.records.map(r => {
          const props = r.get('s').properties;
          const num = Integer.isInteger(props.number) ? (props.number as Integer).toNumber() : props.number;
          return `### Session ${num}\n**One-liner:** ${props.one_liner || 'N/A'}\n\n${props.summary || 'No summary'}`;
        });
        sections.push(`## Recent Sessions\n\n${sessionTexts.join('\n\n')}`);
      } else {
        sections.push('## Recent Sessions\n\nNo sessions recorded yet.');
      }

      // 4. Open plot threads
      const threadsResult = await session.run(
        `MATCH (p:PlotThread {status: 'open'}) RETURN p`
      );
      if (threadsResult.records.length > 0) {
        const threads = threadsResult.records.map(r => {
          const props = r.get('p').properties;
          return `- **${props.name || props.title}:** ${props.description || 'No description'}`;
        });
        sections.push(`## Open Plot Threads\n\n${threads.join('\n')}`);
      } else {
        sections.push('## Open Plot Threads\n\nNone.');
      }

      // 5. NPCs from last 2 sessions
      const npcResult = await session.run(
        `MATCH (s:Session)
         WITH s ORDER BY s.number DESC LIMIT 2
         MATCH (npc:NPC)-[:APPEARED_IN]->(s)
         RETURN DISTINCT npc`
      );
      if (npcResult.records.length > 0) {
        const npcs = npcResult.records.map(r => {
          const props = r.get('npc').properties;
          return `- **${props.name}:** ${props.description || 'No description'} (Motivation: ${props.motivation || 'unknown'})`;
        });
        sections.push(`## Recent NPCs\n\n${npcs.join('\n')}`);
      } else {
        sections.push('## Recent NPCs\n\nNo NPCs appeared in recent sessions.');
      }

      // 6. Unrevealed entities count by type
      const unrevealedResult = await session.run(
        `MATCH (n {revealed: false})
         RETURN labels(n) as labels, count(n) as cnt`
      );
      if (unrevealedResult.records.length > 0) {
        const counts = unrevealedResult.records.map(r => {
          const labels = r.get('labels');
          const cnt = r.get('cnt');
          const cntVal = Integer.isInteger(cnt) ? (cnt as Integer).toNumber() : cnt;
          return `- **${labels.join(', ')}:** ${cntVal}`;
        });
        sections.push(`## Unrevealed Entities\n\n${counts.join('\n')}`);
      } else {
        sections.push('## Unrevealed Entities\n\nNone.');
      }

      return textResponse(sections.join('\n\n---\n\n'));
    } finally {
      await session.close();
    }
  });
}

// ──────────────────────────────────────
// Helpers
// ──────────────────────────────────────

function validateEntityType(type: string): void {
  if (!VALID_ENTITY_TYPES.includes(type as typeof VALID_ENTITY_TYPES[number])) {
    throw new Error(`Invalid entity type: "${type}". Valid types: ${VALID_ENTITY_TYPES.join(', ')}`);
  }
}

function validateRelType(relType: string): void {
  if (!VALID_REL_TYPES.includes(relType as typeof VALID_REL_TYPES[number])) {
    throw new Error(`Invalid relationship type: "${relType}". Valid types: ${VALID_REL_TYPES.join(', ')}`);
  }
}

function truncate(str: string, max: number): string {
  return str.length > max ? str.slice(0, max) + '...' : str;
}
