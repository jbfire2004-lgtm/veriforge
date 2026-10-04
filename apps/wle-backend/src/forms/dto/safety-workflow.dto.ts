import { Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { SafetyFormType } from '@prisma/client';

class SafetyWorkflowSignatureDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  fieldId?: string;

  @IsString()
  @MaxLength(8192)
  signatureData!: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  signerName?: string;
}

export class CreateSafetyWorkflowFormDto {
  @IsEnum(SafetyFormType)
  formType!: SafetyFormType;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  projectId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  workerId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  companyId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  siteId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  equipmentId?: number;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  title?: string;

  @IsOptional()
  @IsObject()
  formData?: Record<string, unknown>;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  supervisorId?: number;
}

export class SaveSafetyWorkflowDraftDto {
  @IsObject()
  formData!: Record<string, unknown>;
}

export class SubmitSafetyWorkflowFormDto {
  @IsObject()
  formData!: Record<string, unknown>;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SafetyWorkflowSignatureDto)
  signatures?: SafetyWorkflowSignatureDto[];
}
