import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { SafetyFormStatus } from '@prisma/client';

export class CreateSafetyFormDto {
  @IsString()
  definitionId!: string;

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsObject()
  formData?: Record<string, unknown>;

  @IsOptional()
  @IsInt()
  companyId?: number;

  @IsOptional()
  @IsInt()
  projectId?: number;

  @IsOptional()
  @IsInt()
  siteId?: number;

  @IsOptional()
  @IsInt()
  workerId?: number;

  @IsOptional()
  @IsInt()
  equipmentId?: number;

  @IsOptional()
  @IsString()
  clientSyncId?: string;
}

export class SaveSafetyFormDraftDto {
  @IsObject()
  formData!: Record<string, unknown>;
}

class SignatureInputDto {
  @IsOptional()
  @IsString()
  fieldId?: string;

  @IsString()
  signatureData!: string;

  @IsOptional()
  @IsString()
  signerName?: string;
}

export class SubmitSafetyFormDto {
  @IsObject()
  formData!: Record<string, unknown>;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SignatureInputDto)
  signatures?: SignatureInputDto[];
}

export class TransitionSafetyFormDto {
  @IsEnum(SafetyFormStatus)
  status!: SafetyFormStatus;

  @IsOptional()
  @IsString()
  note?: string;
}

export class AutoPopulateQueryDto {
  @IsOptional()
  @IsInt()
  workerId?: number;

  @IsOptional()
  @IsInt()
  projectId?: number;

  @IsOptional()
  @IsInt()
  companyId?: number;

  @IsOptional()
  @IsInt()
  equipmentId?: number;
}

export class AddAttachmentDto {
  @IsOptional()
  @IsString()
  fieldId?: string;

  @IsString()
  fileName!: string;

  @IsOptional()
  @IsString()
  mimeType?: string;

  @IsOptional()
  @IsString()
  dataUrl?: string;

  @IsOptional()
  @IsInt()
  sizeBytes?: number;
}

export class OfflineSyncDto {
  @IsString()
  clientSyncId!: string;

  @IsString()
  definitionId!: string;

  @IsObject()
  formData!: Record<string, unknown>;

  @IsOptional()
  @IsBoolean()
  submit?: boolean;

  @IsOptional()
  @IsInt()
  companyId?: number;

  @IsOptional()
  @IsInt()
  projectId?: number;

  @IsOptional()
  @IsInt()
  siteId?: number;

  @IsOptional()
  @IsInt()
  workerId?: number;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SignatureInputDto)
  signatures?: SignatureInputDto[];
}
