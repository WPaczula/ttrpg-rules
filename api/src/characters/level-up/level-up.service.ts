import { Injectable } from '@nestjs/common';
import { CharacterRepository } from '../repositories/character.repository';
import { LevelUpRepository } from './level-up.repository';
import { ExperienceRepository } from '../repositories/experience.repository';
import { CharacterDomainCardRepository } from '../repositories/character-domain-card.repository';
import { GameLogicService } from '../../game-logic/game-logic.service';
import { DomainCardRepository } from '../../srd/repositories/domain-card.repository';
import { AdvancementType } from './advancement-type.enum';
import {
  NotFoundException,
  ConflictException,
  BadRequestException,
  ErrorCode,
} from '../../common/error-codes';
import { ILevelUpOptions } from './level-up-options.interface';
import { ApplyLevelUpDto } from './apply-level-up.dto';
import { PrismaService } from '../../prisma/prisma.service';
import { CharactersGateway } from '../characters.gateway';
import { CharacterResponse } from '../characters.service';

const SLOT_LIMITS: Record<AdvancementType, number> = {
  [AdvancementType.INCREASE_TRAITS]: 3,
  [AdvancementType.ADD_HP]: 2,
  [AdvancementType.ADD_STRESS]: 2,
  [AdvancementType.BOOST_EXPERIENCES]: 1,
  [AdvancementType.EXTRA_DOMAIN_CARD]: 1,
  [AdvancementType.INCREASE_EVASION]: 1,
};

const TIER_LEVEL_RANGES: Record<number, [number, number]> = {
  1: [1, 1],
  2: [2, 4],
  3: [5, 7],
  4: [8, 10],
};

@Injectable()
export class LevelUpService {
  constructor(
    private readonly characters: CharacterRepository,
    private readonly levelUps: LevelUpRepository,
    private readonly experiences: ExperienceRepository,
    private readonly characterDomainCards: CharacterDomainCardRepository,
    private readonly gameLogic: GameLogicService,
    private readonly domainCards: DomainCardRepository,
    private readonly prisma: PrismaService,
    private readonly gateway: CharactersGateway,
  ) {}

  async getLevelUpOptions(characterId: string): Promise<ILevelUpOptions> {
    const character = await this.characters.findById(characterId);
    if (!character) {
      throw new NotFoundException(
        ErrorCode.CHARACTER_NOT_FOUND,
        `Character ${characterId} not found`,
      );
    }

    if (character.level >= 10) {
      throw new ConflictException(
        ErrorCode.MAX_LEVEL_REACHED,
        `Character is already at maximum level 10`,
      );
    }

    const currentLevel = character.level;
    const nextLevel = currentLevel + 1;
    const currentTier = this.gameLogic.computeTier(currentLevel);
    const nextTier = this.gameLogic.computeTier(nextLevel);
    const isTierTransition = nextTier > currentTier;

    // Get the tier range for the tier the character is leveling INTO
    const [tierStart, tierEnd] = TIER_LEVEL_RANGES[nextTier];

    // Count existing advancements in this tier
    const tierAdvancements = await this.levelUps.getAdvancementsInTier(
      characterId,
      tierStart,
      tierEnd,
    );

    const slotUsage: Record<string, number> = {};
    for (const adv of tierAdvancements) {
      slotUsage[adv.type] = (slotUsage[adv.type] || 0) + 1;
    }

    const availableAdvancements = Object.values(AdvancementType).map(
      (type) => {
        const slotsUsed = slotUsage[type] || 0;
        const slotsMax = SLOT_LIMITS[type];
        return {
          type,
          slotsUsed,
          slotsMax,
          available: slotsUsed < slotsMax,
        };
      },
    );

    // Get eligible domain cards: level <= nextLevel and not already owned
    const allCards = await this.domainCards.findAll();
    const ownedCardIds = new Set(
      character.domainCards.map((dc) => dc.domainCard.id),
    );
    const eligibleDomainCards = allCards
      .filter((c) => c.level <= nextLevel && !ownedCardIds.has(c.id))
      .map((c) => ({
        id: c.id,
        name: c.name,
        level: c.level,
        domainName: c.domainName,
      }));

    const tierBonuses = isTierTransition
      ? {
          proficiencyIncrease: true,
          clearMarkedTraits: nextLevel >= 5,
          requiresNewExperience: true,
        }
      : null;

    return {
      currentLevel,
      nextLevel,
      currentTier,
      nextTier,
      isTierTransition,
      tierBonuses,
      availableAdvancements,
      eligibleDomainCards,
    };
  }

