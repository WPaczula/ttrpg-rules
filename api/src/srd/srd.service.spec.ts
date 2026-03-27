import { Test, TestingModule } from '@nestjs/testing';
import { SrdService } from './srd.service';
import { Weapon } from './interfaces/weapon.interface';
import { Armor } from './interfaces/armor.interface';
import { CharacterClass } from './interfaces/class.interface';
import { Ancestry } from './interfaces/ancestry.interface';
import { Community } from './interfaces/community.interface';
import { Subclass } from './interfaces/subclass.interface';
import { Domain } from './interfaces/domain.interface';
import { DomainCard } from './interfaces/domain-card.interface';

function expectWeaponShape(weapon: Weapon): void {
  expect(typeof weapon.name).toBe('string');
  expect(typeof weapon.tier).toBe('number');
  expect(['Primary', 'Secondary']).toContain(weapon.type);
  expect(['Physical', 'Magical']).toContain(weapon.damageType);
  expect(typeof weapon.trait).toBe('string');
  expect(typeof weapon.range).toBe('string');
  expect(typeof weapon.damage).toBe('string');
  expect(typeof weapon.burden).toBe('string');
}

function expectArmorShape(armor: Armor): void {
  expect(typeof armor.name).toBe('string');
  expect(typeof armor.tier).toBe('number');
  expect(typeof armor.baseThresholds).toBe('string');
  expect(typeof armor.baseScore).toBe('number');
}

function expectClassShape(cls: CharacterClass): void {
  expect(typeof cls.name).toBe('string');
  expect(typeof cls.description).toBe('string');
  expect(Array.isArray(cls.domains)).toBe(true);
  expect(cls.domains).toHaveLength(2);
  expect(Array.isArray(cls.subclasses)).toBe(true);
  expect(cls.subclasses).toHaveLength(2);
  expect(typeof cls.evasion).toBe('number');
  expect(typeof cls.hp).toBe('number');
  expect(typeof cls.items).toBe('string');
  expect(typeof cls.suggestedTraits).toBe('string');
  expect(typeof cls.suggestedPrimary).toBe('string');
  expect(typeof cls.suggestedSecondary).toBe('string');
  expect(typeof cls.suggestedArmor).toBe('string');
  expect(typeof cls.hopeFeature.name).toBe('string');
  expect(typeof cls.hopeFeature.text).toBe('string');
  expect(Array.isArray(cls.features)).toBe(true);
  expect(cls.features.length).toBeGreaterThan(0);
  expect(typeof cls.features[0].name).toBe('string');
  expect(typeof cls.features[0].text).toBe('string');
}

function expectAncestryShape(ancestry: Ancestry): void {
  expect(typeof ancestry.name).toBe('string');
  expect(typeof ancestry.description).toBe('string');
  expect(Array.isArray(ancestry.features)).toBe(true);
  expect(ancestry.features.length).toBeGreaterThan(0);
  expect(typeof ancestry.features[0].name).toBe('string');
  expect(typeof ancestry.features[0].text).toBe('string');
}

function expectCommunityShape(community: Community): void {
  expect(typeof community.name).toBe('string');
  expect(typeof community.description).toBe('string');
  expect(typeof community.note).toBe('string');
  expect(Array.isArray(community.features)).toBe(true);
  expect(community.features.length).toBeGreaterThan(0);
  expect(typeof community.features[0].name).toBe('string');
  expect(typeof community.features[0].text).toBe('string');
}

function expectSubclassShape(subclass: Subclass): void {
  expect(typeof subclass.name).toBe('string');
  expect(typeof subclass.description).toBe('string');
  expect(typeof subclass.spellcastTrait).toBe('string');
  expect(Array.isArray(subclass.foundation)).toBe(true);
  expect(Array.isArray(subclass.specialization)).toBe(true);
  expect(Array.isArray(subclass.mastery)).toBe(true);
}

function expectDomainShape(domain: Domain): void {
  expect(typeof domain.name).toBe('string');
  expect(typeof domain.description).toBe('string');
  expect(Array.isArray(domain.classes)).toBe(true);
  expect(typeof domain.cardsByLevel).toBe('object');
}

function expectDomainCardShape(card: DomainCard): void {
  expect(typeof card.name).toBe('string');
  expect(typeof card.level).toBe('number');
  expect(typeof card.domain).toBe('string');
  expect(typeof card.recallCost).toBe('number');
  expect(typeof card.description).toBe('string');
}

describe('SrdService', () => {
  let service: SrdService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SrdService],
    }).compile();

    service = module.get<SrdService>(SrdService);
  });

  describe('findAllWeapons', () => {
    it('should return an array of weapons with correct properties', () => {
      const weapons = service.findAllWeapons();
      expect(weapons.length).toBeGreaterThan(0);
      weapons.forEach(expectWeaponShape);
    });
  });

  describe('findAllArmor', () => {
    it('should return an array of armor with correct properties', () => {
      const armor = service.findAllArmor();
      expect(armor.length).toBeGreaterThan(0);
      armor.forEach(expectArmorShape);
    });
  });

  describe('findAllClasses', () => {
    it('should return an array of classes with correct properties', () => {
      const classes = service.findAllClasses();
      expect(classes.length).toBeGreaterThan(0);
      classes.forEach(expectClassShape);
    });
  });

  describe('findAllAncestries', () => {
    it('should return an array of ancestries with correct properties', () => {
      const ancestries = service.findAllAncestries();
      expect(ancestries.length).toBeGreaterThan(0);
      ancestries.forEach(expectAncestryShape);
    });
  });

  describe('findAllCommunities', () => {
    it('should return an array of communities with correct properties', () => {
      const communities = service.findAllCommunities();
      expect(communities.length).toBeGreaterThan(0);
      communities.forEach(expectCommunityShape);
    });
  });

  describe('findAllSubclasses', () => {
    it('should return an array of subclasses with correct properties', () => {
      const subclasses = service.findAllSubclasses();
      expect(subclasses.length).toBeGreaterThan(0);
      subclasses.forEach(expectSubclassShape);
    });
  });

  describe('findAllDomains', () => {
    it('should return an array of domains with correct properties', () => {
      const domains = service.findAllDomains();
      expect(domains.length).toBeGreaterThan(0);
      domains.forEach(expectDomainShape);
    });
  });

  describe('findAllDomainCards', () => {
    it('should return an array of domain cards with correct properties', () => {
      const domainCards = service.findAllDomainCards();
      expect(domainCards.length).toBeGreaterThan(0);
      domainCards.forEach(expectDomainCardShape);
    });
  });
});
