import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ISrdDomainCard } from '../interfaces/srd-domain-card.interface';

@Injectable()
export class DomainCardRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(filters?: {
    domain?: string;
    level?: number;
  }): Promise<ISrdDomainCard[]> {
    const where: Record<string, unknown> = {};
    if (filters?.level !== undefined) where.level = filters.level;
    if (filters?.domain !== undefined) where.domain = { name: filters.domain };

    const cards = await this.prisma.domainCard.findMany({
      where,
      include: { domain: { select: { name: true } } },
      orderBy: [{ level: 'asc' }, { name: 'asc' }],
    });
    return cards.map((c) => ({
      id: c.id,
      name: c.name,
      level: c.level,
      recallCost: c.recallCost,
      description: c.description,
      domainName: c.domain.name,
    }));
  }

  async findById(id: string): Promise<ISrdDomainCard | null> {
    const c = await this.prisma.domainCard.findUnique({
      where: { id },
      include: { domain: { select: { name: true } } },
    });
    if (!c) return null;
    return {
      id: c.id,
      name: c.name,
      level: c.level,
      recallCost: c.recallCost,
      description: c.description,
      domainName: c.domain.name,
    };
  }

  async findByName(name: string): Promise<ISrdDomainCard | null> {
    const c = await this.prisma.domainCard.findFirst({
      where: { name },
      include: { domain: { select: { name: true } } },
    });
    if (!c) return null;
    return {
      id: c.id,
      name: c.name,
      level: c.level,
      recallCost: c.recallCost,
      description: c.description,
      domainName: c.domain.name,
    };
  }
}
