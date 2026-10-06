import {
  IsString,
  IsOptional,
  IsBoolean,
  IsDate,
  ValidateNested,
  IsInt,
} from 'class-validator';
import { Type } from 'class-transformer';

// ---------------------------
// COMPANY DTO
// ---------------------------
export class CompanyDto {
  @Type(() => Number)
  @IsInt()
  id: number;

  @IsString()
  name: string;
}

// ---------------------------
// CERTIFICATION DTO
// ---------------------------
export class CertificationDto {
  @Type(() => Number)
  @IsInt()
  id: number;

  @IsString()
  name: string;

  @Type(() => Date)
  issuedAt: Date;

  @Type(() => Date)
  expiresAt: Date;

  @IsBoolean()
  isValid: boolean;
}

// ---------------------------
// EQUIPMENT DTO
// ---------------------------
export class EquipmentDto {
  @Type(() => Number)
  @IsInt()
  id: number;

  @IsString()
  name: string;

  @Type(() => Date)
  lastInspection: Date;

  @IsBoolean()
  isSafe: boolean;
}

// ---------------------------
// SITE ACCESS DTO
// ---------------------------
export class SiteAccessDto {
  @IsBoolean()
  allowed: boolean;

  @IsOptional()
  @IsString()
  reason?: string;
}

// ---------------------------
// WORKER VERIFICATION DTO
// ---------------------------
export class WorkerVerificationDto {
  @Type(() => Number)
  @IsInt()
  workerId: number;

  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsOptional()
  @IsString()
  photoUrl?: string;

  @ValidateNested()
  @Type(() => CompanyDto)
  company: CompanyDto;

  @ValidateNested({ each: true })
  @Type(() => CertificationDto)
  certifications: CertificationDto[];

  @ValidateNested({ each: true })
  @Type(() => EquipmentDto)
  equipmentAuthorized: EquipmentDto[];

  @ValidateNested()
  @Type(() => SiteAccessDto)
  siteAccess: SiteAccessDto;
}
