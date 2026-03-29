import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ISrdAdversary } from '../interfaces/srd-adversary.interface';

@Injectable()
export class AdversaryRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(filters?: {
    tier?: number;
    type?: string;
  }): Promise<ISrdAdversary[]> {
    const where: Record<string, unknown> = {};
    if (filters?.tier !== undefined) where.tier = filters.tier;
    if (filters?.type !== undefined) where.type = filters.type;
    return this.prisma.adversary.findMany({
      where,
      include: { features: true },
      orderBy: [{ tier: 'asc' }, { name: 'asc' }],
    });
  }

  async findById(id: string): Promise<ISrdAdversary | null> {
    return this.prisma.adversary.findUnique({
      where: { id },
      include: { features: true },
    });
  }
}
