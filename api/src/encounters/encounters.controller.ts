import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Put,
  Req,
} from '@nestjs/common';
import { EncountersService } from './encounters.service';
import { SyncAdversaryStoreDto } from './dto/sync-adversary-store.dto';
import { GM } from '../auth/decorators/gm.decorator';
import type { RequestWithUser } from '../auth/interfaces/request-with-user.interface';

@Controller('encounters')
export class EncountersController {
  constructor(private readonly service: EncountersService) {}

  @GM()
  @Get('store')
  getStore(@Req() req: RequestWithUser) {
    return this.service.getStore(req.user.id);
  }

  @GM()
  @Put('store')
  @HttpCode(HttpStatus.NO_CONTENT)
  async replaceStore(
    @Body() dto: SyncAdversaryStoreDto,
    @Req() req: RequestWithUser,
  ): Promise<void> {
    await this.service.replaceStore(req.user.id, dto);
  }
}
