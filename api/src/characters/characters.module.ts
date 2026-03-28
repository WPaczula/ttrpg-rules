import { Module } from '@nestjs/common';
import { CharactersController } from './characters.controller';
import { CharactersService } from './characters.service';
import { CharacterRepository } from './repositories/character.repository';
import { ExperienceRepository } from './repositories/experience.repository';
import { CharacterDomainCardRepository } from './repositories/character-domain-card.repository';
import { ThresholdBonusRepository } from './repositories/threshold-bonus.repository';
import { GameLogicModule } from '../game-logic/game-logic.module';
import { SrdModule } from '../srd/srd.module';
import { ClassRepository } from '../srd/repositories/class.repository';
import { ArmorRepository } from '../srd/repositories/armor.repository';
import { DomainCardRepository } from '../srd/repositories/domain-card.repository';

@Module({
  imports: [GameLogicModule, SrdModule],
  controllers: [CharactersController],
  providers: [
    CharactersService,
    CharacterRepository,
    ExperienceRepository,
    CharacterDomainCardRepository,
    ThresholdBonusRepository,
    ClassRepository,
    ArmorRepository,
    DomainCardRepository,
  ],
})
export class CharactersModule {}
