import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ISrdEnvironment } from '../interfaces/srd-environment.interface';

@Injectable()
export class EnvironmentRepository {
  constructor(private readonly prisma: PrismaService) {}

  private map(raw: {
    id: string;
    name: string;
    tier: number;
    type: string;
    description: string;
    difficulty: string;
    impulses: string;
    potentialAdversaries: string | null;
    features: { id: string; name: string; text: string; question: string | null; environmentId: string }[];
  }): ISrdEnvironment {
    return {
      ...raw,
      features: raw.features.map((f) => ({
        id: f.id,
        name: f.name,
        text: f.text,
        question: f.question ?? undefined,
      })),
    };
  }

  async findAll(filters?: { tier?: number; type?: string }): Promise<ISrdEnvironment[]> {
    const where: Record<string, unknown> = {};
    if (filters?.tier !== undefined) where.tier = filters.tier;
    if (filters?.type !== undefined) where.type = filters.type;
    const rows = await this.prisma.environment.findMany({
      where,
      include: { features: true },
      orderBy: [{ tier: 'asc' }, { name: 'asc' }],
    });
    return rows.map((r) => this.map(r));
  }

  async findById(id: string): Promise<ISrdEnvironment | null> {
    const row = await this.prisma.environment.findUnique({ where: { id }, include: { features: true } });
    return row ? this.map(row) : null;
  }
}
