import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { SrdController } from './srd.controller';
import { SrdService } from './srd.service';
import { WeaponRepository } from './repositories/weapon.repository';
import { ArmorRepository } from './repositories/armor.repository';
import { ClassRepository } from './repositories/class.repository';
import { SubclassRepository } from './repositories/subclass.repository';
import { AncestryRepository } from './repositories/ancestry.repository';
import { CommunityRepository } from './repositories/community.repository';
import { DomainRepository } from './repositories/domain.repository';
import { DomainCardRepository } from './repositories/domain-card.repository';
import { SrdCacheInterceptor } from './srd-cache.interceptor';
import { AuthModule } from '../auth/auth.module';
import { AdversaryRepository } from './repositories/adversary.repository';
import { BeastformRepository } from './repositories/beastform.repository';
import { ConsumableRepository } from './repositories/consumable.repository';
import { EnvironmentRepository } from './repositories/environment.repository';
import { ItemRepository } from './repositories/item.repository';

@Module({
  imports: [
    CacheModule.register({ ttl: 3600 * 1000 }), // 1 hour in ms
    AuthModule,
  ],
  controllers: [SrdController],
  providers: [
    SrdService,
    WeaponRepository,
    ArmorRepository,
    ClassRepository,
    SubclassRepository,
    AncestryRepository,
    CommunityRepository,
    DomainRepository,
    DomainCardRepository,
    AdversaryRepository,
    BeastformRepository,
    ConsumableRepository,
    EnvironmentRepository,
    ItemRepository,
    SrdCacheInterceptor,
  ],
  exports: [SrdService],
})
export class SrdModule {}
