import { Feature } from './feature.interface';

export class CharacterClass {
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
  hopeFeature: Feature;
  features: Feature[];
}
