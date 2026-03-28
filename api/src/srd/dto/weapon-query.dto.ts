import { IsInt, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class WeaponQueryDto {
  @IsInt()
  @Min(1)
  @IsOptional()
  @Type(() => Number)
  tier?: number;

  @IsString()
  @IsOptional()
  type?: string;
}
