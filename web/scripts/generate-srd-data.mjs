#!/usr/bin/env node
/**
 * Parses the Daggerheart SRD markdown files and generates a static TypeScript data file
 * for use in the web app's searchable character sheet components.
 *
 * Usage: node web/scripts/generate-srd-data.mjs
 */

import { readdirSync, readFileSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const SRD = join(__dirname, "..", "..", "server", "daggerheart-srd");
const OUT = join(__dirname, "..", "lib", "srd-data.ts");

function readDir(sub) {
  const dir = join(SRD, sub);
  return readdirSync(dir)
    .filter((f) => f.endsWith(".md"))
    .map((f) => ({
      name: f.replace(".md", ""),
      content: readFileSync(join(dir, f), "utf-8").replace(/^\ufeff/, ""),
    }));
}

// ── Weapons ──────────────────────────────────────────────────────────────────

function parseWeapon({ name, content }) {
  const tierMatch = content.match(/\*\*?_Tier (\d+)_\*\*?/);
  const tier = tierMatch ? Number(tierMatch[1]) : 1;

  const isPrimary = /Primary/i.test(content.split("\n")[2] || "");
  const isMagical = /Magical/i.test(content.split("\n")[2] || "");

  const traitMatch = content.match(/\*\*Trait:\*\*\s*(.+)/);
  const rangeMatch = content.match(/\*\*Range:\*\*\s*(.+)/);
  const damageMatch = content.match(/\*\*Damage:\*\*\s*(.+)/);
  const burdenMatch = content.match(/\*\*Burden:\*\*\s*(.+)/);
  const featureMatch = content.match(
    /### FEATURE\s+\*\*\*(.+?):\*\*\*\s*(.+)/
  );

  return {
    name,
    tier,
    type: isPrimary ? "Primary" : "Secondary",
    damageType: isMagical ? "Magical" : "Physical",
    trait: traitMatch ? traitMatch[1].trim() : "",
    range: rangeMatch ? rangeMatch[1].trim() : "",
    damage: damageMatch ? damageMatch[1].trim() : "",
    burden: burdenMatch ? burdenMatch[1].trim() : "",
    feature: featureMatch
      ? `${featureMatch[1].trim()}: ${featureMatch[2].trim()}`
      : undefined,
  };
}

// ── Armor ────────────────────────────────────────────────────────────────────

function parseArmor({ name, content }) {
  const tierMatch = content.match(/\*\*?_Tier (\d+)_\*\*?/);
  const tier = tierMatch ? Number(tierMatch[1]) : 1;

  const threshMatch = content.match(/\*\*Base Thresholds:\*\*\s*(.+)/);
  const scoreMatch = content.match(/\*\*Base Score:\*\*\s*(\d+)/);
  const featureMatch = content.match(
    /### FEATURE\s+\*\*\*(.+?):\*\*\*\s*(.+)/
  );

  return {
    name,
    tier,
    baseThresholds: threshMatch ? threshMatch[1].trim() : "",
    baseScore: scoreMatch ? Number(scoreMatch[1]) : 0,
    feature: featureMatch
      ? `${featureMatch[1].trim()}: ${featureMatch[2].trim()}`
      : undefined,
  };
}

// ── Domain Cards (abilities) ─────────────────────────────────────────────────

function parseAbility({ name, content }) {
  // **_Level 1_** _Blade Ability._ **_Recall Cost_** _1._
  const levelMatch = content.match(/\*\*?_Level (\d+)_\*\*?/);
  const domainMatch = content.match(/_(\w+) (?:Ability|Spell|Grimoire)\._/);
  const recallMatch = content.match(/\*\*?_Recall Cost_\*\*?\s*_(\d+)\._/);

  // Description: everything after the first metadata line
  const lines = content.split("\n");
  let descStart = -1;
  for (let i = 0; i < lines.length; i++) {
    const l = lines[i].trim();
    if (l && !l.startsWith("#") && !l.match(/^\*\*?_/) && !l.match(/^_/)) {
      // Skip lines that are purely metadata (Level, Recall Cost, etc.)
      descStart = i;
      break;
    }
    // Also check for lines that start with content after metadata
    if (
      l &&
      !l.startsWith("#") &&
      descStart === -1 &&
      i > 1 &&
      !l.match(/Level \d/) &&
      !l.match(/Recall Cost/)
    ) {
      descStart = i;
      break;
    }
  }

  let description = "";
  if (descStart >= 0) {
    description = lines
      .slice(descStart)
      .join("\n")
      .trim()
      // Strip markdown bold/italic for clean display
      .replace(/\*\*\*/g, "")
      .replace(/\*\*/g, "")
      .replace(/\*/g, "");
  }

  return {
    name,
    level: levelMatch ? Number(levelMatch[1]) : 0,
    domain: domainMatch ? domainMatch[1] : "",
    recallCost: recallMatch ? Number(recallMatch[1]) : 0,
    description,
  };
}

// ── Domains ──────────────────────────────────────────────────────────────────

function parseDomain({ name, content }) {
  // Extract which classes can access
  const classesMatch = content.match(/accessed by the (.+?) classes/);
  const classes = classesMatch
    ? classesMatch[1]
        .replace(/\*\*/g, "")
        .split(/\s*(?:&|and|,)\s*/)
        .map((c) => c.trim())
        .filter(Boolean)
    : [];

  // Extract first sentence as description
  const lines = content.split("\n");
  let desc = "";
  for (const line of lines) {
    const t = line.trim();
    if (t && !t.startsWith("#")) {
      desc = t;
      break;
    }
  }
  // Clean and shorten
  desc = desc.replace(/\*\*/g, "").replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");
  const sentenceMatch = desc.match(/^(.+?\.)\s/);
  if (sentenceMatch) desc = sentenceMatch[1];

  // Extract card table: level -> card names
  const cardsByLevel = {};
  const tableRows = content.matchAll(
    /\|\s*\*\*(\d+)\*\*\s*\|(.+)\|/g
  );
  for (const match of tableRows) {
    const level = Number(match[1]);
    const cells = match[2]
      .split("|")
      .map((c) => c.trim())
      .filter((c) => c && c !== "—");
    // Extract link text: [Name](url) -> Name
    const cardNames = cells
      .map((c) => {
        const linkMatch = c.match(/\[([^\]]+)\]/);
        return linkMatch ? linkMatch[1] : c;
      })
      .filter(Boolean);
    if (cardNames.length > 0) {
      cardsByLevel[level] = cardNames;
    }
  }

  return {
    name,
    description: desc,
    classes,
    cardsByLevel,
  };
}

