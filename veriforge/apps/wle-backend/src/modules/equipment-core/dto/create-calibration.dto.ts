import {
  IsBoolean,
  IsDateString,
  IsInt,
  IsOptional,
  IsString,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateCalibrationDto {
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
