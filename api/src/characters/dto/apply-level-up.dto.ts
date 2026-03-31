import {
  IsEnum,
  IsOptional,
  IsString,
  MinLength,
  ArrayMinSize,
  ArrayMaxSize,
  ValidateNested,
  IsArray,
  IsUUID,
} from 'class-validator';
import { Type } from 'class-transformer';
import { AdvancementType } from '../enums/advancement-type.enum';
import { Trait } from '../enums/trait.enum';

export class IncreaseTraitsMetadataDto {
  @IsArray()
  @ArrayMinSize(2)
  @ArrayMaxSize(2)
  @IsEnum(Trait, { each: true })
  traits: [Trait, Trait];
}

export class BoostExperiencesMetadataDto {
  @IsArray()
  @ArrayMinSize(2)
  @ArrayMaxSize(2)
  @IsUUID('4', { each: true })
  experienceIds: [string, string];
}

export class DomainCardMetadataDto {
  @IsUUID()
  domainCardId: string;
}

export class AdvancementDto {
  @IsEnum(AdvancementType)
  type: AdvancementType;

  @IsOptional()
  @ValidateNested()
  @Type(() => Object, {
    discriminator: {
      property: 'type',
      subTypes: [
        {
          value: IncreaseTraitsMetadataDto,
          name: AdvancementType.INCREASE_TRAITS,
        },
        {
          value: BoostExperiencesMetadataDto,
          name: AdvancementType.BOOST_EXPERIENCES,
        },
        {
          value: DomainCardMetadataDto,
          name: AdvancementType.EXTRA_DOMAIN_CARD,
        },
      ],
    },
    keepDiscriminatorProperty: true,
  })
  metadata?:
    | IncreaseTraitsMetadataDto
    | BoostExperiencesMetadataDto
    | DomainCardMetadataDto;
}

export class ApplyLevelUpDto {
  @IsArray()
  @ArrayMinSize(2)
  @ArrayMaxSize(2)
  @ValidateNested({ each: true })
  @Type(() => AdvancementDto)
  advancements: [AdvancementDto, AdvancementDto];

  @IsOptional()
  @IsString()
  @MinLength(1)
  newExperienceName?: string;
}
