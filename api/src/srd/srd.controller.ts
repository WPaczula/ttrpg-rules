import { Controller, Get, Param, ParseUUIDPipe, Query, UseInterceptors } from '@nestjs/common';
import { SrdService } from './srd.service';
import { WeaponQueryDto } from './dto/weapon-query.dto';
import { ArmorQueryDto } from './dto/armor-query.dto';
import { DomainCardQueryDto } from './dto/domain-card-query.dto';
import { SrdCacheInterceptor } from './srd-cache.interceptor';
import { AnyRole } from '../auth/decorators/any-role.decorator';

@AnyRole()
@Controller('srd')
@UseInterceptors(SrdCacheInterceptor)
export class SrdController {
  constructor(private readonly srd: SrdService) {}

  @Get('weapons')
  getWeapons(@Query() query: WeaponQueryDto) {
    return this.srd.getWeapons(query);
  }

  @Get('weapons/:id')
  getWeapon(@Param('id', ParseUUIDPipe) id: string) {
    return this.srd.getWeapon(id);
  }

  @Get('armor')
  getArmor(@Query() query: ArmorQueryDto) {
    return this.srd.getArmor(query);
  }

  @Get('armor/:id')
  getArmorById(@Param('id', ParseUUIDPipe) id: string) {
    return this.srd.getArmorById(id);
  }

  @Get('classes')
  getClasses() {
    return this.srd.getClasses();
  }

  @Get('classes/:id')
  getClass(@Param('id', ParseUUIDPipe) id: string) {
    return this.srd.getClass(id);
  }

  @Get('subclasses')
  getSubclasses() {
    return this.srd.getSubclasses();
  }

  @Get('subclasses/:id')
  getSubclass(@Param('id', ParseUUIDPipe) id: string) {
    return this.srd.getSubclass(id);
  }

  @Get('ancestries')
  getAncestries() {
    return this.srd.getAncestries();
  }

  @Get('ancestries/:id')
  getAncestry(@Param('id', ParseUUIDPipe) id: string) {
    return this.srd.getAncestry(id);
  }

  @Get('communities')
  getCommunities() {
    return this.srd.getCommunities();
  }

  @Get('communities/:id')
  getCommunity(@Param('id', ParseUUIDPipe) id: string) {
    return this.srd.getCommunity(id);
  }

  @Get('domains')
  getDomains() {
    return this.srd.getDomains();
  }

  @Get('domains/:id')
  getDomain(@Param('id', ParseUUIDPipe) id: string) {
    return this.srd.getDomain(id);
  }

  @Get('domain-cards')
  getDomainCards(@Query() query: DomainCardQueryDto) {
    return this.srd.getDomainCards(query);
  }

  @Get('domain-cards/:id')
  getDomainCard(@Param('id', ParseUUIDPipe) id: string) {
    return this.srd.getDomainCard(id);
  }
}
