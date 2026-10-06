import { IsString, IsBoolean, IsInt } from 'class-validator';
import { Type } from 'class-transformer';

export class EquipmentVerificationDto {
  @Type(() => Number)
  @IsInt()
  id: number;

  @IsString()
  name: string;

  @Type(() => Date)
  lastInspection: Date;

  @IsBoolean()
  isSafe: boolean;
}
