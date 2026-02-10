import { Driver } from 'neo4j-driver';

const ENTITY_LABELS = [
  'Campaign',
  'Arc',
  'Session',
  'NPC',
  'Location',
  'Faction',
  'PlotThread',
  'Item',
  'PC',
];

export async function initSchema(driver: Driver): Promise<void> {
  const session = driver.session();
  try {
    // Create uniqueness constraints on (label, name) for each entity type
    for (const label of ENTITY_LABELS) {
      await session.run(
        `CREATE CONSTRAINT IF NOT EXISTS FOR (n:${label}) REQUIRE n.name IS UNIQUE`
      );
    }

    // Create indexes for common query patterns
    await session.run(
      `CREATE INDEX IF NOT EXISTS FOR (a:Arc) ON (a.status)`
    );
    await session.run(
      `CREATE INDEX IF NOT EXISTS FOR (s:Session) ON (s.number)`
    );
    await session.run(
      `CREATE INDEX IF NOT EXISTS FOR (p:PlotThread) ON (p.status)`
    );
  } finally {
    await session.close();
  }
}
