jest.mock('@prisma/client', () => ({
  ...jest.requireActual('@prisma/client'),
  PrismaClient: jest.fn(),
}));

import { Test, TestingModule } from '@nestjs/testing';
import { LevelUpService } from './level-up.service';
import { CharacterRepository } from './repositories/character.repository';
import { LevelUpRepository } from './repositories/level-up.repository';
import { GameLogicService } from '../game-logic/game-logic.service';
import { DomainCardRepository } from '../srd/repositories/domain-card.repository';
import { ExperienceRepository } from './repositories/experience.repository';
import { CharacterDomainCardRepository } from './repositories/character-domain-card.repository';
import { PrismaService } from '../prisma/prisma.service';
import { CharactersGateway } from './characters.gateway';
import { ICharacterWithRelations } from './interfaces/character.interface';
import { AdvancementType } from '@prisma/client';

const makeCharacter = (
  overrides: Partial<ICharacterWithRelations> = {},
): ICharacterWithRelations => ({
  id: 'char-1',
  userId: 'user-1',
  name: 'Aria',
  level: 1,
  classId: 'cls-1',
  subclassId: 'sub-1',
  ancestryId: 'anc-1',
  secondaryAncestryId: null,
  ancestryFeatureId: 'af-1',
  secondaryAncestryFeatureId: null,
  communityId: 'com-1',
  agility: 1,
  strength: 0,
  finesse: 2,
  instinct: 0,
  presence: 1,
  knowledge: -1,
  hpTotal: 6,
  hpMarked: 0,
  stressTotal: 6,
  stressMarked: 0,
  armorId: null,
  armorMarked: 0,
  evasion: 10,
  proficiency: 1,
  hope: 2,
  goldHandfuls: 0,
  goldBags: 0,
  goldChests: 0,
  primaryWeaponId: null,
  secondaryWeaponId: null,
  notes: '',
  createdAt: new Date(),
  updatedAt: new Date(),
  class: { id: 'cls-1', name: 'Warrior' },
  subclass: { id: 'sub-1', name: 'Berserker' },
  ancestry: { id: 'anc-1', name: 'Human' },
  secondaryAncestry: null,
  ancestryFeature: { id: 'af-1', name: 'Versatile', text: 'Flexible' },
  secondaryAncestryFeature: null,
  community: { id: 'com-1', name: 'Wanderers' },
  armor: null,
  primaryWeapon: null,
  secondaryWeapon: null,
  experiences: [],
  domainCards: [],
  thresholdBonuses: [],
  markedTraits: [],
  ...overrides,
});

const mockCharacterRepo = {
  findById: jest.fn(),
  update: jest.fn(),
};

const mockLevelUpRepo = {
  getAdvancementsInTier: jest.fn(),
  createWithAdvancements: jest.fn(),
};

const mockDomainCardRepo = {
  findAll: jest.fn(),
  findById: jest.fn(),
};

const mockExperienceRepo = {
  create: jest.fn(),
  update: jest.fn(),
};

const mockCharacterDomainCardRepo = {
  add: jest.fn(),
};

const mockPrisma = {
  $transaction: jest.fn((fn: any) => fn(mockPrisma)),
  characterMarkedTrait: {
    create: jest.fn(),
    deleteMany: jest.fn(),
  },
};

const mockGateway = {
  broadcastStatUpdates: jest.fn(),
};

