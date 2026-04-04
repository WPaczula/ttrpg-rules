jest.mock('@prisma/client', () => ({ PrismaClient: jest.fn() }));

import { Test, TestingModule } from '@nestjs/testing';
import { CharactersService } from './characters.service';
import { CharactersGateway } from './characters.gateway';
import { CharacterRepository } from './repositories/character.repository';
import { ExperienceRepository } from './repositories/experience.repository';
import { CharacterDomainCardRepository } from './repositories/character-domain-card.repository';
import { ThresholdBonusRepository } from './repositories/threshold-bonus.repository';
import { GameLogicService } from '../game-logic/game-logic.service';
import { ClassRepository } from '../srd/repositories/class.repository';
import { ArmorRepository } from '../srd/repositories/armor.repository';
import { DomainCardRepository } from '../srd/repositories/domain-card.repository';
import { ICharacterWithRelations } from './interfaces/character.interface';
import { ComputedStats } from '../game-logic/interfaces/computed-stats.interface';

const mockComputed: ComputedStats = {
  tier: 1,
  thresholds: null,
  effectiveEvasion: 10,
  traitModifiers: {
    agility: 0,
    strength: 0,
    finesse: 0,
    instinct: 0,
    presence: 0,
    knowledge: 0,
  },
};

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
  items: [],
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
  create: jest.fn(),
  findAll: jest.fn(),
  findById: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

