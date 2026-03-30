export interface StatUpdateDto {
  characterId: string;
  characterName: string;
  stat: 'hpMarked' | 'stressMarked' | 'hope' | 'armorMarked';
  value: number;
}
