import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { EquipmentMaintenanceType } from '@prisma/client';

export class CreateMaintenanceRecordDto {
  @IsInt()
  equipmentId: number;

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

export class CreateCalibrationRecordDto {
  @IsInt()
  equipmentId: number;

  @IsOptional()
  @IsDateString()
  calibratedAt?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  calibratedBy?: number;

  @IsOptional()
  @IsString()
  certificateNumber?: string;

  @IsOptional()
  @IsDateString()
  expiresAt?: string;

  @IsOptional()
  @IsBoolean()
  passed?: boolean;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class CreateMaintenanceScheduleDto {
  @IsInt()
  equipmentId: number;

  @IsOptional()
  @IsEnum(EquipmentMaintenanceType)
  type?: EquipmentMaintenanceType;

  @IsOptional()
  @IsInt()
  @Min(1)
  intervalDays?: number;

  @IsOptional()
  @IsNumber()
  intervalHours?: number;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class CreateCalibrationScheduleDto {
  @IsInt()
  equipmentId: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  intervalDays?: number;

  @IsOptional()
  @IsString()
  notes?: string;
}
