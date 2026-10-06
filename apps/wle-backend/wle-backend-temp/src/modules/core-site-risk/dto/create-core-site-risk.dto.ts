import { Type } from 'class-transformer';
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import {
  CoreSiteRiskCategory,
  CoreSiteRiskSeverity,
  CoreSiteRiskStatus,
} from '@prisma/client';

export class CreateCoreSiteRiskDto {
  @IsString()
  @MaxLength(500)
  title!: string;

  @IsOptional()
  @IsString()
  @MaxLength(20000)
  description?: string;

  @IsOptional()
  @IsEnum(CoreSiteRiskCategory)
  category?: CoreSiteRiskCategory;

  @IsOptional()
  @IsEnum(CoreSiteRiskSeverity)
  severity?: CoreSiteRiskSeverity;

  @IsOptional()
  @IsEnum(CoreSiteRiskStatus)
  status?: CoreSiteRiskStatus;

  @IsDateString()
  identifiedAt!: string;

  @IsOptional()
  @IsDateString()
  mitigatedAt?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  locationNote?: string;

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
  ownerUserId?: number;
}
