import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class CharacterDomainCardRepository {
  constructor(private readonly prisma: PrismaService) {}

  async add(characterId: string, domainCardId: string): Promise<{ id: string }> {
    return this.prisma.characterDomainCard.create({
      data: { characterId, domainCardId },
      select: { id: true },
    });
  }

  async remove(id: string): Promise<void> {
    await this.prisma.characterDomainCard.delete({ where: { id } });
  }

  async exists(characterId: string, domainCardId: string): Promise<boolean> {
    const record = await this.prisma.characterDomainCard.findUnique({
      where: { characterId_domainCardId: { characterId, domainCardId } },
    });
    return !!record;
  }
}
