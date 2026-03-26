import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { WeaponsController } from './weapons/weapons.controller';
import { WeaponService } from './weapon/weapon.service';
import { WeaponsService } from './weapons/weapons.service';

@Module({
  imports: [],
  controllers: [AppController, WeaponsController],
  providers: [AppService, WeaponService, WeaponsService],
})
export class AppModule {}
