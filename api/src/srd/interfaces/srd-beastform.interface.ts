import { ISrdFeature } from './srd-class.interface';

export interface ISrdBeastform {
  id: string;
  name: string;
  tier: number;
  examples: string;
  traitBonus: string;
  evasionBonus: string;
  attack: string;
  advantages: string;
  features: ISrdFeature[];
}
