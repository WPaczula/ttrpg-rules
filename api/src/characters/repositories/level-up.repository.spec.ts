jest.mock('@prisma/client', () => ({
  ...jest.requireActual('@prisma/client'),
  PrismaClient: jest.fn(),
}));

import { LevelUpRepository } from './level-up.repository';
import { PrismaService } from '../../prisma/prisma.service';
import { AdvancementType } from '@prisma/client';

const mockPrisma = {
  levelUpRecord: {
    create: jest.fn(),
  },
  levelUpAdvancement: {
    findMany: jest.fn(),
  },
};

describe('LevelUpRepository', () => {
  let repo: LevelUpRepository;

  beforeEach(() => {
    jest.clearAllMocks();
    repo = new LevelUpRepository(mockPrisma as unknown as PrismaService);
  });

  describe('getAdvancementsInTier', () => {
    it('should return advancements for levels within the tier range', async () => {
      const mockAdvancements = [
        { id: 'adv-1', type: AdvancementType.ADD_HP, metadata: null },
        { id: 'adv-2', type: AdvancementType.ADD_HP, metadata: null },
      ];
      mockPrisma.levelUpAdvancement.findMany.mockResolvedValue(mockAdvancements);

      const result = await repo.getAdvancementsInTier('char-1', 2, 4);

      expect(mockPrisma.levelUpAdvancement.findMany).toHaveBeenCalledWith({
        where: {
          levelUpRecord: {
            characterId: 'char-1',
            toLevel: { gte: 2, lte: 4 },
          },
        },
        select: { id: true, type: true, metadata: true },
      });
      expect(result).toEqual(mockAdvancements);
    });
  });

  describe('createWithAdvancements', () => {
    it('should create a level-up record with nested advancements', async () => {
      const mockRecord = {
        id: 'rec-1',
        characterId: 'char-1',
        fromLevel: 1,
        toLevel: 2,
        fromTier: 1,
        toTier: 2,
        newExperienceName: 'Scouting',
        advancements: [
          { id: 'adv-1', type: AdvancementType.ADD_HP, metadata: null },
        ],
      };
      mockPrisma.levelUpRecord.create.mockResolvedValue(mockRecord);

      const result = await repo.createWithAdvancements({
        characterId: 'char-1',
        fromLevel: 1,
        toLevel: 2,
        fromTier: 1,
        toTier: 2,
        newExperienceName: 'Scouting',
        advancements: [{ type: AdvancementType.ADD_HP, metadata: null }],
      });

      expect(mockPrisma.levelUpRecord.create).toHaveBeenCalledWith({
        data: {
          characterId: 'char-1',
          fromLevel: 1,
          toLevel: 2,
          fromTier: 1,
          toTier: 2,
          newExperienceName: 'Scouting',
          advancements: {
            create: [{ type: AdvancementType.ADD_HP, metadata: undefined }],
          },
        },
        include: { advancements: true },
      });
      expect(result).toEqual(mockRecord);
    });
  });
});
