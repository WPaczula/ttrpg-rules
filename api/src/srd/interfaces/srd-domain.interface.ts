export interface ISrdDomain {
  id: string;
  name: string;
  description: string;
  classes: string[];
  cards: { id: string; name: string; level: number }[];
}
