export interface ISrdArmor {
  id: string;
  name: string;
  tier: number;
  baseScore: number;
  majorThreshold: number;
  severeThreshold: number;
  evasionModifier: number | null;
  feature: string | null;
}
