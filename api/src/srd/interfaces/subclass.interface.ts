import { Feature } from './feature.interface';

export class Subclass {
  name: string;
  description: string;
  spellcastTrait: string;
  foundation: Feature[];
  specialization: Feature[];
  mastery: Feature[];
}
