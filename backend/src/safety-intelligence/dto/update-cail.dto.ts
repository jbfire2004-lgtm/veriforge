import {
  IsArray,
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { CailRiskCategory, CailSeverity, CailStatus } from '@prisma/client';

export class UpdateCailDto {
  @IsOptional()
  @IsString()
  @MaxLength(500)
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsInt()
  assignedUserId?: number;

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
  @IsEnum(CailStatus)
  status?: CailStatus;

  @IsOptional()
  @IsString()
  rootCauseCategory?: string;

  @IsOptional()
  @IsString()
  rootCauseNotes?: string;

  @IsOptional()
  @IsArray()
  tags?: string[];
}
