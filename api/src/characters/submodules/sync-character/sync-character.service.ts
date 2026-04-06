import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { ClassRepository } from '../../../srd/repositories/class.repository';
import { SubclassRepository } from '../../../srd/repositories/subclass.repository';
import { AncestryRepository } from '../../../srd/repositories/ancestry.repository';
import { CommunityRepository } from '../../../srd/repositories/community.repository';
import { WeaponRepository } from '../../../srd/repositories/weapon.repository';
import { ArmorRepository } from '../../../srd/repositories/armor.repository';
import { DomainCardRepository } from '../../../srd/repositories/domain-card.repository';
import { SyncCharacterDto } from './sync-character.dto';
import { BadRequestException, ErrorCode } from '../../../common/error-codes';

@Injectable()
export class SyncCharacterService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly classes: ClassRepository,
    private readonly subclasses: SubclassRepository,
    private readonly ancestries: AncestryRepository,
    private readonly communities: CommunityRepository,
    private readonly weapons: WeaponRepository,
    private readonly armor: ArmorRepository,
    private readonly domainCards: DomainCardRepository,
  ) {}

  async syncCharacter(userId: string, dto: SyncCharacterDto): Promise<void> {
    if (!dto.class || !dto.ancestry || !dto.community || !dto.subclass || !dto.ancestryFeature) {
      return;
    }

    const [cls, subclass, ancestry, community] = await Promise.all([
      this.classes.findByName(dto.class),
      this.subclasses.findByName(dto.subclass),
      this.ancestries.findByName(dto.ancestry),
      this.communities.findByName(dto.community),
    ]);

    if (!cls) throw new BadRequestException(ErrorCode.INVALID_SRD_REFERENCE, `Class not found: ${dto.class}`);
    if (!subclass) throw new BadRequestException(ErrorCode.INVALID_SRD_REFERENCE, `Subclass not found: ${dto.subclass}`);
    if (!ancestry) throw new BadRequestException(ErrorCode.INVALID_SRD_REFERENCE, `Ancestry not found: ${dto.ancestry}`);
    if (!community) throw new BadRequestException(ErrorCode.INVALID_SRD_REFERENCE, `Community not found: ${dto.community}`);

    const ancestryFeature = ancestry.features.find((f) => f.name === dto.ancestryFeature);
    if (!ancestryFeature) throw new BadRequestException(ErrorCode.INVALID_SRD_REFERENCE, `Ancestry feature not found: ${dto.ancestryFeature}`);

    let secondaryAncestryId: string | null = null;
    let secondaryAncestryFeatureId: string | null = null;

    if (dto.secondaryAncestry && dto.secondaryAncestryFeature) {
      const secondaryAncestry = await this.ancestries.findByName(dto.secondaryAncestry);
      if (secondaryAncestry) {
        secondaryAncestryId = secondaryAncestry.id;
        const secondaryFeature = secondaryAncestry.features.find((f) => f.name === dto.secondaryAncestryFeature);
        if (secondaryFeature) secondaryAncestryFeatureId = secondaryFeature.id;
      }
    }

    const [primaryWeapon, secondaryWeapon, armorData] = await Promise.all([
      dto.primaryWeapon ? this.weapons.findByName(dto.primaryWeapon) : Promise.resolve(null),
      dto.secondaryWeapon ? this.weapons.findByName(dto.secondaryWeapon) : Promise.resolve(null),
      dto.armorName ? this.armor.findByName(dto.armorName) : Promise.resolve(null),
    ]);

    const domainCardIds: string[] = (
      await Promise.all(
        dto.domainCards.map((dc) => this.domainCards.findByName(dc.name)),
      )
    )
      .filter((dc): dc is NonNullable<typeof dc> => dc !== null)
      .map((dc) => dc.id);

    const existing = await this.prisma.character.findFirst({ where: { userId } });

    await this.prisma.$transaction(async (tx) => {
      const characterData = {
        name: dto.name,
        level: dto.level,
        classId: cls.id,
        subclassId: subclass.id,
        ancestryId: ancestry.id,
        secondaryAncestryId,
        ancestryFeatureId: ancestryFeature.id,
        secondaryAncestryFeatureId,
        communityId: community.id,
        agility: dto.agility,
        strength: dto.strength,
        finesse: dto.finesse,
        instinct: dto.instinct,
        presence: dto.presence,
        knowledge: dto.knowledge,
        hpTotal: dto.hpTotal,
        hpMarked: dto.hpMarked,
        stressTotal: dto.stressTotal,
        stressMarked: dto.stressMarked,
        evasion: dto.evasion,
        armorMarked: dto.armorMarked,
        hope: dto.hope,
        goldHandfuls: dto.goldHandfuls,
        goldBags: dto.goldBags,
        goldChests: dto.goldChests,
        proficiency: dto.proficiency,
        primaryWeaponId: primaryWeapon?.id ?? null,
        secondaryWeaponId: secondaryWeapon?.id ?? null,
        armorId: armorData?.id ?? null,
        notes: dto.notes ?? '',
        items: dto.items,
      };

      if (existing) {
        await tx.character.update({ where: { id: existing.id }, data: characterData });

        await tx.characterExperience.deleteMany({ where: { characterId: existing.id } });
        await tx.characterDomainCard.deleteMany({ where: { characterId: existing.id } });
        await tx.characterMarkedTrait.deleteMany({ where: { characterId: existing.id } });

        if (dto.experiences.length > 0) {
          await tx.characterExperience.createMany({
            data: dto.experiences.map((e) => ({
              characterId: existing.id,
              name: e.name,
              modifier: e.modifier,
            })),
          });
        }

        if (domainCardIds.length > 0) {
          await tx.characterDomainCard.createMany({
            data: domainCardIds.map((dcId) => ({
              characterId: existing.id,
              domainCardId: dcId,
            })),
            skipDuplicates: true,
          });
        }

        if (dto.markedTraits.length > 0) {
          await tx.characterMarkedTrait.createMany({
            data: dto.markedTraits.map((trait) => ({
              characterId: existing.id,
              trait,
            })),
          });
        }
      } else {
        const created = await tx.character.create({
          data: { ...characterData, userId },
        });

        if (dto.experiences.length > 0) {
          await tx.characterExperience.createMany({
            data: dto.experiences.map((e) => ({
              characterId: created.id,
              name: e.name,
              modifier: e.modifier,
            })),
          });
        }

        if (domainCardIds.length > 0) {
          await tx.characterDomainCard.createMany({
            data: domainCardIds.map((dcId) => ({
              characterId: created.id,
              domainCardId: dcId,
            })),
            skipDuplicates: true,
          });
        }

        if (dto.markedTraits.length > 0) {
          await tx.characterMarkedTrait.createMany({
            data: dto.markedTraits.map((trait) => ({
              characterId: created.id,
              trait,
            })),
          });
        }
      }
    });
  }
}
