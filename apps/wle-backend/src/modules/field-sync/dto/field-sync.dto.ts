import { Type } from 'class-transformer';
import {
  IsArray,
  IsInt,
  IsISO8601,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

export class FieldSyncActionDto {
  @IsString()
  type!: string;

  payload!: Record<string, unknown>;

  @IsOptional()
  @IsString()
  clientId?: string;

  @IsOptional()
  @IsISO8601()
  clientTimestamp?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  clientVersion?: number;
}

export class FieldSyncBatchDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FieldSyncActionDto)
  actions!: FieldSyncActionDto[];

  @IsOptional()
  @IsString()
  batchId?: string;

  @IsOptional()
  @IsString()
  clientId?: string;
}

export class FieldDeltaQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  companyId?: number;

  @IsOptional()
  @IsISO8601()
  since?: string;
}
