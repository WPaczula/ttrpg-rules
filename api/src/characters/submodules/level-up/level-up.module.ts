import { Module } from '@nestjs/common';
import { LevelUpService } from './level-up.service';
import { LevelUpRepository } from './repositories/level-up.repository';
import { CharacterRepository } from '../../repositories/character.repository';
import { ExperienceRepository } from '../../repositories/experience.repository';
import { CharacterDomainCardRepository } from '../../repositories/character-domain-card.repository';
import { DomainCardRepository } from '../../../srd/repositories/domain-card.repository';
import { GameLogicModule } from '../../../game-logic/game-logic.module';
import { CharactersGatewayModule } from '../../characters-gateway.module';

@Module({
  imports: [GameLogicModule, CharactersGatewayModule],
  providers: [
    LevelUpService,
    LevelUpRepository,
    CharacterRepository,
    ExperienceRepository,
    CharacterDomainCardRepository,
    DomainCardRepository,
  ],
  exports: [LevelUpService],
})
export class LevelUpModule {}
