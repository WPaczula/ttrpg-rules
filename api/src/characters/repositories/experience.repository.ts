import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ICharacterExperience } from '../interfaces/character-experience.interface';

@Injectable()
export class ExperienceRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(characterId: string, name: string, modifier: number): Promise<ICharacterExperience> {
    return this.prisma.characterExperience.create({
      data: { characterId, name, modifier },
    });
  }

  async update(id: string, data: { name?: string; modifier?: number }): Promise<ICharacterExperience> {
    return this.prisma.characterExperience.update({ where: { id }, data });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.characterExperience.delete({ where: { id } });
  }

  async findById(id: string): Promise<ICharacterExperience | null> {
    return this.prisma.characterExperience.findUnique({ where: { id } });
  }
}
