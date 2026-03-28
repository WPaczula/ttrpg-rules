import { ISrdFeature } from './srd-class.interface';

export interface ISrdSubclassFeature extends ISrdFeature {
  tier: string;
}

export interface ISrdSubclass {
  id: string;
  name: string;
  description: string;
  spellcastTrait: string;
  className: string;
  features: ISrdSubclassFeature[];
}
