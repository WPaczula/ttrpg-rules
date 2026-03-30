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
