import { IsString, IsInt, IsNotEmpty, Min, Max } from 'class-validator';

export class CreateExperienceDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsInt()
  @Min(1)
  @Max(6)
  modifier: number;
}
