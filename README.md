# Daggerheart AI

TTRPG assistant for Daggerheart and D&D, with a rules server, web chat UI, and Claude Code skills.

## Setup

### Server

```bash
cd server
cp .env.example .env   # add your OPENAI_API_KEY
npm install
npm run index-rules               # index Daggerheart SRD
npm run index-rules -- --game=dnd # index D&D SRD
npm run build
```

### Web App

```bash
cd web
cp .env.example .env   # add your ANTHROPIC_API_KEY
npm install
npm run dev
```

### Claude Code MCP

Add to your `.mcp.json`:

```json
{
  "mcpServers": {
    "daggerheart": {
      "command": "node",
      "args": ["<path-to>/daggerheart-ai/server/dist/index.js"],
      "env": {
        "OPENAI_API_KEY": "your-key-here"
      }
    }
  }
}
```

### Skills

Copy skills to your Claude Code skills directory:

```bash
cp -r skills/* ~/.claude/skills/
```

## MCP Tools

Category tools (Daggerheart) -- dynamically registered for each category:

- `list_classes`, `get_class`
- `list_subclasses`, `get_subclass`
- `list_ancestries`, `get_ancestry`
- `list_communities`, `get_community`
- `list_domains`, `get_domain`
- `list_armor`, `get_armor_item`
- `list_weapons`, `get_weapon`

Search:

- `search_rules` - Semantic search across Daggerheart rules

## REST API

The server also exposes REST endpoints on port 3001:

- `/api/daggerheart/search` - Daggerheart semantic search
- `/api/daggerheart/documents/:category` - List/get documents by category
- `/api/dnd/search` - D&D semantic search

## Web App

Next.js chat interface with:

- Game tab bar (Daggerheart / D&D) with per-game chat history
- Game-specific system prompts and tool selection
- Streaming responses via Vercel AI SDK + Anthropic
- Smart model routing (Haiku for factual, Sonnet for creative)

## Skills

- `/daggerheart-campaign` - Create campaign concept
- `/daggerheart-session-zero` - Run session zero
- `/daggerheart-arc` - Plan adventure arc
- `/daggerheart-session` - Prep individual session
- `/daggerheart-help` - Quick help during play
- `/daggerheart-character` - Character creation
- `/daggerheart-process-session` - Process session notes

## Project Structure

```
daggerheart-ai/
  server/               # Express + MCP server
    src/                # TypeScript source
    data/               # SQLite embedding databases
    scripts/            # Indexing scripts
    daggerheart-srd/    # Daggerheart SRD markdown files
    dnd-srd/            # D&D SRD markdown
  web/                  # Next.js chat UI
  skills/               # Claude Code skills
  campaign/             # Your campaign data (created by skills)
  docs/plans/           # Design documents
```
