export class DomainDto {
  name: string;
  description: string;
  classes: string[];
  cardsByLevel: Record<number, string[]>;
}
