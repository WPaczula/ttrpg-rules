import { FeatureDto } from './feature.dto';

export class SubclassDto {
  name: string;
  description: string;
  spellcastTrait: string;
  foundation: FeatureDto[];
  specialization: FeatureDto[];
  mastery: FeatureDto[];
}
