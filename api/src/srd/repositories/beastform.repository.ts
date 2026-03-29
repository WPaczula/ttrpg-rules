import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ISrdBeastform } from '../interfaces/srd-beastform.interface';

@Injectable()
export class BeastformRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(filters?: { tier?: number }): Promise<ISrdBeastform[]> {
    const where: Record<string, unknown> = {};
    if (filters?.tier !== undefined) where.tier = filters.tier;
    return this.prisma.beastform.findMany({
      where,
      include: { features: true },
      orderBy: [{ tier: 'asc' }, { name: 'asc' }],
    });
  }

  async findById(id: string): Promise<ISrdBeastform | null> {
    return this.prisma.beastform.findUnique({ where: { id }, include: { features: true } });
  }
}
