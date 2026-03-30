// api/src/search/search.service.spec.ts

import { Test } from '@nestjs/testing';
import { SearchService } from './search.service';
import { DocumentEmbeddingRepository } from './repositories/document-embedding.repository';

// Mock the openai module
jest.mock('openai', () => {
  return {
    __esModule: true,
    default: jest.fn().mockImplementation(() => ({
      embeddings: {
        create: jest.fn().mockResolvedValue({
          data: [{ embedding: new Array(1536).fill(0.5) }],
        }),
      },
    })),
  };
});

describe('SearchService', () => {
  let service: SearchService;
  let repository: { findNearest: jest.Mock };

  beforeEach(async () => {
    repository = {
      findNearest: jest.fn().mockResolvedValue([
        { id: 'srd/hope', content: 'Hope is a resource...', category: 'srd', similarity: 0.92 },
        { id: 'srd/stress', content: 'Stress represents...', category: 'srd', similarity: 0.85 },
      ]),
    };

    const module = await Test.createTestingModule({
      providers: [
        SearchService,
        { provide: DocumentEmbeddingRepository, useValue: repository },
      ],
    }).compile();

    service = module.get(SearchService);
  });

  describe('search', () => {
    it('returns content strings ordered by relevance', async () => {
      const results = await service.search('how does hope work?', 5);

      expect(repository.findNearest).toHaveBeenCalledWith(
        expect.any(Array),
        5,
        undefined,
      );
      expect(results).toEqual([
        'Hope is a resource...',
        'Stress represents...',
      ]);
    });

    it('passes category filter to repository', async () => {
      await service.search('attack damage', 3, 'classes');

      expect(repository.findNearest).toHaveBeenCalledWith(
        expect.any(Array),
        3,
        'classes',
      );
    });
  });
});
