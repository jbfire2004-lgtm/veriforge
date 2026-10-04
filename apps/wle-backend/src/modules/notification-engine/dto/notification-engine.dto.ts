import { Type } from 'class-transformer';
import { IsInt, IsOptional } from 'class-validator';

export class RunSchedulerQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  companyId?: number;
}
