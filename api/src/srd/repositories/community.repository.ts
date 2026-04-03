import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ISrdCommunity } from '../interfaces/srd-community.interface';

@Injectable()
export class CommunityRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<ISrdCommunity[]> {
    return this.prisma.community.findMany({
      include: { features: true },
      orderBy: { name: 'asc' },
    });
  }

  async findById(id: string): Promise<ISrdCommunity | null> {
    return this.prisma.community.findUnique({
      where: { id },
      include: { features: true },
    });
  }

  async findByName(name: string): Promise<ISrdCommunity | null> {
    return this.prisma.community.findFirst({
      where: { name },
      include: { features: true },
    });
  }
}
