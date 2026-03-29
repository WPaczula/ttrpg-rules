import { IsInt, IsOptional, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class BeastformQueryDto {
  @IsInt()
  @Min(1)
  @Max(4)
  @IsOptional()
  @Type(() => Number)
  tier?: number;
}
