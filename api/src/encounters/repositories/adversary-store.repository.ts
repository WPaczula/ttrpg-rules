import { Injectable } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { SyncAdversaryStoreDto } from '../dto/sync-adversary-store.dto';
import {
  IAdversary,
  IAdversaryFeature,
  IAdversaryStore,
  IEncounter,
} from '../interfaces/adversary-store.interface';

@Injectable()
export class AdversaryStoreRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getStore(userId: string): Promise<IAdversaryStore> {
    const [adversaries, encounters] = await Promise.all([
      this.prisma.userAdversary.findMany({
        where: { userId },
        orderBy: { name: 'asc' },
      }),
      this.prisma.encounter.findMany({
        where: { userId },
        orderBy: { position: 'asc' },
        include: {
          adversaries: { orderBy: { position: 'asc' } },
        },
      }),
    ]);

    return {
      library: adversaries.map((a) => this.mapAdversary(a)),
      encounters: encounters.map((e) => this.mapEncounter(e)),
    };
  }

  async replaceStore(
    userId: string,
    store: SyncAdversaryStoreDto,
  ): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      // Full replace: encounters cascade-delete their adversaries.
      await tx.encounter.deleteMany({ where: { userId } });
      await tx.userAdversary.deleteMany({ where: { userId } });

      if (store.library.length > 0) {
        await tx.userAdversary.createMany({
          data: store.library.map((a) => ({
            userId,
            name: a.name,
            type: a.type,
            tier: a.tier,
            hp: a.hp,
            stress: a.stress,
            difficulty: a.difficulty,
            thresholds: a.thresholds,
            atk: a.atk,
            attack: a.attack,
            range: a.range,
            damage: a.damage,
            description: a.description ?? null,
            motivesAndTactics: a.motives_and_tactics ?? null,
            experience: a.experience ?? null,
            features: (a.features ?? []) as unknown as Prisma.InputJsonValue,
          })),
        });
      }

      for (let i = 0; i < store.encounters.length; i++) {
        const enc = store.encounters[i];
        await tx.encounter.create({
          data: {
            userId,
            name: enc.name,
            pcCount: enc.pcCount,
            musicUrl: enc.musicUrl ?? null,
            position: i,
            adversaries: {
              create: enc.adversaries.map((inst, j) => ({
                adversaryName: inst.adversaryName,
                hpMarked: inst.hpMarked,
                stressMarked: inst.stressMarked,
                position: j,
              })),
            },
          },
        });
      }
    });
  }

  private mapAdversary(a: {
    name: string;
    type: string;
    tier: number;
    hp: number;
    stress: number;
    difficulty: number;
    thresholds: string;
    atk: string;
    attack: string;
    range: string;
    damage: string;
    description: string | null;
    motivesAndTactics: string | null;
    experience: string | null;
    features: unknown;
  }): IAdversary {
    return {
      name: a.name,
      type: a.type,
      tier: a.tier,
      hp: a.hp,
      stress: a.stress,
      difficulty: a.difficulty,
      thresholds: a.thresholds,
      atk: a.atk,
      attack: a.attack,
      range: a.range,
      damage: a.damage,
      description: a.description ?? undefined,
      motives_and_tactics: a.motivesAndTactics ?? undefined,
      experience: a.experience ?? undefined,
      features: (a.features as IAdversaryFeature[] | null) ?? undefined,
    };
  }

  private mapEncounter(e: {
    id: string;
    name: string;
    pcCount: number;
    musicUrl: string | null;
    adversaries: {
      id: string;
      adversaryName: string;
      hpMarked: number;
      stressMarked: number;
    }[];
  }): IEncounter {
    return {
      id: e.id,
      name: e.name,
      pcCount: e.pcCount,
      musicUrl: e.musicUrl ?? undefined,
      adversaries: e.adversaries.map((inst) => ({
        id: inst.id,
        adversaryName: inst.adversaryName,
        hpMarked: inst.hpMarked,
        stressMarked: inst.stressMarked,
      })),
    };
  }
}
