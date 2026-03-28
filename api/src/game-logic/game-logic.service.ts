import { Injectable } from '@nestjs/common';
import {
  ThresholdBreakdown,
  TraitModifiers,
  ComputedStats,
} from './interfaces/computed-stats.interface';

interface ThresholdBonusInput {
  sourceId: string;
  sourceType: string;
  majorBonus: number;
  severeBonus: number;
  active: boolean;
}

@Injectable()
export class GameLogicService {
  computeTier(level: number): number {
    if (level >= 8) return 4;
    if (level >= 5) return 3;
    if (level >= 2) return 2;
    return 1;
  }

  computeThresholds(
    armorBaseThresholds: string | null,
    level: number,
    proficiency: number,
    bonuses: ThresholdBonusInput[],
  ): ThresholdBreakdown | null {
    if (!armorBaseThresholds) return null;

    const parts = armorBaseThresholds.split('/').map(s => parseInt(s.trim(), 10));
    if (parts.length < 2 || isNaN(parts[0]) || isNaN(parts[1])) return null;

    const armorBaseMajor = parts[0];
    const armorBaseSevere = parts[1];
    const levelBonus = level - 1;

    const activeBonuses = bonuses
      .filter(b => b.active)
      .map(b => ({
        label: b.sourceId,
        major: b.majorBonus,
        severe: b.severeBonus,
      }));

    const totalMajor = armorBaseMajor + levelBonus + activeBonuses.reduce((sum, b) => sum + b.major, 0);
    const totalSevere = armorBaseSevere + levelBonus + activeBonuses.reduce((sum, b) => sum + b.severe, 0);

    return {
      armorBaseMajor,
      armorBaseSevere,
      levelBonus,
      bonuses: activeBonuses,
      totalMajor,
      totalSevere,
    };
  }

  computeEffectiveEvasion(baseEvasion: number, armorEvasionModifier: number | null): number {
    return baseEvasion + (armorEvasionModifier ?? 0);
  }

  parseTraitModifiers(
    primaryWeaponFeature: string | null,
    secondaryWeaponFeature: string | null,
    armorFeature: string | null,
  ): TraitModifiers {
    const modifiers: TraitModifiers = {
      agility: 0, strength: 0, finesse: 0,
      instinct: 0, presence: 0, knowledge: 0,
    };

    const sources = [primaryWeaponFeature, secondaryWeaponFeature, armorFeature];

    for (const source of sources) {
      if (!source) continue;
      this.extractModifiers(source, modifiers);
    }

    return modifiers;
  }

  private extractModifiers(text: string, modifiers: TraitModifiers): void {
    // Match: "+N to Trait", "-N to Trait", "+N bonus to Trait"
    const signedPattern = /([+-]\d+)\s+(?:bonus\s+)?to\s+(\w+)/gi;
    let match: RegExpExecArray | null;

    while ((match = signedPattern.exec(text)) !== null) {
      const value = parseInt(match[1], 10);
      const trait = match[2].toLowerCase();
      if (trait in modifiers) {
        modifiers[trait as keyof TraitModifiers] += value;
      }
    }

    // Match: "increase Trait by N"
    const increasePattern = /increase\s+(\w+)\s+by\s+(\d+)/gi;
    while ((match = increasePattern.exec(text)) !== null) {
      const trait = match[1].toLowerCase();
      const value = parseInt(match[2], 10);
      if (trait in modifiers) {
        modifiers[trait as keyof TraitModifiers] += value;
      }
    }

    // Match: "decrease Trait by N"
    const decreasePattern = /decrease\s+(\w+)\s+by\s+(\d+)/gi;
    while ((match = decreasePattern.exec(text)) !== null) {
      const trait = match[1].toLowerCase();
      const value = parseInt(match[2], 10);
      if (trait in modifiers) {
        modifiers[trait as keyof TraitModifiers] -= value;
      }
    }
  }

  computeAll(params: {
    level: number;
    proficiency: number;
    baseEvasion: number;
    armorBaseThresholds: string | null;
    armorEvasionModifier: number | null;
    primaryWeaponFeature: string | null;
    secondaryWeaponFeature: string | null;
    armorFeature: string | null;
    thresholdBonuses: ThresholdBonusInput[];
  }): ComputedStats {
    return {
      tier: this.computeTier(params.level),
      thresholds: this.computeThresholds(
        params.armorBaseThresholds,
        params.level,
        params.proficiency,
        params.thresholdBonuses,
      ),
      effectiveEvasion: this.computeEffectiveEvasion(
        params.baseEvasion,
        params.armorEvasionModifier,
      ),
      traitModifiers: this.parseTraitModifiers(
        params.primaryWeaponFeature,
        params.secondaryWeaponFeature,
        params.armorFeature,
      ),
    };
  }
}
