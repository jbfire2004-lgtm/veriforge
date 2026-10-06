import {
  IsArray,
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { AcpSubscriptionStatus, AcpTenantStatus } from '@prisma/client';

export class UpdateSubscriptionDto {
  @IsOptional()
  @IsString()
  tenantId?: string;

  @IsOptional()
  @IsInt()
  companyId?: number;

  @IsOptional()
  @IsString()
  tierKey?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  seatsPurchased?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  modulesEnabled?: string[];

  @IsOptional()
  @IsEnum(AcpSubscriptionStatus)
  status?: AcpSubscriptionStatus;

  @IsOptional()
  @IsDateString()
  renewalDate?: string;

  @IsOptional()
  @IsEnum(AcpTenantStatus)
  tenantStatus?: AcpTenantStatus;
}
