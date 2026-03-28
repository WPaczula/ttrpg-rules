import { IsUUID } from 'class-validator';

export class AddDomainCardDto {
  @IsUUID()
  domainCardId: string;
}
