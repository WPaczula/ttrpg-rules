import { Injectable } from '@nestjs/common';
import { WeaponRepository } from './repositories/weapon.repository';
import { ArmorRepository } from './repositories/armor.repository';
import { ClassRepository } from './repositories/class.repository';
import { SubclassRepository } from './repositories/subclass.repository';
import { AncestryRepository } from './repositories/ancestry.repository';
import { CommunityRepository } from './repositories/community.repository';
import { DomainRepository } from './repositories/domain.repository';
import { DomainCardRepository } from './repositories/domain-card.repository';
import { NotFoundException, ErrorCode } from '../common/error-codes';

@Injectable()
export class SrdService {
  constructor(
    private readonly weapons: WeaponRepository,
    private readonly armor: ArmorRepository,
    private readonly classes: ClassRepository,
    private readonly subclasses: SubclassRepository,
    private readonly ancestries: AncestryRepository,
    private readonly communities: CommunityRepository,
    private readonly domains: DomainRepository,
    private readonly domainCards: DomainCardRepository,
  ) {}

  getWeapons(filters?: { tier?: number; type?: string }) {
    return this.weapons.findAll(filters);
  }

  async getWeapon(id: string) {
    const weapon = await this.weapons.findById(id);
    if (!weapon) throw new NotFoundException(ErrorCode.SRD_RESOURCE_NOT_FOUND, `Weapon ${id} not found`);
    return weapon;
  }

  getArmor(filters?: { tier?: number }) {
    return this.armor.findAll(filters);
  }

  async getArmorById(id: string) {
    const armor = await this.armor.findById(id);
    if (!armor) throw new NotFoundException(ErrorCode.SRD_RESOURCE_NOT_FOUND, `Armor ${id} not found`);
    return armor;
  }

  getClasses() {
    return this.classes.findAll();
  }

  async getClass(id: string) {
    const cls = await this.classes.findById(id);
    if (!cls) throw new NotFoundException(ErrorCode.SRD_RESOURCE_NOT_FOUND, `Class ${id} not found`);
    return cls;
  }

  getSubclasses() {
    return this.subclasses.findAll();
  }

  async getSubclass(id: string) {
    const sub = await this.subclasses.findById(id);
    if (!sub) throw new NotFoundException(ErrorCode.SRD_RESOURCE_NOT_FOUND, `Subclass ${id} not found`);
    return sub;
  }

  getAncestries() {
    return this.ancestries.findAll();
  }

  async getAncestry(id: string) {
    const ancestry = await this.ancestries.findById(id);
    if (!ancestry) throw new NotFoundException(ErrorCode.SRD_RESOURCE_NOT_FOUND, `Ancestry ${id} not found`);
    return ancestry;
  }

  getCommunities() {
    return this.communities.findAll();
  }

  async getCommunity(id: string) {
    const community = await this.communities.findById(id);
    if (!community) throw new NotFoundException(ErrorCode.SRD_RESOURCE_NOT_FOUND, `Community ${id} not found`);
    return community;
  }

  getDomains() {
    return this.domains.findAll();
  }

  async getDomain(id: string) {
    const domain = await this.domains.findById(id);
    if (!domain) throw new NotFoundException(ErrorCode.SRD_RESOURCE_NOT_FOUND, `Domain ${id} not found`);
    return domain;
  }

  getDomainCards(filters?: { domain?: string; level?: number }) {
    return this.domainCards.findAll(filters);
  }

  async getDomainCard(id: string) {
    const card = await this.domainCards.findById(id);
    if (!card) throw new NotFoundException(ErrorCode.SRD_RESOURCE_NOT_FOUND, `Domain card ${id} not found`);
    return card;
  }
}
