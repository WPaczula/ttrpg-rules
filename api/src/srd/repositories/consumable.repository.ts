import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ISrdConsumable } from '../interfaces/srd-consumable.interface';

@Injectable()
export class ConsumableRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<ISrdConsumable[]> {
    return this.prisma.consumable.findMany({ orderBy: { roll: 'asc' } });
  }

  async findById(id: string): Promise<ISrdConsumable | null> {
    return this.prisma.consumable.findUnique({ where: { id } });
  }
}
