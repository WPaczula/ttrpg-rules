import { readdirSync, readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SRD_PATH = join(__dirname, '..', '..', 'daggerheart-srd');

export function listDocuments(category: string): string[] {
  const categoryPath = join(SRD_PATH, category);

  if (!existsSync(categoryPath)) {
    return [];
  }

  return readdirSync(categoryPath)
    .filter(f => f.endsWith('.md'))
    .map(f => f.replace('.md', ''));
}

export function listDocumentsWithSummary(category: string): string[] {
  const names = listDocuments(category);
  return names.map(name => {
    const content = getDocument(category, name);
    if (!content) return name;
    const summary = extractSummary(category, content);
    return summary ? `${name} \u2014 ${summary}` : name;
  });
}

function stripBom(text: string): string {
  return text.replace(/^\ufeff/, '');
}

function extractSummary(category: string, rawContent: string): string {
  const content = stripBom(rawContent);

  switch (category) {
    case 'classes':
      return summarizeClass(content);
    case 'subclasses':
      return summarizeSubclass(content);
    case 'ancestries':
      return summarizeAncestry(content);
    case 'communities':
      return summarizeCommunity(content);
    case 'domains':
      return summarizeDomain(content);
    case 'weapons':
      return summarizeWeapon(content);
    case 'armor':
      return summarizeArmor(content);
    case 'adversaries':
      return summarizeAdversary(content);
    default:
      return '';
  }
}

function summarizeClass(content: string): string {
  // Extract domains: > **• DOMAINS:** [Grace](../domains/Grace.md) & [Codex](../domains/Codex.md)
  const domainsMatch = content.match(/DOMAINS:\*\*\s*(.+)/);
  let domains = '';
  if (domainsMatch) {
    // Strip markdown links: [Name](url) -> Name
    domains = domainsMatch[1].replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').trim();
  }

  const hpMatch = content.match(/STARTING HIT POINTS:\*\*\s*(\d+)/);
  const hp = hpMatch ? hpMatch[1] : '';

  const evasionMatch = content.match(/STARTING EVASION:\*\*\s*(\d+)/);
  const evasion = evasionMatch ? evasionMatch[1] : '';

  const parts: string[] = [];
  if (domains) parts.push(`${domains} domains`);
  if (hp) parts.push(`${hp} HP`);
  if (evasion) parts.push(`Evasion ${evasion}`);
  return parts.join(', ');
}

function summarizeSubclass(content: string): string {
  // Second line after heading: "Play the X if you want..."
  const lines = content.split('\n');
  let description = '';
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      description = trimmed;
      break;
    }
  }

  // Extract spellcast trait
  const spellcastMatch = content.match(/## SPELLCAST TRAIT\s+(\w+)/);
  const spellcast = spellcastMatch ? spellcastMatch[1] : '';

  // Clean up description: "Play the X if you want to ..." -> extract the desire part
  let shortDesc = description;
  const playMatch = description.match(/Play the .+ if you want (?:to )?(.+?)\.?$/);
  if (playMatch) {
    shortDesc = playMatch[1].replace(/\.$/, '');
    // Capitalize first letter
    shortDesc = shortDesc.charAt(0).toUpperCase() + shortDesc.slice(1);
  }

  const parts: string[] = [];
  if (shortDesc) parts.push(shortDesc);
  if (spellcast) parts.push(`Spellcast: ${spellcast}`);
  return parts.join(', ');
}

function summarizeAncestry(content: string): string {
  // Get first non-heading, non-empty paragraph line, then extract first sentence
  const lines = content.split('\n');
  let description = '';
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#') && !trimmed.startsWith('>')) {
      description = trimmed;
      break;
    }
  }

  // Extract first sentence
  const sentenceMatch = description.match(/^(.+?\.)\s/);
  let sentence = sentenceMatch ? sentenceMatch[1] : description;

  // Trim to reasonable length
  if (sentence.length > 100) {
    sentence = sentence.substring(0, 97) + '...';
  }

  return sentence;
}

function summarizeCommunity(content: string): string {
  // Look for the italicized personality traits line: *Xxx are often ...*
  const traitsMatch = content.match(/^\*(.+? are often .+?)\*$/m);
  if (traitsMatch) {
    return traitsMatch[1];
  }
  return '';
}

