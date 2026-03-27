import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SrdModule } from './srd/srd.module';

@Module({
  imports: [SrdModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
