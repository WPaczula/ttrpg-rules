import { Module } from '@nestjs/common';
import { CharactersController } from './characters.controller';
import { CharactersService } from './characters.service';
import { CharactersGateway } from './characters.gateway';
import { CharacterRepository } from './repositories/character.repository';
import { ExperienceRepository } from './repositories/experience.repository';
import { CharacterDomainCardRepository } from './repositories/character-domain-card.repository';
import { ThresholdBonusRepository } from './repositories/threshold-bonus.repository';
import { GameLogicModule } from '../game-logic/game-logic.module';
import { SrdModule } from '../srd/srd.module';
import { ClassRepository } from '../srd/repositories/class.repository';
import { ArmorRepository } from '../srd/repositories/armor.repository';
import { DomainCardRepository } from '../srd/repositories/domain-card.repository';
import { AuthModule } from '../auth/auth.module';
import { CharacterOwnerGuard } from './guards/character-owner.guard';

@Module({
  imports: [GameLogicModule, SrdModule, AuthModule],
  controllers: [CharactersController],
  providers: [
    CharactersGateway,
    CharactersService,
    CharacterRepository,
    ExperienceRepository,
    CharacterDomainCardRepository,
    ThresholdBonusRepository,
    ClassRepository,
    ArmorRepository,
    DomainCardRepository,
    CharacterOwnerGuard,
  ],
})
export class CharactersModule {}
