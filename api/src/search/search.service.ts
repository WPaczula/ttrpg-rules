// api/src/search/search.service.ts

import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';
import { DocumentEmbeddingRepository } from './repositories/document-embedding.repository';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SearchService {
  private readonly openai: OpenAI;

  constructor(
    private readonly embeddings: DocumentEmbeddingRepository,
    private readonly configService: ConfigService,
  ) {
    this.openai = new OpenAI({
      apiKey: this.configService.get('OPENAI_API_KEY'),
    });
    console.log(this.configService.get('OPENAI_API_KEY'));
  }

  async search(
    query: string,
    limit: number = 5,
    category?: string,
  ): Promise<string[]> {
    const response = await this.openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: query,
    });
    const queryEmbedding = response.data[0].embedding;

    const results = await this.embeddings.findNearest(
      queryEmbedding,
      limit,
      category,
    );

    return results.map((r) => r.content);
  }
}