// ── Generate ─────────────────────────────────────────────────────────────────

const weapons = readDir("weapons").map(parseWeapon);
const armors = readDir("armor").map(parseArmor);
const abilities = readDir("abilities").map(parseAbility);
const domains = readDir("domains").map(parseDomain);

// Sort weapons: Tier 1 first, then alphabetical
weapons.sort((a, b) => a.tier - b.tier || a.name.localeCompare(b.name));
armors.sort((a, b) => a.tier - b.tier || a.name.localeCompare(b.name));
abilities.sort((a, b) => a.level - b.level || a.name.localeCompare(b.name));
domains.sort((a, b) => a.name.localeCompare(b.name));

const output = `// Auto-generated from Daggerheart SRD. Do not edit by hand.
// Run: node web/scripts/generate-srd-data.mjs

export interface SrdWeapon {
  name: string
  tier: number
  type: "Primary" | "Secondary"
  damageType: "Physical" | "Magical"
  trait: string
  range: string
  damage: string
  burden: string
  feature?: string
}

export interface SrdArmor {
  name: string
  tier: number
  baseThresholds: string
  baseScore: number
  feature?: string
}

export interface SrdDomainCard {
  name: string
  level: number
  domain: string
  recallCost: number
  description: string
}

export interface SrdDomain {
  name: string
  description: string
  classes: string[]
  cardsByLevel: Record<number, string[]>
}

export const SRD_WEAPONS: SrdWeapon[] = ${JSON.stringify(weapons, null, 2)} as const

export const SRD_ARMOR: SrdArmor[] = ${JSON.stringify(armors, null, 2)} as const

export const SRD_DOMAIN_CARDS: SrdDomainCard[] = ${JSON.stringify(abilities, null, 2)} as const

export const SRD_DOMAINS: SrdDomain[] = ${JSON.stringify(domains, null, 2)} as const
`;

writeFileSync(OUT, output, "utf-8");

console.log(
  `Generated ${OUT}:`,
  `${weapons.length} weapons,`,
  `${armors.length} armors,`,
  `${abilities.length} domain cards,`,
  `${domains.length} domains`
);
