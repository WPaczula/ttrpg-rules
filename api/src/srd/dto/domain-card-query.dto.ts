import { IsInt, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class DomainCardQueryDto {
  @IsString()
  @IsOptional()
  domain?: string;

  @IsInt()
  @Min(1)
  @IsOptional()
  @Type(() => Number)
  level?: number;
}
