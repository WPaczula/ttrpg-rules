import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as fs from 'fs';
import * as path from 'path';
import 'dotenv/config';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const JSON_DIR = path.join(__dirname, '..', 'daggerheart-srd', '.build', '03_json');

function readJson<T>(filename: string): T {
  const content = fs.readFileSync(path.join(JSON_DIR, filename), 'utf-8').replace(/^\uFEFF/, '');
  return JSON.parse(content);
}

function parseEvasionModifier(feature: string | undefined): number | null {
  if (!feature) return null;
  const match = feature.match(/([+-]\d+)\s+to\s+Evasion/i);
  return match ? parseInt(match[1], 10) : null;
}

interface RawWeapon {
  name: string;
  tier: string;
  primary_or_secondary: string;
  physical_or_magical: string;
  trait: string;
  range: string;
  damage: string;
  burden: string;
  feature?: { name: string; text: string }[];
}

interface RawArmor {
  name: string;
  tier: string;
  base_score: string;
  base_thresholds: string;
  feature?: { name: string; text: string }[];
}

interface RawClass {
  name: string;
  description: string;
  evasion: string;
  hp: string;
  items: string;
  suggested_traits: string;
  suggested_primary: string;
  suggested_secondary: string;
  suggested_armor: string;
  hope_feature_name: string;
  hope_feature_text: string;
  domain_1: string;
  domain_2: string;
  subclass_1: string;
  subclass_2: string;
  feature: { name: string; text: string }[];
}

interface RawSubclass {
  name: string;
  description: string;
  spellcast_trait: string;
  foundation: { name: string; text: string }[];
  specialization: { name: string; text: string }[];
  mastery: { name: string; text: string }[];
}

interface RawAncestry {
  name: string;
  description: string;
  feature: { name: string; text: string }[];
}

interface RawCommunity {
  name: string;
  description: string;
  note: string;
  feature: { name: string; text: string }[];
}

interface RawDomain {
  name: string;
  description: string;
  card: string[][];
}

interface RawAbility {
  name: string;
  level: string;
  domain: string;
  recall: string;
  text: string;
  type: string;
}

interface RawAdversary {
  name: string;
  tier: string;
  type: string;
  hp: string;
  stress: string;
  difficulty: string;
  thresholds: string;
  atk: string;
  attack: string;
  range: string;
  damage: string;
  description?: string;
  motives_and_tactics?: string;
  experience?: string;
  feature?: { name: string; text: string }[];
}

interface RawBeastform {
  name: string;
  tier: string;
  examples: string;
  trait_bonus: string;
  evasion_bonus: string;
  attack: string;
  advantages: string;
  feature?: { name: string; text: string }[];
}

interface RawConsumable {
  name: string;
  roll: string;
  description: string;
}

interface RawEnvironment {
  name: string;
  tier: string;
  type: string;
  description: string;
  difficulty: string;
  impulses: string;
  potential_adversaries?: string;
  feature?: { name: string; text: string; question?: string }[];
}

interface RawItem {
  name: string;
  roll: string;
  description: string;
}

