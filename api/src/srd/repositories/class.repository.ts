import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ISrdClass } from '../interfaces/srd-class.interface';

@Injectable()
export class ClassRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<ISrdClass[]> {
    const classes = await this.prisma.srdClass.findMany({
      include: {
        features: true,
        subclasses: { select: { id: true, name: true } },
        domains: { include: { domain: { select: { id: true, name: true } } } },
        suggestedPrimary: { select: { id: true, name: true } },
        suggestedSecondary: { select: { id: true, name: true } },
        suggestedArmor: { select: { id: true, name: true } },
      },
      orderBy: { name: 'asc' },
    });
    return classes.map((c) => ({
      id: c.id,
      name: c.name,
      description: c.description,
      evasion: c.evasion,
      hp: c.hp,
      items: c.items,
      suggestedTraits: c.suggestedTraits,
      hopeFeatureName: c.hopeFeatureName,
      hopeFeatureText: c.hopeFeatureText,
      suggestedPrimary: c.suggestedPrimary,
      suggestedSecondary: c.suggestedSecondary,
      suggestedArmor: c.suggestedArmor,
      features: c.features,
      subclasses: c.subclasses,
      domains: c.domains.map((cd) => cd.domain),
    }));
  }

  async findById(id: string): Promise<ISrdClass | null> {
    const c = await this.prisma.srdClass.findUnique({
      where: { id },
      include: {
        features: true,
        subclasses: { select: { id: true, name: true } },
        domains: { include: { domain: { select: { id: true, name: true } } } },
        suggestedPrimary: { select: { id: true, name: true } },
        suggestedSecondary: { select: { id: true, name: true } },
        suggestedArmor: { select: { id: true, name: true } },
      },
    });
    if (!c) return null;
    return {
      id: c.id,
      name: c.name,
      description: c.description,
      evasion: c.evasion,
      hp: c.hp,
      items: c.items,
      suggestedTraits: c.suggestedTraits,
      hopeFeatureName: c.hopeFeatureName,
      hopeFeatureText: c.hopeFeatureText,
      suggestedPrimary: c.suggestedPrimary,
      suggestedSecondary: c.suggestedSecondary,
      suggestedArmor: c.suggestedArmor,
      features: c.features,
      subclasses: c.subclasses,
      domains: c.domains.map((cd) => cd.domain),
    };
  }
}