  async applyLevelUp(
    characterId: string,
    dto: ApplyLevelUpDto,
  ): Promise<CharacterResponse> {
    const options = await this.getLevelUpOptions(characterId);
    const character = (await this.characters.findById(characterId))!;

    // Validate tier transition requires experience name
    if (options.isTierTransition && !dto.newExperienceName) {
      throw new BadRequestException(
        ErrorCode.MISSING_EXPERIENCE_NAME,
        'Tier transition requires a new experience name',
      );
    }

    // Validate each advancement
    const characterUpdate: Record<string, number> = {};
    const newMarkedTraits: string[] = [];
    const experienceUpdates: { id: string; modifier: number }[] = [];
    let domainCardId: string | null = null;

    for (const adv of dto.advancements) {
      const optionSlot = options.availableAdvancements.find(
        (a) => a.type === adv.type,
      );
      if (!optionSlot || !optionSlot.available) {
        throw new BadRequestException(
          ErrorCode.ADVANCEMENT_SLOT_FULL,
          `Advancement slot for ${adv.type} is full (${optionSlot?.slotsUsed ?? 0}/${optionSlot?.slotsMax ?? 0})`,
        );
      }
      // Decrement availability for duplicate type detection
      optionSlot.slotsUsed++;
      optionSlot.available = optionSlot.slotsUsed < optionSlot.slotsMax;

      switch (adv.type) {
        case AdvancementType.INCREASE_TRAITS: {
          const traits = (adv.metadata as { traits: string[] })?.traits;
          if (!traits || traits.length !== 2) {
            throw new BadRequestException(
              ErrorCode.INVALID_ADVANCEMENT,
              'INCREASE_TRAITS requires exactly 2 traits',
            );
          }
          const markedSet = new Set(
            character.markedTraits.map((m) => m.trait),
          );
          for (const t of traits) {
            if (markedSet.has(t) || newMarkedTraits.includes(t)) {
              throw new BadRequestException(
                ErrorCode.TRAIT_ALREADY_MARKED,
                `Trait ${t} is already marked`,
              );
            }
          }
          for (const t of traits) {
            const traitKey = t as keyof typeof character;
            characterUpdate[t] =
              (characterUpdate[t] ?? (character[traitKey] as number)) + 1;
            newMarkedTraits.push(t);
          }
          break;
        }
        case AdvancementType.ADD_HP:
          characterUpdate.hpTotal =
            (characterUpdate.hpTotal ?? character.hpTotal) + 1;
          break;
        case AdvancementType.ADD_STRESS:
          characterUpdate.stressTotal =
            (characterUpdate.stressTotal ?? character.stressTotal) + 1;
          break;
        case AdvancementType.BOOST_EXPERIENCES: {
          const expIds = (adv.metadata as { experienceIds: string[] })
            ?.experienceIds;
          if (!expIds || expIds.length !== 2) {
            throw new BadRequestException(
              ErrorCode.INVALID_ADVANCEMENT,
              'BOOST_EXPERIENCES requires exactly 2 experience IDs',
            );
          }
          for (const expId of expIds) {
            const exp = character.experiences.find((e) => e.id === expId);
            if (!exp) {
              throw new BadRequestException(
                ErrorCode.INVALID_ADVANCEMENT,
                `Experience ${expId} not found on character`,
              );
            }
            if (exp.modifier >= 6) {
              throw new BadRequestException(
                ErrorCode.EXPERIENCE_MODIFIER_MAXED,
                `Experience ${exp.name} is already at maximum modifier 6`,
              );
            }
            experienceUpdates.push({ id: expId, modifier: exp.modifier + 1 });
          }
          break;
        }
        case AdvancementType.EXTRA_DOMAIN_CARD: {
          const cardMeta = adv.metadata as
            | { domainCardId: string }
            | undefined;
          if (!cardMeta?.domainCardId) {
            throw new BadRequestException(
              ErrorCode.INVALID_ADVANCEMENT,
              'EXTRA_DOMAIN_CARD requires a domainCardId in metadata',
            );
          }
          const eligible = options.eligibleDomainCards.find(
            (c) => c.id === cardMeta.domainCardId,
          );
          if (!eligible) {
            throw new BadRequestException(
              ErrorCode.DOMAIN_CARD_NOT_AVAILABLE,
              `Domain card ${cardMeta.domainCardId} is not eligible`,
            );
          }
          domainCardId = cardMeta.domainCardId;
          break;
        }
        case AdvancementType.INCREASE_EVASION:
          characterUpdate.evasion =
            (characterUpdate.evasion ?? character.evasion) + 1;
          break;
      }
    }

    // Apply tier transition bonuses
    if (options.isTierTransition) {
      characterUpdate.proficiency = (character.proficiency ?? 1) + 1;
    }

    characterUpdate.level = options.nextLevel;

    // Create level-up record
    await this.levelUps.createWithAdvancements({
      characterId,
      fromLevel: options.currentLevel,
      toLevel: options.nextLevel,
      fromTier: options.currentTier,
      toTier: options.nextTier,
      newExperienceName: dto.newExperienceName ?? null,
      advancements: dto.advancements.map((a) => ({
        type: a.type,
        metadata: a.metadata ?? null,
      })),
    });

    // Apply character updates
    const updated = await this.characters.update(characterId, characterUpdate);

    // Create marked traits
    for (const trait of newMarkedTraits) {
      await this.prisma.characterMarkedTrait.create({
        data: { characterId, trait },
      });
    }

    // Update experience modifiers
    for (const exp of experienceUpdates) {
      await this.experiences.update(exp.id, { modifier: exp.modifier });
    }

    // Add domain card
    if (domainCardId) {
      await this.characterDomainCards.add(characterId, domainCardId);
    }

    // Tier transition: add new experience, clear marked traits
    if (options.isTierTransition) {
      await this.experiences.create(characterId, dto.newExperienceName!, 2);
      if (options.nextLevel >= 5) {
        await this.prisma.characterMarkedTrait.deleteMany({
          where: { characterId },
        });
      }
    }

    // Refetch to get all relations
    const finalCharacter = (await this.characters.findById(characterId))!;
    const computed = this.gameLogic.computeAll({
      level: finalCharacter.level,
      baseEvasion: finalCharacter.evasion,
      armorBaseThresholds: finalCharacter.armor
        ? [
            finalCharacter.armor.majorThreshold,
            finalCharacter.armor.severeThreshold,
          ]
        : null,
      armorEvasionModifier: finalCharacter.armor?.evasionModifier ?? null,
      primaryWeaponFeature: finalCharacter.primaryWeapon?.feature ?? null,
      secondaryWeaponFeature: finalCharacter.secondaryWeapon?.feature ?? null,
      armorFeature: finalCharacter.armor?.feature ?? null,
      thresholdBonuses: finalCharacter.thresholdBonuses,
    });

    this.gateway.broadcastStatUpdates(finalCharacter.userId, [
      {
        characterId,
        characterName: finalCharacter.name,
        stat: 'level',
        value: finalCharacter.level,
      },
    ]);

    return { character: finalCharacter, computed };
  }
}
