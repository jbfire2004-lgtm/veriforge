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
import {
  CoreComplianceNoteCategory,
  CoreComplianceNotePriority,
  CoreComplianceNoteStatus,
} from '@prisma/client';
import { CORE_CRUD_MAX_TAKE } from '../../../common/constants/core-crud-list.constants';

export const CORE_COMPLIANCE_NOTE_LIST_SORT_FIELDS = [
  'id',
  'title',
  'status',
  'category',
  'priority',
  'dueAt',
  'createdAt',
  'updatedAt',
] as const;

export type CoreComplianceNoteListSortField =
  (typeof CORE_COMPLIANCE_NOTE_LIST_SORT_FIELDS)[number];

export class ListCoreComplianceNoteQueryDto {
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
  @IsEnum(CoreComplianceNoteStatus)
  status?: CoreComplianceNoteStatus;

  @IsOptional()
  @IsEnum(CoreComplianceNoteCategory)
  category?: CoreComplianceNoteCategory;

  @IsOptional()
  @IsEnum(CoreComplianceNotePriority)
  priority?: CoreComplianceNotePriority;

  /** Inclusive lower bound on `dueAt`. */
  @IsOptional()
  @IsDateString()
  dueFrom?: string;

  /** Inclusive upper bound on `dueAt`. */
  @IsOptional()
  @IsDateString()
  dueTo?: string;

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
  @IsIn([...CORE_COMPLIANCE_NOTE_LIST_SORT_FIELDS])
  sortBy?: CoreComplianceNoteListSortField;

  @IsOptional()
  @IsIn(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc';
}
