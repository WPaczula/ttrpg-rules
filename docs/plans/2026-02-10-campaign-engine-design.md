# Daggerheart Campaign Engine — Design Document

## Overview

Transform the existing Daggerheart DM assistant from a collection of disconnected skills with broken tool references into a professional campaign engine. The system uses a Neo4j graph database for campaign state, improved MCP tools for rules lookup, web research for community-sourced inspiration, and 8 rewritten skills that leverage Daggerheart-specific mechanics.

## Problem Statement

The current skills have three major issues:

1. **Too generic** — Skills produce cookie-cutter results that could apply to any TTRPG. They don't leverage Daggerheart mechanics like Fear/Hope, duality dice, adversary motives & tactics, or the ancestry/community system.
2. **No Daggerheart flavor** — Skills reference MCP tools that don't exist (`list_adversaries`, `get_adversary`, `get_ability`, `list_abilities`). The actual MCP server exposes different tools (`list_classes`, `get_class`, `list_ancestries`, etc.).
3. **Poor continuity** — Each skill works in isolation. Sessions don't build on arcs, arcs don't reference the campaign, nothing feels connected. Skills say "read campaign/concept.md" but there's no smart context loading.

## Architecture

Four components working together:

### 1. Daggerheart Rules MCP Server (existing, improved)

Semantic search over SRD rules via embeddings. Already works.

**Improvement needed:** All `list_*` tools currently return bare names only. They need to return name + short description so Claude can make informed decisions without calling `get_*` for every item.

Current behavior:
```
list_weapons → "Battleaxe\nBroadsword\nCrossbow\n..."
```

Improved behavior:
```
list_weapons → "Battleaxe — Two-handed, melee, Tier 1\nBroadsword — One-handed, melee, Tier 1\n..."
```

Applies to: `list_classes`, `list_subclasses`, `list_ancestries`, `list_communities`, `list_domains`, `list_armor`, `list_weapons`.

**Implementation:** Modify `listDocuments()` to extract a one-line summary from each markdown file (first sentence of description, or key stats like tier/type/damage).

### 2. Campaign Engine — Neo4j Graph Database (new)

A Neo4j instance running via Docker that stores all campaign state as a graph.

**Why Neo4j over SQLite:**
- Native graph traversal via Cypher queries
- Visual browser at `localhost:7474` for exploring NPC/faction/location relationships
- Natural fit for entity-relationship data (who knows who, what's where, what's connected to what)

**Docker setup:**
```bash
docker run -d --name neo4j \
  -p 7474:7474 -p 7687:7687 \
  -e NEO4J_AUTH=neo4j/password \
  neo4j:community
```

#### Graph Schema

**Node types:**

| Label | Key Properties | Purpose |
|-------|---------------|---------|
| `Campaign` | name, tone, setting, overview | Root node, always loaded |
| `Arc` | title, goal, status (active/complete), summary | Story arcs |
| `Session` | number, date, summary, one_liner | Individual sessions |
| `NPC` | name, description, faction, motivation, voice | Non-player characters |
| `Location` | name, description, significance | Places in the world |
| `Faction` | name, goal, resources, attitude_to_party | Organizations and groups |
| `PlotThread` | title, status (open/resolved), description | Unresolved storylines |
| `Item` | name, properties, owner | Important objects |
| `PC` | name, class, ancestry, community, player_name | Player characters |

**Common properties on every node:**
- `revealed: boolean` — do the players know about this?
- `revealed_in_session: number | null` — when they found out
- `planned_reveal: string | null` — DM's notes on when/how to reveal
- `created_in_session: number` — when this entered the campaign

The `revealed` flag is a key feature. The DM plans the full picture in the graph — secret factions, hidden NPCs, unrevealed plot twists — and marks what players actually know. This enables queries like "what secrets are ripe for revealing this session?" and "what's the gap between what players think is happening and reality?"

**Relationship types:**

| Relationship | Example |
|-------------|---------|
| `BELONGS_TO` | NPC → Faction |
| `LOCATED_AT` | NPC → Location, Faction → Location |
| `PART_OF` | Session → Arc, Arc → Campaign |
| `INVOLVES` | PlotThread → NPC, PlotThread → Location |
| `KNOWS_ABOUT` | PC → NPC, PC → Location |
| `POSSESSES` | PC → Item, NPC → Item |
| `ALLIED_WITH` / `HOSTILE_TO` | Faction → Faction, NPC → NPC |
| `APPEARED_IN` | NPC → Session, Location → Session |

#### Campaign Engine MCP Tools

**Query tools (read):**

| Tool | Description |
|------|-------------|
| `get_campaign_overview()` | Returns campaign summary, tone, setting. Always-available context. |
| `get_current_arc()` | Returns the active arc's title, goal, summary, and progress. |
| `get_recent_sessions(count)` | Returns last N session summaries with key events. |
| `query_entities(type, filter?)` | Search entities by type and optional filter. Example: `query_entities("NPC", { faction: "Iron Circle" })` |
| `get_entity(type, name)` | Full details on a specific entity + all its relationships. |
| `get_unrevealed(type?)` | Everything the players don't know yet. Optionally filtered by type. |
| `get_connections(name)` | All relationships for an entity — who knows who, what's where. |
| `get_open_threads()` | All unresolved plot threads, sorted by relevance. |

