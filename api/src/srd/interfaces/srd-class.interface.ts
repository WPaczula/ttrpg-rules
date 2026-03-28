export interface ISrdFeature {
  id: string;
  name: string;
  text: string;
}

export interface ISrdClass {
  id: string;
  name: string;
  description: string;
  evasion: number;
  hp: number;
  items: string;
  suggestedTraits: number[];
  hopeFeatureName: string;
  hopeFeatureText: string;
  suggestedPrimary: { id: string; name: string } | null;
  suggestedSecondary: { id: string; name: string } | null;
  suggestedArmor: { id: string; name: string } | null;
  features: ISrdFeature[];
  subclasses: { id: string; name: string }[];
  domains: { id: string; name: string }[];
}
