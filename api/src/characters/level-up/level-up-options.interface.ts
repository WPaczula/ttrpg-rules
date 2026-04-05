import { AdvancementType } from './advancement-type.enum';

export interface IAdvancementOption {
  type: AdvancementType;
  slotsUsed: number;
  slotsMax: number;
  available: boolean;
}

export interface ITierBonuses {
  proficiencyIncrease: boolean;
  clearMarkedTraits: boolean;
  requiresNewExperience: boolean;
}

export interface IEligibleDomainCard {
  id: string;
  name: string;
  level: number;
  domainName: string;
}

export interface ILevelUpOptions {
  currentLevel: number;
  nextLevel: number;
  currentTier: number;
  nextTier: number;
  isTierTransition: boolean;
  tierBonuses: ITierBonuses | null;
  availableAdvancements: IAdvancementOption[];
  eligibleDomainCards: IEligibleDomainCard[];
}