**Mutation tools (write):**

| Tool | Description |
|------|-------------|
| `create_entity(type, properties)` | Add a new node to the graph. |
| `update_entity(type, name, properties)` | Update properties on an existing node. |
| `create_relationship(from, to, type)` | Add an edge between two nodes. |
| `save_session(number, summary, one_liner, events)` | Record a session's results. |
| `create_arc(title, goal, sessions_estimate)` | Start a new arc linked to the campaign. |
| `reveal_entity(name, session_number)` | Mark something as known to players. |
| `resolve_thread(title, resolution)` | Close a plot thread with its resolution. |

**Context tool:**

| Tool | Description |
|------|-------------|
| `generate_session_context()` | Builds a focused context blob for session prep: campaign overview + current arc + last 2 sessions + open threads + active NPCs. One call replaces reading 5+ files. |

### 3. Skills (rewritten)

7 existing skills rewritten + 1 new research skill. All skills:
- Open with `generate_session_context()` for automatic context loading
- Reference Daggerheart-specific mechanics: Fear/Hope economy, duality dice, stress/HP, adversary motives & tactics, ancestries/communities
- Read from and write to the Neo4j graph via campaign engine tools
- Offer optional web research integration

### 4. Web Research (via built-in WebSearch/WebFetch)

No new infrastructure. Skills instruct Claude when and how to search. Searches broadly across D&D, Pathfinder, and general TTRPG communities, then Claude adapts findings to Daggerheart mechanics.

## Skill Designs

### `/daggerheart-campaign` — Campaign Creation

**Changes from current:**
- Uses `list_ancestries` and `list_communities` (with descriptions) to ground the world in Daggerheart peoples and their cultural dynamics
- Villain design focuses on motivation and methods, uses `search_rules` to find thematically appropriate adversaries
- Optional research step: "Want me to search for campaign concepts with similar themes?"
- Output seeds the graph via `create_entity` for factions, locations, villain, and the campaign node itself

### `/daggerheart-arc` — Arc Planning

**Changes from current:**
- Calls `get_open_threads` and `get_unrevealed()` to suggest arc goals based on what's unresolved or still secret from players
- Encounter design uses adversary motives & tactics from the SRD and Fear/Hope economy — "This fight should build Fear early, then give players a Hope moment when they discover the weakness"
- Uses `get_connections` to show how player choices ripple through faction relationships
- Optional research step: "Want me to look up how other DMs structured similar arcs?"
- Output calls `create_arc` + `create_entity` for new NPCs/locations

### `/daggerheart-session` — Session Prep

**Changes from current:**
- Recap is automatic via `get_recent_sessions(1)` — no manual file reading
- Scene pacing uses Fear/Hope flow: exploration builds Hope, combat spends it, social scenes can go either way
- Encounters pull adversary motives & tactics from the SRD — not generic "the monster attacks" but "the Acid Burrower drags the isolated target underground per its tactics"
- Contingencies informed by `get_open_threads` — what if players chase a different thread?
- Optional research step: "Want encounter inspiration for this setting?"
- Output calls graph mutation tools to save prep data

### `/daggerheart-session-zero` — Session Zero

**Changes from current:**
- Loads campaign concept from graph via `get_campaign_overview()`
- Character creation uses improved list tools with descriptions for informed choices
- Backstory weaving uses `get_connections` to tie characters to existing factions and locations
- Output creates `PC` nodes in the graph with all relationships

### `/daggerheart-character` — Character Creation

**Changes from current:**
- Uses improved `list_classes`, `list_ancestries`, `list_communities` (with descriptions) to present options with enough info to choose without requiring full details on each
- Uses `get_class`, `get_ancestry`, `get_community` for full details after selection
- Uses improved `list_weapons` and `list_armor` (with tier/type descriptions) for equipment selection
- Output creates a `PC` node in the graph with relationships to class, ancestry, community

### `/daggerheart-help` — Quick Help During Play

**Changes from current:**
- Monster tactics pull the actual Motives & Tactics line from the adversary via `search_rules`, then suggest specific actions based on the battlefield
- NPC generation references `list_ancestries` and `list_communities` for Daggerheart-appropriate names and backgrounds
- Fear/Hope advice: "Players have accumulated a lot of Fear — consider a moment that lets them spend Hope to turn the tide"
- Can query the graph for context: `get_entity` to remind the DM about an NPC's connections mid-session

### `/daggerheart-process-session` — Post-Session Processing

**Changes from current:**
- Instead of writing to flat markdown files, calls graph mutation tools: `save_session`, `create_entity`, `update_entity`, `reveal_entity`, `resolve_thread`
- Still generates three summary levels (one-liner, paragraph, detailed) stored on the Session node
- Tracks which entities were revealed to players this session via `reveal_entity`
- Updates faction attitudes, NPC relationships, and plot thread statuses

### `/daggerheart-research` — Web Research (NEW)

