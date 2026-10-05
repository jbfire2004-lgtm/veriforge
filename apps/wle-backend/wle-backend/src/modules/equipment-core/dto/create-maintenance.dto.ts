import {
  IsDateString,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { Type } from 'class-transformer';
import { EquipmentMaintenanceType } from '@prisma/client';

export class CreateMaintenanceDto {
  @IsOptional()
  @IsEnum(EquipmentMaintenanceType)
  type?: EquipmentMaintenanceType;

  @IsOptional()
  @IsDateString()
  performedAt?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  performedBy?: number;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsDateString()
  nextDueAt?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  meterHours?: number;
}
