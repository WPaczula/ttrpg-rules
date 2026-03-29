import { IsString, IsInt, IsUUID, IsOptional, Min, Max } from 'class-validator';

export class UpdateCharacterDto {
  @IsInt()
  @Min(0)
  @IsOptional()
  hpMarked?: number;

  @IsInt()
  @Min(0)
  @IsOptional()
  stressMarked?: number;

  @IsInt()
  @Min(0)
  @Max(12)
  @IsOptional()
  hope?: number;

  @IsInt()
  @Min(0)
  @Max(9)
  @IsOptional()
  goldHandfuls?: number;

  @IsInt()
  @Min(0)
  @Max(9)
  @IsOptional()
  goldBags?: number;

  @IsInt()
  @Min(0)
  @Max(99)
  @IsOptional()
  goldChests?: number;

  @IsInt()
  @Min(0)
  @IsOptional()
  armorMarked?: number;

  @IsInt()
  @Min(-3)
  @Max(5)
  @IsOptional()
  agility?: number;

  @IsInt()
  @Min(-3)
  @Max(5)
  @IsOptional()
  strength?: number;

  @IsInt()
  @Min(-3)
  @Max(5)
  @IsOptional()
  finesse?: number;

  @IsInt()
  @Min(-3)
  @Max(5)
  @IsOptional()
  instinct?: number;

  @IsInt()
  @Min(-3)
  @Max(5)
  @IsOptional()
  presence?: number;

  @IsInt()
  @Min(-3)
  @Max(5)
  @IsOptional()
  knowledge?: number;

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
}