const mockExperienceRepo = {
  create: jest.fn(),
  findById: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

const mockDomainCardRepo = {
  exists: jest.fn(),
  add: jest.fn(),
  remove: jest.fn(),
};

const mockThresholdBonusRepo = {
  toggleActive: jest.fn(),
};

const mockGameLogic = {
  computeAll: jest.fn().mockReturnValue(mockComputed),
  computeTier: jest.fn().mockReturnValue(1),
};

const mockClassRepo = {
  findById: jest.fn(),
};

const mockArmorRepo = {
  findById: jest.fn(),
};

const mockDomainCardSrdRepo = {
  findById: jest.fn(),
};

const mockGateway = {
  broadcastStatUpdate: jest.fn(),
  broadcastStatUpdates: jest.fn(),
};

describe('CharactersService', () => {
  let service: CharactersService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CharactersService,
        { provide: CharacterRepository, useValue: mockCharacterRepo },
        { provide: ExperienceRepository, useValue: mockExperienceRepo },
        {
          provide: CharacterDomainCardRepository,
          useValue: mockDomainCardRepo,
        },
        { provide: ThresholdBonusRepository, useValue: mockThresholdBonusRepo },
        { provide: GameLogicService, useValue: mockGameLogic },
        { provide: ClassRepository, useValue: mockClassRepo },
        { provide: ArmorRepository, useValue: mockArmorRepo },
        { provide: DomainCardRepository, useValue: mockDomainCardSrdRepo },
        { provide: CharactersGateway, useValue: mockGateway },
      ],
    }).compile();
    service = module.get(CharactersService);
  });

  const baseCreateDto = {
    name: 'Aria',
    classId: 'cls-1',
    subclassId: 'sub-1',
    ancestryId: 'anc-1',
    ancestryFeatureId: 'af-1',
    communityId: 'com-1',
    agility: 1, strength: 0, finesse: 2, instinct: 0, presence: 1, knowledge: -1,
  };

  describe('create', () => {
    beforeEach(() => {
      mockClassRepo.findById.mockResolvedValue({ id: 'cls-1', hp: 6, evasion: 10 });
      mockCharacterRepo.create.mockResolvedValue(makeCharacter());
    });

    it('rejects an unknown domain card id', async () => {
      mockDomainCardSrdRepo.findById.mockResolvedValue(null);

      await expect(
        service.create({ ...baseCreateDto, domainCardIds: ['dc-bad'] }, 'user-1'),
      ).rejects.toThrow('not found');
    });

    it('rejects a domain card whose level exceeds 1 for a level-1 character', async () => {
      mockDomainCardSrdRepo.findById.mockResolvedValue({ id: 'dc-1', level: 2 });

      await expect(
        service.create({ ...baseCreateDto, domainCardIds: ['dc-1'] }, 'user-1'),
      ).rejects.toThrow('not available');
    });

    it('passes experiences to the repository', async () => {
      const experiences = [{ name: 'Scouting', modifier: 2 }];

      await service.create({ ...baseCreateDto, experiences }, 'user-1');

      expect(mockCharacterRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({ experiences }),
      );
    });

    it('passes domainCardIds to the repository after validation', async () => {
      mockDomainCardSrdRepo.findById.mockResolvedValue({ id: 'dc-1', level: 1 });

      await service.create({ ...baseCreateDto, domainCardIds: ['dc-1'] }, 'user-1');

      expect(mockCharacterRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({ domainCardIds: ['dc-1'] }),
      );
    });
  });

  describe('addDomainCard', () => {
    it('rejects a domain card whose level exceeds the character level', async () => {
      // tier 2 char: old code would allow level <= 4, correct rule: level <= 2
      mockGameLogic.computeTier.mockReturnValue(2);
      const character = makeCharacter({ level: 2 });
      mockCharacterRepo.findById.mockResolvedValue(character);
      mockDomainCardSrdRepo.findById.mockResolvedValue({ id: 'dc-1', level: 3 });

      await expect(
        service.addDomainCard('char-1', { domainCardId: 'dc-1' }),
      ).rejects.toThrow('not available');
    });

    it('accepts a domain card whose level equals the character level', async () => {
      mockGameLogic.computeTier.mockReturnValue(2);
      const character = makeCharacter({ level: 2 });
      mockCharacterRepo.findById.mockResolvedValue(character);
      mockDomainCardSrdRepo.findById.mockResolvedValue({ id: 'dc-1', level: 2 });
      mockDomainCardRepo.exists.mockResolvedValue(false);
      mockDomainCardRepo.add.mockResolvedValue({ id: 'cdc-1' });

      await expect(
        service.addDomainCard('char-1', { domainCardId: 'dc-1' }),
      ).resolves.not.toThrow();
    });
  });

  describe('update', () => {
    it('broadcasts hpMarked change via gateway', async () => {
      const character = makeCharacter({ hpMarked: 3 });
      mockCharacterRepo.findById.mockResolvedValue(character);
      mockCharacterRepo.update.mockResolvedValue(character);

      await service.update('char-1', { hpMarked: 3 });

      expect(mockGateway.broadcastStatUpdates).toHaveBeenCalledWith('user-1', [
        {
          characterId: 'char-1',
          characterName: 'Aria',
          stat: 'hpMarked',
          value: 3,
        },
      ]);
    });

    it('broadcasts stressMarked change via gateway', async () => {
      const character = makeCharacter({ stressMarked: 2 });
      mockCharacterRepo.findById.mockResolvedValue(character);
      mockCharacterRepo.update.mockResolvedValue(character);

      await service.update('char-1', { stressMarked: 2 });

      expect(mockGateway.broadcastStatUpdates).toHaveBeenCalledWith('user-1', [
        {
          characterId: 'char-1',
          characterName: 'Aria',
          stat: 'stressMarked',
          value: 2,
        },
      ]);
    });

    it('broadcasts hope change via gateway', async () => {
      const character = makeCharacter({ hope: 5 });
      mockCharacterRepo.findById.mockResolvedValue(character);
      mockCharacterRepo.update.mockResolvedValue(character);

      await service.update('char-1', { hope: 5 });

      expect(mockGateway.broadcastStatUpdates).toHaveBeenCalledWith('user-1', [
        {
          characterId: 'char-1',
          characterName: 'Aria',
          stat: 'hope',
          value: 5,
        },
      ]);
    });

    it('broadcasts armorMarked change via gateway', async () => {
      const character = makeCharacter({ armorMarked: 1 });
      mockCharacterRepo.findById.mockResolvedValue(character);
      mockCharacterRepo.update.mockResolvedValue(character);

      await service.update('char-1', { armorMarked: 1 });

      expect(mockGateway.broadcastStatUpdates).toHaveBeenCalledWith('user-1', [
        {
          characterId: 'char-1',
          characterName: 'Aria',
          stat: 'armorMarked',
          value: 1,
        },
      ]);
    });

    it('broadcasts multiple stat changes in a single update', async () => {
      const character = makeCharacter({ hpMarked: 4, hope: 7 });
      mockCharacterRepo.findById.mockResolvedValue(character);
      mockCharacterRepo.update.mockResolvedValue(character);

      await service.update('char-1', { hpMarked: 4, hope: 7 });

      expect(mockGateway.broadcastStatUpdates).toHaveBeenCalledWith('user-1', [
        {
          characterId: 'char-1',
          characterName: 'Aria',
          stat: 'hpMarked',
          value: 4,
        },
        {
          characterId: 'char-1',
          characterName: 'Aria',
          stat: 'hope',
          value: 7,
        },
      ]);
    });

    it('does not broadcast when no tracked stats are updated', async () => {
      const character = makeCharacter();
      mockCharacterRepo.findById.mockResolvedValue(character);
      mockCharacterRepo.update.mockResolvedValue(character);

      await service.update('char-1', { notes: 'some note' });

      expect(mockGateway.broadcastStatUpdates).not.toHaveBeenCalled();
    });

    it('does not broadcast for non-tracked stat changes like gold', async () => {
      const character = makeCharacter();
      mockCharacterRepo.findById.mockResolvedValue(character);
      mockCharacterRepo.update.mockResolvedValue(character);

      await service.update('char-1', { goldHandfuls: 5 });

      expect(mockGateway.broadcastStatUpdates).not.toHaveBeenCalled();
    });

    it('returns the character response regardless of broadcast', async () => {
      const character = makeCharacter({ hpMarked: 2 });
      mockCharacterRepo.findById.mockResolvedValue(character);
      mockCharacterRepo.update.mockResolvedValue(character);

      const result = await service.update('char-1', { hpMarked: 2 });

      expect(result).toEqual({
        character,
        computed: mockComputed,
      });
    });
  });
});
