import { Module } from '@nestjs/common';
import { SearchController } from './search.controller';
import { SearchService } from './search.service';
import { DocumentEmbeddingRepository } from './repositories/document-embedding.repository';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [SearchController],
  providers: [SearchService, DocumentEmbeddingRepository],
})
export class SearchModule {}
