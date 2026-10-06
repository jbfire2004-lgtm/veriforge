import { Type } from 'class-transformer';
import { IsEnum, IsIn, IsInt, IsOptional, Max, Min } from 'class-validator';
import { CoreDailyLogShift } from '@prisma/client';
import { CORE_CRUD_MAX_TAKE } from '../../../common/constants/core-crud-list.constants';

/** Whitelisted `sortBy` values for GET /api/v1/core-daily-logs. */
export const CORE_DAILY_LOG_LIST_SORT_FIELDS = [
  'id',
  'title',
  'logDate',
  'shift',
  'createdAt',
  'updatedAt',
] as const;

export type CoreDailyLogListSortField =
  (typeof CORE_DAILY_LOG_LIST_SORT_FIELDS)[number];

/** Query params for GET /api/v1/core-daily-logs (global ValidationPipe). */
export class ListCoreDailyLogQueryDto {
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
  @IsEnum(CoreDailyLogShift)
  shift?: CoreDailyLogShift;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  skip?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(CORE_CRUD_MAX_TAKE)
  take?: number;

  @IsOptional()
  @IsIn([...CORE_DAILY_LOG_LIST_SORT_FIELDS])
  sortBy?: CoreDailyLogListSortField;

  @IsOptional()
  @IsIn(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc';
}
