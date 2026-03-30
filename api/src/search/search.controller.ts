import { Controller, Post, Body } from '@nestjs/common';
import { SearchService } from './search.service';
import { SearchQueryDto } from './dto/search-query.dto';
import { AnyRole } from '../auth/decorators/any-role.decorator';

@AnyRole()
@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Post()
  async search(@Body() dto: SearchQueryDto): Promise<string[]> {
    return this.searchService.search(dto.query, dto.limit ?? 5, dto.category);
  }
}
