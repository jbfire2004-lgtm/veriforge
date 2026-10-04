import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, Min } from 'class-validator';
import {
  SafetyObservationSeverity,
  SafetyObservationStatus,
} from '@prisma/client';

export class ListSafetyObservationQueryDto {
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
  @IsEnum(SafetyObservationStatus)
  status?: SafetyObservationStatus;

  @IsOptional()
  @IsEnum(SafetyObservationSeverity)
  severity?: SafetyObservationSeverity;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  skip?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  take?: number;
}
