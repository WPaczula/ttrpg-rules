import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Put,
  Req,
} from '@nestjs/common';
import { CharactersService } from './characters.service';
import { LevelUpService } from './level-up.service';
import { SyncCharacterService } from './sync-character.service';
import { ApplyLevelUpDto } from './dto/apply-level-up.dto';
import { CreateCharacterDto } from './dto/create-character.dto';
import { UpdateCharacterDto } from './dto/update-character.dto';
import { CreateExperienceDto } from './dto/create-experience.dto';
import { UpdateExperienceDto } from './dto/update-experience.dto';
import { AddDomainCardDto } from './dto/add-domain-card.dto';
import { ToggleThresholdBonusDto } from './dto/toggle-threshold-bonus.dto';
import { SyncCharacterDto } from './dto/sync-character.dto';
import { GM } from '../auth/decorators/gm.decorator';
import { PC } from '../auth/decorators/pc.decorator';
import { OwnerOnly } from './decorators/owner-only.decorator';
import type { RequestWithUser } from '../auth/interfaces/request-with-user.interface';

@Controller('characters')
export class CharactersController {
  constructor(
    private readonly service: CharactersService,
    private readonly levelUpService: LevelUpService,
    private readonly syncService: SyncCharacterService,
  ) {}

  @GM()
  @Get()
  findAll() {
    return this.service.findAll();
  }

  @PC()
  @Post()
  create(@Body() dto: CreateCharacterDto, @Req() req: RequestWithUser) {
    return this.service.create(dto, req.user.id);
  }

  @PC()
  @Get('me')
  async findMine(@Req() req: RequestWithUser) {
    const character = await this.service.findByUserId(req.user.id);
    if (!character) {
      return null;
    }
    return character;
  }

  @OwnerOnly()
  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.findOne(id);
  }

  @OwnerOnly()
  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCharacterDto,
  ) {
    return this.service.update(id, dto);
  }

  @OwnerOnly()
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.remove(id);
  }

  @OwnerOnly()
  @Get(':id/computed-stats')
  getComputedStats(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.getComputedStats(id);
  }

  @OwnerOnly()
  @Post(':id/experiences')
  addExperience(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CreateExperienceDto,
  ) {
    return this.service.addExperience(id, dto);
  }

  @OwnerOnly()
  @Patch(':id/experiences/:expId')
  updateExperience(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('expId', ParseUUIDPipe) expId: string,
    @Body() dto: UpdateExperienceDto,
  ) {
    return this.service.updateExperience(id, expId, dto);
  }

  @OwnerOnly()
  @Delete(':id/experiences/:expId')
  @HttpCode(HttpStatus.NO_CONTENT)
  removeExperience(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('expId', ParseUUIDPipe) expId: string,
  ) {
    return this.service.removeExperience(id, expId);
  }

  @OwnerOnly()
  @Post(':id/domain-cards')
  addDomainCard(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AddDomainCardDto,
  ) {
    return this.service.addDomainCard(id, dto);
  }

  @OwnerOnly()
  @Delete(':id/domain-cards/:cardId')
  @HttpCode(HttpStatus.NO_CONTENT)
  removeDomainCard(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('cardId', ParseUUIDPipe) cardId: string,
  ) {
    return this.service.removeDomainCard(id, cardId);
  }

  @OwnerOnly()
  @Patch(':id/threshold-bonuses/:bonusId')
  toggleThresholdBonus(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('bonusId', ParseUUIDPipe) bonusId: string,
    @Body() dto: ToggleThresholdBonusDto,
  ) {
    return this.service.toggleThresholdBonus(id, bonusId, dto);
  }

  @OwnerOnly()
  @Get(':id/level-up/options')
  getLevelUpOptions(@Param('id', ParseUUIDPipe) id: string) {
    return this.levelUpService.getLevelUpOptions(id);
  }

  @OwnerOnly()
  @Post(':id/level-up')
  applyLevelUp(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ApplyLevelUpDto,
  ) {
    return this.levelUpService.applyLevelUp(id, dto);
  }

  /** Temporary sync endpoint — will be removed once localStorage migration is complete */
  @PC()
  @Put('sync')
  @HttpCode(HttpStatus.NO_CONTENT)
  async syncCharacter(
    @Body() dto: SyncCharacterDto,
    @Req() req: RequestWithUser,
  ): Promise<void> {
    await this.syncService.syncCharacter(req.user.id, dto);
  }
}
