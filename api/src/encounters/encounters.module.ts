import { Module } from '@nestjs/common';
import { EncountersController } from './encounters.controller';
import { EncountersService } from './encounters.service';
import { AdversaryStoreRepository } from './repositories/adversary-store.repository';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [EncountersController],
  providers: [EncountersService, AdversaryStoreRepository],
})
export class EncountersModule {}
