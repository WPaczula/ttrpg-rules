export interface ITrackedStats {
  hpMarked: number;
  stressMarked: number;
  hope: number;
  armorMarked: number;
  level: number;
}

export interface IStatUpdate {
  characterId: string;
  characterName: string;
  stat: keyof ITrackedStats;
  value: number;
}

export interface IArmorChange {
  characterId: string;
  characterName: string;
  armor: {
    id: string;
    name: string;
    baseScore: number;
  } | null;
  armorMarked: number;
}
