import { ISrdFeature } from './srd-class.interface';

export interface ISrdAdversary {
  id: string;
  name: string;
  tier: number;
  type: string;
  hp: number;
  stress: number;
  difficulty: string;
  thresholds: string;
  atk: string;
  attack: string;
  range: string;
  damage: string;
  description: string | null;
  motivesAndTactics: string | null;
  experience: string | null;
  features: ISrdFeature[];
}
