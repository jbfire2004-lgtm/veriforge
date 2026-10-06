import { IsString, IsOptional, IsEnum, IsInt } from 'class-validator';
import { Type } from 'class-transformer';
import { EquipmentSafetyStatus } from '@prisma/client';

export class CreateEquipmentDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  serialNumber?: string;

  @IsOptional()
  @IsEnum(EquipmentSafetyStatus)
  safetyStatus?: EquipmentSafetyStatus;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  companyId?: number;

  @IsOptional()
  @IsString()
  photoUrl?: string | null;
}
