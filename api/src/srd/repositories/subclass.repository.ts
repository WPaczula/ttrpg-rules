import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ISrdSubclass } from '../interfaces/srd-subclass.interface';

@Injectable()
export class SubclassRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<ISrdSubclass[]> {
    const subclasses = await this.prisma.subclass.findMany({
      include: { features: true, class: { select: { name: true } } },
      orderBy: { name: 'asc' },
    });
    return subclasses.map(s => ({
      id: s.id, name: s.name, description: s.description,
      spellcastTrait: s.spellcastTrait, className: s.class.name, features: s.features,
    }));
  }

  async findById(id: string): Promise<ISrdSubclass | null> {
    const s = await this.prisma.subclass.findUnique({
      where: { id },
      include: { features: true, class: { select: { name: true } } },
    });
    if (!s) return null;
    return {
      id: s.id, name: s.name, description: s.description,
      spellcastTrait: s.spellcastTrait, className: s.class.name, features: s.features,
    };
  }
}
