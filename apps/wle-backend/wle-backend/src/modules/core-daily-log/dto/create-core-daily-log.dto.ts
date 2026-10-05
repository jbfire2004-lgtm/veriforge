import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  MinLength,
  ValidateIf,
} from 'class-validator';
import { CoreDailyLogShift } from '@prisma/client';

export class CreateCoreDailyLogDto {
  /** Short headline; derived from activities when omitted. */
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(500)
  title?: string;

  /** @deprecated Prefer `activities`. */
  @IsOptional()
  @IsString()
  @MaxLength(20000)
  body?: string;

  /** Schema: activities */
  @IsOptional()
  @IsString()
  @MaxLength(20000)
  activities?: string;

  /** Schema: safety_notes */
  @IsOptional()
  @IsString()
  @MaxLength(20000)
  safetyNotes?: string;

  /** Snake alias for safety_notes */
  @IsOptional()
  @IsString()
  @MaxLength(20000)
  safety_notes?: string;

  /** ISO-8601 date or datetime (schema: date). */
  @ValidateIf((o: CreateCoreDailyLogDto) => o.logDate != null || o.date == null)
  @IsDateString()
  logDate?: string;

  /** Snake alias for logDate */
  @IsOptional()
  @IsDateString()
  date?: string;

  @IsOptional()
  @IsEnum(CoreDailyLogShift)
  shift?: CoreDailyLogShift;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  companyId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  company_id?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  siteId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  site_id?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  createdByUserId?: number;

  /** Schema: supervisor (User id) */
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  supervisorUserId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  supervisor?: number;

  /** Schema: attachments — CoreFile ids */
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(50)
  @Type(() => Number)
  @IsInt({ each: true })
  @Min(1, { each: true })
  attachmentFileIds?: number[];

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(50)
  @Type(() => Number)
  @IsInt({ each: true })
  @Min(1, { each: true })
  attachments?: number[];
}
