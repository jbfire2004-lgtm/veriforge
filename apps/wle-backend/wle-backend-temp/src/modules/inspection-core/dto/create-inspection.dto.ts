import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';
import { InspectionKind, InspectionType } from '@prisma/client';

export class CreateInspectionDto {
  @IsInt()
  equipmentId: number;

  @IsOptional()
  @IsInt()
  workerId?: number;

  @IsOptional()
  @IsInt()
  siteId?: number;

  @IsOptional()
  @IsInt()
  checklistId?: number;

  @IsOptional()
  @IsEnum(InspectionType)
  inspectionType?: InspectionType;

  @IsOptional()
  @IsEnum(InspectionKind)
  kind?: InspectionKind;

  @IsObject()
  checklist: Record<string, unknown>;

  @IsBoolean()
  passed: boolean;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  photos?: string[];

  @IsOptional()
  @IsString()
  correctiveActions?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsNumber()
  meterReading?: number;

  @IsOptional()
  @IsString()
  signature?: string;
}

export class UnlockAfterInspectionDto {
  @IsOptional()
  @IsString()
  notes?: string;
}
