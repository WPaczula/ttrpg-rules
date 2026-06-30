import { Injectable } from '@nestjs/common';
import { AdversaryStoreRepository } from './repositories/adversary-store.repository';
import { SyncAdversaryStoreDto } from './dto/sync-adversary-store.dto';
import { IAdversaryStore } from './interfaces/adversary-store.interface';

@Injectable()
export class EncountersService {
  constructor(private readonly store: AdversaryStoreRepository) {}

  getStore(userId: string): Promise<IAdversaryStore> {
    return this.store.getStore(userId);
  }

  replaceStore(userId: string, dto: SyncAdversaryStoreDto): Promise<void> {
    return this.store.replaceStore(userId, dto);
  }
}
