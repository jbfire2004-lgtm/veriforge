import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
} from 'class-validator';
import { JhaFlhaKind } from '@prisma/client';

export class SmsWorkflowCreateDto {
  @Type(() => Number)
  @IsInt()
  companyId!: number;

  @Type(() => Number)
  @IsInt()
  projectId!: number;

  @IsOptional()
  @IsString()
  @MaxLength(128)
  clientSyncId?: string;

  @IsOptional()
  @IsEnum(JhaFlhaKind)
  kind?: JhaFlhaKind;

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(4000)
  taskDescription?: string;

  @IsOptional()
  @IsString()
  @MaxLength(8000)
  workScope?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  locationNote?: string;

  @IsOptional()
  @IsUUID()
  templateId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  title?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  siteId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  equipmentId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  workerId?: number;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  sourceModule?: string;

  @IsOptional()
  @IsString()
  @MaxLength(128)
  sourceId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(8000)
  description?: string;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  actionType?: string;

  @IsOptional()
  @IsString()
  @MaxLength(32)
  severity?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  assignUserId?: number;

  @IsOptional()
  @IsBoolean()
  publish?: boolean;

  @IsOptional()
  @IsUUID()
  eventId?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  leadInvestigatorId?: number;
}
