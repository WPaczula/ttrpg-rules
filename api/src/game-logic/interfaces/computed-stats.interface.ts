export interface ThresholdBreakdown {
  armorBaseMajor: number;
  armorBaseSevere: number;
  levelBonus: number;
  bonuses: { label: string; major: number; severe: number }[];
  totalMajor: number;
  totalSevere: number;
}

export interface TraitModifiers {
  agility: number;
  strength: number;
  finesse: number;
  instinct: number;
  presence: number;
  knowledge: number;
}

export interface ComputedStats {
  tier: number;
  thresholds: ThresholdBreakdown | null;
  effectiveEvasion: number;
  traitModifiers: TraitModifiers;
}
