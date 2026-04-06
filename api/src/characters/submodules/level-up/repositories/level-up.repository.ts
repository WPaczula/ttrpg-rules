import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../prisma/prisma.service';
import { AdvancementType } from '../enums/advancement-type.enum';

interface CreateLevelUpData {
  characterId: string;
  fromLevel: number;
  toLevel: number;
  fromTier: number;
  toTier: number;
  newExperienceName: string | null;
  advancements: { type: AdvancementType; metadata: unknown }[];
}

@Injectable()
export class LevelUpRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getAdvancementsInTier(
    characterId: string,
    tierStartLevel: number,
    tierEndLevel: number,
  ) {
    return this.prisma.levelUpAdvancement.findMany({
      where: {
        levelUpRecord: {
          characterId,
          toLevel: { gte: tierStartLevel, lte: tierEndLevel },
        },
      },
      select: { id: true, type: true, metadata: true },
    });
  }

  async createWithAdvancements(data: CreateLevelUpData) {
    return this.prisma.levelUpRecord.create({
      data: {
        characterId: data.characterId,
        fromLevel: data.fromLevel,
        toLevel: data.toLevel,
        fromTier: data.fromTier,
        toTier: data.toTier,
        newExperienceName: data.newExperienceName,
        advancements: {
          create: data.advancements.map((a) => ({
            type: a.type,
            metadata: a.metadata ?? undefined,
          })),
        },
      },
      include: { advancements: true },
    });
  }
}
