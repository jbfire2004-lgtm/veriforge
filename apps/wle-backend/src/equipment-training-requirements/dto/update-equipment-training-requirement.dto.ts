import { IsInt, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateEquipmentTrainingRequirementDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  equipmentId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  certificationId?: number;
}
