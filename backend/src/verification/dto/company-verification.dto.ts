import {
  IsString,
  IsNumber,
  IsBoolean,
  ValidateNested,
  IsInt,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CompanyWorkerDto {
  @Type(() => Number)
  @IsInt()
  id: number;

  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsNumber()
  certifications: number;

  @IsNumber()
  equipmentAssigned: number;

  @IsBoolean()
  siteAccess: boolean;
}

export class CompanyVerificationDto {
  @Type(() => Number)
  @IsInt()
  companyId: number;

  @IsString()
  name: string;

  @IsNumber()
  workerCount: number;

  @ValidateNested({ each: true })
  @Type(() => CompanyWorkerDto)
  workers: CompanyWorkerDto[];
}
