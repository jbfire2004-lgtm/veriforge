import { IsInt, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class AssignWorkerDto {
  @IsInt()
  workerId!: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  companyId?: number;
}
