export class Weapon {
  name: string;
  tier: number;
  type: 'Primary' | 'Secondary';
  damageType: 'Physical' | 'Magical';
  trait: string;
  range: string;
  damage: string;
  burden: string;
  feature?: string;
}
