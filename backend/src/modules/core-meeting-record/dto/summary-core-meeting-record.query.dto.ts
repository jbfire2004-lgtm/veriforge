import { Type } from 'class-transformer';
import { IsDateString, IsInt, IsOptional, Min } from 'class-validator';

/**
 * Query parameters for GET /core-meeting-records/summary
 */
export class SummaryCoreMeetingRecordQueryDto {
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

  /** Inclusive lower bound on `heldAt` (ISO-8601 date or datetime). */
  @IsOptional()
  @IsDateString()
  heldFrom?: string;

  /** Inclusive upper bound on `heldAt` (ISO-8601 date or datetime). */
  @IsOptional()
  @IsDateString()
  heldTo?: string;
}
