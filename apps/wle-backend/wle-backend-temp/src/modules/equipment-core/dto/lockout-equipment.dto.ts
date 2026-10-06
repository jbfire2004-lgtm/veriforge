import { IsInt, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class LockoutEquipmentDto {
  @IsString()
  reason!: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  companyId?: number;
}
