export interface ICharacter {
  id: string;
  name: string;
  level: number;
  classId: string;
  subclassId: string;
  ancestryId: string;
  secondaryAncestryId: string | null;
  ancestryFeatureId: string;
  secondaryAncestryFeatureId: string | null;
  communityId: string;
  agility: number;
  strength: number;
  finesse: number;
  instinct: number;
  presence: number;
  knowledge: number;
  hpTotal: number;
  hpMarked: number;
  stressTotal: number;
  stressMarked: number;
  armorId: string | null;
  armorMarked: number;
  evasion: number;
  proficiency: number;
  hope: number;
  goldHandfuls: number;
  goldBags: number;
  goldChests: number;
  primaryWeaponId: string | null;
  secondaryWeaponId: string | null;
  notes: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICharacterWithRelations extends ICharacter {
  class: { id: string; name: string };
  subclass: { id: string; name: string };
  ancestry: { id: string; name: string };
  secondaryAncestry: { id: string; name: string } | null;
  ancestryFeature: { id: string; name: string; text: string };
  secondaryAncestryFeature: { id: string; name: string; text: string } | null;
  community: { id: string; name: string };
  armor: { id: string; name: string; baseThresholds: string; evasionModifier: number | null; feature: string | null } | null;
  primaryWeapon: { id: string; name: string; feature: string | null } | null;
  secondaryWeapon: { id: string; name: string; feature: string | null } | null;
  experiences: { id: string; name: string; modifier: number }[];
  domainCards: { id: string; domainCard: { id: string; name: string; level: number; domainName: string } }[];
  thresholdBonuses: { id: string; sourceType: string; sourceId: string; majorBonus: number; severeBonus: number; active: boolean }[];
  markedTraits: { id: string; trait: string }[];
}
