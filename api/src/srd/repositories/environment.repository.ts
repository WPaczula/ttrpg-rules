import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ISrdEnvironment } from '../interfaces/srd-environment.interface';

@Injectable()
export class EnvironmentRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(filters?: { tier?: number; type?: string }): Promise<ISrdEnvironment[]> {
    const where: Record<string, unknown> = {};
    if (filters?.tier !== undefined) where.tier = filters.tier;
    if (filters?.type !== undefined) where.type = filters.type;
    return this.prisma.environment.findMany({
      where,
      include: { features: true },
      orderBy: [{ tier: 'asc' }, { name: 'asc' }],
    });
  }

  async findById(id: string): Promise<ISrdEnvironment | null> {
    return this.prisma.environment.findUnique({ where: { id }, include: { features: true } });
  }
}
