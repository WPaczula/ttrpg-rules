---
name: daggerheart-session
description: Use when preparing for an individual Daggerheart session - planning scenes, encounters, contingencies based on previous session and arc context
---

# Daggerheart Session Prep

Help a DM prepare for an upcoming session.

## When to Use

- Preparing for next week's session
- Need to plan scenes and encounters
- Want contingency plans for player choices

## Prerequisites

Read first:
- `campaign/concept.md` - campaign context
- Current arc file (if exists)
- `campaign/sessions/` - previous session notes

## Quick Reference

| Element | Purpose |
|---------|---------|
| Recap | Where last session ended |
| Scenes 2-4 | Main content (explore, roleplay, combat) |
| Stat blocks | Adversary stats for encounters |
| Contingencies | If-then plans for deviations |
| Closing hook | Cliffhanger ending |

## Process

### 1. Recap

Summarize last session:
- What happened?
- What threads are open?
- What did players say they'd do?

### 2. Anticipate Player Actions

Ask DM:
- Where will players likely go?
- What will they try?
- Any character moments coming up?

### 3. Plan Scenes

Plan 2-4 scenes:
- **Opening**: Pick up from last session
- **Middle 1-2**: Main content
- **Closing**: End on something compelling

For each scene:
- Location
- NPCs present
- Potential conflicts
- Information players might learn

### 4. Prepare Encounters

For combat:
- Use `get_adversary` for stat blocks
- Note terrain features
- Identify adversary tactics
- Set difficulty to drama (not every fight is deadly)

### 5. Plan Contingencies

Prepare for deviations:
- "If they ignore the hook..."
- "If they go elsewhere..."
- "If they attack the NPC..."

## Output

Save to `campaign/sessions/session-N-prep.md`:

```markdown
# Session N Prep

**Date:** When playing

## Recap
Last session summary

## Planned Scenes

### Scene 1: Opening
Location, NPCs, conflicts

### Scene 2: [Name]
...

## Stat Blocks
Adversary stats needed

## NPCs
Names, descriptions, voices/mannerisms

## Contingencies
- If X, then Y
- If A, then B

## Closing Hook Ideas
Ways to end on a cliffhanger
```

## Common Mistakes

- **Over-preparing**: Plan beats, not scripts.
- **No contingencies**: Players will surprise you. Plan for it.
- **Weak endings**: Always have a cliffhanger ready.
