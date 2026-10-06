import { IsEnum, IsInt, IsOptional, IsString } from 'class-validator';
import {
  CailRiskCategory,
  CailSeverity,
  ObservationPolarity,
} from '@prisma/client';

export class CreateInspectionItemDto {
  @IsEnum(ObservationPolarity)
  polarity!: ObservationPolarity;

  @IsOptional()
  @IsString()
  photoStorageKey?: string;

  @IsOptional()
  @IsString()
  photoDataUrl?: string;

  @IsOptional()
  @IsInt()
  coreFileId?: number;

  @IsOptional()
  @IsString()
  ocrText?: string;

  @IsOptional()
  @IsString()
  caption?: string;

  @IsOptional()
  @IsInt()
  ownerCompanyId?: number;

  @IsOptional()
  @IsInt()
  assignedUserId?: number;

  @IsOptional()
  @IsInt()
  equipmentId?: number;

  @IsOptional()
  @IsEnum(CailRiskCategory)
  riskCategory?: CailRiskCategory;

  @IsOptional()
  @IsEnum(CailSeverity)
  severity?: CailSeverity;

  @IsOptional()
  @IsString()
  notes?: string;
}
