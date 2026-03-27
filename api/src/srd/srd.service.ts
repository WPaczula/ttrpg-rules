import { Injectable } from '@nestjs/common';
import {
  SRD_WEAPONS,
  SRD_ARMOR,
  SRD_CLASSES,
  SRD_ANCESTRIES,
  SRD_COMMUNITIES,
  SRD_SUBCLASSES,
  SRD_DOMAINS,
  SRD_DOMAIN_CARDS,
} from 'lib/srd-data';
import { Weapon } from './interfaces/weapon.interface';
import { Armor } from './interfaces/armor.interface';
import { CharacterClass } from './interfaces/class.interface';
import { Ancestry } from './interfaces/ancestry.interface';
import { Community } from './interfaces/community.interface';
import { Subclass } from './interfaces/subclass.interface';
import { Domain } from './interfaces/domain.interface';
import { DomainCard } from './interfaces/domain-card.interface';

@Injectable()
export class SrdService {
  findAllWeapons(): Weapon[] {
    return SRD_WEAPONS;
  }

  findAllArmor(): Armor[] {
    return SRD_ARMOR;
  }

  findAllClasses(): CharacterClass[] {
    return SRD_CLASSES;
  }

  findAllAncestries(): Ancestry[] {
    return SRD_ANCESTRIES;
  }

  findAllCommunities(): Community[] {
    return SRD_COMMUNITIES;
  }

  findAllSubclasses(): Subclass[] {
    return SRD_SUBCLASSES;
  }

  findAllDomains(): Domain[] {
    return SRD_DOMAINS;
  }

  findAllDomainCards(): DomainCard[] {
    return SRD_DOMAIN_CARDS;
  }
}
