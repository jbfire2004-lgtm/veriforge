import { Type } from 'class-transformer';
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import {
  CoreComplianceNoteCategory,
  CoreComplianceNotePriority,
  CoreComplianceNoteStatus,
} from '@prisma/client';

export class CreateCoreComplianceNoteDto {
  @IsString()
  @MinLength(1)
  @MaxLength(500)
  title!: string;

  @IsOptional()
  @IsString()
  @MaxLength(20000)
  body?: string;

  @IsOptional()
  @IsEnum(CoreComplianceNoteCategory)
  category?: CoreComplianceNoteCategory;

  @IsOptional()
  @IsEnum(CoreComplianceNoteStatus)
  status?: CoreComplianceNoteStatus;

  @IsOptional()
  @IsEnum(CoreComplianceNotePriority)
  priority?: CoreComplianceNotePriority;

  @IsOptional()
  @IsDateString()
  dueAt?: string;

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
  @Type(() => Number)
  @IsInt()
  @Min(1)
  createdByUserId?: number;
}
