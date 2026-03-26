import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { WeaponsController } from './weapons/weapons.controller';

@Module({
  imports: [],
  controllers: [AppController, WeaponsController],
  providers: [AppService],
})
export class AppModule {}
