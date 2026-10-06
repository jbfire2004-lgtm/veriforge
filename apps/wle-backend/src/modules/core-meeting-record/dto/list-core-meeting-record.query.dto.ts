import { Type } from 'class-transformer';
import {
  IsDateString,
  IsEnum,
  IsIn,
  IsInt,
  IsOptional,
  Max,
  Min,
} from 'class-validator';
import { CoreMeetingRecordType } from '@prisma/client';
import { CORE_CRUD_MAX_TAKE } from '../../../common/constants/core-crud-list.constants';

/** Whitelisted `sortBy` values for GET /api/v1/core-meeting-records. */
export const CORE_MEETING_RECORD_LIST_SORT_FIELDS = [
  'id',
  'title',
  'heldAt',
  'meetingType',
  'createdAt',
  'updatedAt',
] as const;

export type CoreMeetingRecordListSortField =
  (typeof CORE_MEETING_RECORD_LIST_SORT_FIELDS)[number];

export class ListCoreMeetingRecordQueryDto {
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
  @IsEnum(CoreMeetingRecordType)
  meetingType?: CoreMeetingRecordType;

  /** Inclusive lower bound on `heldAt` (list filter). */
  @IsOptional()
  @IsDateString()
  heldFrom?: string;

  /** Inclusive upper bound on `heldAt` (list filter). */
  @IsOptional()
  @IsDateString()
  heldTo?: string;

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
  @IsIn([...CORE_MEETING_RECORD_LIST_SORT_FIELDS])
  sortBy?: CoreMeetingRecordListSortField;

  @IsOptional()
  @IsIn(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc';
}