function summarizeDomain(content: string): string {
  // First sentence of description + extract class access
  const lines = content.split('\n');
  let description = '';
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#') && !trimmed.startsWith('|') && !trimmed.startsWith('>')) {
      description = trimmed;
      break;
    }
  }

  // Extract first sentence
  const sentenceMatch = description.match(/^(.+?\.)\s/);
  const firstSentence = sentenceMatch ? sentenceMatch[1] : '';

  // Extract classes: "The X domain can be accessed by the Y & Z classes."
  const classesMatch = description.match(/accessed by the (.+?) classes/);
  const classes = classesMatch ? classesMatch[1] : '';

  // Build a short summary from the first sentence
  let summary = firstSentence;
  // Remove the name prefix if present (e.g., "Bone is the domain of..." -> "Domain of...")
  const domainOfMatch = summary.match(/^\w+ is the (domain of .+?)\.?$/);
  if (domainOfMatch) {
    summary = domainOfMatch[1].charAt(0).toUpperCase() + domainOfMatch[1].slice(1);
  }

  if (classes) {
    summary = `${summary} (${classes})`;
  }

  if (summary.length > 90) {
    summary = summary.substring(0, 87) + '...';
  }

  return summary;
}

function summarizeWeapon(content: string): string {
  // **Trait:** X; **Range:** Y; **Damage:** Z; **Burden:** W
  const traitMatch = content.match(/\*\*Trait:\*\*\s*([^;]+)/);
  const rangeMatch = content.match(/\*\*Range:\*\*\s*([^;]+)/);
  const damageMatch = content.match(/\*\*Damage:\*\*\s*([^;]+)/);
  const burdenMatch = content.match(/\*\*Burden:\*\*\s*(.+)/);

  // Tier: *Primary Weapon - Tier 1*
  const tierMatch = content.match(/\*((?:Primary|Secondary) Weapon - Tier \d+)\*/);

  const parts: string[] = [];
  if (traitMatch) parts.push(traitMatch[1].trim());
  if (rangeMatch) parts.push(rangeMatch[1].trim());
  if (damageMatch) parts.push(damageMatch[1].trim());
  if (burdenMatch) parts.push(burdenMatch[1].trim());
  if (tierMatch) parts.push(`(${tierMatch[1]})`);

  return parts.join(', ');
}

function summarizeArmor(content: string): string {
  // **Base Thresholds:** X / Y; **Base Score:** Z
  const scoreMatch = content.match(/\*\*Base Score:\*\*\s*(\d+)/);
  const threshMatch = content.match(/\*\*Base Thresholds:\*\*\s*([^;]+)/);

  // Feature name: **Feature:** ***Name:***
  const featureMatch = content.match(/\*\*Feature:\*\*\s*\*\*\*(\w+):/);

  // Tier: *Armor - Tier 1*
  const tierMatch = content.match(/\*(Armor - Tier \d+)\*/);

  const parts: string[] = [];
  if (scoreMatch) parts.push(`Score ${scoreMatch[1]}`);
  if (threshMatch) parts.push(`Thresholds ${threshMatch[1].trim()}`);
  if (featureMatch) parts.push(featureMatch[1]);
  if (tierMatch) parts.push(`(${tierMatch[1]})`);

  return parts.join(', ');
}

function summarizeAdversary(content: string): string {
  // ***Tier X Role***
  const tierMatch = content.match(/\*\*\*(.+?)\*\*\*/);
  const tier = tierMatch ? tierMatch[1] : '';

  // *Description in italics*
  const descMatch = content.match(/^\*([^*].+?)\*\s*$/m);
  let desc = descMatch ? descMatch[1] : '';

  // Trim description if too long
  if (desc.length > 60) {
    desc = desc.substring(0, 57) + '...';
  }

  const parts: string[] = [];
  if (tier) parts.push(tier);
  if (desc) parts.push(desc);
  return parts.join(', ');
}

export function getDocument(category: string, name: string): string | null {
  const filePath = join(SRD_PATH, category, `${name}.md`);

  if (!existsSync(filePath)) {
    return null;
  }

  return readFileSync(filePath, 'utf-8');
}
