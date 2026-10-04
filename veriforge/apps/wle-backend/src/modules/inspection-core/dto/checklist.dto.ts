import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { InspectionChecklistCategory, InspectionType } from '@prisma/client';

export class ChecklistItemDto {
  @IsString()
  id: string;

  @IsString()
  label: string;

  @IsOptional()
  @IsBoolean()
  required?: boolean;
}

export class CreateChecklistDto {
  @IsString()
  name: string;

  @IsEnum(InspectionChecklistCategory)
  category: InspectionChecklistCategory;

  @IsEnum(InspectionType)
  inspectionType: InspectionType;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ChecklistItemDto)
  items: ChecklistItemDto[];

  @IsOptional()
  @IsInt()
  intervalDays?: number;

  @IsOptional()
  @IsInt()
  intervalHours?: number;

  @IsOptional()
  @IsBoolean()
  active?: boolean;
}

export class UpdateChecklistDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEnum(InspectionChecklistCategory)
  category?: InspectionChecklistCategory;

  @IsOptional()
  @IsEnum(InspectionType)
  inspectionType?: InspectionType;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ChecklistItemDto)
  items?: ChecklistItemDto[];

  @IsOptional()
  @IsInt()
  intervalDays?: number;

  @IsOptional()
  @IsInt()
  intervalHours?: number;

  @IsOptional()
  @IsBoolean()
  active?: boolean;
}
