import { Controller, Get } from '@nestjs/common';
import { WeaponDto } from './weapon.dto';
import { SRD_WEAPONS } from 'lib/srd-data';

@Controller('weapons')
export class WeaponsController {
  @Get()
  public fetchAll(): WeaponDto[] {
    return SRD_WEAPONS;
  }
}
