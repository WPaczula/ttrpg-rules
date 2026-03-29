import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ISrdItem } from '../interfaces/srd-item.interface';

@Injectable()
export class ItemRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<ISrdItem[]> {
    return this.prisma.item.findMany({ orderBy: { roll: 'asc' } });
  }

  async findById(id: string): Promise<ISrdItem | null> {
    return this.prisma.item.findUnique({ where: { id } });
  }
}
