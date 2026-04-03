import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ISrdArmor } from '../interfaces/srd-armor.interface';

@Injectable()
export class ArmorRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(filters?: { tier?: number }): Promise<ISrdArmor[]> {
    const where: Record<string, unknown> = {};
    if (filters?.tier !== undefined) where.tier = filters.tier;
    return this.prisma.armor.findMany({
      where,
      orderBy: [{ tier: 'asc' }, { name: 'asc' }],
    });
  }

  async findById(id: string): Promise<ISrdArmor | null> {
    return this.prisma.armor.findUnique({ where: { id } });
  }

  async findByName(name: string): Promise<ISrdArmor | null> {
    return this.prisma.armor.findFirst({ where: { name } });
  }
}
