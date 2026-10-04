import { OmitType, PartialType } from '@nestjs/mapped-types';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, Min, ValidateIf } from 'class-validator';
import { CreateCoreActionItemDto } from './create-core-action-item.dto';

export class UpdateCoreActionItemDto extends PartialType(
  OmitType(CreateCoreActionItemDto, [
    'coreMeetingRecordId',
    'coreDailyLogId',
  ] as const),
) {
  /** Set to `null` in PATCH to detach from the meeting record. */
  @IsOptional()
  @ValidateIf((_, v) => v !== null)
  @Type(() => Number)
  @IsInt()
  @Min(1)
  coreMeetingRecordId?: number | null;

  /** Set to `null` in PATCH to detach from the daily log. */
  @IsOptional()
  @ValidateIf((_, v) => v !== null)
  @Type(() => Number)
  @IsInt()
  @Min(1)
  coreDailyLogId?: number | null;
}
