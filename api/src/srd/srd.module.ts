import { Module } from '@nestjs/common';
import { SrdController } from './srd.controller';
import { SrdService } from './srd.service';

@Module({
  controllers: [SrdController],
  providers: [SrdService],
})
export class SrdModule {}
