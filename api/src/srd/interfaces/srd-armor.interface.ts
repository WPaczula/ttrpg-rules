export interface ISrdArmor {
  id: string;
  name: string;
  tier: number;
  baseScore: number;
  baseThresholds: string;
  evasionModifier: number | null;
  feature: string | null;
}
