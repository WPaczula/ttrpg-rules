import { Injectable } from '@nestjs/common';
import { CharacterRepository } from './repositories/character.repository';
import { ExperienceRepository } from './repositories/experience.repository';
import { CharacterDomainCardRepository } from './repositories/character-domain-card.repository';
import { ThresholdBonusRepository } from './repositories/threshold-bonus.repository';
import { GameLogicService } from '../game-logic/game-logic.service';
import { ClassRepository } from '../srd/repositories/class.repository';
import { ArmorRepository } from '../srd/repositories/armor.repository';
import {
  NotFoundException,
  BadRequestException,
  ConflictException,
  ErrorCode,
} from '../common/error-codes';
import { CreateCharacterDto } from './dto/create-character.dto';
import { UpdateCharacterDto } from './dto/update-character.dto';
import { CreateExperienceDto } from './dto/create-experience.dto';
import { UpdateExperienceDto } from './dto/update-experience.dto';
import { AddDomainCardDto } from './dto/add-domain-card.dto';
import { ToggleThresholdBonusDto } from './dto/toggle-threshold-bonus.dto';
import { ICharacterWithRelations } from './interfaces/character.interface';
import { DomainCardRepository } from '../srd/repositories/domain-card.repository';
import { ComputedStats } from '../game-logic/interfaces/computed-stats.interface';
import { CharactersGateway } from './characters.gateway';
import { IStatUpdate, ITrackedStats } from './interfaces/stat-update.interface';

export interface CharacterResponse {
  character: ICharacterWithRelations;
  computed: ComputedStats;
}

@Injectable()
export class CharactersService {
  private static readonly TRACKED_STATS: (keyof ITrackedStats)[] = [
    'hpMarked',
    'stressMarked',
    'hope',
    'armorMarked',
  ];

  constructor(
    private readonly characters: CharacterRepository,
    private readonly experiences: ExperienceRepository,
    private readonly characterDomainCards: CharacterDomainCardRepository,
    private readonly thresholdBonuses: ThresholdBonusRepository,
    private readonly gameLogic: GameLogicService,
    private readonly classes: ClassRepository,
    private readonly armor: ArmorRepository,
    private readonly domainCards: DomainCardRepository,
    private readonly gateway: CharactersGateway,
  ) {}

  private buildResponse(character: ICharacterWithRelations): CharacterResponse {
    const computed = this.gameLogic.computeAll({
      level: character.level,
      baseEvasion: character.evasion,
      armorBaseThresholds: character.armor
        ? [character.armor.majorThreshold, character.armor.severeThreshold]
        : null,
      armorEvasionModifier: character.armor?.evasionModifier ?? null,
      primaryWeaponFeature: character.primaryWeapon?.feature ?? null,
      secondaryWeaponFeature: character.secondaryWeapon?.feature ?? null,
      armorFeature: character.armor?.feature ?? null,
      thresholdBonuses: character.thresholdBonuses,
    });
    return { character, computed };
  }

  async create(
    dto: CreateCharacterDto,
    userId: string,
  ): Promise<CharacterResponse> {
    const cls = await this.classes.findById(dto.classId);
    if (!cls)
      throw new BadRequestException(
        ErrorCode.INVALID_SRD_REFERENCE,
        `Class ${dto.classId} not found`,
      );

    const armorData = dto.armorId
      ? await this.armor.findById(dto.armorId)
      : null;
    if (dto.armorId && !armorData) {
      throw new BadRequestException(
        ErrorCode.INVALID_SRD_REFERENCE,
        `Armor ${dto.armorId} not found`,
      );
    }

    const character = await this.characters.create({
      ...dto,
      userId,
      hpTotal: cls.hp,
      evasion: cls.evasion + (armorData?.evasionModifier ?? 0),
    });
    return this.buildResponse(character);
  }

  findAll(): Promise<ICharacterWithRelations[]> {
    return this.characters.findAll();
  }

  async findOne(id: string): Promise<CharacterResponse> {
    const character = await this.characters.findById(id);
    if (!character)
      throw new NotFoundException(
        ErrorCode.CHARACTER_NOT_FOUND,
        `Character ${id} not found`,
      );
    return this.buildResponse(character);
  }

  private async findCharacter(id: string): Promise<ICharacterWithRelations> {
    const character = await this.characters.findById(id);
    if (!character)
      throw new NotFoundException(
        ErrorCode.CHARACTER_NOT_FOUND,
        `Character ${id} not found`,
      );
    return character;
  }

