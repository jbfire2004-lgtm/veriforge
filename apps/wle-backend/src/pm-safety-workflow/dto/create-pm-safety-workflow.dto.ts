import { Type } from 'class-transformer';
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { PmSafetyWorkflowKind } from '@prisma/client';

export class CreatePmSafetyWorkflowDto {
  @IsString()
  @MaxLength(300)
  title!: string;

  @IsOptional()
  @IsEnum(PmSafetyWorkflowKind)
  kind?: PmSafetyWorkflowKind;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  companyId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  siteId?: number;

  @IsOptional()
  @IsString()
  workDescription?: string;

  @IsOptional()
  @IsString()
  hazardSummary?: string;

  @IsOptional()
  @IsString()
  controlMeasures?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  jobLocation?: string;

  /// JSON array string, e.g. steps for JHA / Energy Wheel checklist
  @IsOptional()
  @IsString()
  taskStepsJson?: string;

  @IsOptional()
  @IsDateString()
  validFrom?: string;

  @IsOptional()
  @IsDateString()
  validTo?: string;
}
