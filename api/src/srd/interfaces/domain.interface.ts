export class Domain {
  name: string;
  description: string;
  classes: string[];
  cardsByLevel: Record<number, string[]>;
}
