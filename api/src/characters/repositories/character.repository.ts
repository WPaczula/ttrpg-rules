import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ICharacterWithRelations } from '../interfaces/character.interface';

const CHARACTER_INCLUDE = {
  class: { select: { id: true, name: true } },
  subclass: { select: { id: true, name: true } },
  ancestry: { select: { id: true, name: true } },
  secondaryAncestry: { select: { id: true, name: true } },
  ancestryFeature: { select: { id: true, name: true, text: true } },
  secondaryAncestryFeature: { select: { id: true, name: true, text: true } },
  community: { select: { id: true, name: true } },
  armor: { select: { id: true, name: true, baseThresholds: true, evasionModifier: true, feature: true } },
  primaryWeapon: { select: { id: true, name: true, feature: true } },
  secondaryWeapon: { select: { id: true, name: true, feature: true } },
  experiences: { select: { id: true, name: true, modifier: true } },
  domainCards: {
    select: {
      id: true,
      domainCard: {
        select: {
          id: true,
          name: true,
          level: true,
          domain: { select: { name: true } },
        },
      },
    },
  },
  thresholdBonuses: {
    select: {
      id: true, sourceType: true, sourceId: true,
      majorBonus: true, severeBonus: true, active: true,
    },
  },
  markedTraits: { select: { id: true, trait: true } },
} as const;

@Injectable()
export class CharacterRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: {
    name: string;
    classId: string;
    subclassId: string;
    ancestryId: string;
    secondaryAncestryId?: string;
    ancestryFeatureId: string;
    secondaryAncestryFeatureId?: string;
    communityId: string;
    agility: number;
    strength: number;
    finesse: number;
    instinct: number;
    presence: number;
    knowledge: number;
    primaryWeaponId?: string;
    secondaryWeaponId?: string;
    armorId?: string;
    notes?: string;
    hpTotal: number;
    evasion: number;
  }): Promise<ICharacterWithRelations> {
    const character = await this.prisma.character.create({
      data: {
        name: data.name,
        classId: data.classId,
        subclassId: data.subclassId,
        ancestryId: data.ancestryId,
        secondaryAncestryId: data.secondaryAncestryId ?? null,
        ancestryFeatureId: data.ancestryFeatureId,
        secondaryAncestryFeatureId: data.secondaryAncestryFeatureId ?? null,
        communityId: data.communityId,
        agility: data.agility,
        strength: data.strength,
        finesse: data.finesse,
        instinct: data.instinct,
        presence: data.presence,
        knowledge: data.knowledge,
        primaryWeaponId: data.primaryWeaponId ?? null,
        secondaryWeaponId: data.secondaryWeaponId ?? null,
        armorId: data.armorId ?? null,
        notes: data.notes ?? '',
        hpTotal: data.hpTotal,
        evasion: data.evasion,
      },
      include: CHARACTER_INCLUDE,
    });
    return this.mapCharacter(character);
  }

  async findAll(): Promise<ICharacterWithRelations[]> {
    const characters = await this.prisma.character.findMany({
      include: CHARACTER_INCLUDE,
      orderBy: { createdAt: 'desc' },
    });
    return characters.map(c => this.mapCharacter(c));
  }

  async findById(id: string): Promise<ICharacterWithRelations | null> {
    const character = await this.prisma.character.findUnique({
      where: { id },
      include: CHARACTER_INCLUDE,
    });
    if (!character) return null;
    return this.mapCharacter(character);
  }

  async update(id: string, data: Record<string, unknown>): Promise<ICharacterWithRelations> {
    const character = await this.prisma.character.update({
      where: { id },
      data,
      include: CHARACTER_INCLUDE,
    });
    return this.mapCharacter(character);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.character.delete({ where: { id } });
  }

  private mapCharacter(c: any): ICharacterWithRelations {
    return {
      ...c,
      domainCards: c.domainCards.map((dc: any) => ({
        id: dc.id,
        domainCard: {
          id: dc.domainCard.id,
          name: dc.domainCard.name,
          level: dc.domainCard.level,
          domainName: dc.domainCard.domain.name,
        },
      })),
    };
  }
}
