import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { PpeType, ToolStatus } from '@prisma/client';

export class CreateToolDto {
  @IsInt()
  companyId: number;

  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  serialNumber?: string;

  @IsOptional()
  @IsString()
  assetTag?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  inspectionIntervalDays?: number;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class CreatePpeDto {
  @IsInt()
  companyId: number;

  @IsString()
  name: string;

  @IsEnum(PpeType)
  ppeType: PpeType;

  @IsOptional()
  @IsString()
  serialNumber?: string;

  @IsOptional()
  @IsString()
  condition?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  /** ISO date; default computed from ppeType if omitted */
  @IsOptional()
  @IsString()
  expiresAt?: string;

  @IsOptional()
  @IsString()
  issuedAt?: string;
}

export class AssignToWorkerDto {
  @IsInt()
  workerId: number;

  @IsOptional()
  @IsInt()
  projectId?: number;
}

export class AssignToProjectDto {
  @IsInt()
  projectId: number;

  @IsOptional()
  @IsInt()
  workerId?: number;
}

export class ToolInspectDto {
  @IsBoolean()
  passed: boolean;

  @IsOptional()
  @IsObject()
  checklist?: Record<string, unknown>;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsInt()
  workerId?: number;
}

export class PpeInspectDto {
  @IsBoolean()
  passed: boolean;

  @IsOptional()
  @IsObject()
  checklist?: Record<string, unknown>;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsInt()
  workerId?: number;

  /** Extend expiry on pass (ISO date or days from now via service) */
  @IsOptional()
  @IsString()
  extendedExpiresAt?: string;
}

export class UpdateToolDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEnum(ToolStatus)
  status?: ToolStatus;

  @IsOptional()
  @IsString()
  notes?: string;
}
