import { Controller, Get } from '@nestjs/common';
import { SrdService } from './srd.service';
import { WeaponDto } from './dtos/weapon.dto';
import { ArmorDto } from './dtos/armor.dto';
import { ClassDto } from './dtos/class.dto';
import { AncestryDto } from './dtos/ancestry.dto';
import { CommunityDto } from './dtos/community.dto';
import { SubclassDto } from './dtos/subclass.dto';
import { DomainDto } from './dtos/domain.dto';
import { DomainCardDto } from './dtos/domain-card.dto';

@Controller('srd')
export class SrdController {
  constructor(private srdService: SrdService) {}

  @Get('weapons')
  public findAllWeapons(): WeaponDto[] {
    return this.srdService.findAllWeapons();
  }

  @Get('armor')
  public findAllArmor(): ArmorDto[] {
    return this.srdService.findAllArmor();
  }

  @Get('classes')
  public findAllClasses(): ClassDto[] {
    return this.srdService.findAllClasses();
  }

  @Get('ancestries')
  public findAllAncestries(): AncestryDto[] {
    return this.srdService.findAllAncestries();
  }

  @Get('communities')
  public findAllCommunities(): CommunityDto[] {
    return this.srdService.findAllCommunities();
  }

  @Get('subclasses')
  public findAllSubclasses(): SubclassDto[] {
    return this.srdService.findAllSubclasses();
  }

  @Get('domains')
  public findAllDomains(): DomainDto[] {
    return this.srdService.findAllDomains();
  }

  @Get('domain-cards')
  public findAllDomainCards(): DomainCardDto[] {
    return this.srdService.findAllDomainCards();
  }
}
