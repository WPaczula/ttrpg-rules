# Daggerheart DM Assistant - Design Document

## Overview

A Daggerheart DM assistant for new game masters, built as a Claude Code MCP server with shareable skills. Helps with campaign planning, rules lookup, session prep, and character creation.

## Components

### 1. Rules MCP Server

Provides semantic search over 767 Daggerheart reference files.

**Tech stack:**
- TypeScript
- OpenAI embeddings (`text-embedding-3-small`)
- SQLite for vector storage

**Tools:**

| Tool | Description |
|------|-------------|
| `search_rules` | Semantic search across all content |
| `get_adversary` | Fetch monster by name |
| `get_ability` | Fetch ability by name |
| `list_adversaries` | List monsters, filter by tier |
| `list_abilities` | List abilities, filter by class/domain |

**Indexing:**
- One-time script embeds all MD files
- Re-run when rules files update
- ~30 seconds, ~$0.01

### 2. Campaign State Storage

Tracks campaign progress without unbounded context growth.

**Approach:** Graph DB + hierarchical summaries

- **Graph DB:** Stores entities (NPCs, locations, plot threads) and relationships
- **Hierarchical summaries:**
  - Campaign overview (1 paragraph, always loaded)
  - Arc summaries (loaded when relevant)
  - Recent 2-3 sessions in detail
  - Older sessions compressed to key events

**Tools:**

| Tool | Description |
|------|-------------|
| `query_campaign` | Search campaign state by topic |
| `get_entity` | Fetch NPC, location, or plot thread |
| `get_recent_sessions` | Get recent session summaries |

### 3. Skills

Shareable Claude Code skills that guide DMs through workflows.

#### Campaign Concept (`/daggerheart-campaign`)
Creates campaign pitch with setting, villain, and central conflict.

*Flow:*
1. Asks about tone and setting type
2. Brainstorms central conflict ideas
3. Develops main villain
4. Identifies factions and locations

*Output:* Campaign pitch document

#### Session Zero (`/daggerheart-session-zero`)
Guides first session with players.

*Flow:*
1. Reviews campaign concept
2. Guides safety tools discussion
3. Establishes table expectations
4. Coordinates character creation
5. Weaves backstories into world

*Output:* Session zero checklist, character-campaign connections

#### Adventure Arc (`/daggerheart-arc`)
Plans story arcs within the campaign.

*Flow:*
1. Asks about arc goal
2. Suggests appropriate adversaries
3. Brainstorms key scenes
4. Identifies player decision points

*Output:* Arc outline with scenes, adversaries, branching possibilities

#### Session Prep (`/daggerheart-session`)
Prepares individual sessions.

*Flow:*
1. Reviews where last session ended
2. Asks expected player actions
3. Suggests scenes and encounters
4. Picks adversaries
5. Prepares contingencies

*Output:* Session outline with scenes, stat blocks, contingency notes

#### DM Quick Help (`/daggerheart-help`)
Immediate help during play.

*Handles:*
- Unexpected player actions
- Rule clarifications
- Improvised NPCs
- Monster tactics
- Unprepped locations

*Output:* Short, actionable answer

#### Character Creation (`/daggerheart-character`)
Walks players through character creation.

*Flow:*
1. Explains Daggerheart character basics
2. Walks through ancestry options
3. Guides class/subclass selection
4. Helps with domain cards
5. Covers community and background
6. Fills in equipment

*Output:* Complete character sheet

#### Process Session (`/daggerheart-process-session`)
Processes session recordings into structured data.

*Flow:*
1. User provides transcript or notes
2. Extracts key events and decisions
3. Identifies new entities
4. Updates graph DB
5. Generates multi-level summaries

*Output:* Updated graph DB, session summaries, refreshed campaign overview

## File Structure

```
D:\AI\daggerheart-ai\
  docs/
    plans/                # Design documents
  mcp-server/
    src/
      index.ts            # MCP server entry
      embeddings.ts       # Rules semantic search
      campaign-graph.ts   # Campaign state storage
      tools/
        rules-tools.ts    # Rules lookup tools
        campaign-tools.ts # Campaign state tools
    data/
      embeddings.db       # Rules vectors (SQLite)
      campaign.db         # Campaign state (SQLite)
    scripts/
      index-rules.ts      # One-time indexing script
  skills/
    daggerheart-campaign.md
    daggerheart-session-zero.md
    daggerheart-arc.md
    daggerheart-session.md
    daggerheart-help.md
    daggerheart-character.md
    daggerheart-process-session.md
```

## Shareability

- Skills are markdown files, shareable via git or copy
- MCP server published as npm package or git repo
- Users provide their own OpenAI API key for embeddings
- Users point MCP server at their own Daggerheart SRD files

## Data Sources

Rules content (external): `D:\AI\daggerheart\srd\`
- 767 markdown files
- 1.9MB total
- Categories: abilities, adversaries, ancestries, armor, classes, communities, consumables, contents, domains, environments, frames, items, subclasses, weapons
