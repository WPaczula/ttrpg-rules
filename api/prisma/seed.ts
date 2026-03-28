import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

const JSON_DIR = path.join(__dirname, '..', 'daggerheart-srd', '.build', '03_json');

function readJson<T>(filename: string): T {
  const content = fs.readFileSync(path.join(JSON_DIR, filename), 'utf-8');
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

async function seed() {
  console.log('Seeding SRD data...');

  // Clear existing SRD data (in dependency order)
  await prisma.characterMarkedTrait.deleteMany();
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
    const evasionModifier = parseEvasionModifier(featureText);
    await prisma.armor.create({
      data: {
        name: a.name,
        tier: parseInt(a.tier, 10),
        baseScore: parseInt(a.base_score, 10),
        baseThresholds: a.base_thresholds,
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
          spellcastTrait: subData.spellcast_trait,
          features: {
            create: features.map(f => ({ tier: f.tier, name: f.name, text: f.text })),
          },
        },
      });
    }
  }
  console.log(`  Seeded ${rawClasses.length} classes with subclasses and features`);

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
