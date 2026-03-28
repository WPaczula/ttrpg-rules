import { IsBoolean } from 'class-validator';

export class ToggleThresholdBonusDto {
  @IsBoolean()
  active: boolean;
}
