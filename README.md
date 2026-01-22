# Daggerheart AI

DM assistant for Daggerheart TTRPG, built as a Claude Code MCP server with skills.

## Setup

### 1. Install dependencies

```bash
cd mcp-server
npm install
```

### 2. Set OpenAI API key

```bash
export OPENAI_API_KEY=your-key-here
```

### 3. Index the rules

Point the indexer at your Daggerheart SRD files:

```bash
npm run index-rules
```

This creates `data/embeddings.db` with searchable rules content.

### 4. Build the server

```bash
npm run build
```

### 5. Configure Claude Code

Add to your Claude Code MCP settings:

```json
{
  "mcpServers": {
    "daggerheart": {
      "command": "node",
      "args": ["D:/AI/daggerheart-ai/mcp-server/dist/index.js"],
      "env": {
        "OPENAI_API_KEY": "your-key-here"
      }
    }
  }
}
```

### 6. Install skills

Copy the skills to your Claude Code skills directory:

```bash
cp -r skills/* ~/.claude/skills/
```

## Usage

### MCP Tools

- `search_rules` - Semantic search across all Daggerheart content
- `get_adversary` - Get a specific monster
- `get_ability` - Get a specific ability
- `list_adversaries` - List monsters by tier
- `list_abilities` - List abilities by class/domain

### Skills

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
  mcp-server/         # MCP server code
    src/              # TypeScript source
    data/             # SQLite databases
    scripts/          # Indexing scripts
  skills/             # Claude Code skills
  campaign/           # Your campaign data (created by skills)
  docs/               # Documentation
```
