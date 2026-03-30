// api/src/search/repositories/document-embedding.repository.ts

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ISearchResult } from '../interfaces/search-result.interface';

@Injectable()
export class DocumentEmbeddingRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findNearest(
    embedding: number[],
    limit: number,
    category?: string,
  ): Promise<ISearchResult[]> {
    const vectorStr = `[${embedding.join(',')}]`;

    if (category) {
      return this.prisma.$queryRawUnsafe<ISearchResult[]>(
        `SELECT id, content, category, 1 - (embedding <=> $1::vector) AS similarity
         FROM document_embedding
         WHERE category = $2
         ORDER BY embedding <=> $1::vector
         LIMIT $3`,
        vectorStr,
        category,
        limit,
      );
    }

    return this.prisma.$queryRawUnsafe<ISearchResult[]>(
      `SELECT id, content, category, 1 - (embedding <=> $1::vector) AS similarity
       FROM document_embedding
       ORDER BY embedding <=> $1::vector
       LIMIT $2`,
      vectorStr,
      limit,
    );
  }

  async upsert(
    id: string,
    content: string,
    category: string,
    embedding: number[],
  ): Promise<void> {
    const vectorStr = `[${embedding.join(',')}]`;

    await this.prisma.$executeRawUnsafe(
      `INSERT INTO document_embedding (id, content, category, embedding)
       VALUES ($1, $2, $3, $4::vector)
       ON CONFLICT (id) DO UPDATE SET
         content = EXCLUDED.content,
         category = EXCLUDED.category,
         embedding = EXCLUDED.embedding`,
      id,
      content,
      category,
      vectorStr,
    );
  }
}
