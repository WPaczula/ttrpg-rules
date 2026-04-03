import {
  IsString,
  IsInt,
  IsOptional,
  IsArray,
  Min,
  Max,
  ValidateNested,
  IsNumber,
} from 'class-validator';
import { Type } from 'class-transformer';

export class SyncExperienceDto {
  @IsString()
  name: string;

  @IsNumber()
  modifier: number;
}

export class SyncDomainCardDto {
  @IsString()
  name: string;
}

export class SyncCharacterDto {
  @IsString()
  name: string;

  @IsInt()
  @Min(1)
  @Max(10)
  level: number;

  @IsString()
  class: string;

  @IsString()
  subclass: string;

  @IsString()
  ancestry: string;

  @IsString()
  @IsOptional()
  secondaryAncestry?: string;

  @IsString()
  ancestryFeature: string;

  @IsString()
  @IsOptional()
  secondaryAncestryFeature?: string;

  @IsString()
  community: string;

  @IsInt()
  @Min(-3)
  @Max(5)
  agility: number;

  @IsInt()
  @Min(-3)
  @Max(5)
  strength: number;

  @IsInt()
  @Min(-3)
  @Max(5)
  finesse: number;

  @IsInt()
  @Min(-3)
  @Max(5)
  instinct: number;

  @IsInt()
  @Min(-3)
  @Max(5)
  presence: number;

  @IsInt()
  @Min(-3)
  @Max(5)
  knowledge: number;

  @IsInt()
  @Min(0)
  hpTotal: number;

  @IsInt()
  @Min(0)
  hpMarked: number;

  @IsInt()
  @Min(0)
  stressTotal: number;

  @IsInt()
  @Min(0)
  stressMarked: number;

  @IsInt()
  @Min(0)
  evasion: number;

  @IsInt()
  @Min(0)
  armorMarked: number;

  @IsInt()
  @Min(0)
  @Max(12)
  hope: number;

  @IsInt()
  @Min(0)
  goldHandfuls: number;

  @IsInt()
  @Min(0)
  goldBags: number;

  @IsInt()
  @Min(0)
  goldChests: number;

  @IsInt()
  @Min(1)
  proficiency: number;

  @IsArray()
  @IsString({ each: true })
  markedTraits: string[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SyncExperienceDto)
  experiences: SyncExperienceDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SyncDomainCardDto)
  domainCards: SyncDomainCardDto[];

  @IsString()
  @IsOptional()
  primaryWeapon?: string;

  @IsString()
  @IsOptional()
  secondaryWeapon?: string;

  @IsString()
  @IsOptional()
  armorName?: string;

  @IsArray()
  @IsString({ each: true })
  items: string[];

  @IsString()
  @IsOptional()
  notes?: string;
}
