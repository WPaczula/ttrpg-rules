---
name: daggerheart-process-session
description: Use when processing session notes or transcripts into structured campaign data - extracting events, NPCs, locations, and plot threads
---

# Daggerheart Session Processing

Convert session notes or transcripts into structured campaign documentation.

## When to Use

- After a session ends
- DM has notes or transcript to process
- Need to update campaign records with what happened

## Quick Reference

| Extract | Save To |
|---------|---------|
| Session summary | `campaign/sessions/session-N-summary.md` |
| One-liner | `campaign/overview.md` |
| Arc paragraph | Current arc file |
| NPCs | `campaign/entities/npcs.md` |
| Locations | `campaign/entities/locations.md` |
| Plot threads | `campaign/entities/threads.md` |

## Process

### 1. Extract Events

Identify from notes/transcript:
- Major story beats
- Combat encounters and outcomes
- Important NPC interactions
- Player decisions and consequences
- Items acquired/lost
- Locations visited

### 2. Identify Entities

Find new or updated:
- **NPCs**: Name, description, party relationship
- **Locations**: Name, description, significance
- **Items**: Name, properties, owner
- **Plot Threads**: Open questions, unresolved conflicts

### 3. Track Character Changes

Note PC changes:
- HP/Stress carried over
- New abilities or items
- Relationship changes
- Character development moments

### 4. Generate Summaries

Create three levels:

**One-liner** (for overview):
> "The party discovered the temple and learned the villain's true identity."

**Paragraph** (for arc):
> "Session 3 saw the party navigate the Thornwood ruins, defeating shadow wolves before finding the hidden temple. Inside, evidence linked Lord Vance to the disappearances. Mira was captured but rescued, earning her loyalty."

**Detailed notes** (full breakdown):
Event-by-event with NPC names, locations, items, memorable quotes.

## Output

Create/update these files:

1. `campaign/sessions/session-N-summary.md` - Detailed notes
2. `campaign/overview.md` - Add one-liner
3. `campaign/arcs/arc-N-title.md` - Add paragraph
4. `campaign/entities/npcs.md` - New/changed NPCs
5. `campaign/entities/locations.md` - New/changed locations
6. `campaign/entities/threads.md` - Plot threads

## Common Mistakes

- **Missing threads**: Always note unresolved questions.
- **Forgetting items**: Track what players gained/lost.
- **No character moments**: Note roleplay/development, not just mechanics.
