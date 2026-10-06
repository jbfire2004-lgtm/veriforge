import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, Min } from 'class-validator';
import {
  CoreSiteRiskCategory,
  CoreSiteRiskSeverity,
  CoreSiteRiskStatus,
} from '@prisma/client';

export class ListCoreSiteRiskQueryDto {
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
  @IsEnum(CoreSiteRiskStatus)
  status?: CoreSiteRiskStatus;

  @IsOptional()
  @IsEnum(CoreSiteRiskCategory)
  category?: CoreSiteRiskCategory;

  @IsOptional()
  @IsEnum(CoreSiteRiskSeverity)
  severity?: CoreSiteRiskSeverity;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  skip?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  take?: number;
}
