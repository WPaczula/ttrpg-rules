---
name: daggerheart-character
description: Use when walking a player through Daggerheart character creation, selecting class, ancestry, community, traits, and equipment
---

# Daggerheart Character Creation

Guide a player through creating a Daggerheart character step by step.

## When to Use

- Player is new to Daggerheart
- Player wants help building a character
- Session zero character creation

## Quick Reference

| Step | What to Choose |
|------|----------------|
| Class | 9 options - determines abilities and domains |
| Subclass | Specialization within class |
| Ancestry | Physical traits + 2 ancestry features |
| Community | Cultural background + 1 feature |
| Traits | +2, +1, +1, +0, +0, -1 across 6 traits |
| Equipment | Weapons + armor from Tier 1 options |
| Experiences | 2 phrases representing skills (+2 each) |
| Domain Cards | 2 cards from class domains |

## Process

### 1. Class and Subclass

Present the 9 classes:
- **Bard** - Performer, support/social
- **Druid** - Nature magic, shapeshifting
- **Guardian** - Armored protector
- **Ranger** - Wilderness, ranged combat
- **Rogue** - Stealth, precision
- **Seraph** - Divine warrior, healing
- **Sorcerer** - Raw arcane power
- **Warrior** - Martial combat
- **Wizard** - Studied magic, versatile

Use `search_rules` to get chosen class details: HP, Evasion, features, domains, subclasses.

### 2. Ancestry

Use `search_rules` for "ancestries". Each gives:
- Physical traits
- Two ancestry features

Mention Mixed Ancestry option.

### 3. Community

Use `search_rules` for "communities". Each represents cultural background and grants one feature.

### 4. Traits

Six traits: Agility, Strength, Finesse, Instinct, Presence, Knowledge

Assign: +2, +1, +1, +0, +0, -1

Suggest assignments based on class (e.g., Wizard wants Knowledge +2).

### 5. Equipment

Use `search_rules` for "Weapons" and "Armor" (Tier 1 options).

Choose:
- Two-handed primary OR one-handed + secondary
- One armor set
- Starting items

### 6. Background and Experiences

Use class background questions as prompts.

Create 2 Experiences (+2 each) - words/phrases representing skills or traits.

### 7. Domain Cards

Explain class domains. Use `search_rules` for domain cards.

Pick 2 cards (same domain or split).

## Output

Save to `campaign/characters/character-name.md`:

```markdown
# Character Name

**Class:** X (Subclass)
**Ancestry:** X
**Community:** X

## Traits
- Agility: +X
- Strength: +X
- Finesse: +X
- Instinct: +X
- Presence: +X
- Knowledge: +X

## Experiences
- Experience 1 (+2)
- Experience 2 (+2)

## Equipment
- Primary weapon
- Armor

## Domain Cards
- Card 1
- Card 2

## Background
Brief backstory notes
```

## Common Mistakes

- **Mismatched traits**: Ensure primary class trait gets the +2.
- **Forgetting experiences**: These are crucial for skill checks.
- **Ignoring domains**: Domain cards define character capabilities.
