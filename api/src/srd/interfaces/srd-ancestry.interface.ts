import { ISrdFeature } from './srd-class.interface';

export interface ISrdAncestry {
  id: string;
  name: string;
  description: string;
  features: ISrdFeature[];
}