  async update(
    id: string,
    dto: UpdateCharacterDto,
  ): Promise<CharacterResponse> {
    await this.findCharacter(id);
    const character = await this.characters.update(id, dto);
    const response = this.buildResponse(character);

    const updates: IStatUpdate[] = CharactersService.TRACKED_STATS.filter(
      (stat) => (dto as Record<string, unknown>)[stat] !== undefined,
    ).map((stat) => ({
      characterId: character.id,
      characterName: character.name,
      stat,
      value: character[stat],
    }));

    if (updates.length > 0) {
      this.gateway.broadcastStatUpdates(character.userId, updates);
    }

    return response;
  }

  async remove(id: string): Promise<void> {
    await this.findCharacter(id);
    await this.characters.delete(id);
  }

  async addExperience(characterId: string, dto: CreateExperienceDto) {
    await this.findCharacter(characterId);
    return this.experiences.create(characterId, dto.name, dto.modifier);
  }

  async updateExperience(
    characterId: string,
    experienceId: string,
    dto: UpdateExperienceDto,
  ) {
    await this.findCharacter(characterId);
    const exp = await this.experiences.findById(experienceId);
    if (!exp || exp.characterId !== characterId) {
      throw new NotFoundException(
        ErrorCode.EXPERIENCE_NOT_FOUND,
        `Experience ${experienceId} not found`,
      );
    }
    return this.experiences.update(experienceId, dto);
  }

  async removeExperience(
    characterId: string,
    experienceId: string,
  ): Promise<void> {
    await this.findCharacter(characterId);
    const exp = await this.experiences.findById(experienceId);
    if (!exp || exp.characterId !== characterId) {
      throw new NotFoundException(
        ErrorCode.EXPERIENCE_NOT_FOUND,
        `Experience ${experienceId} not found`,
      );
    }
    await this.experiences.delete(experienceId);
  }

  async addDomainCard(characterId: string, dto: AddDomainCardDto) {
    const character = await this.findCharacter(characterId);

    const card = await this.domainCards.findById(dto.domainCardId);
    if (!card) {
      throw new NotFoundException(
        ErrorCode.SRD_RESOURCE_NOT_FOUND,
        `Domain card ${dto.domainCardId} not found`,
      );
    }

    // Check tier eligibility: card level must be <= character tier * 2
    const tier = this.gameLogic.computeTier(character.level);
    const maxLevel = tier * 2;
    if (card.level > maxLevel) {
      throw new BadRequestException(
        ErrorCode.DOMAIN_CARD_NOT_AVAILABLE,
        `Card level ${card.level} is not available at tier ${tier} (max level ${maxLevel})`,
      );
    }

    const alreadyAdded = await this.characterDomainCards.exists(
      characterId,
      dto.domainCardId,
    );
    if (alreadyAdded) {
      throw new ConflictException(
        ErrorCode.DUPLICATE_DOMAIN_CARD,
        `Domain card already added to this character`,
      );
    }

    return this.characterDomainCards.add(characterId, dto.domainCardId);
  }

  async removeDomainCard(
    characterId: string,
    domainCardId: string,
  ): Promise<void> {
    await this.findCharacter(characterId);
    await this.characterDomainCards.remove(domainCardId);
  }

  async toggleThresholdBonus(
    characterId: string,
    bonusId: string,
    dto: ToggleThresholdBonusDto,
  ) {
    const character = await this.findCharacter(characterId);
    const bonus = character.thresholdBonuses.find((b) => b.id === bonusId);
    if (!bonus) {
      throw new NotFoundException(
        ErrorCode.SRD_RESOURCE_NOT_FOUND,
        `Threshold bonus ${bonusId} not found`,
      );
    }
    return this.thresholdBonuses.toggleActive(bonusId, dto.active);
  }

  async getComputedStats(characterId: string) {
    const character = await this.findOne(characterId);
    return this.gameLogic.computeAll({
      level: character.character.level,
      baseEvasion: character.character.evasion,
      armorBaseThresholds: character.character.armor
        ? [
            character.character.armor.majorThreshold,
            character.character.armor.severeThreshold,
          ]
        : null,
      armorEvasionModifier: character.character.armor?.evasionModifier ?? null,
      primaryWeaponFeature: character.character.primaryWeapon?.feature ?? null,
      secondaryWeaponFeature:
        character.character.secondaryWeapon?.feature ?? null,
      armorFeature: character.character.armor?.feature ?? null,
      thresholdBonuses: character.character.thresholdBonuses,
    });
  }
}
