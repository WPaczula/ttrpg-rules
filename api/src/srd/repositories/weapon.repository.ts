import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ISrdWeapon } from '../interfaces/srd-weapon.interface';

@Injectable()
export class WeaponRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(filters?: {
    tier?: number;
    type?: string;
  }): Promise<ISrdWeapon[]> {
    const where: Record<string, unknown> = {};
    if (filters?.tier !== undefined) where.tier = filters.tier;
    if (filters?.type !== undefined) where.type = filters.type;
    return this.prisma.weapon.findMany({
      where,
      orderBy: [{ tier: 'asc' }, { name: 'asc' }],
    });
  }

  async findById(id: string): Promise<ISrdWeapon | null> {
    return this.prisma.weapon.findUnique({ where: { id } });
  }
}
