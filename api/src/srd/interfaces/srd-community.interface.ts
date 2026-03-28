import { ISrdFeature } from './srd-class.interface';

export interface ISrdCommunity {
  id: string;
  name: string;
  description: string;
  note: string;
  features: ISrdFeature[];
}
