import { Type } from 'class-transformer';
import { IsInt, IsOptional } from 'class-validator';

export class DashboardWidgetsQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  companyId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  unionHallId?: number;
}