describe('LevelUpService', () => {
  let service: LevelUpService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LevelUpService,
        GameLogicService,
        { provide: CharacterRepository, useValue: mockCharacterRepo },
        { provide: LevelUpRepository, useValue: mockLevelUpRepo },
        { provide: DomainCardRepository, useValue: mockDomainCardRepo },
        { provide: ExperienceRepository, useValue: mockExperienceRepo },
        {
          provide: CharacterDomainCardRepository,
          useValue: mockCharacterDomainCardRepo,
        },
        { provide: PrismaService, useValue: mockPrisma },
        { provide: CharactersGateway, useValue: mockGateway },
      ],
    }).compile();
    service = module.get(LevelUpService);
  });

  describe('getLevelUpOptions', () => {
    it('should throw ConflictException when character is level 10', async () => {
      mockCharacterRepo.findById.mockResolvedValue(
        makeCharacter({ level: 10 }),
      );

      await expect(service.getLevelUpOptions('char-1')).rejects.toThrow(
        'already at maximum level',
      );
    });

    it('should return options for a level 1 character (tier transition)', async () => {
      mockCharacterRepo.findById.mockResolvedValue(
        makeCharacter({ level: 1 }),
      );
      mockLevelUpRepo.getAdvancementsInTier.mockResolvedValue([]);
      mockDomainCardRepo.findAll.mockResolvedValue([
        {
          id: 'dc-1',
          name: 'Flame Bolt',
          level: 1,
          domainName: 'Arcana',
          recallCost: 1,
          description: '',
        },
      ]);

      const result = await service.getLevelUpOptions('char-1');

      expect(result.currentLevel).toBe(1);
      expect(result.nextLevel).toBe(2);
      expect(result.isTierTransition).toBe(true);
      expect(result.tierBonuses).toEqual({
        proficiencyIncrease: true,
        clearMarkedTraits: false,
        requiresNewExperience: true,
      });
      expect(result.availableAdvancements).toHaveLength(6);
      expect(result.availableAdvancements.every((a) => a.available)).toBe(true);
    });

    it('should return options for level 4 character (tier transition to tier 3)', async () => {
      mockCharacterRepo.findById.mockResolvedValue(
        makeCharacter({ level: 4 }),
      );
      mockLevelUpRepo.getAdvancementsInTier.mockResolvedValue([]);
      mockDomainCardRepo.findAll.mockResolvedValue([]);

      const result = await service.getLevelUpOptions('char-1');

      expect(result.nextLevel).toBe(5);
      expect(result.isTierTransition).toBe(true);
      expect(result.tierBonuses!.clearMarkedTraits).toBe(true);
    });

    it('should mark slots as unavailable when tier limit reached', async () => {
      mockCharacterRepo.findById.mockResolvedValue(
        makeCharacter({ level: 2 }),
      );
      mockLevelUpRepo.getAdvancementsInTier.mockResolvedValue([
        {
          id: 'a1',
          type: AdvancementType.BOOST_EXPERIENCES,
          metadata: null,
        },
      ]);
      mockDomainCardRepo.findAll.mockResolvedValue([]);

      const result = await service.getLevelUpOptions('char-1');

      const boostOption = result.availableAdvancements.find(
        (a) => a.type === AdvancementType.BOOST_EXPERIENCES,
      );
      expect(boostOption!.slotsUsed).toBe(1);
      expect(boostOption!.slotsMax).toBe(1);
      expect(boostOption!.available).toBe(false);
    });

    it('should filter eligible domain cards by next level', async () => {
      mockCharacterRepo.findById.mockResolvedValue(
        makeCharacter({ level: 2 }),
      );
      mockLevelUpRepo.getAdvancementsInTier.mockResolvedValue([]);
      mockDomainCardRepo.findAll.mockResolvedValue([
        {
          id: 'dc-1',
          name: 'Card L1',
          level: 1,
          domainName: 'Blade',
          recallCost: 1,
          description: '',
        },
        {
          id: 'dc-2',
          name: 'Card L3',
          level: 3,
          domainName: 'Blade',
          recallCost: 1,
          description: '',
        },
        {
          id: 'dc-5',
          name: 'Card L5',
          level: 5,
          domainName: 'Blade',
          recallCost: 1,
          description: '',
        },
      ]);

      const result = await service.getLevelUpOptions('char-1');

      expect(result.eligibleDomainCards).toHaveLength(2);
      expect(result.eligibleDomainCards.map((c) => c.id)).toEqual([
        'dc-1',
        'dc-2',
      ]);
    });

    it('should exclude domain cards already owned', async () => {
      mockCharacterRepo.findById.mockResolvedValue(
        makeCharacter({
          level: 2,
          domainCards: [
            {
              id: 'cdc-1',
              domainCard: {
                id: 'dc-1',
                name: 'Card L1',
                level: 1,
                domainName: 'Blade',
              },
            },
          ],
        }),
      );
      mockLevelUpRepo.getAdvancementsInTier.mockResolvedValue([]);
      mockDomainCardRepo.findAll.mockResolvedValue([
        {
          id: 'dc-1',
          name: 'Card L1',
          level: 1,
          domainName: 'Blade',
          recallCost: 1,
          description: '',
        },
        {
          id: 'dc-2',
          name: 'Card L2',
          level: 2,
          domainName: 'Blade',
          recallCost: 1,
          description: '',
        },
      ]);

      const result = await service.getLevelUpOptions('char-1');

      expect(result.eligibleDomainCards).toHaveLength(1);
      expect(result.eligibleDomainCards[0].id).toBe('dc-2');
    });

    it('should return non-tier-transition for level 2 -> 3', async () => {
      mockCharacterRepo.findById.mockResolvedValue(
        makeCharacter({ level: 2 }),
      );
      mockLevelUpRepo.getAdvancementsInTier.mockResolvedValue([]);
      mockDomainCardRepo.findAll.mockResolvedValue([]);

      const result = await service.getLevelUpOptions('char-1');

      expect(result.nextLevel).toBe(3);
      expect(result.isTierTransition).toBe(false);
      expect(result.tierBonuses).toBeNull();
    });
  });

  describe('applyLevelUp', () => {
    it('should apply a basic level-up with ADD_HP and ADD_STRESS', async () => {
      const character = makeCharacter({ level: 2 });
      const updatedCharacter = makeCharacter({
        level: 3,
        hpTotal: 7,
        stressTotal: 7,
      });
      // findById is called 3 times: getLevelUpOptions, applyLevelUp validation, final refetch
      mockCharacterRepo.findById
        .mockResolvedValueOnce(character)
        .mockResolvedValueOnce(character)
        .mockResolvedValueOnce(updatedCharacter);
      mockLevelUpRepo.getAdvancementsInTier.mockResolvedValue([]);
      mockDomainCardRepo.findAll.mockResolvedValue([]);
      mockLevelUpRepo.createWithAdvancements.mockResolvedValue({});
      mockCharacterRepo.update.mockResolvedValue(updatedCharacter);

      const result = await service.applyLevelUp('char-1', {
        advancements: [
          { type: AdvancementType.ADD_HP },
          { type: AdvancementType.ADD_STRESS },
        ],
      } as any);

      expect(mockCharacterRepo.update).toHaveBeenCalledWith(
        'char-1',
        expect.objectContaining({
          level: 3,
          hpTotal: 7,
          stressTotal: 7,
        }),
      );
      expect(result.character).toEqual(updatedCharacter);
    });

    it('should apply INCREASE_TRAITS and create marked trait records', async () => {
      const character = makeCharacter({ level: 2, agility: 1, strength: 0 });
      mockCharacterRepo.findById.mockResolvedValue(character);
      mockLevelUpRepo.getAdvancementsInTier.mockResolvedValue([]);
      mockDomainCardRepo.findAll.mockResolvedValue([]);
      mockLevelUpRepo.createWithAdvancements.mockResolvedValue({});
      mockCharacterRepo.update.mockResolvedValue(makeCharacter({ level: 3 }));

      await service.applyLevelUp('char-1', {
        advancements: [
          {
            type: AdvancementType.INCREASE_TRAITS,
            metadata: { traits: ['agility', 'strength'] },
          },
          { type: AdvancementType.ADD_HP },
        ],
      } as any);

      expect(mockCharacterRepo.update).toHaveBeenCalledWith(
        'char-1',
        expect.objectContaining({
          agility: 2,
          strength: 1,
        }),
      );
    });

    it('should reject when character is at max level', async () => {
      mockCharacterRepo.findById.mockResolvedValue(
        makeCharacter({ level: 10 }),
      );

      await expect(
        service.applyLevelUp('char-1', {
          advancements: [
            { type: AdvancementType.ADD_HP },
            { type: AdvancementType.ADD_STRESS },
          ],
        } as any),
      ).rejects.toThrow('already at maximum level');
    });

    it('should reject when advancement slot is full', async () => {
      mockCharacterRepo.findById.mockResolvedValue(
        makeCharacter({ level: 2 }),
      );
      mockLevelUpRepo.getAdvancementsInTier.mockResolvedValue([
        {
          id: 'a1',
          type: AdvancementType.BOOST_EXPERIENCES,
          metadata: null,
        },
      ]);
      mockDomainCardRepo.findAll.mockResolvedValue([]);

      await expect(
        service.applyLevelUp('char-1', {
          advancements: [
            {
              type: AdvancementType.BOOST_EXPERIENCES,
              metadata: { experienceIds: ['exp-1', 'exp-2'] },
            },
            { type: AdvancementType.ADD_HP },
          ],
        } as any),
      ).rejects.toThrow('is full');
    });

    it('should reject INCREASE_TRAITS when trait is already marked', async () => {
      mockCharacterRepo.findById.mockResolvedValue(
        makeCharacter({
          level: 2,
          markedTraits: [{ id: 'mt-1', trait: 'agility' }],
        }),
      );
      mockLevelUpRepo.getAdvancementsInTier.mockResolvedValue([]);
      mockDomainCardRepo.findAll.mockResolvedValue([]);

      await expect(
        service.applyLevelUp('char-1', {
          advancements: [
            {
              type: AdvancementType.INCREASE_TRAITS,
              metadata: { traits: ['agility', 'strength'] },
            },
            { type: AdvancementType.ADD_HP },
          ],
        } as any),
      ).rejects.toThrow('already marked');
    });

    it('should apply tier transition bonuses at level 2', async () => {
      const character = makeCharacter({ level: 1, proficiency: 1 });
      mockCharacterRepo.findById.mockResolvedValue(character);
      mockLevelUpRepo.getAdvancementsInTier.mockResolvedValue([]);
      mockDomainCardRepo.findAll.mockResolvedValue([]);
      mockLevelUpRepo.createWithAdvancements.mockResolvedValue({});
      mockCharacterRepo.update.mockResolvedValue(
        makeCharacter({ level: 2, proficiency: 2 }),
      );

      await service.applyLevelUp('char-1', {
        advancements: [
          { type: AdvancementType.ADD_HP },
          { type: AdvancementType.ADD_STRESS },
        ],
        newExperienceName: 'Scouting',
      } as any);

      expect(mockCharacterRepo.update).toHaveBeenCalledWith(
        'char-1',
        expect.objectContaining({
          level: 2,
          proficiency: 2,
        }),
      );
    });

    it('should require newExperienceName on tier transitions', async () => {
      mockCharacterRepo.findById.mockResolvedValue(
        makeCharacter({ level: 1 }),
      );
      mockLevelUpRepo.getAdvancementsInTier.mockResolvedValue([]);
      mockDomainCardRepo.findAll.mockResolvedValue([]);

      await expect(
        service.applyLevelUp('char-1', {
          advancements: [
            { type: AdvancementType.ADD_HP },
            { type: AdvancementType.ADD_STRESS },
          ],
        } as any),
      ).rejects.toThrow('requires a new experience name');
    });

    it('should reject BOOST_EXPERIENCES when experience modifier is already 6', async () => {
      mockCharacterRepo.findById.mockResolvedValue(
        makeCharacter({
          level: 2,
          experiences: [
            { id: 'exp-1', name: 'Fighting', modifier: 6 },
            { id: 'exp-2', name: 'Tracking', modifier: 3 },
          ],
        }),
      );
      mockLevelUpRepo.getAdvancementsInTier.mockResolvedValue([]);
      mockDomainCardRepo.findAll.mockResolvedValue([]);

      await expect(
        service.applyLevelUp('char-1', {
          advancements: [
            {
              type: AdvancementType.BOOST_EXPERIENCES,
              metadata: { experienceIds: ['exp-1', 'exp-2'] },
            },
            { type: AdvancementType.ADD_HP },
          ],
        } as any),
      ).rejects.toThrow('already at maximum modifier');
    });
  });
});
