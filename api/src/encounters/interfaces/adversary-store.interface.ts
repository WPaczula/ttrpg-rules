export interface IAdversaryFeature {
  name: string;
  text: string;
}

export interface IAdversary {
  name: string;
  type: string;
  tier: number;
  hp: number;
  stress: number;
  difficulty: number;
  thresholds: string;
  atk: string;
  attack: string;
  range: string;
  damage: string;
  description?: string;
  motives_and_tactics?: string;
  experience?: string;
  features?: IAdversaryFeature[];
}

export interface IEncounterAdversary {
  id: string;
  adversaryName: string;
  hpMarked: number;
  stressMarked: number;
}

export interface IEncounter {
  id: string;
  name: string;
  pcCount: number;
  musicUrl?: string;
  adversaries: IEncounterAdversary[];
}

export interface IAdversaryStore {
  library: IAdversary[];
  encounters: IEncounter[];
}
