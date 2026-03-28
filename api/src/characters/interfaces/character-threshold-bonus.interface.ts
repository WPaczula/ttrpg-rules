export interface ICharacterThresholdBonus {
  id: string;
  characterId: string;
  sourceType: string;
  sourceId: string;
  majorBonus: number;
  severeBonus: number;
  active: boolean;
}
