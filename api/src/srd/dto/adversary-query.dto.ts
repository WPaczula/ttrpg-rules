import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class AdversaryQueryDto {
  @IsInt()
  @Min(1)
  @Max(4)
  @IsOptional()
  @Type(() => Number)
  tier?: number;

  @IsString()
  @IsOptional()
  type?: string;
}
