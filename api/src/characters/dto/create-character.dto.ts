import {
  IsString,
  IsInt,
  IsUUID,
  IsOptional,
  Min,
  Max,
  IsNotEmpty,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CreateExperienceDto } from './create-experience.dto';

export class CreateCharacterDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsUUID()
  classId: string;

  @IsUUID()
  subclassId: string;

  @IsUUID()
  ancestryId: string;

  @IsUUID()
  @IsOptional()
  secondaryAncestryId?: string;

  @IsUUID()
  ancestryFeatureId: string;

  @IsUUID()
  @IsOptional()
  secondaryAncestryFeatureId?: string;

  @IsUUID()
  communityId: string;

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

  @IsUUID()
  @IsOptional()
  primaryWeaponId?: string;

  @IsUUID()
  @IsOptional()
  secondaryWeaponId?: string;

  @IsUUID()
  @IsOptional()
  armorId?: string;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CreateExperienceDto)
  experiences?: CreateExperienceDto[];

  @IsArray()
  @IsOptional()
  @IsUUID('4', { each: true })
  domainCardIds?: string[];
}
