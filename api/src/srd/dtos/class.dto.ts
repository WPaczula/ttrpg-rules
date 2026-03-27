import { FeatureDto } from './feature.dto';

export class ClassDto {
  name: string;
  description: string;
  domains: [string, string];
  subclasses: [string, string];
  evasion: number;
  hp: number;
  items: string;
  suggestedTraits: string;
  suggestedPrimary: string;
  suggestedSecondary: string;
  suggestedArmor: string;
  hopeFeature: FeatureDto;
  features: FeatureDto[];
}
