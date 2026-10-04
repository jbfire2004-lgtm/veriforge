import { Type } from 'class-transformer';
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import {
  SafetyObservationSeverity,
  SafetyObservationStatus,
} from '@prisma/client';

export class CreateSafetyObservationDto {
  @IsString()
  @MaxLength(500)
  title!: string;

  @IsOptional()
  @IsString()
  @MaxLength(10000)
  description?: string;

  @IsOptional()
  @IsEnum(SafetyObservationSeverity)
  severity?: SafetyObservationSeverity;

  @IsOptional()
  @IsEnum(SafetyObservationStatus)
  status?: SafetyObservationStatus;

  @IsDateString()
  observedAt!: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  locationNote?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  companyId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  siteId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  reportedByUserId?: number;
}
