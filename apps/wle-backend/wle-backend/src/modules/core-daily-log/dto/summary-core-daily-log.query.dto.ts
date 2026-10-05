import { Type } from 'class-transformer';
import { IsDateString, IsInt, IsOptional, Min } from 'class-validator';

/**
 * Query parameters for GET /api/v1/core-daily-logs/summary
 */
export class SummaryCoreDailyLogQueryDto {
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

  /** Inclusive lower bound on `logDate` (ISO-8601 date or datetime). */
  @IsOptional()
  @IsDateString()
  logDateFrom?: string;

  /** Inclusive upper bound on `logDate` (ISO-8601 date or datetime). */
  @IsOptional()
  @IsDateString()
  logDateTo?: string;
}
