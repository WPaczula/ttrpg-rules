import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ISrdDomain } from '../interfaces/srd-domain.interface';

@Injectable()
export class DomainRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<ISrdDomain[]> {
    const domains = await this.prisma.domain.findMany({
      include: {
        cards: { select: { id: true, name: true, level: true }, orderBy: { level: 'asc' } },
        classes: { include: { class: { select: { name: true } } } },
      },
      orderBy: { name: 'asc' },
    });
    return domains.map(d => ({
      id: d.id, name: d.name, description: d.description,
      classes: d.classes.map(cd => cd.class.name), cards: d.cards,
    }));
  }

  async findById(id: string): Promise<ISrdDomain | null> {
    const d = await this.prisma.domain.findUnique({
      where: { id },
      include: {
        cards: { select: { id: true, name: true, level: true }, orderBy: { level: 'asc' } },
        classes: { include: { class: { select: { name: true } } } },
      },
    });
    if (!d) return null;
    return {
      id: d.id, name: d.name, description: d.description,
      classes: d.classes.map(cd => cd.class.name), cards: d.cards,
    };
  }
}
