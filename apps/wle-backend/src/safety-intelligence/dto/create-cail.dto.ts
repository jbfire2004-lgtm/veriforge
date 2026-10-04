import {
  IsArray,
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { CailRiskCategory, CailSeverity, CailSourceType } from '@prisma/client';

export class CreateCailDto {
  @IsInt()
  projectId!: number;

  @IsInt()
  ownerCompanyId!: number;

  @IsEnum(CailSourceType)
  sourceType!: CailSourceType;

  @IsOptional()
  @IsString()
  sourceId?: string;

  @IsOptional()
  @IsString()
  sourceItemId?: string;

  @IsString()
  @MaxLength(500)
  title!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(CailSeverity)
  severity?: CailSeverity;

  @IsOptional()
  @IsEnum(CailRiskCategory)
  riskCategory?: CailRiskCategory;

  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @IsOptional()
  @IsInt()
  assignedUserId?: number;

  @IsOptional()
  @IsInt()
  siteId?: number;

  @IsOptional()
  @IsString()
  locationNote?: string;

  @IsOptional()
  @IsInt()
  equipmentId?: number;

  @IsOptional()
  @IsInt()
  workerId?: number;

  @IsOptional()
  @IsArray()
  tags?: string[];
}
