import { IsInt, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class ArmorQueryDto {
  @IsInt()
  @Min(1)
  @IsOptional()
  @Type(() => Number)
  tier?: number;
}
