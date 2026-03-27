import { WeaponDto } from '../dtos/weapon.dto';
import { ArmorDto } from '../dtos/armor.dto';
import { FeatureDto } from '../dtos/feature.dto';
import { ClassDto } from '../dtos/class.dto';
import { AncestryDto } from '../dtos/ancestry.dto';
import { CommunityDto } from '../dtos/community.dto';
import { SubclassDto } from '../dtos/subclass.dto';
import { DomainDto } from '../dtos/domain.dto';
import { DomainCardDto } from '../dtos/domain-card.dto';

export function createMockFeature(overrides?: Partial<FeatureDto>): FeatureDto {
  return {
    name: 'Test Feature',
    text: 'Test text',
    ...overrides,
  };
}

export function createMockWeapon(overrides?: Partial<WeaponDto>): WeaponDto {
  return {
    name: 'Broadsword',
    tier: 1,
    type: 'Primary',
    damageType: 'Physical',
    trait: 'Agility',
    range: 'Melee',
    damage: 'd8 phy',
    burden: 'One-Handed',
    ...overrides,
  };
}

export function createMockArmor(overrides?: Partial<ArmorDto>): ArmorDto {
  return {
    name: 'Leather Armor',
    tier: 1,
    baseThresholds: '3/6/9',
    baseScore: 2,
    ...overrides,
  };
}

export function createMockClass(overrides?: Partial<ClassDto>): ClassDto {
  return {
    name: 'Warrior',
    description: 'A brave fighter',
    domains: ['Blade', 'Bone'],
    subclasses: ['Champion', 'Berserker'],
    evasion: 10,
    hp: 18,
    items: 'Sword, Shield',
    suggestedTraits: 'Strength',
    suggestedPrimary: 'Broadsword',
    suggestedSecondary: 'Dagger',
    suggestedArmor: 'Leather Armor',
    hopeFeature: createMockFeature(),
    features: [createMockFeature()],
    ...overrides,
  };
}

export function createMockAncestry(
  overrides?: Partial<AncestryDto>,
): AncestryDto {
  return {
    name: 'Human',
    description: 'Adaptable folk',
    features: [createMockFeature()],
    ...overrides,
  };
}

export function createMockCommunity(
  overrides?: Partial<CommunityDto>,
): CommunityDto {
  return {
    name: 'Highborne',
    description: 'Nobles',
    note: 'A note',
    features: [createMockFeature()],
    ...overrides,
  };
}

export function createMockSubclass(
  overrides?: Partial<SubclassDto>,
): SubclassDto {
  return {
    name: 'Champion',
    description: 'A protector',
    spellcastTrait: 'Strength',
    foundation: [createMockFeature()],
    specialization: [createMockFeature()],
    mastery: [createMockFeature()],
    ...overrides,
  };
}

export function createMockDomain(overrides?: Partial<DomainDto>): DomainDto {
  return {
    name: 'Blade',
    description: 'Domain of blades',
    classes: ['Warrior'],
    cardsByLevel: { 1: ['Strike'] },
    ...overrides,
  };
}

export function createMockDomainCard(
  overrides?: Partial<DomainCardDto>,
): DomainCardDto {
  return {
    name: 'Strike',
    level: 1,
    domain: 'Blade',
    recallCost: 1,
    description: 'A swift strike',
    ...overrides,
  };
}
