import { ISrdFeature } from './srd-class.interface';

export interface ISrdEnvironmentFeature extends ISrdFeature {
  question?: string;
}

export interface ISrdEnvironment {
  id: string;
  name: string;
  tier: number;
  type: string;
  description: string;
  difficulty: string;
  impulses: string;
  potentialAdversaries: string | null;
  features: ISrdEnvironmentFeature[];
}
