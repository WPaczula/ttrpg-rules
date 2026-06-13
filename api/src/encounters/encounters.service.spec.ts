jest.mock('@prisma/client', () => ({ PrismaClient: jest.fn() }));

import { Test, TestingModule } from '@nestjs/testing';
import { EncountersService } from './encounters.service';
import { AdversaryStoreRepository } from './repositories/adversary-store.repository';
import { SyncAdversaryStoreDto } from './dto/sync-adversary-store.dto';
import { IAdversaryStore } from './interfaces/adversary-store.interface';

describe('EncountersService', () => {
  let service: EncountersService;
  let repo: jest.Mocked<Pick<AdversaryStoreRepository, 'getStore' | 'replaceStore'>>;

  beforeEach(async () => {
    repo = {
      getStore: jest.fn(),
      replaceStore: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EncountersService,
        { provide: AdversaryStoreRepository, useValue: repo },
      ],
    }).compile();

    service = module.get(EncountersService);
  });

  it('getStore delegates to the repository for the given user', async () => {
    const store: IAdversaryStore = { library: [], encounters: [] };
    repo.getStore.mockResolvedValue(store);

    await expect(service.getStore('user-1')).resolves.toBe(store);
    expect(repo.getStore).toHaveBeenCalledWith('user-1');
  });

  it('replaceStore forwards the payload to the repository', async () => {
    const dto: SyncAdversaryStoreDto = {
      library: [
        {
          name: 'Goblin',
          type: 'Minion',
          tier: 1,
          hp: 3,
          stress: 1,
          difficulty: 10,
          thresholds: '5/9',
          atk: '+1',
          attack: 'Dagger',
          range: 'Melee',
          damage: '1d6 phy',
          features: [{ name: 'Sneaky', text: 'Has advantage when hidden.' }],
        },
      ],
      encounters: [
        {
          name: 'Ambush',
          pcCount: 4,
          adversaries: [
            { adversaryName: 'Goblin', hpMarked: 0, stressMarked: 0 },
          ],
        },
      ],
    };
    repo.replaceStore.mockResolvedValue(undefined);

    await service.replaceStore('user-1', dto);
    expect(repo.replaceStore).toHaveBeenCalledWith('user-1', dto);
  });
});
