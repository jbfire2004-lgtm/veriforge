import {
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  EquipmentCatalogCategory,
  EquipmentSafetyStatus,
} from '@prisma/client';

export class CreateEquipmentCoreDto {
  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  serialNumber?: string;

  @IsOptional()
  @IsString()
  assetTag?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  companyId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  categoryId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  typeId?: number;

  @IsOptional()
  @IsEnum(EquipmentSafetyStatus)
  safetyStatus?: EquipmentSafetyStatus;

  @IsOptional()
  @IsString()
  photoUrl?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  manufacturer?: string;

  @IsOptional()
  @IsString()
  model?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1900)
  @Max(2100)
  yearMade?: number;

  @IsOptional()
  @IsEnum(EquipmentCatalogCategory)
  catalogCategory?: EquipmentCatalogCategory;

  @IsOptional()
  @IsString()
  catalogTypeKey?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  meterHours?: number;
}
