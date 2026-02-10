import { describe, it, expect } from 'vitest';
import { listDocuments, listDocumentsWithSummary, getDocument } from './documents.js';

describe('documents service', () => {
  describe('listDocuments', () => {
    it('lists all classes', () => {
      const classes = listDocuments('classes');
      expect(classes).toContain('Bard');
      expect(classes).toContain('Warrior');
      expect(classes.length).toBe(9);
    });

    it('returns empty array for non-existent category', () => {
      const docs = listDocuments('nonexistent');
      expect(docs).toEqual([]);
    });
  });

  describe('listDocumentsWithSummary', () => {
    it('classes include domain info in the summary', () => {
      const classes = listDocumentsWithSummary('classes');
      const wizard = classes.find(c => c.startsWith('Wizard'));
      expect(wizard).toBeDefined();
      expect(wizard).toContain('\u2014');
      expect(wizard).toContain('Codex');
      expect(wizard).toContain('Splendor');
      expect(wizard).toContain('domains');
    });

    it('classes include HP and evasion', () => {
      const classes = listDocumentsWithSummary('classes');
      const bard = classes.find(c => c.startsWith('Bard'));
      expect(bard).toBeDefined();
      expect(bard).toContain('5 HP');
      expect(bard).toContain('Evasion 10');
    });

    it('weapons include trait, range, and tier in the summary', () => {
      const weapons = listDocumentsWithSummary('weapons');
      const battleaxe = weapons.find(w => w.startsWith('Battleaxe'));
      expect(battleaxe).toBeDefined();
      expect(battleaxe).toContain('\u2014');
      expect(battleaxe).toContain('Strength');
      expect(battleaxe).toContain('Melee');
      expect(battleaxe).toContain('Tier 1');
    });

    it('armor includes score and tier', () => {
      const armor = listDocumentsWithSummary('armor');
      const chainmail = armor.find(a => a.startsWith('Chainmail Armor'));
      expect(chainmail).toBeDefined();
      expect(chainmail).toContain('\u2014');
      expect(chainmail).toContain('Score 4');
      expect(chainmail).toContain('Tier 1');
    });

    it('adversaries include tier', () => {
      const adversaries = listDocumentsWithSummary('adversaries');
      const burrower = adversaries.find(a => a.startsWith('Acid Burrower'));
      expect(burrower).toBeDefined();
      expect(burrower).toContain('\u2014');
      expect(burrower).toContain('Tier 1');
    });

    it('returns name \u2014 summary format for all entries', () => {
      const classes = listDocumentsWithSummary('classes');
      for (const entry of classes) {
        expect(entry).toMatch(/^.+ \u2014 .+$/);
      }
    });

    it('subclasses include spellcast trait', () => {
      const subclasses = listDocumentsWithSummary('subclasses');
      const school = subclasses.find(s => s.startsWith('School of Knowledge'));
      expect(school).toBeDefined();
      expect(school).toContain('Spellcast: Knowledge');
    });

    it('communities include personality traits', () => {
      const communities = listDocumentsWithSummary('communities');
      const highborne = communities.find(c => c.startsWith('Highborne'));
      expect(highborne).toBeDefined();
      expect(highborne).toContain('amiable');
    });

    it('domains include class access info', () => {
      const domains = listDocumentsWithSummary('domains');
      const bone = domains.find(d => d.startsWith('Bone'));
      expect(bone).toBeDefined();
      expect(bone).toContain('Ranger');
      expect(bone).toContain('Warrior');
    });

    it('returns empty array for non-existent category', () => {
      const docs = listDocumentsWithSummary('nonexistent');
      expect(docs).toEqual([]);
    });
  });

  describe('getDocument', () => {
    it('returns content for existing document', () => {
      const content = getDocument('classes', 'Bard');
      expect(content).toContain('# BARD');
      expect(content).toContain('Grace');
    });

    it('returns null for non-existent document', () => {
      const content = getDocument('classes', 'NonExistent');
      expect(content).toBeNull();
    });
  });
});
