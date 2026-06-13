import {
  IsString,
  IsInt,
  IsOptional,
  IsArray,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class SyncAdversaryFeatureDto {
  @IsString()
  name: string;

  @IsString()
  text: string;
}

export class SyncAdversaryDto {
  @IsString()
  name: string;

  @IsString()
  type: string;

  @IsInt()
  tier: number;

  @IsInt()
  hp: number;

  @IsInt()
  stress: number;

  @IsInt()
  difficulty: number;

  @IsString()
  thresholds: string;

  @IsString()
  atk: string;

  @IsString()
  attack: string;

  @IsString()
  range: string;

  @IsString()
  damage: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  motives_and_tactics?: string;

  @IsString()
  @IsOptional()
  experience?: string;

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => SyncAdversaryFeatureDto)
  features?: SyncAdversaryFeatureDto[];
}

export class SyncEncounterAdversaryDto {
  @IsString()
  adversaryName: string;

  @IsInt()
  @Min(0)
  hpMarked: number;

  @IsInt()
  @Min(0)
  stressMarked: number;
}

export class SyncEncounterDto {
  @IsString()
  name: string;

  @IsInt()
  @Min(1)
  pcCount: number;

  @IsString()
  @IsOptional()
  musicUrl?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SyncEncounterAdversaryDto)
  adversaries: SyncEncounterAdversaryDto[];
}

export class SyncAdversaryStoreDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SyncAdversaryDto)
  library: SyncAdversaryDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SyncEncounterDto)
  encounters: SyncEncounterDto[];
}
