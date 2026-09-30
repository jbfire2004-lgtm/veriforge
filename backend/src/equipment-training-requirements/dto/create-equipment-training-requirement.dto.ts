import { IsInt } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateEquipmentTrainingRequirementDto {
  @Type(() => Number)
  @IsInt()
  equipmentId: number;

  @Type(() => Number)
  @IsInt()
  certificationId: number;
}
