import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SrdModule } from './srd/srd.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [PrismaModule, SrdModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
