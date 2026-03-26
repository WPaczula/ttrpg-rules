import { Controller, Get } from '@nestjs/common';
import { WeaponDto } from './dtos/weapon.dto';
import { WeaponsService } from './weapons.service';

@Controller('weapons')
export class WeaponsController {
  constructor(private weaponsService: WeaponsService) {}

  @Get()
  public fetchAll(): WeaponDto[] {
    return this.weaponsService.findAll();
  }
}
