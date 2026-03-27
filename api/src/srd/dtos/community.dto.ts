import { FeatureDto } from './feature.dto';

export class CommunityDto {
  name: string;
  description: string;
  note: string;
  features: FeatureDto[];
}
