# Daggerheart Process Session

Process session notes or transcripts into structured campaign data.

## Input

The DM provides either:
- A transcript of the session
- Their own notes about what happened

## Process

### Step 1: Extract Events

Identify key events:
- Major story beats
- Combat encounters and outcomes
- Important NPC interactions
- Player decisions and their consequences
- Items acquired or lost
- Locations visited

### Step 2: Identify Entities

Find new or updated entities:
- **NPCs**: Name, description, relationship to party
- **Locations**: Name, description, significance
- **Items**: Name, properties, who has it
- **Plot Threads**: Open questions, unresolved conflicts

### Step 3: Track Character Changes

Note any changes to PCs:
- HP/Stress changes that carried over
- New abilities or items
- Relationship changes
- Character development moments

### Step 4: Generate Summaries

Create three levels of summary:

**One-liner** (for campaign overview):
> "The party discovered the temple and learned the villain's true identity."

**Paragraph** (for arc summary):
> "Session 3 saw the party navigate the Thornwood ruins, defeating a pack of shadow wolves before discovering the hidden temple entrance. Inside, they found evidence linking Lord Vance to the disappearances. Mira was captured but the party rescued her, earning her loyalty."

**Detailed notes** (for recent history):
Full event-by-event breakdown with NPC names, specific locations, exact items, and quotes worth remembering.

### Output

Create/update:
- `campaign/sessions/session-N-summary.md` - Detailed notes
- Update `campaign/overview.md` - Add one-liner
- Update relevant arc file - Add paragraph
- Update `campaign/entities/npcs.md` - New/changed NPCs
- Update `campaign/entities/locations.md` - New/changed locations
- Update `campaign/entities/threads.md` - Plot threads
