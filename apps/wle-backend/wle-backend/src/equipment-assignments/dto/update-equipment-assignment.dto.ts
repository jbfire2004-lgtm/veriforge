import { PartialType } from '@nestjs/mapped-types';
import { CreateEquipmentAssignmentDto } from './create-equipment-assignment.dto';

export class UpdateEquipmentAssignmentDto extends PartialType(
  CreateEquipmentAssignmentDto,
) {}
