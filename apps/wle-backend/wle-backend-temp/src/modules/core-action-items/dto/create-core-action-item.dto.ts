import { Type } from 'class-transformer';
import {
  IsDateString,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { AssertActionItemParentExclusivity } from '../decorators/action-item-parent-exclusivity.decorator';

/** Matches frontend `CORE_ACTION_STATUSES` */
export const CORE_ACTION_STATUSES = [
  'OPEN',
  'IN_PROGRESS',
  'BLOCKED',
  'DONE',
  'CANCELLED',
] as const;

export type CoreActionItemStatus = (typeof CORE_ACTION_STATUSES)[number];

/** Matches frontend `CORE_ACTION_PRIORITIES` */
export const CORE_ACTION_PRIORITIES = [
  'LOW',
  'NORMAL',
  'HIGH',
  'CRITICAL',
] as const;

export type CoreActionItemPriority = (typeof CORE_ACTION_PRIORITIES)[number];

export class CreateCoreActionItemDto {
  @AssertActionItemParentExclusivity()
  @IsString()
  @MinLength(1)
  @MaxLength(500)
  title!: string;

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  description?: string;

  @IsOptional()
  @IsString()
  @IsIn([...CORE_ACTION_STATUSES])
  status?: CoreActionItemStatus;

  @IsOptional()
  @IsDateString()
  dueAt?: string;

  @IsOptional()
  @IsString()
  @IsIn([...CORE_ACTION_PRIORITIES])
  priority?: CoreActionItemPriority;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  companyId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  createdById?: number;

  /** Optional link to the VERA Core meeting record (toolbox / team safety / etc.) that produced this action. */
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  coreMeetingRecordId?: number;

  /** Optional link to a daily log entry. Mutually exclusive with `coreMeetingRecordId`. */
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  coreDailyLogId?: number;
}
