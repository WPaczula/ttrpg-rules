import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ICharacterThresholdBonus } from '../interfaces/character-threshold-bonus.interface';

@Injectable()
export class ThresholdBonusRepository {
  constructor(private readonly prisma: PrismaService) {}

  async toggleActive(
    id: string,
    active: boolean,
  ): Promise<ICharacterThresholdBonus> {
    return this.prisma.characterThresholdBonus.update({
      where: { id },
      data: { active },
    });
  }

  async findById(id: string): Promise<ICharacterThresholdBonus | null> {
    return this.prisma.characterThresholdBonus.findUnique({ where: { id } });
  }
}
