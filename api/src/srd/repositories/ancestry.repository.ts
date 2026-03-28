import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ISrdAncestry } from '../interfaces/srd-ancestry.interface';

@Injectable()
export class AncestryRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<ISrdAncestry[]> {
    return this.prisma.ancestry.findMany({ include: { features: true }, orderBy: { name: 'asc' } });
  }

  async findById(id: string): Promise<ISrdAncestry | null> {
    return this.prisma.ancestry.findUnique({ where: { id }, include: { features: true } });
  }
}
