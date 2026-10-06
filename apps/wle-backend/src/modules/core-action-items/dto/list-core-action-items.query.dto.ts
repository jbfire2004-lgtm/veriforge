import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { CORE_CRUD_MAX_TAKE } from '../../../common/constants/core-crud-list.constants';
import {
  CORE_ACTION_PRIORITIES,
  CORE_ACTION_STATUSES,
} from './create-core-action-item.dto';

export const CORE_ACTION_ITEM_LIST_SORT_FIELDS = [
  'dueAt',
  'createdAt',
  'updatedAt',
  'status',
  'priority',
  'title',
] as const;

export type CoreActionItemListSortField =
  (typeof CORE_ACTION_ITEM_LIST_SORT_FIELDS)[number];

export class ListCoreActionItemsQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  companyId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  coreMeetingRecordId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  coreDailyLogId?: number;

  @IsOptional()
  @IsString()
  @IsIn([...CORE_ACTION_STATUSES])
  status?: string;

  @IsOptional()
  @IsString()
  @IsIn([...CORE_ACTION_PRIORITIES])
  priority?: string;

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
  @IsIn([...CORE_ACTION_ITEM_LIST_SORT_FIELDS])
  sortBy?: CoreActionItemListSortField;

  @IsOptional()
  @IsIn(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc';
}