**Standalone mode:**

1. **Understand the need.** Ask the DM what kind of inspiration: campaign concept, arc structure, encounter design, NPC/villain ideas, or location design.

2. **Search broadly.** 3-5 WebSearch queries targeting TTRPG communities:
   - `site:reddit.com/r/DMAcademy [topic]`
   - `site:reddit.com/r/DnD [topic] "campaign"`
   - `"TTRPG" [topic] adventure hook`
   - `"one-shot" [topic] encounter idea`
   - `site:reddit.com/r/DnDBehindTheScreen [topic]`

3. **Read and extract.** WebFetch on top 3-5 results. For each, extract:
   - The core structural idea (not flavor text or system-specific stats)
   - What made it interesting according to commenters/author
   - Any pitfalls or "I wish I'd done X differently" notes

4. **Adapt to Daggerheart.** For each idea, translate:
   - D&D monsters → Daggerheart equivalents via `search_rules`
   - CR/difficulty → Fear/Hope tension pacing
   - D&D skill checks → Daggerheart trait rolls (Agility, Strength, Finesse, Instinct, Presence, Knowledge)
   - D&D magic items → Daggerheart equipment via `list_weapons`/`list_armor`
   - Cultural elements → mapped to Daggerheart ancestries and communities

5. **Present 3-5 options.** Each with: title, core idea (2-3 sentences), why it works, Daggerheart twist, source link.

6. **Save.** DM picks favorites, saved to `campaign/research/YYYY-MM-DD-topic.md`.

**Integrated mode** (called from within other skills):

Each planning skill (campaign, arc, session) offers an optional step:
> "Would you like me to search for [campaign/arc/encounter] ideas that match what we're building? I'll look across D&D, Pathfinder, and general TTRPG communities and adapt the best ones to Daggerheart."

If yes, runs a scoped version (2-3 searches, top 3 results) woven into the current planning conversation.

## Implementation Phases

### Phase 1: MCP Server Improvements

**No dependencies. Can start immediately.**

- Modify `listDocuments()` in the rules MCP server to extract one-line summaries from each markdown file
- All `list_*` tools return `name — short description` format
- Applies to: classes, subclasses, ancestries, communities, domains, armor, weapons

### Phase 2: Neo4j Campaign Engine

**No dependency on Phase 1. Can run in parallel.**

- Create Docker Compose file with Neo4j community edition
- Add `neo4j` npm driver to the MCP server
- Implement Neo4j connection module
- Create graph schema (node types, relationship types, indexes, constraints)
- Implement all query tools: `get_campaign_overview`, `get_current_arc`, `get_recent_sessions`, `query_entities`, `get_entity`, `get_unrevealed`, `get_connections`, `get_open_threads`
- Implement all mutation tools: `create_entity`, `update_entity`, `create_relationship`, `save_session`, `create_arc`, `reveal_entity`, `resolve_thread`
- Implement `generate_session_context`
- Tests for all tools

### Phase 3: Skill Rewrites

**Depends on Phase 1 and Phase 2.**

- Rewrite all 7 existing skills to use correct MCP tools and Daggerheart mechanics
- Add Fear/Hope pacing, adversary motives, ancestry/community grounding
- Add optional research steps to campaign, arc, and session skills
- Write the new `/daggerheart-research` standalone skill
- Validate skills against the writing-skills skill for quality

### Phase 4: Integration Testing

**Depends on Phase 3.**

- Seed a test campaign into Neo4j
- Run through each skill end-to-end
- Verify graph updates correctly after each skill
- Test `generate_session_context` produces useful, focused context
- Test research skill finds and adapts content
- Test the `revealed` flag workflow: create hidden entities, reveal them, verify queries reflect the change

## Technical Stack

- **Existing:** TypeScript, @modelcontextprotocol/sdk, better-sqlite3, OpenAI embeddings, Express, Zod
- **New:** Neo4j (Docker), neo4j-driver (npm), Docker Compose
- **Built-in:** WebSearch, WebFetch (no infrastructure needed)

## File Structure

```
D:\AI\ttrpg-rules\
  server\
    src\
      mcp.ts                    # MCP server entry (rules + campaign tools)
      index.ts                  # Express API (separate)
      services\
        documents.ts            # Document loading (improved with summaries)
        search.ts               # Semantic search
      campaign\
        neo4j.ts                # Neo4j connection and helpers
        campaign-tools.ts       # Campaign engine MCP tool implementations
        schema.ts               # Graph schema setup and constraints
    data\
      daggerheart-embeddings.db # Rules vectors (existing)
    docker-compose.yml          # Neo4j container
  skills\                       # Installed to ~/.claude/skills/
    daggerheart-campaign\SKILL.md
    daggerheart-arc\SKILL.md
    daggerheart-session\SKILL.md
    daggerheart-session-zero\SKILL.md
    daggerheart-character\SKILL.md
    daggerheart-help\SKILL.md
    daggerheart-process-session\SKILL.md
    daggerheart-research\SKILL.md
  campaign\                     # Research notes (graph is primary storage)
    research\
  docs\
    plans\
```
