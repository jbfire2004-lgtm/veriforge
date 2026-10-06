import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';
import { InspectionKind } from '@prisma/client';

export class CreateInspectionDto {
  @IsInt()
  equipmentId!: number;

  @IsOptional()
  @IsInt()
  siteId?: number;

  @IsOptional()
  @IsEnum(InspectionKind)
  kind?: InspectionKind;

  @IsObject()
  checklist!: Record<string, unknown>;

  @IsBoolean()
  passed!: boolean;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  correctiveActions?: string;

  @IsOptional()
  @IsNumber()
  meterReading?: number;

  @IsOptional()
  @IsString()
  signature?: string;
}
