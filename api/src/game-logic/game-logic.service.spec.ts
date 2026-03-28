import { GameLogicService } from './game-logic.service';

describe('GameLogicService', () => {
  let service: GameLogicService;

  beforeEach(() => {
    service = new GameLogicService();
  });

  describe('computeTier', () => {
    it('should return 1 for level 1', () => {
      expect(service.computeTier(1)).toBe(1);
    });

    it('should return 2 for levels 2-4', () => {
      expect(service.computeTier(2)).toBe(2);
      expect(service.computeTier(3)).toBe(2);
      expect(service.computeTier(4)).toBe(2);
    });

    it('should return 3 for levels 5-7', () => {
      expect(service.computeTier(5)).toBe(3);
      expect(service.computeTier(7)).toBe(3);
    });

    it('should return 4 for levels 8-10', () => {
      expect(service.computeTier(8)).toBe(4);
      expect(service.computeTier(10)).toBe(4);
    });
  });

  describe('computeThresholds', () => {
    it('should return null when no armor base thresholds provided', () => {
      expect(service.computeThresholds(null, 1, 1, [])).toBeNull();
    });

    it('should parse armor base thresholds correctly', () => {
      const result = service.computeThresholds('6 / 13', 1, 1, []);
      expect(result!.armorBaseMajor).toBe(6);
      expect(result!.armorBaseSevere).toBe(13);
    });

    it('should add level - 1 as bonus', () => {
      const result = service.computeThresholds('6 / 13', 5, 1, []);
      expect(result!.levelBonus).toBe(4);
      expect(result!.totalMajor).toBe(10);
      expect(result!.totalSevere).toBe(17);
    });

    it('should add level bonus of 0 at level 1', () => {
      const result = service.computeThresholds('6 / 13', 1, 1, []);
      expect(result!.levelBonus).toBe(0);
      expect(result!.totalMajor).toBe(6);
      expect(result!.totalSevere).toBe(13);
    });

    it('should sum active threshold bonuses', () => {
      const bonuses = [
        { sourceId: 'Fortified Armor', sourceType: 'domainCard' as const, majorBonus: 2, severeBonus: 2, active: true },
        { sourceId: 'Vitality', sourceType: 'domainCard' as const, majorBonus: 2, severeBonus: 2, active: true },
      ];
      const result = service.computeThresholds('6 / 13', 1, 1, bonuses);
      expect(result!.totalMajor).toBe(10);
      expect(result!.totalSevere).toBe(17);
    });

    it('should ignore inactive bonuses', () => {
      const bonuses = [
        { sourceId: 'Fortified Armor', sourceType: 'domainCard' as const, majorBonus: 2, severeBonus: 2, active: false },
      ];
      const result = service.computeThresholds('6 / 13', 1, 1, bonuses);
      expect(result!.totalMajor).toBe(6);
      expect(result!.totalSevere).toBe(13);
    });

    it('should handle all bonuses active at max level', () => {
      const bonuses = [
        { sourceId: 'Fortified Armor', sourceType: 'domainCard' as const, majorBonus: 2, severeBonus: 2, active: true },
        { sourceId: 'Frenzy', sourceType: 'domainCard' as const, majorBonus: 0, severeBonus: 8, active: true },
        { sourceId: 'Stalwart:Undaunted', sourceType: 'subclassFeature' as const, majorBonus: 3, severeBonus: 3, active: true },
      ];
      const result = service.computeThresholds('8 / 17', 10, 1, bonuses);
      // base 8/17 + level 9 + bonuses (5/13) = 22/39
      expect(result!.totalMajor).toBe(22);
      expect(result!.totalSevere).toBe(39);
    });
  });

  describe('computeEffectiveEvasion', () => {
    it('should return base evasion when no armor modifier', () => {
      expect(service.computeEffectiveEvasion(10, null)).toBe(10);
    });

    it('should add positive armor evasion modifier', () => {
      expect(service.computeEffectiveEvasion(10, 1)).toBe(11);
    });

    it('should subtract negative armor evasion modifier', () => {
      expect(service.computeEffectiveEvasion(10, -2)).toBe(8);
    });
  });

  describe('parseTraitModifiers', () => {
    it('should return all zeros when no equipment features', () => {
      const result = service.parseTraitModifiers(null, null, null);
      expect(result).toEqual({
        agility: 0, strength: 0, finesse: 0,
        instinct: 0, presence: 0, knowledge: 0,
      });
    });

    it('should parse "+N to Trait" from armor feature', () => {
      const result = service.parseTraitModifiers(null, null, 'Very Heavy: -2 to Evasion; -1 to Agility');
      expect(result.agility).toBe(-1);
    });

    it('should parse "+N to Trait" from weapon feature', () => {
      const result = service.parseTraitModifiers('+1 to Strength', null, null);
      expect(result.strength).toBe(1);
    });

    it('should combine modifiers from multiple equipment', () => {
      const result = service.parseTraitModifiers(
        '+1 to Presence',
        '+1 to Finesse',
        '-1 to Agility',
      );
      expect(result.presence).toBe(1);
      expect(result.finesse).toBe(1);
      expect(result.agility).toBe(-1);
    });

    it('should parse "increase Trait by N"', () => {
      const result = service.parseTraitModifiers('increase Strength by 2', null, null);
      expect(result.strength).toBe(2);
    });

    it('should parse "decrease Trait by N"', () => {
      const result = service.parseTraitModifiers('decrease Agility by 1', null, null);
      expect(result.agility).toBe(-1);
    });
  });
});
