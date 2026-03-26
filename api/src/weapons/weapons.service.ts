import { Injectable } from '@nestjs/common';
import { Weapon } from './interfaces/weapon.interface';
import { SRD_WEAPONS } from 'lib/srd-data';

@Injectable()
export class WeaponsService {
  findAll(): Weapon[] {
    return SRD_WEAPONS;
  }
}
