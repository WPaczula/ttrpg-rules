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
import { AdversaryRepository } from './repositories/adversary.repository';
import { BeastformRepository } from './repositories/beastform.repository';
import { ConsumableRepository } from './repositories/consumable.repository';
import { EnvironmentRepository } from './repositories/environment.repository';
import { ItemRepository } from './repositories/item.repository';

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
    private readonly adversaries: AdversaryRepository,
    private readonly beastforms: BeastformRepository,
    private readonly consumables: ConsumableRepository,
    private readonly environments: EnvironmentRepository,
    private readonly items: ItemRepository,
  ) {}

  getWeapons(filters?: { tier?: number; type?: string }) {
    return this.weapons.findAll(filters);
  }

  async getWeapon(id: string) {
    const weapon = await this.weapons.findById(id);
    if (!weapon)
      throw new NotFoundException(
        ErrorCode.SRD_RESOURCE_NOT_FOUND,
        `Weapon ${id} not found`,
      );
    return weapon;
  }

  getArmor(filters?: { tier?: number }) {
    return this.armor.findAll(filters);
  }

  async getArmorById(id: string) {
    const armor = await this.armor.findById(id);
    if (!armor)
      throw new NotFoundException(
        ErrorCode.SRD_RESOURCE_NOT_FOUND,
        `Armor ${id} not found`,
      );
    return armor;
  }

  getClasses() {
    return this.classes.findAll();
  }

  async getClass(id: string) {
    const cls = await this.classes.findById(id);
    if (!cls)
      throw new NotFoundException(
        ErrorCode.SRD_RESOURCE_NOT_FOUND,
        `Class ${id} not found`,
      );
    return cls;
  }

  getSubclasses() {
    return this.subclasses.findAll();
  }

  async getSubclass(id: string) {
    const sub = await this.subclasses.findById(id);
    if (!sub)
      throw new NotFoundException(
        ErrorCode.SRD_RESOURCE_NOT_FOUND,
        `Subclass ${id} not found`,
      );
    return sub;
  }

  getAncestries() {
    return this.ancestries.findAll();
  }

  async getAncestry(id: string) {
    const ancestry = await this.ancestries.findById(id);
    if (!ancestry)
      throw new NotFoundException(
        ErrorCode.SRD_RESOURCE_NOT_FOUND,
        `Ancestry ${id} not found`,
      );
    return ancestry;
  }

  getCommunities() {
    return this.communities.findAll();
  }

  async getCommunity(id: string) {
    const community = await this.communities.findById(id);
    if (!community)
      throw new NotFoundException(
        ErrorCode.SRD_RESOURCE_NOT_FOUND,
        `Community ${id} not found`,
      );
    return community;
  }

  getDomains() {
    return this.domains.findAll();
  }

  async getDomain(id: string) {
    const domain = await this.domains.findById(id);
    if (!domain)
      throw new NotFoundException(
        ErrorCode.SRD_RESOURCE_NOT_FOUND,
        `Domain ${id} not found`,
      );
    return domain;
  }

  getDomainCards(filters?: { domain?: string; level?: number }) {
    return this.domainCards.findAll(filters);
  }

  async getDomainCard(id: string) {
    const card = await this.domainCards.findById(id);
    if (!card)
      throw new NotFoundException(
        ErrorCode.SRD_RESOURCE_NOT_FOUND,
        `Domain card ${id} not found`,
      );
    return card;
  }

  getAdversaries(filters?: { tier?: number; type?: string }) {
    return this.adversaries.findAll(filters);
  }

  async getAdversary(id: string) {
    const adversary = await this.adversaries.findById(id);
    if (!adversary)
      throw new NotFoundException(
        ErrorCode.SRD_RESOURCE_NOT_FOUND,
        `Adversary ${id} not found`,
      );
    return adversary;
  }

  getBeastforms(filters?: { tier?: number }) {
    return this.beastforms.findAll(filters);
  }

  async getBeastform(id: string) {
    const beastform = await this.beastforms.findById(id);
    if (!beastform)
      throw new NotFoundException(
        ErrorCode.SRD_RESOURCE_NOT_FOUND,
        `Beastform ${id} not found`,
      );
    return beastform;
  }

  getConsumables() {
    return this.consumables.findAll();
  }

  async getConsumable(id: string) {
    const consumable = await this.consumables.findById(id);
    if (!consumable)
      throw new NotFoundException(
        ErrorCode.SRD_RESOURCE_NOT_FOUND,
        `Consumable ${id} not found`,
      );
    return consumable;
  }

  getEnvironments(filters?: { tier?: number; type?: string }) {
    return this.environments.findAll(filters);
  }

  async getEnvironment(id: string) {
    const environment = await this.environments.findById(id);
    if (!environment)
      throw new NotFoundException(
        ErrorCode.SRD_RESOURCE_NOT_FOUND,
        `Environment ${id} not found`,
      );
    return environment;
  }

  getItems() {
    return this.items.findAll();
  }

  async getItem(id: string) {
    const item = await this.items.findById(id);
    if (!item)
      throw new NotFoundException(
        ErrorCode.SRD_RESOURCE_NOT_FOUND,
        `Item ${id} not found`,
      );
    return item;
  }
}
