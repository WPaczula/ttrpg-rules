import { IsString, IsNotEmpty, IsOptional, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class SearchQueryDto {
  @IsString()
  @IsNotEmpty()
  query: string;

  @IsInt()
  @Min(1)
  @Max(20)
  @IsOptional()
  @Type(() => Number)
  limit?: number;

  @IsString()
  @IsOptional()
  category?: string;
}