async function seed() {
  console.log('Seeding SRD data...');

  // Clear existing SRD data (in dependency order)
  await prisma.characterMarkedTrait.deleteMany();
  await prisma.environmentFeature.deleteMany();
  await prisma.environment.deleteMany();
  await prisma.beastformFeature.deleteMany();
  await prisma.beastform.deleteMany();
  await prisma.adversaryFeature.deleteMany();
  await prisma.adversary.deleteMany();
  await prisma.consumable.deleteMany();
  await prisma.item.deleteMany();
  await prisma.characterThresholdBonus.deleteMany();
  await prisma.characterDomainCard.deleteMany();
  await prisma.characterExperience.deleteMany();
  await prisma.character.deleteMany();
  await prisma.domainCard.deleteMany();
  await prisma.classDomain.deleteMany();
  await prisma.classFeature.deleteMany();
  await prisma.subclassFeature.deleteMany();
  await prisma.subclass.deleteMany();
  await prisma.srdClass.deleteMany();
  await prisma.communityFeature.deleteMany();
  await prisma.community.deleteMany();
  await prisma.ancestryFeature.deleteMany();
  await prisma.ancestry.deleteMany();
  await prisma.domain.deleteMany();
  await prisma.weapon.deleteMany();
  await prisma.armor.deleteMany();

  // 1. Seed weapons
  const rawWeapons = readJson<RawWeapon[]>('weapons.json');
  for (const w of rawWeapons) {
    const featureText = w.feature?.map(f => `${f.name}: ${f.text}`).join('; ') || null;
    await prisma.weapon.create({
      data: {
        name: w.name,
        tier: parseInt(w.tier, 10),
        type: w.primary_or_secondary,
        damageType: w.physical_or_magical,
        trait: w.trait,
        range: w.range,
        damage: w.damage,
        burden: w.burden,
        feature: featureText,
      },
    });
  }
  console.log(`  Seeded ${rawWeapons.length} weapons`);

  // 2. Seed armor
  const rawArmor = readJson<RawArmor[]>('armor.json');
  for (const a of rawArmor) {
    const featureText = a.feature?.map(f => `${f.name}: ${f.text}`).join('; ') || null;
    const evasionModifier = parseEvasionModifier(featureText ?? undefined);
    const [major, severe] = a.base_thresholds.split('/').map(s => parseInt(s.trim(), 10));
    await prisma.armor.create({
      data: {
        name: a.name,
        tier: parseInt(a.tier, 10),
        baseScore: parseInt(a.base_score, 10),
        majorThreshold: major,
        severeThreshold: severe,
        evasionModifier,
        feature: featureText,
      },
    });
  }
  console.log(`  Seeded ${rawArmor.length} armor`);

  // 3. Seed ancestries
  const rawAncestries = readJson<RawAncestry[]>('ancestries.json');
  for (const a of rawAncestries) {
    await prisma.ancestry.create({
      data: {
        name: a.name,
        description: a.description,
        features: {
          create: a.feature.map(f => ({ name: f.name, text: f.text })),
        },
      },
    });
  }
  console.log(`  Seeded ${rawAncestries.length} ancestries`);

  // 4. Seed communities
  const rawCommunities = readJson<RawCommunity[]>('communities.json');
  for (const c of rawCommunities) {
    await prisma.community.create({
      data: {
        name: c.name,
        description: c.description,
        note: c.note,
        features: {
          create: c.feature.map(f => ({ name: f.name, text: f.text })),
        },
      },
    });
  }
  console.log(`  Seeded ${rawCommunities.length} communities`);

  // 5. Seed domains
  const rawDomains = readJson<RawDomain[]>('domains.json');
  for (const d of rawDomains) {
    await prisma.domain.create({
      data: {
        name: d.name,
        description: d.description,
      },
    });
  }
  console.log(`  Seeded ${rawDomains.length} domains`);

  // 6. Seed domain cards from abilities.json
  const rawAbilities = readJson<RawAbility[]>('abilities.json');
  for (const a of rawAbilities) {
    const domain = await prisma.domain.findFirst({ where: { name: a.domain } });
    if (!domain) {
      console.warn(`  Warning: domain "${a.domain}" not found for ability "${a.name}"`);
      continue;
    }
    await prisma.domainCard.create({
      data: {
        domainId: domain.id,
        name: a.name,
        level: parseInt(a.level, 10),
        recallCost: parseInt(a.recall, 10),
        description: a.text,
      },
    });
  }
  console.log(`  Seeded ${rawAbilities.length} domain cards`);

  // 7. Seed classes with subclasses, features, and domain links
  const rawSubclasses = readJson<RawSubclass[]>('subclasses.json');
  const rawClasses = readJson<RawClass[]>('classes.json');
  for (const c of rawClasses) {
    const suggestedPrimary = await prisma.weapon.findFirst({ where: { name: c.suggested_primary } });
    const suggestedSecondary = await prisma.weapon.findFirst({ where: { name: c.suggested_secondary } });
    const suggestedArmor = await prisma.armor.findFirst({ where: { name: c.suggested_armor } });

    const suggestedTraits = c.suggested_traits
      .split(',')
      .map(s => parseInt(s.trim(), 10));

    const domain1 = await prisma.domain.findFirst({ where: { name: c.domain_1 } });
    const domain2 = await prisma.domain.findFirst({ where: { name: c.domain_2 } });

    const sub1Data = rawSubclasses.find(s => s.name === c.subclass_1);
    const sub2Data = rawSubclasses.find(s => s.name === c.subclass_2);

    const createdClass = await prisma.srdClass.create({
      data: {
        name: c.name,
        description: c.description,
        evasion: parseInt(c.evasion, 10),
        hp: parseInt(c.hp, 10),
        items: c.items,
        suggestedTraits,
        hopeFeatureName: c.hope_feature_name,
        hopeFeatureText: c.hope_feature_text,
        suggestedPrimaryId: suggestedPrimary?.id ?? null,
        suggestedSecondaryId: suggestedSecondary?.id ?? null,
        suggestedArmorId: suggestedArmor?.id ?? null,
        features: {
          create: c.feature.map(f => ({ name: f.name, text: f.text })),
        },
        domains: {
          create: [
            ...(domain1 ? [{ domainId: domain1.id }] : []),
            ...(domain2 ? [{ domainId: domain2.id }] : []),
          ],
        },
      },
    });

    for (const subData of [sub1Data, sub2Data]) {
      if (!subData) continue;
      const features = [
        ...subData.foundation.map(f => ({ ...f, tier: 'foundation' })),
        ...subData.specialization.map(f => ({ ...f, tier: 'specialization' })),
        ...subData.mastery.map(f => ({ ...f, tier: 'mastery' })),
      ];
      await prisma.subclass.create({
        data: {
          classId: createdClass.id,
          name: subData.name,
          description: subData.description,
          spellcastTrait: subData.spellcast_trait || '',
          features: {
            create: features.map(f => ({ tier: f.tier, name: f.name, text: f.text })),
          },
        },
      });
    }
  }
  console.log(`  Seeded ${rawClasses.length} classes with subclasses and features`);

  // 8. Seed adversaries
  const rawAdversaries = readJson<RawAdversary[]>('adversaries.json');
  for (const a of rawAdversaries) {
    await prisma.adversary.create({
      data: {
        name: a.name,
        tier: parseInt(a.tier, 10),
        type: a.type,
        hp: parseInt(a.hp, 10),
        stress: parseInt(a.stress, 10),
        difficulty: a.difficulty,
        thresholds: a.thresholds,
        atk: a.atk,
        attack: a.attack,
        range: a.range,
        damage: a.damage,
        description: a.description || null,
        motivesAndTactics: a.motives_and_tactics || null,
        experience: a.experience || null,
        features: {
          create: (a.feature || []).map(f => ({ name: f.name, text: f.text })),
        },
      },
    });
  }
  console.log(`  Seeded ${rawAdversaries.length} adversaries`);

  // 9. Seed beastforms
  const rawBeastforms = readJson<RawBeastform[]>('beastforms.json');
  for (const b of rawBeastforms) {
    await prisma.beastform.create({
      data: {
        name: b.name,
        tier: parseInt(b.tier, 10),
        examples: b.examples,
        traitBonus: b.trait_bonus || '',
        evasionBonus: b.evasion_bonus || '',
        attack: b.attack || '',
        advantages: b.advantages || '',
        features: {
          create: (b.feature || []).map(f => ({ name: f.name, text: f.text })),
        },
      },
    });
  }
  console.log(`  Seeded ${rawBeastforms.length} beastforms`);

  // 10. Seed consumables
  const rawConsumables = readJson<RawConsumable[]>('consumables.json');
  for (const c of rawConsumables) {
    await prisma.consumable.create({
      data: {
        name: c.name,
        roll: parseInt(c.roll, 10),
        description: c.description,
      },
    });
  }
  console.log(`  Seeded ${rawConsumables.length} consumables`);

  // 11. Seed environments
  const rawEnvironments = readJson<RawEnvironment[]>('environments.json');
  for (const e of rawEnvironments) {
    await prisma.environment.create({
      data: {
        name: e.name,
        tier: parseInt(e.tier, 10),
        type: e.type,
        description: e.description,
        difficulty: e.difficulty,
        impulses: e.impulses,
        potentialAdversaries: e.potential_adversaries || null,
        features: {
          create: (e.feature || []).map(f => ({
            name: f.name,
            text: f.text,
            question: f.question || null,
          })),
        },
      },
    });
  }
  console.log(`  Seeded ${rawEnvironments.length} environments`);

  // 12. Seed items
  const rawItems = readJson<RawItem[]>('items.json');
  for (const i of rawItems) {
    await prisma.item.create({
      data: {
        name: i.name,
        roll: parseInt(i.roll, 10),
        description: i.description,
      },
    });
  }
  console.log(`  Seeded ${rawItems.length} items`);

  console.log('Seeding complete!');
}

seed()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
