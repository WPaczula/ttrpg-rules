import { Module } from '@nestjs/common';
import { SyncCharacterService } from './sync-character.service';
import { ClassRepository } from '../../../srd/repositories/class.repository';
import { SubclassRepository } from '../../../srd/repositories/subclass.repository';
import { AncestryRepository } from '../../../srd/repositories/ancestry.repository';
import { CommunityRepository } from '../../../srd/repositories/community.repository';
import { WeaponRepository } from '../../../srd/repositories/weapon.repository';
import { ArmorRepository } from '../../../srd/repositories/armor.repository';
import { DomainCardRepository } from '../../../srd/repositories/domain-card.repository';
import { CharactersGatewayModule } from '../../characters-gateway.module';

@Module({
  imports: [CharactersGatewayModule],
  providers: [
    SyncCharacterService,
    ClassRepository,
    SubclassRepository,
    AncestryRepository,
    CommunityRepository,
    WeaponRepository,
    ArmorRepository,
    DomainCardRepository,
  ],
  exports: [SyncCharacterService],
})
export class SyncCharacterModule {}
