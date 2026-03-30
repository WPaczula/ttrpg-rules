// api/src/search/repositories/document-embedding.repository.spec.ts

import { Test } from '@nestjs/testing';
import { DocumentEmbeddingRepository } from './document-embedding.repository';
import { PrismaService } from '../../prisma/prisma.service';

describe('DocumentEmbeddingRepository', () => {
  let repository: DocumentEmbeddingRepository;
  let prisma: { $queryRawUnsafe: jest.Mock; $executeRawUnsafe: jest.Mock };

  beforeEach(async () => {
    prisma = {
      $queryRawUnsafe: jest.fn(),
      $executeRawUnsafe: jest.fn(),
    };

    const module = await Test.createTestingModule({
      providers: [
        DocumentEmbeddingRepository,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    repository = module.get(DocumentEmbeddingRepository);
  });

  describe('findNearest', () => {
    it('queries with cosine distance and returns results', async () => {
      const mockRows = [
        { id: 'srd/hope', content: 'Hope rules...', category: 'srd', similarity: 0.92 },
      ];
      prisma.$queryRawUnsafe.mockResolvedValue(mockRows);

      const embedding = new Array(1536).fill(0.1);
      const results = await repository.findNearest(embedding, 5);

      expect(prisma.$queryRawUnsafe).toHaveBeenCalledTimes(1);
      const sql = prisma.$queryRawUnsafe.mock.calls[0][0] as string;
      expect(sql).toContain('<=>');
      expect(sql).toContain('LIMIT');
      expect(results).toEqual(mockRows);
    });

    it('filters by category when provided', async () => {
      prisma.$queryRawUnsafe.mockResolvedValue([]);

      const embedding = new Array(1536).fill(0.1);
      await repository.findNearest(embedding, 5, 'classes');

      const sql = prisma.$queryRawUnsafe.mock.calls[0][0] as string;
      expect(sql).toContain('category');
    });
  });

  describe('upsert', () => {
    it('executes an upsert query', async () => {
      prisma.$executeRawUnsafe.mockResolvedValue(1);

      const embedding = new Array(1536).fill(0.1);
      await repository.upsert('test-id', 'test content', 'srd', embedding);

      expect(prisma.$executeRawUnsafe).toHaveBeenCalledTimes(1);
      const sql = prisma.$executeRawUnsafe.mock.calls[0][0] as string;
      expect(sql).toContain('INSERT INTO document_embedding');
      expect(sql).toContain('ON CONFLICT');
    });
  });
});
