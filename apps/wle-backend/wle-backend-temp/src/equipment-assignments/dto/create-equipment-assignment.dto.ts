import { IsInt, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateEquipmentAssignmentDto {
  @Type(() => Number)
  @IsInt()
  workerId: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  equipmentId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  siteId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  companyId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  assignedBy?: number;

  @IsOptional()
  startAt?: Date;

  @IsOptional()
  endAt?: Date;
}
